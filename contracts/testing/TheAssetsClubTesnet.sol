// SPDX-License-Identifier: MIT
pragma solidity =0.8.18;

import { IERC721A } from "erc721a/contracts/IERC721A.sol";
import { TheAssetsClub, Phase } from "../TheAssetsClub.sol";

/**
 * @title TheAssetsClubTesnet
 * @author Mathieu "Windyy" Bour
 * @notice TheAssetsClub contract with a settable phase an an open mint function, intend to run on testnets.
 */
contract TheAssetsClubTesnet is TheAssetsClub {
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

  function setPhase(Phase newPhase) public onlyOwner {
    _phase = newPhase;
  }

  function phase() public view override returns (Phase) {
    return _phase;
  }
}
