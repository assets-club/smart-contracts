// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./SimpleWhitelist.sol";

/**
 * @title Whitelist
 * @author Mathieu "Windyy" Bour
 * @dev Allow an owner to manage a address whitelist.
 */
contract Whitelist is SimpleWhitelist, Ownable {
  mapping(address => bool) list;

  event Added(address indexed account);
  event Removed(address indexed account);

  /**
   * @dev Add multiple accounts to the whitelist.
   */
  function add(address[] memory accounts) external onlyOwner {
    for (uint256 i = 0; i < accounts.length; i++) {
      list[accounts[i]] = true;
      emit Added(accounts[i]);
    }
  }

  /**
   * @dev Remove multiple accounts to the whitelist.
   */
  function remove(address[] memory accounts) external onlyOwner {
    for (uint256 i = 0; i < accounts.length; i++) {
      list[accounts[i]] = false;
      emit Removed(accounts[i]);
    }
  }

  /**
   * @dev Check if the provided account is whitelisted.
   */
  function isWhitelisted(address account) external view returns (bool) {
    return list[account];
  }
}
