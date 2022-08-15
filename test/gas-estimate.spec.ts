import { expect } from 'chai';
import { ethers } from 'hardhat';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import {
  TheAssetsClubA,
  TheAssetsClubA__factory,
  TheAssetsClubOZ,
  TheAssetsClubOZ__factory,
  TheAssetsClubPsi,
  TheAssetsClubPsi__factory,
} from '../typings';

const factories = [TheAssetsClubOZ__factory, TheAssetsClubA__factory, TheAssetsClubPsi__factory];
const cases = factories.map((factory) => ({
  name: factory.name.replace('__factory', ''),
  deploy: async (deployer: SignerWithAddress) => {
    const contract = await new factory(deployer).deploy();
    await contract.deployed();
    return contract;
  },
}));

for (const { name, deploy } of cases) {
  describe(name, () => {
    let deployer: SignerWithAddress;
    let accounts: SignerWithAddress[];
    let contract: TheAssetsClubOZ | TheAssetsClubA | TheAssetsClubPsi;

    beforeEach(async () => {
      accounts = await ethers.getSigners();
      deployer = accounts.shift()!;
      contract = await deploy(deployer);
    });

    it(`should mint 5 NFT at once`, async () => {
      const n = 5;
      await contract.connect(accounts[0]).mint(n);

      expect(await contract.totalSupply()).to.eq(n);

      for (let i = 0; i < n; i++) {
        expect(await contract.ownerOf(i)).to.eq(accounts[0].address);
      }
    });

    it('should transfer 5 NFT from accounts[0] to accounts[1]', async () => {
      const n = 5;
      const c0 = contract.connect(accounts[0]);
      await c0.mint(n);

      for (let i = 0; i < n; i++) {
        await c0.transferFrom(accounts[0].address, accounts[1].address, i);
      }

      for (let i = 0; i < n; i++) {
        expect(await contract.ownerOf(i)).to.eq(accounts[1].address);
      }
    });
  });
}
