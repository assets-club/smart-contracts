// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "./interfaces/ITheAssetsClub.sol";

enum Proof {
  CLAIM,
  MINT
}

enum Tier {
  PUBLIC,
  WL,
  OG,
  LOCKED
}

/**
 * @title TheAssetsClub NFT Collection Minter
 * @author Mathieu "Windyy" Bour
 * @notice This contract will manage the mint of the Assets Club NFT collection.
 * @dev Four phases are planned (see {Tier} above)
 */
contract TheAssetsClubMinter is Ownable {
  uint256 public constant MAXIMUM_MINTS = 5;
  uint256 public constant PRIVATE_SALE_PRICE = 0.05 ether;
  uint256 public constant PUBLIC_SALE_PRICE = 0.07 ether;
  uint256 public constant OG_DURATION = 24 * 3600; // in seconds
  uint256 public constant WL_DURATION = 24 * 3600; // in seconds

  /// TheAssetsClub smart contract.
  ITheAssetsClub public tac;
  /// TheAssetsClub treasury wallet.
  address public treasury;

  /// The mint start date.
  uint256 public startDate;
  /// The number of reserved tokens.
  uint256 public reserved;
  /// The  Merkle Tree root that controls the OG, WL and the reservations.
  bytes32 public merkelRoot;

  mapping(address => uint256) minted;
  mapping(address => bool) claimed;

  /// Thrown when the mint start date is in the future.
  error NotStartedYet();
  /// Thrown when the mint start date is in the past.
  error AlreadyStarted();
  /// Thrown when the argument of a batched function have not the same length.
  error ArgumentSizeMismatch(uint256 x, uint256 y);
  /// Thrown when the mint quantity is invalid (only allowed values are 1, 2 or 3).
  error InvalidPricing(Tier tier, uint256 quantity, uint256 skip);
  /// Thrown when the Merkle Tree provided proof is invalid.
  error InvalidMerkleProof(address acccount);
  /// Thrown when the sender tier is insufficient.
  error InsufficientTier(address acccount, Tier tier, Tier current);
  /// Thrown when the transaction value is insufficient.
  error InsufficientValue(uint256 quantity, uint256 expected, uint256 actual);
  /// Thrown when the supply is insufficient to execute the transaction.
  error InsufficientSupply(uint256 remaining, uint256 actual);
  /// Thrown when the wallet has already claimed his tokens.
  error AlreadyClaimed(address account, uint256 quantity);
  /// Thrown when a native transfer to treasury fails (but it should never happen).
  error TransferFailed(address from, address to, uint256 value);

  /**
   * @param _tac TheAssetsClub ERC721A contract address.
   * @param _treasury The treasury address, where all the funds of the primary sale will be forwarded.
   * @param admin The admin multi-signature wallet.
   */
  constructor(ITheAssetsClub _tac, address _treasury, address admin) {
    tac = _tac;
    treasury = _treasury;

    // Grant roles
    transferOwnership(admin);
  }

  /**
   * Ensure that the transaction is after the mint start date.
   */
  modifier onlyBeforeStart() {
    if (startDate > 0 && block.timestamp > startDate) {
      revert AlreadyStarted();
    }
    _;
  }

  /**
   * Ensure that the transaction is before the mint start date.
   */
  modifier onlyAfterStart() {
    if (startDate == 0 || block.timestamp < startDate) {
      revert NotStartedYet();
    }
    _;
  }

  /**
   * @notice The number of tokens available for the mint.
   * @dev The Assets supply minus teh reserved tokens.
   */
  function remaining() public view returns (uint256) {
    return tac.remaining() - reserved;
  }

  /**
   * @notice Get the current mint tier.
   */
  function getTier() public view returns (Tier) {
    if (startDate == 0 || startDate > block.timestamp) {
      return Tier.LOCKED;
    }

    if (block.timestamp < startDate + OG_DURATION) {
      return Tier.OG;
    }

    if (block.timestamp < startDate + OG_DURATION + WL_DURATION) {
      return Tier.WL;
    }

    return Tier.PUBLIC;
  }

  /**
   * @notice Get the price to pay to mint.
   * @param tier The tier to use (OG, WL or PUBLIC). Passing LOCKED will revert.
   * @param quantity The quantity to mint (maximum 3).
   * @return The price in Ether wei.
   */
  function getPrice(Tier tier, uint256 quantity, uint256 skip) public pure returns (uint256) {
    if (tier >= Tier.LOCKED || quantity == 0 || quantity + skip > MAXIMUM_MINTS) {
      revert InvalidPricing(tier, quantity, skip);
    }

    unchecked {
      // 2 free tokens for the OG, 1 for the WL
      uint256 free = tier == Tier.OG ? 2 : (tier == Tier.WL ? 1 : 0);
      // OG and WL can mint for a privileged price
      uint256 price = tier == Tier.PUBLIC ? PUBLIC_SALE_PRICE : PRIVATE_SALE_PRICE;

      // skip cannot be greater than free
      free = free >= skip ? free - skip : 0;
      // free cannot be greater than quantity
      free = free >= quantity ? quantity : free;

      return price * (quantity - free);
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
   * @notice Set the mint start date.
   * @param newStartDate The new start date as an UNIX timestamp.
   * @dev Requirements:
   * - Sender must be OPERATOR.
   * - Mint start date cannot be changed after the mint start date.
   */
  function setStartDate(uint256 newStartDate) external onlyOwner onlyBeforeStart {
    startDate = newStartDate;
  }

  /**
   * @notice Set the mint parameters.
   * @param _merkelRoot The new Merkle Tree root that controls the wait list and the reservations.
   * @param _reserved The total number of reservations.
   * @dev Requirements:
   * - Sender must be the owner.
   * - Mint should not have started yet.
   */
  function setMintParameters(bytes32 _merkelRoot, uint256 _reserved) external onlyOwner onlyBeforeStart {
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
  function mintTo(address to, uint256 quantity, Tier tier, bytes32[] calldata proof) external payable onlyAfterStart {
    Tier contractTier = getTier();

    if (contractTier != Tier.PUBLIC && !verifyProof(to, Proof.MINT, uint256(tier), proof)) {
      revert InvalidMerkleProof(to);
    }

    if (tier < contractTier) {
      revert InsufficientTier(to, tier, contractTier);
    }

    if (tac.remaining() - reserved < quantity) {
      revert InsufficientSupply(tac.remaining() - reserved, quantity);
    }

    uint256 price = getPrice(tier, quantity, minted[to]);
    if (msg.value < price) {
      revert InsufficientValue(quantity, msg.value, price);
    }

    minted[to] += quantity;
    tac.mint(to, quantity);
  }

  /**
   * @notice Claim reserved tokens for free.
   * @dev Since the reserved
   */
  function claim(address to, uint256 quantity, bytes32[] calldata proof) external onlyAfterStart {
    if (!verifyProof(to, Proof.CLAIM, quantity, proof)) {
      revert InvalidMerkleProof(to);
    }

    if (claimed[to]) {
      revert AlreadyClaimed(to, quantity);
    }

    reserved -= quantity;
    claimed[to] = true;
    tac.mint(to, quantity);
  }

  /**
   * @notice Withdraw the Ethers stored on the contract and send them to the treasury.
   * @dev Anyone can call this function (and pay the gas for us :D).
   */
  function withdraw() external {
    (bool sent, ) = treasury.call{ value: address(this).balance }("");
    if (!sent) {
      revert TransferFailed(address(this), treasury, address(this).balance);
    }
  }
}
