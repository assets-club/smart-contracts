import { expect } from 'chai';
import { BigNumberish, utils } from 'ethers';
import { ethers } from 'hardhat';
import { faker } from '@faker-js/faker';
import { loadFixture, setBalance } from '@nomicfoundation/hardhat-network-helpers';
import { increaseTo } from '@nomicfoundation/hardhat-network-helpers/dist/src/helpers/time';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import Config from '../lib/config/Config';
import getTestAccounts from '../lib/testing/getTestAccounts';
import stackFixture from '../lib/testing/stackFixture';
import Tier from '../lib/types/Tier';
import parseEther from '../lib/utils/parseEther';
import { TheAssetsClub, TheAssetsClubMinter } from '../typechain-types';

describe('TheAssetsClubMinter', () => {
  let admin: SignerWithAddress;
  let user1: SignerWithAddress;
  let user2: SignerWithAddress;
  let user3: SignerWithAddress;
  let minter: SignerWithAddress;
  let config: Config;

  let TheAssetsClub: TheAssetsClub;
  let TheAssetsClubMinter: TheAssetsClubMinter;

  let now: number;

  const PRIVATE_SALE_PRICE = utils.parseEther('0.05');
  const PUBLIC_SALE_PRICE = utils.parseEther('0.07');
  let WAITLIST_DURATION: number;
  let OG_DURATION: number;

  beforeEach(async () => {
    ({ admin, user1, user2, user3 } = await getTestAccounts());
    ({ TheAssetsClub, TheAssetsClubMinter, config } = await loadFixture(stackFixture));

    WAITLIST_DURATION = (await TheAssetsClubMinter.WAITLIST_DURATION()).toNumber();
    OG_DURATION = (await TheAssetsClubMinter.OG_DURATION()).toNumber();

    minter = await ethers.getImpersonatedSigner(TheAssetsClubMinter.address);
    await setBalance(minter.address, parseEther(10));

    now = Math.floor(Date.now() / 1000);
  });

  describe('addTheAssetsClubMinter', () => {
    it('should revert if non-owner tries to set the account tiers', async () => {
      await expect(TheAssetsClubMinter.connect(user1).addWaitList([user1.address], [3])).to.be.revertedWith(
        'Ownable: caller is not the owner',
      );
    });

    it('should revert if accounts and tiers size mismatch', async () => {
      await expect(TheAssetsClubMinter.connect(admin).addWaitList([user1.address, user2.address], [1, 2, 3]))
        .to.be.revertedWithCustomError(TheAssetsClubMinter, 'ArgumentSizeMismatch')
        .withArgs(2, 3);
    });

    it('should allow owner to set the account tiers', async () => {
      const tiers = {
        [user1.address]: faker.datatype.number(3),
        [user2.address]: faker.datatype.number(3),
        [user3.address]: faker.datatype.number(3),
      };

      await expect(TheAssetsClubMinter.connect(admin).addWaitList(Object.keys(tiers), Object.values(tiers)))
        .to.emit(TheAssetsClubMinter, 'AddedToWaitList')
        .withArgs(user1.address, tiers[user1.address])
        .and.to.emit(TheAssetsClubMinter, 'AddedToWaitList')
        .withArgs(user2.address, tiers[user2.address])
        .and.to.emit(TheAssetsClubMinter, 'AddedToWaitList')
        .withArgs(user3.address, tiers[user3.address]);

      for (const [account, tier] of Object.entries(tiers)) {
        expect(await TheAssetsClubMinter.waitList(account)).to.eq(tier);
      }
    });
  });

  describe('setStartDate', () => {
    it('should revert if non-owner tries to set the start date', async () => {
      await expect(TheAssetsClubMinter.connect(user1).setStartDate(faker.datatype.number())).to.be.revertedWith(
        'Ownable: caller is not the owner',
      );
    });

    it('should revert if owner tries to set the start date twice', async () => {
      await TheAssetsClubMinter.connect(admin).setStartDate(faker.datatype.datetime().getTime()); // pass
      await expect(TheAssetsClubMinter.connect(admin).setStartDate(faker.datatype.number()))
        .to.be.revertedWithCustomError(TheAssetsClubMinter, 'AlreadyStarted')
        .withArgs();
    });

    it('should allow owner to set the start date', async () => {
      const startDate = faker.datatype.datetime().getTime();
      await TheAssetsClubMinter.connect(admin).setStartDate(startDate); // pass
      expect(await TheAssetsClubMinter.startDate()).to.equal(startDate);
    });
  });

  describe('getTier', () => {
    it('should return LOCKED if start date is not initialized', async () => {
      expect(await TheAssetsClubMinter.getTier()).to.equal(Tier.LOCKED);
    });

    it('should return LOCKED if start date is in the future', async () => {
      await TheAssetsClubMinter.connect(admin).setStartDate(now + 1000);
      expect(await TheAssetsClubMinter.getTier()).to.equal(Tier.LOCKED);
    });

    it('should return OG if mint is in OG period', async () => {
      await TheAssetsClubMinter.connect(admin).setStartDate(now);
      await increaseTo(now + faker.datatype.number(OG_DURATION));
      expect(await TheAssetsClubMinter.getTier()).to.equal(Tier.OG);
    });

    it('should return WAITLIST if mint is in WaitList period', async () => {
      await TheAssetsClubMinter.connect(admin).setStartDate(now);
      await increaseTo(now + OG_DURATION + faker.datatype.number(WAITLIST_DURATION));
      expect(await TheAssetsClubMinter.getTier()).to.equal(Tier.WAITLIST);
    });

    it('should return PUBLIC if mint is in public period', async () => {
      await TheAssetsClubMinter.connect(admin).setStartDate(now);
      await increaseTo(now + OG_DURATION + WAITLIST_DURATION + faker.datatype.number(WAITLIST_DURATION));
      expect(await TheAssetsClubMinter.getTier()).to.equal(Tier.PUBLIC);
    });
  });

  describe('getPrice', () => {
    it('should revert if quantity is zero', async () => {
      await expect(TheAssetsClubMinter.getPrice(Tier.PUBLIC, 0))
        .to.be.revertedWithCustomError(TheAssetsClubMinter, 'InvalidQuantity')
        .withArgs(0);
    });

    it('should revert if quantity is greater than 3', async () => {
      const invalidQuantity = 4 + faker.datatype.number();
      await expect(TheAssetsClubMinter.getPrice(Tier.PUBLIC, invalidQuantity))
        .to.be.revertedWithCustomError(TheAssetsClubMinter, 'InvalidQuantity')
        .withArgs(invalidQuantity);
    });

    it('should revert if tier is locked', async () => {
      await expect(TheAssetsClubMinter.getPrice(Tier.LOCKED, 1))
        .to.be.revertedWithCustomError(TheAssetsClubMinter, 'Locked')
        .withArgs();
    });

    const dataset: [Tier, number, BigNumberish][] = [
      [Tier.OG, 1, 0],
      [Tier.OG, 2, 0],
      [Tier.OG, 3, PRIVATE_SALE_PRICE],
      [Tier.WAITLIST, 1, 0],
      [Tier.WAITLIST, 2, PRIVATE_SALE_PRICE],
      [Tier.WAITLIST, 3, PRIVATE_SALE_PRICE.mul(2)],
      [Tier.PUBLIC, 1, PUBLIC_SALE_PRICE],
      [Tier.PUBLIC, 2, PUBLIC_SALE_PRICE.mul(2)],
      [Tier.PUBLIC, 3, PUBLIC_SALE_PRICE.mul(3)],
    ];

    for (const [tier, quantity, expectedPrice] of dataset) {
      const fPrice = utils.formatEther(expectedPrice);
      it(`should compute price for (tier=${tier},quantity=${quantity}) => ${fPrice}\u039e`, async () => {
        expect(await TheAssetsClubMinter.getPrice(tier, quantity)).to.equal(expectedPrice);
      });
    }
  });
});
