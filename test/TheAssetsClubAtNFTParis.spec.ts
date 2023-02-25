import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import { ethers } from 'hardhat';
import deploy from '../lib/deploy';
import { TheAssetsClubAtNFTParis } from '../typechain-types';

describe('TheAssetsClubAtNFTParis', () => {
  let owner: SignerWithAddress;
  let contract: TheAssetsClubAtNFTParis;

  beforeEach(async () => {
    [owner] = await ethers.getSigners();
    ({ contract } = await deploy(owner, { verify: false }));
  });

  describe('contractURI', async () => {
    expect(await contract.contractURI()).to.eq('https://static.theassets.club/nft-paris/contract.json');
  });

  describe('tokenURI', () => {
    it('tokenURI should be defined', async () => {
      await contract.connect(owner).mint(1);
      expect(await contract.tokenURI(0)).to.eq('https://static.theassets.club/nft-paris/0.json');
    });
  });

  describe('mint', () => {
    it('owner should be able to mint his tokens', async () => {
      await contract.connect(owner).mint(3);
    });
  });

  describe('burn', () => {
    it('owner should be able to burn his tokens', async () => {
      await contract.connect(owner).mint(3);
      await contract.connect(owner).burn([0, 1, 2]);
    });
  });
});
