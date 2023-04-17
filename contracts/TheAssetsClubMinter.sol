// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { MerkleProof } from "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import { PaymentSplitter } from "@openzeppelin/contracts/finance/PaymentSplitter.sol";
import { IERC721A } from "erc721a/contracts/IERC721A.sol";
import { ITheAssetsClub } from "./interfaces/ITheAssetsClub.sol";

enum Proof {
  CLAIM,
  MINT
}

enum Tier {
  PUBLIC,
  ACCESS_LIST,
  OG
}

enum Phase {
  PRIVATE_SALE,
  PUBLIC_SALE,
  CLOSED
}

/**
 * @title TheAssetsClub NFT Collection Minter
 * @author Mathieu "Windyy" Bour
 * @notice This contract will manage the mint of the Assets Club NFT collection.
 * @dev Four phases are planned (see {Tier} above)
 * Our Merkle Tree type is [address, Proof, uint8].
 * - If proof is Proof.claim, the last param corresponds to the claimable quantity.
 * - If proof is Proof.MINT, the last param corresponds to the tier (ACCESS_LIST=1,OG=2).
 */
contract TheAssetsClubMinter is Ownable, PaymentSplitter {
  uint256 public constant MAXIMUM_MINTS = 5;
  uint256 public constant SALE_PRICE = 0.02 ether;
  uint256 public constant PRIVATE_SALE_DURATION = 24 * 3600; // 1 day in seconds
  uint256 public constant PUBLIC_SALE_DURATION = 2 * 24 * 3600; // 2 days in seconds

  /// Thu Apr 27 2023 09:00:00 GMT
  uint256 public constant START_DATE = 1682586000;
  /// Thu Apr 28 2023 09:00:00 GMT
  uint256 public constant PRIVATE_SALE_END_DATE = START_DATE + PRIVATE_SALE_DURATION;
  /// Thu Apr 30 2023 09:00:00 GM
  uint256 public constant PUBLIC_SALE_END_DATE = PRIVATE_SALE_END_DATE + PUBLIC_SALE_DURATION;

  /// TheAssetsClub smart contract.
  ITheAssetsClub public theAssetsClub;

  /// The number of reserved tokens.
  uint256 public reserved;
  /// The  Merkle Tree root that controls the OG, WL and the reservations.
  bytes32 public merkelRoot;

  mapping(address => uint256) public minted;
  mapping(address => bool) public claimed;

  /// Thrown when the mint is not open (before the START_DATE or after the PUBLIC_SALE_END_DATE).
  error Closed();
  /// Thrown when the mint quantity is invalid (only allowed values are 1, 2 or 3).
  error InvalidPricing(Tier tier, uint256 quantity, uint256 skip);
  /// Thrown when the Merkle Tree provided proof is invalid.
  error InvalidMerkleProof(address acccount);
  /// Thrown when the sender tier is insufficient.
  error InsufficientTier(address acccount, Tier tier);
  /// Thrown when the transaction value is insufficient.
  error InsufficientValue(uint256 quantity, uint256 expected, uint256 actual);
  /// Thrown when the supply is insufficient to execute the transaction.
  error InsufficientSupply(uint256 remaining, uint256 actual);
  /// Thrown when the wallet has already claimed his tokens.
  error AlreadyClaimed(address account, uint256 quantity);
  /// Thrown when a native transfer to treasury fails (but it should never happen).
  error TransferFailed(address from, address to, uint256 value);

  // ----- NFT Paris Collection -----
  /// TheAssetsClub at NFT ERC721 contract
  IERC721A public constant TACP_ERC721 = IERC721A(0xD13fbE29dbd15Bd0175122a4f8c90072c568511d);
  /// TheAssetsClub at NFT Paris used tokens
  mapping(uint256 => bool) public TACP_used;

  /// Thrown when the minter does not hold a TheAssetsClub at NFT Paris token
  error TACP_NotHolder(uint256 tokenId);
  /// Thrown when the minter tries to use TheAssetsClub at NFT Paris token for the second time
  error TACP_AlreadyUsed(uint256 tokenId);

  /**
   * @param _tac TheAssetsClub ERC721A contract address.
   * @param admin The admin multi-signature wallet.
   * @param payees The payees addresses.
   * @param shares_ The payees shares.
   */
  constructor(
    ITheAssetsClub _tac,
    address admin,
    address[] memory payees,
    uint256[] memory shares_
  ) PaymentSplitter(payees, shares_) {
    theAssetsClub = _tac;

    // Grant roles
    _transferOwnership(admin);
  }

  /**
   * @notice Get the current mint tier.
   */
  function phase() public view returns (Phase) {
    uint256 timestamp = block.timestamp;
    if (timestamp < START_DATE) {
      return Phase.CLOSED;
    }

    if (timestamp < PRIVATE_SALE_END_DATE) {
      return Phase.PRIVATE_SALE;
    }

    if (timestamp < PUBLIC_SALE_END_DATE) {
      return Phase.PUBLIC_SALE;
    }

    return Phase.CLOSED;
  }

  /**
   * @notice Get the price to pay to mint.
   * @param tier The tier to use (OG, WL or PUBLIC). Passing LOCKED will revert.
   * @param quantity The quantity to mint (maximum 3).
   * @return The price in Ether wei.
   */
  function getPrice(Tier tier, uint256 quantity, uint256 skip) public pure returns (uint256) {
    if (tier > Tier.OG || quantity == 0 || quantity + skip > MAXIMUM_MINTS) {
      revert InvalidPricing(tier, quantity, skip);
    }

    unchecked {
      // 3 free tokens for the OG, 2 for the access list
      uint256 free = tier == Tier.OG ? 3 : (tier == Tier.ACCESS_LIST ? 2 : 0);
      // skip cannot be greater than free
      free = free >= skip ? free - skip : 0;
      // free cannot be greater than quantity
      free = free >= quantity ? quantity : free;

      return SALE_PRICE * (quantity - free);
    }
  }

  /**
   * @notice Verify if a Merkle proof is valid.
   * @param account The account involved into the verification.
   * @param _type The proof type (0 for claim, 1 for mint).
   * @param data For claim proofs, the number of tokens to claim. For mint proofs, the wl tier.
   * @param proof The Merkle proof.
   */
  function verifyProof(
    address account,
    Proof _type,
    uint256 data,
    bytes32[] calldata proof
  ) public view returns (bool) {
    bytes32 leaf = keccak256(bytes.concat(keccak256(abi.encode(account, _type, data))));
    return MerkleProof.verifyCalldata(proof, merkelRoot, leaf);
  }

  /**
   * @notice Set the mint parameters.
   * @param _merkelRoot The new Merkle Tree root that controls the wait list and the reservations.
   * @param _reserved The total number of reservations.
   * @dev Requirements:
   * - Sender must be the owner.
   * - Mint should not have started yet.
   */
  function setMintParameters(bytes32 _merkelRoot, uint256 _reserved) external onlyOwner {
    merkelRoot = _merkelRoot;
    reserved = _reserved;
  }

  /**
   * @notice Mint Asset tokens.
   * @dev Requirements:
   * - A valid Merkle proof must be provided.
   * - Sender tier must be greater that the current tier (see {getTier}).
   * - Transaction value must be sufficient (see {getPrice}).
   */
  function mintTo(address to, uint256 quantity, Tier tier, bytes32[] calldata proof) external payable {
    Phase _phase = phase();
    if (_phase == Phase.CLOSED) {
      revert Closed();
    }

    Tier _tier;

    // for TheAssetsClub at NFT Paris holders
    if (proof.length == 1 && bytes32toAddress(proof[0]) == address(TACP_ERC721)) {
      uint256 tokenId = uint256(proof[0] >> 160);
      if (TACP_ERC721.ownerOf(tokenId) != to) {
        revert TACP_NotHolder(tokenId);
      } else if (TACP_used[tokenId]) {
        revert TACP_AlreadyUsed(tokenId);
      }

      TACP_used[tokenId] = true;
      _tier = Tier.ACCESS_LIST;
    }
    // claimed tier is greater than PUBLIC, verify the Merkle proof
    else if (tier > Tier.PUBLIC) {
      if (!verifyProof(to, Proof.MINT, uint256(tier), proof)) {
        revert InvalidMerkleProof(to);
      }

      _tier = tier;
    }

    uint256 remaining = theAssetsClub.remaining();

    if (_phase == Phase.PRIVATE_SALE) {
      // Unprivileged users cannot mint during the private sale
      if (_tier == Tier.PUBLIC) {
        revert InsufficientTier(to, tier);
      }

      // during the private sale, remaining tokens do not include reserved ones
      remaining -= reserved;
    }

    if (remaining < quantity) {
      revert InsufficientSupply(remaining, quantity);
    }

    uint256 price = getPrice(tier, quantity, minted[to]);
    if (msg.value < price) {
      revert InsufficientValue(quantity, msg.value, price);
    }

    minted[to] += quantity;
    theAssetsClub.mint(to, quantity);
  }

  /**
   * @notice Claim reserved tokens for free.
   * @dev Since the reserved
   */
  function claimTo(address to, uint256 quantity, bytes32[] calldata proof) external {
    Phase _phase = phase();
    if (_phase == Phase.CLOSED) {
      revert Closed();
    }

    if (!verifyProof(to, Proof.CLAIM, quantity, proof)) {
      revert InvalidMerkleProof(to);
    }

    if (claimed[to]) {
      revert AlreadyClaimed(to, quantity);
    }

    reserved -= quantity;
    claimed[to] = true;
    theAssetsClub.mint(to, quantity);
  }

  // ----- Utility functions ----
  /**
   * Convert a bytes32 to address.
   * @param input The bytes32 to convert.
   */
  function bytes32toAddress(bytes32 input) public pure returns (address addr) {
    assembly {
      mstore(0, input)
      addr := mload(0)
    }
  }
}
