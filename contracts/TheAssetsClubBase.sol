// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title TheAssetsClubBase
 * @author Mathieu Bour
 * @dev Define the common base of The Assets Club NFT contract. This contract will be merged when we choose which
 * ERC721 implementation to use.
 */
abstract contract TheAssetsClubBase is Ownable {
  uint256 public immutable maxSupply;

  constructor(uint256 _maxSupply) {
    maxSupply = _maxSupply;
  }

  function mint(uint256 count) external payable virtual;

  function withdraw() external virtual onlyOwner {
    (bool sent, ) = payable(owner()).call{ value: address(this).balance }("");
    // solhint-disable-line avoid-low-level-calls
    require(sent, "TheAssetsClub: withdraw failure");
  }
}
