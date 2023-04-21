// SPDX-License-Identifier: MIT
pragma solidity =0.8.18;

import { VRFConsumerBaseV2 } from "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import { VRFCoordinatorV2Interface } from "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import { ERC2981 } from "@openzeppelin/contracts/token/common/ERC2981.sol";
import { ERC721A } from "erc721a/contracts/ERC721A.sol";
import { DefaultOperatorFilterer } from "operator-filter-registry/src/DefaultOperatorFilterer.sol";
import { Ownable } from "solady/src/auth/Ownable.sol";

/**
 * @title TheAssetsClub NFT Collection
 * @author Mathieu "Windyy" Bour
 * @notice The Assets Club NFT collection implementation based Azuki's ERC721A contract.
 * Less gas, more assets, thanks Azuki <3!
 *
 * In order to enforce the creator fees on secondary sales, we chose to adhere to the Operator Filter Registry
 * standard that was initially developed by OpenSea.
 * For more information, see https://github.com/ProjectOpenSea/operator-filter-registry
 *
 * Governance:
 * - TheAssetsClub owner can update the tokens base URI.
 */
contract TheAssetsClub is ERC721A, ERC2981, Ownable, VRFConsumerBaseV2, DefaultOperatorFilterer {
  /// The maximum Assets mints, which effectively caps the total supply.
  uint256 constant MAXIMUM_MINTS = 5777;

  /// Royalties 7.7% on secondary sales.
  uint96 constant ROYALTIES = 770;

  /// The address allowed to mint the Assets.
  address public minter;

  // Token URIs
  string private _contractURI = "https://static.theassets.club/contract.json";
  string private baseURI = "https://static.theassets.club/tokens/";

  /// If the collectioon has been reveal.
  /// This state has to seperated from seed since VRF request and fullfilment are written in seperate transactions.
  bool revealed = false;

  /// The collection reveal seed.
  uint256 public seed;

  // Chainlink VRF parameters
  VRFCoordinatorV2Interface public coordinator;
  bytes32 keyHash;
  uint64 subId;
  uint16 constant minimumRequestConfirmations = 10;
  uint32 constant callbackGasLimit = 2500000;
  uint256 requestId;

  error OnlyUnrevealed();
  error MaximumMintsReached(uint256 wanted, uint256 totalSupply);
  error InvalidVRFRequestId(uint256 expected, uint256 actual);
  error MinterAlreadySet();
  error OnlyMinter(address expected, address actual);

  constructor(
    address _coordinator,
    bytes32 _keyHash,
    uint64 _subId,
    address treasury
  ) ERC721A("The Assets Club", "TAC") VRFConsumerBaseV2(_coordinator) {
    coordinator = VRFCoordinatorV2Interface(_coordinator);
    keyHash = _keyHash;
    subId = _subId;

    _setDefaultRoyalty(treasury, ROYALTIES);
    _initializeOwner(msg.sender);
  }

  /**
   * @dev TheAssetsClub collection starts at token 1. This allow to have the token IDs between [1,5777].
   */
  function _startTokenId() internal view virtual override returns (uint256) {
    return 1;
  }

  /**
   * @dev Since the ERC721 token and the minter are deployed sequentially, the ERC721 contract does not know the minter
   * address in advance. This function allow to finish the contract initialization:
   * 1. Set the minter contract address.
   * 2. Transfer ownership the the final admin.
   *
   * @param admin The new admin address.
   * @param _minter The {TheAssetsClubMinter} contract address
   */
  function initialize(address admin, address _minter) external onlyOwner {
    if (minter != address(0)) {
      revert MinterAlreadySet();
    }

    minter = _minter;
    _setOwner(admin);
  }

  /**
   * @return The next token ID to be minted.
   * @dev This allow to have the upper bound incase of if we want to iterate over the owners.
   */
  function nextTokenId() external view returns (uint256) {
    return _nextTokenId();
  }

  /**
   * @return The OpenSea Contract-level metadata URI.
   * @dev See full specification here: https://docs.opensea.io/docs/contract-level-metadata
   */
  function contractURI() public view returns (string memory) {
    return _contractURI;
  }

  /**
   * @dev Allow to change the collection contractURI, most likely due to URI migration to IPFS.
   * Requirements:
   * - sender must be the contract owner
   *
   * @param newContractURI The new contract URI.
   */
  function setContractURI(string memory newContractURI) external onlyOwner {
    _contractURI = newContractURI;
  }

  /**
   * @return The base URI for the tokens.
   */
  function _baseURI() internal view override returns (string memory) {
    return baseURI;
  }

  /**
   * @dev Allow to change the collection base URI, most likely due to URI migration to IPFS.
   * Requirements:
   * - Sender must be the owner of the contract.
   *
   * @param newBaseURI The new contract base URI.
   */
  function setBaseURI(string memory newBaseURI) external onlyOwner {
    baseURI = newBaseURI;
  }

  /**
   * @notice The number of remaining tokens avaialble for mint.
   * This is a hard limit that the owner cannot change.
   */
  function remaining() external view returns (uint256) {
    return MAXIMUM_MINTS - _totalMinted();
  }

  /**
   * @notice Mint {quantity} tokens {to} account.
   * @dev Only used by {TheAssetsClub} minter.
   *
   * @param to The recipient account address.
   * @param quantity The number opf tokens to mint.
   */
  function mint(address to, uint256 quantity) external {
    if (msg.sender != minter) {
      revert OnlyMinter(minter, msg.sender);
    }

    uint256 totalMinted = _totalMinted();

    if (totalMinted + quantity > MAXIMUM_MINTS) {
      revert MaximumMintsReached(quantity, totalMinted);
    }

    _mint(to, quantity);
  }

  /**
   * @notice Burn a existing token.
   * @dev Requirements:
   * - Sender must be the owner of the token or should have approved the burn.
   *
   * @param tokenId The token id to burn.
   */
  function burn(uint256 tokenId) external {
    _burn(tokenId, true);
  }

  /**
   * @notice Trigger the reveal.
   * @dev Requirements:
   * - Sender must be the owner of the contract.
   * - Reveal should not have started yet.
   */
  function reveal() external onlyOwner {
    if (revealed) {
      revert OnlyUnrevealed();
    }

    revealed = true;
    requestId = coordinator.requestRandomWords(keyHash, subId, minimumRequestConfirmations, callbackGasLimit, 1);
  }

  /**
   * @dev Receive the entropy from Chainlink VRF coordinator.
   */
  function fulfillRandomWords(uint256 _requestId, uint256[] memory randomWords) internal override {
    if (requestId != _requestId) {
      revert InvalidVRFRequestId(requestId, _requestId);
    }

    seed = randomWords[0];
  }

  /**
   * @notice IERC165 declaration.
   * @dev Supports the following `interfaceId`s:
   * - IERC165: 0x01ffc9a7
   * - IERC721: 0x80ac58cd
   * - IERC721Metadata: 0x5b5e139f
   * - IERC2981: 0x2a55205a
   */
  function supportsInterface(bytes4 interfaceId) public view virtual override(ERC2981, ERC721A) returns (bool) {
    return super.supportsInterface(interfaceId) || ERC721A.supportsInterface(interfaceId);
  }
}
