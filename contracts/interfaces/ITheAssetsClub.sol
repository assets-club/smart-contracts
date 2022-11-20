// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/access/IAccessControl.sol";
import "erc721a/contracts/IERC721A.sol";

interface ITheAssetsClub is IERC721A, IAccessControl {
  function mint(address to, uint256 quantity) external;
}
