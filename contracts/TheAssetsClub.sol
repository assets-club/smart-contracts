// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "erc721a/contracts/ERC721A.sol";

/**
 * @title TheAssetsClub NFT Collection
 * @author Mathieu "Windyy" Bour
 * @notice The Assets Club NFT collection implementation based Azuki's ERC721A contract.
 * Less gas, more assets, thanks Azuki <3!
 * @dev Implemented roles
 * - DEFAULT_ADMIN_ROLE assigned to the deployer account only and will be renounced shorty after successful deployment
 * - MINTER assigned to the TheAssetsClubMint contract, will be renounced as soon as the mint is finished
 * - MAINTAINER assign to TheAssetsClub multisig wallet, allows to perform exceptional maintained of the metadata URIs,
 *   for example if the domain theassets.club is hijacked.
 */
contract TheAssetsClub is ERC721A, AccessControl, VRFConsumerBaseV2 {
  uint256 public constant MAXIMUM_MINTS = 5777;

  // Roles
  bytes32 public constant MINTER = keccak256("MINTER");
  bytes32 public constant OPERATOR = keccak256("OPERATOR");

  string private _contractURI = "https://theassets.club/api/contract";
  string private baseURI = "https://theassets.club/api/nft/";

  // State
  mapping(uint256 => uint256) tokenMap;
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
    uint64 _subId
  ) ERC721A("The Assets Club", "TAC") VRFConsumerBaseV2(_coordinator) {
    coordinator = VRFCoordinatorV2Interface(_coordinator);
    keyHash = _keyHash;
    subId = _subId;
    _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
  }

  /**
   * @notice Ensure that the function cannot be called after reveal.
   */
  modifier onlyUnrevealed() {
    if (revealed) {
      revert OnlyUnrevealed();
    }
    _;
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
    uint256 mappedTokenId = tokenMap[tokenId];
    return string(abi.encodePacked(super.tokenURI(mappedTokenId), ".json"));
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
   * @notice Trigger the reveal.
   * @dev Requirements:
   * - reveal should not have started yet
   * - only MAINTAINER role can call this function
   */
  function reveal() external onlyUnrevealed onlyRole(OPERATOR) {
    revealed = true;
    requestId = coordinator.requestRandomWords(keyHash, subId, minimumRequestConfirmations, callbackGasLimit, 1);
  }

  /**
   * @notice Receive the entropy from Chainlink VRF coordinator and shuffle the tokens using the Fisher-Yates algorithm.
   */
  function fulfillRandomWords(uint256 _requestId, uint256[] memory randomWords) internal override {
    if (requestId != _requestId) {
      revert InvalidVRFRequestId(requestId, _requestId);
    }
    seed = randomWords[0];
  }

  /**
   * @notice Mark ERC721 and AccessControl as supported interfaces.
   */
  function supportsInterface(bytes4 interfaceId) public view virtual override(ERC721A, AccessControl) returns (bool) {
    return super.supportsInterface(interfaceId);
  }
}
