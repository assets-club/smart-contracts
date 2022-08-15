// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

/**
 * @title TheAssetsClubOZ
 * @author Mathieu Bour
 * @dev The Assets Club NFT collection implementation based on OpenZeppelin's ERC721Enumerable contract.
 */
contract TheAssetsClubOZ is ERC721, Ownable {
  uint256 public constant MAX_SUPPLY = 10000;

  /// @dev The token id tracker, starts at zero.
  uint256 private _minted = 0;

  constructor() ERC721("The Assets Club", "TAC") {}

  function _baseURI() internal pure override returns (string memory) {
    return "https://theassets.club/api/nft/";
  }

  function totalSupply() public view returns (uint256) {
    return _minted;
  }

  function mint(uint256 count) external payable {
    uint256 minted = totalSupply();
    require(minted + count < MAX_SUPPLY, "TheAssetsClub: minting count exceeds maxSupply");

    for (uint256 i = 0; i < count; i++) {
      _safeMint(_msgSender(), minted++);
    }

    _minted = minted;
  }

  function withdraw() external virtual onlyOwner {
    (bool sent, ) = payable(owner()).call{ value: address(this).balance }("");
    // solhint-disable-line avoid-low-level-calls
    require(sent, "TheAssetsClub: withdraw failure");
  }
}
