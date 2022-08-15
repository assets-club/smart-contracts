// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "./TheAssetsClubBase.sol";

/**
 * @title TheAssetsClubOZ
 * @author Mathieu Bour
 * @dev The Assets Club NFT collection implementation based on OpenZeppelin's ERC721Enumerable contract.
 */
contract TheAssetsClubOZ is ERC721Enumerable, TheAssetsClubBase {
  using Counters for Counters.Counter;

  /// @dev The token id tracker, starts at zero.
  Counters.Counter private tracker;

  constructor(uint256 _maxSupply) ERC721("The Assets Club", "TAC") TheAssetsClubBase(_maxSupply) {}

  function mint(uint256 count) external payable override {
    require(totalSupply() + count < maxSupply, "TheAssetsClub: minting count exceeds maxSupply");

    for (uint256 i = 0; i < count; i++) {
      _safeMint(_msgSender(), tracker.current());
      tracker.increment();
    }
  }
}
