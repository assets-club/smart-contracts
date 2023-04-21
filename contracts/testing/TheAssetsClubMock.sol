// SPDX-License-Identifier: MIT
pragma solidity =0.8.18;

import { IERC721A } from "erc721a/contracts/IERC721A.sol";
import { TheAssetsClub } from "../TheAssetsClub.sol";

contract TheAssetsClubMock is TheAssetsClub {
  constructor(
    address admin,
    IERC721A _tacp,
    address _coordinator,
    bytes32 _keyHash,
    uint64 _subId
  ) TheAssetsClub(admin, _tacp, _coordinator, _keyHash, _subId) {}

  function mint(address to, uint256 quantity) external {
    _mint(to, quantity);
  }
}
