// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";
import "erc721psi/contracts/ERC721Psi.sol";

/**
 * @title TheAssetsClubOZ
 * @author Mathieu Bour
 * @dev The Assets Club NFT collection implementation based on Medieval DAO ERC721Psi contract.
 */
contract TheAssetsClubPsi is ERC721Psi, Ownable {
  uint256 public constant MAX_SUPPLY = 10000;

  constructor() ERC721Psi("The Assets Club", "TAC") {}

  function _baseURI() internal pure override returns (string memory) {
    return "https://theassets.club/api/nft/";
  }

  function mint(uint256 quantity) external payable {
    require(totalSupply() + quantity <= MAX_SUPPLY, "TheAssetsClub: minting quantity exceeds maxSupply");
    _mint(msg.sender, quantity);
  }

  function withdraw() external virtual onlyOwner {
    (bool sent, ) = payable(owner()).call{ value: address(this).balance }("");
    // solhint-disable-line avoid-low-level-calls
    require(sent, "TheAssetsClub: withdraw failure");
  }
}
