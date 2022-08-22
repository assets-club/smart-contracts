import { expect, use } from 'chai';
import { BigNumber } from 'ethers';
import { parseEther } from 'ethers/lib/utils';
import { ethers } from 'hardhat';
import { smock } from '@defi-wonderland/smock';
import { setBalance } from '@nomicfoundation/hardhat-network-helpers';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { TheAssetsClub__factory } from '../typings';

use(smock.matchers);

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

    it('should revert when deploying with malformed thresholds', async () => {
      // The `deploy` function enforce limits.length === quantities.length, so we have to deploy the contract "manually"
      const deployment = new TheAssetsClub__factory(deployer).deploy(
        10000,
        parseEther('0.1'),
        3,
        [4, 3, 2], // limits.length === 3
        [],
      );

      await expect(deployment).to.be.revertedWith('TheAssetsClub: threshold parameters length mismatch');
    });
  });

  describe('setBaseURI', () => {
    it('should change the tokenURI via the baseURI', async () => {
      const tac = await deploy();
      await tac.mint();
      expect(await tac.tokenURI(1)).to.eq('https://theassets.club/api/nft/1.json');

      await tac.setBaseURI('https://static.theassets.club/');
      expect(await tac.tokenURI(1)).to.eq('https://static.theassets.club/1.json');
    });
  });

  describe('tokenURI', () => {
    it('should return the online tokenURI', async () => {
      const tac = await deploy();
      await tac.mint();
      expect(await tac.tokenURI(1)).to.eq('https://theassets.club/api/nft/1.json');
    });
  });

  describe('quantity', () => {
    it('should allow to mint 3 NFTs at the beginning of the mint phase', async () => {
      const tac = await deploy();
      expect(await tac.quantity()).to.eq(3);
    });
  });

  describe('mint', () => {
    it('should mint properly with maxSupply=20', async () => {
      const tac = await deploy({
        maxSupply: 20,
        thresholds: [
          { limit: 8, quantity: 3 },
          { limit: 15, quantity: 2 },
        ],
      });

      let index = 0; // will track the account index, since accounts are limited to 3 tokens

      for (let i3 = 0; i3 < 3; i3++) {
        expect(await tac.quantity()).to.eq(3);
        await tac.connect(accounts[index++]).mint();
      }

      for (let i2 = 0; i2 < 3; i2++) {
        expect(await tac.quantity()).to.eq(2);
        await tac.connect(accounts[index++]).mint();
      }

      for (let i1 = 0; i1 < 5; i1++) {
        expect(await tac.quantity()).to.eq(1);
        await tac.connect(accounts[index++]).mint();
      }

      for (let j = 0; j < 3; j++) {
        expect(await tac.balanceOf(accounts[j].address)).to.eq(3);
      }

      for (let j = 3; j < 6; j++) {
        expect(await tac.balanceOf(accounts[j].address)).to.eq(2);
      }

      for (let j = 6; j < 11; j++) {
        expect(await tac.balanceOf(accounts[j].address)).to.eq(1);
      }

      expect(await tac.balanceOf(accounts[11].address)).to.eq(0);
    });

    it('should revert if minting is closed', async () => {
      const tac = await deploy();
      await tac.close();
      await expect(tac.connect(accounts[0]).mint()).to.be.revertedWith('TheAssetsClub: minting is closed (forever!)');
    });

    it('should revert if the account owns less than 0.1 ether', async () => {
      const tac = await deploy();

      const prevBalance = await accounts[0].getBalance();
      await setBalance(accounts[0].address, parseEther('0.05')); // Not enough to mint

      await expect(tac.connect(accounts[0]).mint()).to.be.revertedWith(
        'TheAssetsClub: minting requires to hold ethers',
      );

      await setBalance(accounts[0].address, prevBalance);
    });

    it('should revert if the account tries to mint too much tokens', async () => {
      const tac = await deploy();
      await tac.connect(accounts[0]).mint(); // mint 3 tokens => limit reached
      await expect(tac.connect(accounts[0]).mint()).to.be.revertedWith('TheAssetsClub: maximum mint reached!');
    });

    it('should revert if the lint would exceed the maximum supply', async () => {
      const tac = await deploy({ maxSupply: 6 });
      await tac.connect(accounts[0]).mint(); // account 0 mints 3 tokens => 3 left
      await tac.connect(accounts[1]).mint(); // account 1 mints 3 tokens => 0 left: sold out

      // account 2 tries mints 3 tokens => 0 left: error
      await expect(tac.connect(accounts[2]).mint()).to.be.revertedWith(
        'TheAssetsClub: minting quantity exceeds maxSupply',
      );
    });
  });

  describe('withdraw', () => {
    it('should allow the owner to withdraw the balance of the contract', async () => {
      // We allow users to send some ether as a tip during the mint process
      const tip = parseEther('0.2');
      const tac = await deploy();
      await tac.connect(accounts[0]).mint({ value: tip });

      expect(await ethers.provider.getBalance(tac.address)).to.eq(tip);

      await expect(() => tac.withdraw()).to.changeEtherBalances([tac.address, deployer.address], [tip.mul(-1), tip]);
    });

    it('should revert if the owner cannot receive ether', async () => {
      // A contract without a payable function cannot receive ethers except using the self-destruct opcode.
      // We create a dummy contract that cannot receive the withdrew ether.
      const tac = await deploy();
      const recipient = await (await smock.mock('Void')).deploy();
      await setBalance(recipient.address, parseEther('1'));

      await tac.transferOwnership(recipient.address);

      await expect(tac.connect(recipient.wallet).withdraw()).to.be.revertedWith('TheAssetsClub: withdraw failure');
    });
  });
});
