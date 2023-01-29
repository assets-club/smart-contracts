// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/ITheAssetsClub.sol";

enum Tier {
  PUBLIC,
  WAITLIST,
  OG,
  LOCKED
}

/**
 * @title TheAssetsClub NFT Collection
 * @author Mathieu "Windyy" Bour
 */
contract TheAssetsClubMinter is Ownable {
  uint256 public constant PRIVATE_SALE_PRICE = 0.05 ether;
  uint256 public constant PUBLIC_SALE_PRICE = 0.07 ether;
  uint256 public constant OG_DURATION = 24 * 3600; // in seconds
  uint256 public constant WAITLIST_DURATION = 24 * 3600; // in seconds

  /// TheAssetsClub smart contract.
  ITheAssetsClub public tac;
  /// TheAssetsClub treasury wallet.
  address public splitter;
  /// The waitlist sale start date.
  uint256 public startDate;

  /// The number of reserved tokens.
  uint256 public reserved = 0;
  /// The reservations mapping.
  mapping(address => uint8) public reservations;
  /// The waitlist mapping.
  mapping(address => Tier) public waitList;

  /// Fired when an account is added to the waitlist
  event AddedToWaitList(address account, Tier tier);

  /// Thrown when the mint start date has already be defined.
  error AlreadyStarted();
  /// Thrown when the argument of a batched function have not the same length.
  error ArgumentSizeMismatch(uint256 x, uint256 y);
  /// Thrown when the mint quantity is invalid (only allowed values are 1, 2 or 3).
  error InvalidQuantity(uint256 quantity);
  /// Thrown when the mint is still locked.
  error Locked();
  /// Thrown when the sender tier is insufficient.
  error InsufficientTier(address acccount, Tier tier, Tier current);
  /// Thrown when the transaction value is insufficient.
  error InsufficientValue(uint256 quantity, uint256 expected, uint256 actual);
  /// Thrown when the supply is insufficient to execute the transaction.
  error InsufficientSupply(uint256 remaining, uint256 actual);
  /// Thrown when a native transfer to treasury fails (but it should never happen).
  error TransferFailed(address from, address to, uint256 value);

  /**
   * @param _tac TheAssetsClub ERC721A contract address.
   * @param _treasury The treasury address, where all the funds of the primary sale will be forwarded.
   * @param rAccounts The reserved wallet addresses.
   * @param rValues The reserved mint amounts.
   * @param admin The admin multi-signature wallet.
   */
  constructor(
    ITheAssetsClub _tac,
    address _treasury,
    address[] memory rAccounts,
    uint8[] memory rValues,
    address admin
  ) {
    if (rAccounts.length != rValues.length) {
      revert ArgumentSizeMismatch(rAccounts.length, rValues.length);
    }

    tac = _tac;
    splitter = _treasury;

    // Add reservation for the Assets contributors.
    for (uint256 i = 0; i < rAccounts.length; i++) {
      if (reserved + rValues[i] > _tac.remaining()) {
        revert InsufficientSupply(_tac.remaining(), rValues[i]);
      }

      reserved += rValues[i];
      reservations[rAccounts[i]] = rValues[i];
    }

    // Grant roles
    transferOwnership(admin);
  }

  /**
   * @notice The number of tokens available for the mint.
   * @dev The Assets supply minus teh reserved tokens.
   */
  function remaining() public view returns (uint256) {
    return tac.remaining() - reserved;
  }

  /**
   * @notice Add wallets to waitlist, alongside their tiers.
   * @param accounts The wallet addresses.
   * @param tiers The associated waitlist tiers.
   * @dev Requirements:
   * - Sender must be OPERATOR.
   * - accounts.length must equal tiers.length.
   */
  function addWaitList(address[] memory accounts, Tier[] memory tiers) external onlyOwner {
    if (accounts.length != tiers.length) {
      revert ArgumentSizeMismatch(accounts.length, tiers.length);
    }

    for (uint256 i = 0; i < accounts.length; i++) {
      waitList[accounts[i]] = tiers[i];
      emit AddedToWaitList(accounts[i], tiers[i]);
    }
  }

  /**
   * @notice Set the mint start date.
   * @param newStartDate The new start date as an UNIX timestamp.
   * @dev Requirements:
   * - Sender must be OPERATOR.
   * - Mint start date cannot be set twice.
   */
  function setStartDate(uint256 newStartDate) external onlyOwner {
    if (startDate != 0) {
      revert AlreadyStarted();
    }

    startDate = newStartDate;
  }

  /**
   * @notice Get the current mint tier.
   */
  function getTier() public view returns (Tier) {
    if (startDate == 0 || startDate > block.timestamp) {
      return Tier.LOCKED;
    }

    if (block.timestamp < startDate + OG_DURATION) {
      return Tier.OG;
    }

    if (block.timestamp < startDate + OG_DURATION + WAITLIST_DURATION) {
      return Tier.WAITLIST;
    }

    return Tier.PUBLIC;
  }

  /**
   * @notice Get the price to pay to mint.
   * @param tier The tier to use (OG, WAITLIST or PUBLIC). Passing LOCKED will revert.
   * @param quantity The quantity to mint (maximum 3).
   * @return The price in Ether wei.
   */
  function getPrice(Tier tier, uint256 quantity) public pure returns (uint256) {
    if (quantity == 0 || quantity > 3) {
      revert InvalidQuantity(quantity);
    }

    uint8 free;
    uint256 price;
    uint256 total = 0;

    if (tier == Tier.OG) {
      free = 2;
      price = PRIVATE_SALE_PRICE;
    } else if (tier == Tier.WAITLIST) {
      free = 1;
      price = PRIVATE_SALE_PRICE;
    } else if (tier == Tier.PUBLIC) {
      free = 0;
      price = PUBLIC_SALE_PRICE;
    } else {
      revert Locked();
    }

    for (; quantity > 0; quantity--) {
      if (free > 0) {
        free--;
        continue;
      }

      total += price;
    }

    return total;
  }

  /**
   * @notice Mint Asset tokens.
   * @dev Requirements:
   * - Sender tier must be greater that the current tier (see {getTier}).
   * - Sender tier must be greater that the current tier (see {getTier}).
   * - Transaction value must be sufficient (see {getPrice}).
   */
  function mintTo(address to, uint256 quantity) external payable {
    Tier tier = getTier();
    Tier senderTier = waitList[to];

    if (senderTier < tier) {
      revert InsufficientTier(to, senderTier, tier);
    }

    if (tac.remaining() - reserved < quantity) {
      revert InsufficientSupply(tac.remaining() - reserved, quantity);
    }

    uint256 price = getPrice(senderTier, quantity);
    if (msg.value < price) {
      revert InsufficientValue(quantity, msg.value, price);
    }

    tac.mint(to, quantity);
  }

  /**
   * @notice Claim reserved tokens for free.
   */
  function claim() external {
    uint256 _reserved = uint256(reservations[msg.sender]);
    reservations[msg.sender] = 0;
    reserved -= _reserved;
    tac.mint(msg.sender, _reserved);
  }

  /**
   * @notice Withdraw the Ethers stored on the contract and send them to the treasury.
   * @dev Anyone can call this function (and pay the gas for us :D).
   */
  function withdraw() external {
    (bool sent, ) = splitter.call{ value: address(this).balance }("");
    if (!sent) {
      revert TransferFailed(address(this), splitter, address(this).balance);
    }
  }
}
