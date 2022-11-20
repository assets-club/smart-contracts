// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "./interfaces/ITheAssetsClub.sol";

contract TheAssetsClubMinter is AccessControl {
  // Roles
  bytes32 public constant OPERATOR = keccak256("OPERATOR");

  uint256 public constant PRIVATE_SALE_PRICE = 0.05 ether;
  /// The private sale duration, in seconds
  uint256 public constant PRIVATE_SALE_DURATION = 24 * 3600;
  uint256 public constant PUBLIC_SALE_PRICE = 0.07 ether;

  /// TheAssetsClub smart contract.
  ITheAssetsClub tac;
  /// TheAssetsClub treasury wallet.
  address treasury;
  /// The UNIX timestamp when the public sale will be open.
  uint256 privateSaleTimestamp;
  /// The UNIX timestamp when the public sale will be open.
  uint256 publicSaleTimestamp;

  mapping(address => bool) public waitList;

  event AddedToWaitList(address account);

  error StartDateAlreadySet();
  error NotWaitListed(address acccount);
  error InsufficientValue(uint256 quantity, uint256 expected, uint256 actual);
  /// Thrown when a native transfer to treasury fails (but it should never happen).
  error TransferFailed(address from, address to, uint256 value);

  constructor(ITheAssetsClub _tac, address _treasury) {
    tac = _tac;
    treasury = _treasury;

    _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    _grantRole(OPERATOR, treasury);
  }

  function setStartDate(uint256 newStartDate) external onlyRole(OPERATOR) {
    if (privateSaleTimestamp != 0) {
      revert StartDateAlreadySet();
    }

    privateSaleTimestamp = newStartDate;
    publicSaleTimestamp = newStartDate + PRIVATE_SALE_DURATION;
  }

  function addWaitList(address[] memory accounts) external onlyRole(OPERATOR) {
    for (uint256 i = 0; i < accounts.length; i++) {
      waitList[accounts[i]] = true;
      emit AddedToWaitList(accounts[i]);
    }
  }

  function isPrivateSale() internal view returns (bool) {
    return publicSaleTimestamp > block.timestamp;
  }

  function getPrice(uint256 quantity) public view returns (uint256) {
    if (quantity == 0) {
      return 0;
    }

    if (isPrivateSale()) {
      return (quantity - 1) * PRIVATE_SALE_PRICE;
    }

    return quantity * PUBLIC_SALE_PRICE;
  }

  function mintTo(address to, uint256 quantity) external payable {
    if (isPrivateSale() && !waitList[to]) {
      revert NotWaitListed(to);
    }

    uint256 minimumValue = getPrice(quantity);
    if (msg.value < minimumValue) {
      revert InsufficientValue(quantity, msg.value, minimumValue);
    }

    tac.mint(to, quantity);
  }

  function withdraw() external onlyRole(OPERATOR) {
    (bool sent, ) = treasury.call{ value: address(this).balance }("");
    if (!sent) {
      revert TransferFailed(address(this), treasury, address(this).balance);
    }
  }
}
