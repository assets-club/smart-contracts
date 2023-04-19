// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import { ERC721A } from "erc721a/contracts/ERC721A.sol";

contract ERC721Mock is ERC721A {
  constructor() ERC721A("ERC721Mock", "Mock") {}

  function mintTo(address to, uint256 quantity) external {
    _mint(to, quantity);
  }
}
