// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";
import "erc721a/contracts/ERC721A.sol";

/**
 * @title TheAssetsClub NFT Collection
 * @author Mathieu "Windyy" Bour
 * @dev The Assets Club NFT collection implementation based Azuki's ERC721A contract.
 * Less gas, more assets, thanks Azuki<3!
 */
contract TheAssetsClub is ERC721A, Ownable {
  struct Threshold {
    uint256 limit;
    uint256 quantity;
  }

  uint256 public immutable maxSupply;
  uint256 public immutable minETHBalance;
  uint256 public immutable maxTACBalance;
  Threshold[] public thresholds;

  bool public closed = false;

  constructor(
    uint256 _maxSupply,
    uint256 _minETHBalance,
    uint256 _maxTACBalance,
    uint256[] memory _thresholdLimits,
    uint256[] memory _thresholdQuantities
  ) ERC721A("The Assets Club", "TAC") {
    require(_thresholdLimits.length == _thresholdQuantities.length, "TheAssetsClub: threshold length mismatch");

    maxSupply = _maxSupply;
    minETHBalance = _minETHBalance;
    maxTACBalance = _maxTACBalance;

    for (uint256 i = 0; i < _thresholdLimits.length; i++) {
      thresholds.push(Threshold(_thresholdLimits[i], _thresholdQuantities[i]));
    }
  }

  function _baseURI() internal pure override returns (string memory) {
    return "https://theassets.club/api/nft/";
  }

  function quantity() public view returns (uint256) {
    uint256 willMint = 1;
    uint256 totalMinted = _totalMinted();

    for (uint256 i = 0; i < thresholds.length; i++) {
      if (totalMinted < thresholds[i].limit && willMint < thresholds[i].quantity) {
        willMint = thresholds[i].quantity;
      }
    }

    return willMint;
  }

  /**
   * @dev Allow users to mint NFTs.
   */
  function mint() external payable {
    require(!closed, "TheAssetsClub: minting is closed (forever!)");
    require(address(_msgSender()).balance >= minETHBalance, "TheAssetsClub: minting requires to hold ethers");

    uint256 willMint = quantity();

    require(totalSupply() + willMint <= maxSupply, "TheAssetsClub: minting quantity exceeds maxSupply");

    _mint(msg.sender, willMint);
  }

  function close() external onlyOwner {
    closed = true;
  }

  /**
   * @dev Allow to withdraw the contract balance
   */
  function withdraw() external onlyOwner {
    // solhint-disable-next-line avoid-low-level-calls
    (bool sent, ) = payable(owner()).call{ value: address(this).balance }("");
    require(sent, "TheAssetsClub: withdraw failure");
  }
}
