// SPDX-License-Identifier: MIT
pragma solidity =0.8.18;

import { IERC721A } from "erc721a/contracts/IERC721A.sol";
import { TheAssetsClub, Phase } from "../TheAssetsClub.sol";

/**
 * @title TheAssetsClubMock
 * @author Mathieu "Windyy" Bour
 * @notice TheAssetsClub contract with an open mint function, intended to be used in automatited tests.
 */
contract TheAssetsClubMock is TheAssetsClub {
  Phase private _phase;

  constructor(
    address admin,
    address treasury,
    IERC721A _paris,
    address _coordinator,
    bytes32 _keyHash,
    uint64 _subId
  ) TheAssetsClub(admin, treasury, _paris, _coordinator, _keyHash, _subId) {}

  function mint(address to, uint256 quantity) external {
    _mint(to, quantity);
  }
}
