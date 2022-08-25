// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";
import "erc721a/contracts/ERC721A.sol";
import "./SimpleWhitelist.sol";

enum Phase {
  EARLY,
  OPEN,
  CLOSED
}

/**
 * @title TheAssetsClub NFT Collection
 * @author Mathieu "Windyy" Bour
 * @dev The Assets Club NFT collection implementation based Azuki's ERC721A contract.
 * Less gas, more assets, thanks Azuki <3!
 */
contract TheAssetsClub is ERC721A, Ownable {
  struct Threshold {
    uint256 limit;
    uint256 quantity;
  }

  uint256 public immutable maxSupply;
  uint256 public immutable minETHBalance;
  uint256 public immutable maxTACBalance;
  Threshold[] public thresholds;

  /** @dev Internal state which holds if an account is the allow to mint during the private sale. */
  Phase state = Phase.EARLY;
  string private baseURI = "https://theassets.club/api/nft/";
  SimpleWhitelist whitelist;
  uint256 publicAt = 0;

  constructor(
    uint256 _maxSupply,
    uint256 _minETHBalance,
    uint256 _maxTACBalance,
    SimpleWhitelist _whitelist,
    uint256[] memory _thresholdLimits,
    uint256[] memory _thresholdQuantities
  ) ERC721A("The Assets Club", "TAC") {
    require(
      _thresholdLimits.length == _thresholdQuantities.length,
      "TheAssetsClub: threshold parameters length mismatch"
    );

    maxSupply = _maxSupply;
    minETHBalance = _minETHBalance;
    maxTACBalance = _maxTACBalance;
    whitelist = _whitelist;

    for (uint256 i = 0; i < _thresholdLimits.length; i++) {
      thresholds.push(Threshold(_thresholdLimits[i], _thresholdQuantities[i]));
    }
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
  function setBaseURI(string memory newBaseURI) external onlyOwner {
    baseURI = newBaseURI;
  }

  /**
   * @dev Returns the Uniform Resource Identifier (URI) for `tokenId` token.
   * We append a .json extension to host the metadata as JSON files.
   */
  function tokenURI(uint256 tokenId) public view override returns (string memory) {
    return string(abi.encodePacked(super.tokenURI(tokenId), ".json"));
  }

  /**
   * @dev Returns the tokens count that will be minted during the next transaction.
   */
  function quantity() public view returns (uint256) {
    uint256 willMint = 1;
    uint256 totalMinted = _totalMinted();

    for (uint256 i = 0; i < thresholds.length; i++) {
      if (totalMinted < thresholds[i].limit && willMint < thresholds[i].quantity) {
        willMint = thresholds[i].quantity;
      }
    }

    return willMint;
  }

  /**
   * @dev Open the mint process.
   * @param _publicAt specifies when the mint become public (e.g. does not require to be whitelisted).
   */
  function open(uint256 _publicAt) external onlyOwner {
    require(state == Phase.EARLY, "TheAssetsClub: state must be Phase.EARLY");
    state = Phase.OPEN;
    publicAt = _publicAt;
  }

  /**
   * @dev Close the mint process, forever; the collection will stay at is current supply.
   */
  function close() external onlyOwner {
    state = Phase.CLOSED;
  }

  /**
   * @dev Allow users to mint NFTs. Users might send some ethers during the mint as tip.
   * Requirements:
   * - mint process must not be closed
   * - minter must own at least `minETHBalance` ethers
   * - minter must not own more than `maxTACBalance` tokens
   * - totalSupply + mint count should not exceed
   */
  function mint() external payable {
    address minter = _msgSender();

    if (state == Phase.EARLY) {
      revert("TheAssetsClub: mint is not yet open");
    } else if (state == Phase.OPEN && block.timestamp < publicAt && !whitelist.isWhitelisted(minter)) {
      revert("TheAssetsClub: account is not whitelisted");
    } else if (state == Phase.CLOSED) {
      revert("TheAssetsClub: mint is closed (forever!)");
    }

    require(address(minter).balance >= minETHBalance, "TheAssetsClub: minting requires to hold ethers");

    uint256 willMint = quantity();

    require(balanceOf(minter) + willMint <= maxTACBalance, "TheAssetsClub: maximum mint reached!");
    require(totalSupply() + willMint <= maxSupply, "TheAssetsClub: minting quantity exceeds maxSupply");

    _mint(minter, willMint);
  }

  /**
   * @dev Allow to withdraw the contract balance to the owner, in case of someone sends some ether as tip.
   */
  function withdraw() external onlyOwner {
    // solhint-disable-next-line avoid-low-level-calls
    (bool sent, ) = payable(owner()).call{ value: address(this).balance }("");
    require(sent, "TheAssetsClub: withdraw failure");
  }
}
