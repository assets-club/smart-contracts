// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";
import "erc721a/contracts/ERC721A.sol";
import "operator-filter-registry/src/DefaultOperatorFilterer.sol";

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
 * Implemented roles:
 * - DEFAULT_ADMIN_ROLE assigned to the deployer account only and will be renounced quickly after successful deployment.
 * - MINTER assigned to the TheAssetsClubMinter contract, will be renounced as soon as the mint is finished.
 * - OPERATOR assign to TheAssetsClub multi-signature wallet, allows to perform exceptional maintained of the metadata
 *   URIs, for example if the domain theassets.club is hijacked.
 */
contract TheAssetsClub is ERC721A, ERC2981, AccessControl, VRFConsumerBaseV2, DefaultOperatorFilterer {
  /// The maximum Assets mints, which effectively caps the total supply
  uint256 public constant MAXIMUM_MINTS = 5777;
  /// Royalties 5% on secondary sales
  uint96 public constant ROYALTIES = 500;

  // Roles
  bytes32 public constant MINTER = keccak256("MINTER");
  bytes32 public constant OPERATOR = keccak256("OPERATOR");

  // Token URIs
  string private _contractURI = "https://static.theassets.club/contract.json";
  string private baseURI = "https://static.theassets.club/tokens/";

  // State
  bool public revealed = false;
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

  constructor(
    address _coordinator,
    bytes32 _keyHash,
    uint64 _subId,
    address admin,
    address treasury
  ) ERC721A("The Assets Club", "TAC") VRFConsumerBaseV2(_coordinator) {
    coordinator = VRFCoordinatorV2Interface(_coordinator);
    keyHash = _keyHash;
    subId = _subId;

    _setDefaultRoyalty(treasury, ROYALTIES);

    _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    _grantRole(OPERATOR, admin);
  }

  /**
   * @notice The next token ID to be minted.
   */
  function nextTokenId() external view returns (uint256) {
    return _nextTokenId();
  }

  /**
   * @dev The base URI for the tokens.
   */
  function contractURI() public view returns (string memory) {
    return _contractURI;
  }

  /**
   * @dev Allow to change the collection contractURI, most likely due to URL migration.
   * We wil try not use this method and use HTTP redirects instead, but we keep it as an escape hatch.
   */
  function setContractURI(string memory newContractURI) external onlyRole(OPERATOR) {
    _contractURI = newContractURI;
  }

  /**
   * @dev The base URI for the tokens.
   */
  function _baseURI() internal view override returns (string memory) {
    return baseURI;
  }

  /**
   * @dev Allow to change the collection baseURI, most likely due to URL migration.
   * We wil try not use this method and use HTTP redirects instead, but we keep it as an escape hatch.
   */
  function setBaseURI(string memory newBaseURI) external onlyRole(OPERATOR) {
    baseURI = newBaseURI;
  }

  /**
   * @notice Returns the Uniform Resource Identifier (URI) for `tokenId` token.
   * @dev We append a .json extension to host the metadata as JSON files.
   * @param tokenId The token numeric id.
   */
  function tokenURI(uint256 tokenId) public view override returns (string memory) {
    uint256 tokenId_ = tokenId;

    if (revealed) {
      tokenId_ = (tokenId + seed) % _totalMinted();
    }

    return string(abi.encodePacked(super.tokenURI(tokenId_), ".json"));
  }

  /**
   * @notice The number of remaining Asset tokens.
   */
  function remaining() external view returns (uint256) {
    return MAXIMUM_MINTS - _totalMinted();
  }

  /**
   * @notice Mint {quantity} tokens {to} account.
   * @param to The recipient account address.
   * @param quantity The number opf tokens to mint.
   */
  function mint(address to, uint256 quantity) external onlyRole(MINTER) {
    uint256 totalMinted = _totalMinted();

    if (totalMinted + quantity > MAXIMUM_MINTS) {
      revert MaximumMintsReached(quantity, totalMinted);
    }

    _mint(to, quantity);
  }

  /**
   * @notice Burn a token.
   * @dev Requirements:
   * - Sender must be the owner of the token or should have approved the burn.
   */
  function burn(uint256 tokenId) external {
    _burn(tokenId, true);
  }

  /**
   * @notice Trigger the reveal.
   * @dev Requirements:
   * - reveal should not have started yet
   * - only OPERATOR role can call this function
   */
  function reveal() external onlyRole(OPERATOR) {
    if (revealed) {
      revert OnlyUnrevealed();
    }

    revealed = true;
    requestId = coordinator.requestRandomWords(keyHash, subId, minimumRequestConfirmations, callbackGasLimit, 1);
  }

  /**
   * @notice Receive the entropy from Chainlink VRF coordinator
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
  function supportsInterface(bytes4 interfaceId)
    public
    view
    virtual
    override(ERC721A, ERC2981, AccessControl)
    returns (bool)
  {
    return super.supportsInterface(interfaceId) || ERC721A.supportsInterface(interfaceId);
  }
}
