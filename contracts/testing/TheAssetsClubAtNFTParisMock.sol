// SPDX-License-Identifier: MIT
pragma solidity =0.8.18;

import { ERC721A } from "erc721a/contracts/ERC721A.sol";

/**
 * @title TheAssetsClubAtNFTParisMock
 * @dev Used to replicate the TheAssetsClubAtNFTParis contract.
 */
contract TheAssetsClubAtNFTParisMock is ERC721A {
  constructor() ERC721A("TheAssetsClub at NFT Paris", "TACP") {}

  /**
   * @notice Mint a token to any address.
   * @dev This function is intentionnaly unrestricted.
   * @param quantity The number of tokens to mint.
   */
  function mint(uint256 quantity) external {
    _mint(msg.sender, quantity);
  }
}
