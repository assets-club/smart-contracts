# The Assets Club smart contracts

![GitHub License](https://img.shields.io/github/license/assets-club/smart-contracts?style=for-the-badge)
![GitHub Release Date](https://img.shields.io/github/release-date/assets-club/smart-contracts?style=for-the-badge)
![GitHub branch checks state](https://img.shields.io/github/checks-status/assets-club/smart-contracts/main?style=for-the-badge)
![Codecov](https://img.shields.io/codecov/c/gh/assets-club/smart-contracts?style=for-the-badge&token=oW4DQ9MuUh)

## NFT Paris

We are at the NFT Paris on February 24-25 2023! For this event, we deployed a special collection dedicated to NFT Paris.

Related links:

- [Etherscan](https://etherscan.io/address/0xd13fbe29dbd15bd0175122a4f8c90072c568511d)
- [OpenSea collection](https://opensea.io/collection/theassetsclub-at-nft-paris)

## Maintainers

This repository is proudly maintained by [@mathieu-bour](https://github.com/mathieu-bour), software engineer.

<table>
  <tr>
    <td align="center">
      <a href="https://github.com/mathieu-bour">
        <img src="https://avatars.githubusercontent.com/u/21281702?v=3?s=150" width="150px;" alt="Mathieu Bour"/>
        <br />
        <b>Mathieu "Windyy" Bour</b>
      </a>
    </td>
    <td align="center">
      <a href="https://github.com/Lymnah">
        <img src="https://avatars.githubusercontent.com/u/29931035?v=3?s=150" width="150px;" alt="Charly Mancel"/>
        <br />
        <b>Charly "Lymnah" Mancel</b>
      </a>
    </td>
  </tr>
</table>

## Architecture

The Assets Club has only a single smart contract, that is deployed on the Ethereum blockchain at [insert deployed address].

The contract is [ERC721-compatible](https://eips.ethereum.org/EIPS/eip-721) and is based on Asuki's [ERC721A implementation](https://www.erc721a.org).
The source can be found in [TheAssetsClub.sol](contracts/TheAssetsClub.sol).
