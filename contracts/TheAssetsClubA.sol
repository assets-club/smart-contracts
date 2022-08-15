// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";
import "erc721a/contracts/ERC721A.sol";
import "./TheAssetsClubBase.sol";

/**
 * @title TheAssetsClubOZ
 * @author Mathieu Bour
 * @dev The Assets Club NFT collection implementation based Azuki's ERC721A contract.
 */
contract TheAssetsClubA is ERC721A, TheAssetsClubBase {
  constructor(uint256 _maxSupply) ERC721A("The Assets Club", "TAC") TheAssetsClubBase(_maxSupply) {}

  function mint(uint256 quantity) external payable override {
    require(totalSupply() + quantity <= maxSupply, "TheAssetsClub: minting quantity exceeds maxSupply");
    _mint(msg.sender, quantity);
  }
}
