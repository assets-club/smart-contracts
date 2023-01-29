import { expect } from 'chai';
import { BigNumber } from 'ethers';
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

  let PRIVATE_SALE_PRICE: BigNumber;
  let PUBLIC_SALE_PRICE: BigNumber;
  let WAITLIST_DURATION: number;
  let OG_DURATION: number;

  beforeEach(async () => {
    ({ admin, user1, user2, user3 } = await getTestAccounts());
    ({ TheAssetsClub, TheAssetsClubMinter, config } = await loadFixture(stackFixture));

    PRIVATE_SALE_PRICE = await TheAssetsClubMinter.OG_DURATION();
    PUBLIC_SALE_PRICE = await TheAssetsClubMinter.PUBLIC_SALE_PRICE();
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
});
