// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";
import "erc721psi/contracts/ERC721Psi.sol";
import "./TheAssetsClubBase.sol";

/**
 * @title TheAssetsClubOZ
 * @author Mathieu Bour
 * @dev The Assets Club NFT collection implementation based on Medieval DAO ERC721Psi contract.
 */
contract TheAssetsClubPsi is ERC721Psi, TheAssetsClubBase {
  constructor(uint256 _maxSupply) ERC721Psi("The Assets Club", "TAC") TheAssetsClubBase(_maxSupply) {}

  function mint(uint256 quantity) external payable override {
    require(totalSupply() + quantity <= maxSupply, "TheAssetsClub: minting quantity exceeds maxSupply");
    _mint(msg.sender, quantity);
  }
}
