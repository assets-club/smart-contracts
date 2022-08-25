// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

/**
 * @title SimpleWhitelist
 * @author Mathieu "Windyy" Bour
 * @dev Simplest whitelist consumer interface.
 */
interface SimpleWhitelist {
  /**
   * @dev Check if the provided account is whitelisted.
   */
  function isWhitelisted(address account) external returns (bool);
}
