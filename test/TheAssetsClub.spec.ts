import { expect } from 'chai';
import { BigNumber } from 'ethers';
import { parseEther } from 'ethers/lib/utils';
import { ethers } from 'hardhat';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { TheAssetsClub__factory } from '../typings';

interface DeployOptions {
  maxSupply: number;
  minETHBalance: BigNumber;
  maxTACBalance: number;
  thresholds: {
    limit: number;
    quantity: number;
  }[];
}

describe('TheAssetsClub', () => {
  let deployer: SignerWithAddress;
  let accounts: SignerWithAddress[];

  async function deploy(options?: Partial<DeployOptions>) {
    const thresholds = options?.thresholds ?? [
      { limit: 2000, quantity: 3 },
      { limit: 5000, quantity: 2 },
    ];

    const tac = await new TheAssetsClub__factory(deployer).deploy(
      options?.maxSupply ?? 10000,
      options?.minETHBalance ?? parseEther('0.1'),
      options?.maxTACBalance ?? 3,
      thresholds.map((t) => t.limit),
      thresholds.map((t) => t.quantity),
    );

    return await tac.deployed();
  }

  beforeEach(async () => {
    [deployer, ...accounts] = await ethers.getSigners();
  });

  describe('constructor', () => {
    it('should deploy the contract properly', async () => {
      const tac = await deploy();
      expect(tac.address).to.not.be.null;
    });
  });

  describe('quantity', () => {
    it('should allow to mint 3 NFTs at the beginning of the mint phase', async () => {
      const tac = await deploy();
      expect(await tac.quantity()).to.eq(3);
    });

    it('should allow to mint 3 NFTs at the beginning of the mint phase', async () => {
      const tac = await deploy({
        thresholds: [
          { limit: 4, quantity: 3 },
          { limit: 6, quantity: 2 },
        ],
      });

      expect(await tac.quantity()).to.eq(3);
      await tac
        .connect(accounts[0])
        .mint()
        .then((tx) => tx.wait());
      expect(await tac.quantity()).to.eq(3);

      await tac
        .connect(accounts[1])
        .mint()
        .then((tx) => tx.wait());
      expect(await tac.quantity()).to.eq(3);
    });
  });
});
