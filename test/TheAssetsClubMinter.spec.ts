import { expect } from 'chai';
import { BigNumberish, utils } from 'ethers';
import { ethers } from 'hardhat';
import { faker } from '@faker-js/faker';
import { loadFixture, setBalance } from '@nomicfoundation/hardhat-network-helpers';
import { increaseTo, setNextBlockTimestamp } from '@nomicfoundation/hardhat-network-helpers/dist/src/helpers/time';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { StandardMerkleTree } from '@openzeppelin/merkle-tree';
import Config from '../lib/config/Config';
import getTestAccounts from '../lib/testing/getTestAccounts';
import stackFixture from '../lib/testing/stackFixture';
import Proof from '../lib/types/Proof';
import Tier from '../lib/types/Tier';
import parseEther from '../lib/utils/parseEther';
import { PaymentSplitter, TheAssetsClub, TheAssetsClubMinter } from '../typechain-types';

describe('TheAssetsClubMinter', () => {
  let admin: SignerWithAddress;
  let user1: SignerWithAddress;
  let userOG: SignerWithAddress;
  let user3: SignerWithAddress;
  let userWL: SignerWithAddress;
  let user5: SignerWithAddress;
  let minter: SignerWithAddress;
  let config: Config;
  let tree: StandardMerkleTree<[string, Proof, number]>;

  let TheAssetsClub: TheAssetsClub;
  let TheAssetsClubMinter: TheAssetsClubMinter;
  let Treasury: PaymentSplitter;

  let now: number;

  // These constants are hardcoded because they are used into the test names
  const MAXIMUM_MINTS = 5;
  const PRIVATE_SALE_PRICE = utils.parseEther('0.05');
  const PUBLIC_SALE_PRICE = utils.parseEther('0.07');
  let WL_DURATION: number;
  let OG_DURATION: number;

  beforeEach(async () => {
    ({ admin, user1, user2: userOG, user3, user4: userWL, user5 } = await getTestAccounts());
    ({ TheAssetsClub, TheAssetsClubMinter, Treasury, config, tree } = await loadFixture(stackFixture));

    WL_DURATION = (await TheAssetsClubMinter.WL_DURATION()).toNumber();
    OG_DURATION = (await TheAssetsClubMinter.OG_DURATION()).toNumber();

    minter = await ethers.getImpersonatedSigner(TheAssetsClubMinter.address);
    await setBalance(minter.address, parseEther(10));

    now = Math.floor(Date.now() / 1000);
  });

  describe('setStartDate', () => {
    it('should revert if non-owner tries to set the start date', async () => {
      await expect(TheAssetsClubMinter.connect(user1).setStartDate(faker.datatype.number())).to.be.revertedWith(
        'Ownable: caller is not the owner',
      );
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

    it('should return WL if mint is in WL period', async () => {
      await TheAssetsClubMinter.connect(admin).setStartDate(now);
      await increaseTo(now + OG_DURATION + faker.datatype.number(WL_DURATION));
      expect(await TheAssetsClubMinter.getTier()).to.equal(Tier.WL);
    });

    it('should return PUBLIC if mint is in public period', async () => {
      await TheAssetsClubMinter.connect(admin).setStartDate(now);
      await increaseTo(now + OG_DURATION + WL_DURATION + faker.datatype.number(WL_DURATION));
      expect(await TheAssetsClubMinter.getTier()).to.equal(Tier.PUBLIC);
    });
  });

  describe('getPrice', () => {
    it('should revert if quantity is zero', async () => {
      await expect(TheAssetsClubMinter.getPrice(Tier.PUBLIC, 0, 0))
        .to.be.revertedWithCustomError(TheAssetsClubMinter, 'InvalidPricing')
        .withArgs(Tier.PUBLIC, 0, 0);
    });

    it('should revert if quantity is greater than 3', async () => {
      const invalidQuantity = 4 + faker.datatype.number();
      await expect(TheAssetsClubMinter.getPrice(Tier.PUBLIC, invalidQuantity, 0))
        .to.be.revertedWithCustomError(TheAssetsClubMinter, 'InvalidPricing')
        .withArgs(Tier.PUBLIC, invalidQuantity, 0);
    });

    it('should revert if tier is locked', async () => {
      await expect(TheAssetsClubMinter.getPrice(Tier.LOCKED, 1, 0))
        .to.be.revertedWithCustomError(TheAssetsClubMinter, 'InvalidPricing')
        .withArgs(Tier.LOCKED, 1, 0);
    });

    // Dataset arguments: account tier, mint quantity, already minted quantity, expected price
    const dataset: [Tier, number, number, BigNumberish][] = [
      [Tier.OG, 1, 0, 0],
      [Tier.OG, 2, 0, 0],
      [Tier.OG, 3, 0, PRIVATE_SALE_PRICE],
      [Tier.OG, 1, 1, 0],
      [Tier.OG, 2, 1, PRIVATE_SALE_PRICE],
      [Tier.OG, 1, 2, PRIVATE_SALE_PRICE],

      [Tier.WL, 1, 0, 0],
      [Tier.WL, 2, 0, PRIVATE_SALE_PRICE],
      [Tier.WL, 3, 0, PRIVATE_SALE_PRICE.mul(2)],
      [Tier.WL, 1, 1, PRIVATE_SALE_PRICE],
      [Tier.WL, 2, 1, PRIVATE_SALE_PRICE.mul(2)],
      [Tier.WL, 1, 2, PRIVATE_SALE_PRICE],

      [Tier.PUBLIC, 1, 0, PUBLIC_SALE_PRICE],
      [Tier.PUBLIC, 2, 0, PUBLIC_SALE_PRICE.mul(2)],
      [Tier.PUBLIC, 3, 0, PUBLIC_SALE_PRICE.mul(3)],
      [Tier.PUBLIC, 1, 1, PUBLIC_SALE_PRICE],
      [Tier.PUBLIC, 2, 1, PUBLIC_SALE_PRICE.mul(2)],
      [Tier.PUBLIC, 1, 2, PUBLIC_SALE_PRICE],
    ];

    for (const [tier, quantity, skip, expectedPrice] of dataset) {
      const fPrice = utils.formatEther(expectedPrice);
      it(`should compute price for (tier=${tier},quantity=${quantity},skip=${skip}) => ${fPrice}\u039e`, async () => {
        expect(await TheAssetsClubMinter.getPrice(tier, quantity, skip)).to.equal(expectedPrice);
      });
    }
  });

  describe('mintTo', () => {
    describe('when the private sale has not yet started', () => {
      it('should revert if an OG attempts to mint a token', async () => {
        const proof = tree.getProof([userOG.address, Proof.MINT, Tier.OG]);
        await expect(TheAssetsClubMinter.connect(userOG).mintTo(userOG.address, 1, Tier.OG, proof))
          .to.be.revertedWithCustomError(TheAssetsClubMinter, 'NotStartedYet')
          .withArgs();
      });

      it('should revert if a WL attempts to mint a token', async () => {
        const proof = tree.getProof([userWL.address, Proof.MINT, Tier.WL]);
        await expect(TheAssetsClubMinter.connect(userWL).mintTo(userWL.address, 1, Tier.WL, proof))
          .to.be.revertedWithCustomError(TheAssetsClubMinter, 'NotStartedYet')
          .withArgs();
      });

      it('should revert if a regular account attempts to mint a token', async () => {
        await expect(TheAssetsClubMinter.connect(user5).mintTo(user5.address, 1, Tier.OG, []))
          .to.be.revertedWithCustomError(TheAssetsClubMinter, 'NotStartedYet')
          .withArgs();
      });
    });

    function testOG() {
      it(`should revert if an OG tries to mint ${MAXIMUM_MINTS + 1} tokens`, async () => {
        const proof = tree.getProof([userOG.address, Proof.MINT, Tier.OG]);

        await expect(
          TheAssetsClubMinter.connect(userOG).mintTo(userOG.address, MAXIMUM_MINTS + 1, Tier.OG, proof, {
            value: PRIVATE_SALE_PRICE.sub(3),
          }),
        )
          .to.be.revertedWithCustomError(TheAssetsClubMinter, 'InvalidPricing')
          .withArgs(Tier.OG, MAXIMUM_MINTS + 1, 0);
      });

      it('should revert if an OG tries to mint 3 tokens for less than 1xPRIVATE_SALE_PRICE', async () => {
        const proof = tree.getProof([userOG.address, Proof.MINT, Tier.OG]);
        const value = PRIVATE_SALE_PRICE.sub(1);
        await expect(TheAssetsClubMinter.connect(userOG).mintTo(userOG.address, 3, Tier.OG, proof, { value }))
          .to.be.revertedWithCustomError(TheAssetsClubMinter, 'InsufficientValue')
          .withArgs(3, value, PRIVATE_SALE_PRICE);
      });

      it('should allow an OG to mint 1 token for free', async () => {
        const proof = tree.getProof([userOG.address, Proof.MINT, Tier.OG]);
        await expect(
          TheAssetsClubMinter.connect(userOG).mintTo(userOG.address, 1, Tier.OG, proof),
        ).to.be.changeTokenBalance(TheAssetsClub, userOG.address, 1);
      });

      it('should allow an OG to mint 2 tokens for free', async () => {
        const proof = tree.getProof([userOG.address, Proof.MINT, Tier.OG]);
        await expect(
          TheAssetsClubMinter.connect(userOG).mintTo(userOG.address, 2, Tier.OG, proof),
        ).to.be.changeTokenBalance(TheAssetsClub, userOG.address, 2);
      });

      it('should allow an OG to mint 3 tokens for 1xPRIVATE_SALE_PRICE', async () => {
        const proof = tree.getProof([userOG.address, Proof.MINT, Tier.OG]);
        await expect(
          TheAssetsClubMinter.connect(userOG).mintTo(userOG.address, 3, Tier.OG, proof, {
            value: PRIVATE_SALE_PRICE,
          }),
        ).to.be.changeTokenBalance(TheAssetsClub, userOG.address, 3);
      });
    }

    function testWL() {
      it(`should revert if an WL tries to mint ${MAXIMUM_MINTS + 1} tokens`, async () => {
        const proof = tree.getProof([userWL.address, Proof.MINT, Tier.WL]);

        await expect(
          TheAssetsClubMinter.connect(userWL).mintTo(userWL.address, MAXIMUM_MINTS + 1, Tier.WL, proof, {
            value: PRIVATE_SALE_PRICE.sub(3),
          }),
        )
          .to.be.revertedWithCustomError(TheAssetsClubMinter, 'InvalidPricing')
          .withArgs(Tier.WL, MAXIMUM_MINTS + 1, 0);
      });

      it('should revert if a WL tries to mint 2 tokens for less than 1xPRIVATE_SALE_PRICE', async () => {
        const proof = tree.getProof([userWL.address, Proof.MINT, Tier.WL]);
        const value = PRIVATE_SALE_PRICE.sub(1);
        await expect(TheAssetsClubMinter.connect(userOG).mintTo(userWL.address, 2, Tier.WL, proof, { value }))
          .to.be.revertedWithCustomError(TheAssetsClubMinter, 'InsufficientValue')
          .withArgs(2, value, PRIVATE_SALE_PRICE);
      });

      it('should allow a WL to mint 1 token for free', async () => {
        const proof = tree.getProof([userWL.address, Proof.MINT, Tier.WL]);
        await expect(
          TheAssetsClubMinter.connect(userWL).mintTo(userWL.address, 1, Tier.WL, proof),
        ).to.be.changeTokenBalance(TheAssetsClub, userWL.address, 1);
      });

      for (const quantity of [2, 3]) {
        it(`should allow a WL to mint ${quantity} tokens for ${quantity - 1}xPRIVATE_SALE_PRICE`, async () => {
          const proof = tree.getProof([userWL.address, Proof.MINT, Tier.WL]);
          await expect(
            TheAssetsClubMinter.connect(userWL).mintTo(userWL.address, quantity, Tier.WL, proof, {
              value: PRIVATE_SALE_PRICE.mul(quantity - 1),
            }),
          ).to.be.changeTokenBalance(TheAssetsClub, userWL.address, quantity);
        });
      }
    }

    describe('during the OG sale', () => {
      beforeEach(async () => {
        await TheAssetsClubMinter.connect(admin).setStartDate(now);
        await setNextBlockTimestamp(now + 10000);
      });

      testOG();

      it('should revert a WL attempts to mint a token', async () => {
        const proof = tree.getProof([userWL.address, Proof.MINT, Tier.WL]);
        await expect(TheAssetsClubMinter.connect(userWL).mintTo(userWL.address, 1, Tier.WL, proof))
          .to.be.revertedWithCustomError(TheAssetsClubMinter, 'InsufficientTier')
          .withArgs(userWL.address, Tier.WL, Tier.OG);
      });

      it('should revert if a regular account attempts to mint a token without a Merkle proof', async () => {
        await expect(TheAssetsClubMinter.connect(user5).mintTo(user5.address, 1, Tier.OG, []))
          .to.be.revertedWithCustomError(TheAssetsClubMinter, 'InvalidMerkleProof')
          .withArgs(user5.address);
      });
    });

    describe('during the WL sale', () => {
      beforeEach(async () => {
        await TheAssetsClubMinter.connect(admin).setStartDate(now);
        await setNextBlockTimestamp(now + OG_DURATION + 10000);
      });

      testOG();
      testWL();

      it('should revert if a regular account attempts to mint a token without a Merkle proof', async () => {
        await expect(TheAssetsClubMinter.connect(user5).mintTo(user5.address, 1, Tier.OG, []))
          .to.be.revertedWithCustomError(TheAssetsClubMinter, 'InvalidMerkleProof')
          .withArgs(user5.address);
      });
    });

    describe('during the public sale', () => {
      beforeEach(async () => {
        await TheAssetsClubMinter.connect(admin).setStartDate(now);
        await setNextBlockTimestamp(now + OG_DURATION + WL_DURATION + 10000);
      });

      testOG();
      testWL();

      for (const i of [1, 2, 3]) {
        const tokens = 'token' + (i > 1 ? 's' : '');
        it(`should allow a regular account attempts to mint ${i} ${tokens} for ${i}xPUBLIC_SALE_PRICE`, async () => {
          await expect(
            TheAssetsClubMinter.connect(user5).mintTo(user5.address, i, Tier.PUBLIC, [], {
              value: PUBLIC_SALE_PRICE.mul(i),
            }),
          ).to.be.changeTokenBalance(TheAssetsClub, user5.address, i);
        });
      }
    });
  });

  describe('claim', () => {
    describe('when the private sale has not yet started', () => {
      it('should revert if private sale has not yet started', async () => {
        const proof = tree.getProof([user1.address, Proof.CLAIM, 1]);
        await expect(TheAssetsClubMinter.connect(user1).claim(user1.address, 1, proof))
          .to.be.revertedWithCustomError(TheAssetsClubMinter, 'NotStartedYet')
          .withArgs();
      });
    });

    describe('when the private sale has started', () => {
      beforeEach(async () => {
        await TheAssetsClubMinter.connect(admin).setStartDate(now);
        await setNextBlockTimestamp(now + 10000);
      });

      it('should revert a user tries to claim his reserved tokens twice', async () => {
        const proof = tree.getProof([user1.address, Proof.CLAIM, 1]);
        await TheAssetsClubMinter.connect(user1).claim(user1.address, 1, proof); // pass
        await expect(TheAssetsClubMinter.connect(user1).claim(user1.address, 1, proof))
          .to.be.revertedWithCustomError(TheAssetsClubMinter, 'AlreadyClaimed')
          .withArgs(user1.address, 1);
      });

      it('should allow if the Merkle Proof is invalid', async () => {
        const proof = tree.getProof([user1.address, Proof.CLAIM, 1]);
        await expect(TheAssetsClubMinter.connect(user1).claim(user1.address, 1, proof)).to.changeTokenBalance(
          TheAssetsClub,
          user1,
          1,
        );
      });

      it('should allow a user to claim his reserved tokens', async () => {
        const proof = tree.getProof([user1.address, Proof.CLAIM, 1]);
        await expect(TheAssetsClubMinter.connect(user1).claim(user1.address, 1, proof)).to.changeTokenBalance(
          TheAssetsClub,
          user1,
          1,
        );
      });
    });
  });

  describe('withdraw', () => {
    it('allow anybody to withdraw the funds to the treasury', async () => {
      const balance = parseEther(100 * Math.random() * (faker.datatype.number(10) + 1));
      await setBalance(TheAssetsClubMinter.address, balance);
      await expect(TheAssetsClubMinter.connect(user5).withdraw()).to.changeEtherBalances(
        [TheAssetsClubMinter, Treasury],
        [`-${balance.toString()}`, balance],
      );
    });
  });
});
