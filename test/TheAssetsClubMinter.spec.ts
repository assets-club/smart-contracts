import { expect } from 'chai';
import { EtherSymbol, Signer, formatEther, parseEther } from 'ethers';
import { ethers } from 'hardhat';
import { faker } from '@faker-js/faker';
import { loadFixture, setBalance } from '@nomicfoundation/hardhat-network-helpers';
import { increaseTo, setNextBlockTimestamp } from '@nomicfoundation/hardhat-network-helpers/dist/src/helpers/time';
import { CustomEthersSigner } from '@nomiclabs/hardhat-ethers/signers';
import { StandardMerkleTree } from '@openzeppelin/merkle-tree';
import Config from '../lib/config/Config';
import connect from '../lib/connect';
import getTestAccounts from '../lib/testing/getTestAccounts';
import stackFixture from '../lib/testing/stackFixture';
import Phase from '../lib/types/Phase';
import Proof from '../lib/types/Proof';
import Tier from '../lib/types/Tier';
import { PaymentSplitter, TheAssetsClub, TheAssetsClubMinter } from '../typechain-types';

describe('TheAssetsClubMinter', () => {
  let admin: CustomEthersSigner;

  let user1: CustomEthersSigner;
  let user2: CustomEthersSigner; // 1 claimable token
  let user3: CustomEthersSigner; // 7 claimable tokens
  let userOG: CustomEthersSigner; // user4
  let userAL: CustomEthersSigner; // user5

  let treasury: CustomEthersSigner;
  let minter: CustomEthersSigner;
  let config: Config;
  let tree: StandardMerkleTree<[string, Proof, number]>;

  let TheAssetsClub: TheAssetsClub;
  let TheAssetsClubMinter: TheAssetsClubMinter;

  let randomProof: string[];

  // These constants are hardcoded because they are used into the test names
  const MAXIMUM_MINTS = 5;
  const SALE_PRICE = parseEther('0.02');
  let START_DATE: number;
  let PRIVATE_SALE_DURATION: number;
  let PUBLIC_SALE_DURATION: number;

  beforeEach(async () => {
    ({ admin, user1, user2, user3, user4: userOG, user5: userAL, treasury } = await getTestAccounts());
    ({ TheAssetsClub, TheAssetsClubMinter, config, tree } = await loadFixture(stackFixture));

    START_DATE = Number(await TheAssetsClubMinter.START_DATE());
    PRIVATE_SALE_DURATION = Number(await TheAssetsClubMinter.PRIVATE_SALE_DURATION());
    PUBLIC_SALE_DURATION = Number(await TheAssetsClubMinter.PUBLIC_SALE_DURATION());

    minter = await ethers.getImpersonatedSigner(TheAssetsClubMinter.target as string);
    await setBalance(await minter.getAddress(), parseEther('10'));

    randomProof = [ethers.solidityPackedKeccak256(['string'], [faker.datatype.string()])];
  });

  describe('phase', () => {
    it('should return CLOSED before the private sale', async () => {
      await increaseTo(START_DATE - 10);
      expect(await TheAssetsClubMinter.phase()).to.eq(Phase.CLOSED);
    });

    it('should return PRIVATE_SALE after the start date', async () => {
      await increaseTo(START_DATE + 100);
      expect(await TheAssetsClubMinter.phase()).to.eq(Phase.PRIVATE_SALE);
    });

    it('should return PUBLIC_SALE after the public sale', async () => {
      await increaseTo(START_DATE + PRIVATE_SALE_DURATION + 100);
      expect(await TheAssetsClubMinter.phase()).to.eq(Phase.PUBLIC_SALE);
    });

    it('should return CLOSED after the public sale', async () => {
      await increaseTo(START_DATE + PRIVATE_SALE_DURATION + PUBLIC_SALE_DURATION + 100);
      expect(await TheAssetsClubMinter.phase()).to.eq(Phase.CLOSED);
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

    // Dataset arguments: account tier, mint quantity, already minted quantity, expected price
    const dataset: [Tier, number, number, bigint][] = [
      [Tier.OG, 1, 0, 0n],
      [Tier.OG, 2, 0, 0n],
      [Tier.OG, 3, 0, 0n],
      [Tier.OG, 4, 0, SALE_PRICE],
      [Tier.OG, 5, 0, SALE_PRICE * 2n],
      [Tier.OG, 1, 1, 0n],
      [Tier.OG, 2, 1, 0n],
      [Tier.OG, 3, 1, SALE_PRICE],
      [Tier.OG, 4, 1, SALE_PRICE * 2n],
      [Tier.OG, 1, 2, 0n],
      [Tier.OG, 2, 2, SALE_PRICE],
      [Tier.OG, 3, 2, SALE_PRICE * 2n],
      [Tier.OG, 1, 3, SALE_PRICE],
      [Tier.OG, 2, 3, SALE_PRICE * 2n],
      [Tier.OG, 1, 4, SALE_PRICE],

      [Tier.ACCESS_LIST, 1, 0, 0n],
      [Tier.ACCESS_LIST, 2, 0, 0n],
      [Tier.ACCESS_LIST, 3, 0, SALE_PRICE],
      [Tier.ACCESS_LIST, 4, 0, SALE_PRICE * 2n],
      [Tier.ACCESS_LIST, 5, 0, SALE_PRICE * 3n],
      [Tier.ACCESS_LIST, 1, 1, 0n],
      [Tier.ACCESS_LIST, 2, 1, SALE_PRICE],
      [Tier.ACCESS_LIST, 3, 1, SALE_PRICE * 2n],
      [Tier.ACCESS_LIST, 4, 1, SALE_PRICE * 3n],
      [Tier.ACCESS_LIST, 1, 2, SALE_PRICE],
      [Tier.ACCESS_LIST, 2, 2, SALE_PRICE * 2n],
      [Tier.ACCESS_LIST, 3, 2, SALE_PRICE * 3n],
      [Tier.ACCESS_LIST, 1, 3, SALE_PRICE],
      [Tier.ACCESS_LIST, 2, 3, SALE_PRICE * 2n],
      [Tier.ACCESS_LIST, 1, 4, SALE_PRICE],

      [Tier.PUBLIC, 1, 0, SALE_PRICE],
      [Tier.PUBLIC, 2, 0, SALE_PRICE * 2n],
      [Tier.PUBLIC, 3, 0, SALE_PRICE * 3n],
      [Tier.PUBLIC, 4, 0, SALE_PRICE * 4n],
      [Tier.PUBLIC, 5, 0, SALE_PRICE * 5n],
      [Tier.PUBLIC, 1, 1, SALE_PRICE],
      [Tier.PUBLIC, 2, 1, SALE_PRICE * 2n],
      [Tier.PUBLIC, 3, 1, SALE_PRICE * 3n],
      [Tier.PUBLIC, 4, 1, SALE_PRICE * 4n],
      [Tier.PUBLIC, 1, 2, SALE_PRICE],
      [Tier.PUBLIC, 2, 2, SALE_PRICE * 2n],
      [Tier.PUBLIC, 3, 2, SALE_PRICE * 3n],
      [Tier.PUBLIC, 1, 3, SALE_PRICE],
      [Tier.PUBLIC, 2, 3, SALE_PRICE * 2n],
      [Tier.PUBLIC, 1, 4, SALE_PRICE],
    ];

    for (const [tier, quantity, skip, expectedPrice] of dataset) {
      const fPrice = formatEther(expectedPrice);
      it(`should compute price for (tier=${tier},quantity=${quantity},skip=${skip}) => ${fPrice}${EtherSymbol}`, async () => {
        expect(await TheAssetsClubMinter.getPrice(tier, quantity, skip)).to.equal(expectedPrice);
      });
    }
  });

  describe('mintTo', () => {
    let TheAssetsClubMinter_OG: TheAssetsClubMinter;
    let TheAssetsClubMinter_AL: TheAssetsClubMinter;
    let TheAssetsClubMinter_public: TheAssetsClubMinter;

    beforeEach(() => {
      TheAssetsClubMinter_OG = connect(TheAssetsClubMinter, userOG);
      TheAssetsClubMinter_AL = connect(TheAssetsClubMinter, userAL);
      TheAssetsClubMinter_public = connect(TheAssetsClubMinter, user1);
    });

    function testClosed() {
      it('should revert if an OG attempts to mint a token with valid proof', async () => {
        const proof = tree.getProof([userOG.address, Proof.MINT, Tier.OG]);
        await expect(TheAssetsClubMinter_OG.mintTo(userOG.address, 1, Tier.OG, proof))
          .to.be.revertedWithCustomError(TheAssetsClubMinter, 'Closed')
          .withArgs();
      });

      it('should revert if an access list member the attempts to mint a token with valid proof', async () => {
        const proof = tree.getProof([userAL.address, Proof.MINT, Tier.ACCESS_LIST]);
        await expect(TheAssetsClubMinter_OG.mintTo(userAL.address, 1, Tier.ACCESS_LIST, proof))
          .to.be.revertedWithCustomError(TheAssetsClubMinter, 'Closed')
          .withArgs();
      });

      it('should revert if an account attempts to mint a token', async () => {
        await expect(TheAssetsClubMinter_public.mintTo(userAL.address, 1, Tier.PUBLIC, []))
          .to.be.revertedWithCustomError(TheAssetsClubMinter, 'Closed')
          .withArgs();
      });
    }

    function testOG() {
      describe('OG', () => {
        let proof: string[];

        beforeEach(async () => {
          proof = tree.getProof([userOG.address, Proof.MINT, Tier.OG]);
        });

        it('should allow an OG to mint three free tokens', async () => {
          const proof = tree.getProof([userOG.address, Proof.MINT, Tier.OG]);
          await expect(TheAssetsClubMinter_OG.mintTo(userOG.address, 3, Tier.OG, proof)).to.changeTokenBalance(
            TheAssetsClub,
            userOG,
            3,
          );
        });

        for (const paid of [1, 2]) {
          it(`should allow an OG to mint three free + ${paid} paid tokens`, async () => {
            const proof = tree.getProof([userOG.address, Proof.MINT, Tier.OG]);
            const value = SALE_PRICE * BigInt(paid);
            await expect(TheAssetsClubMinter_OG.mintTo(userOG.address, 3 + paid, Tier.OG, proof, { value }))
              .to.changeTokenBalance(TheAssetsClub, userOG, 3 + paid)
              .and.to.changeEtherBalances([userOG, TheAssetsClubMinter], [-value, value]);
          });
        }
      });
    }

    function testAccessList() {
      describe('access list member', () => {
        let proof: string[];

        beforeEach(async () => {
          proof = tree.getProof([userAL.address, Proof.MINT, Tier.ACCESS_LIST]);
        });

        it('should allow an access list member to mint two free tokens', async () => {
          await expect(TheAssetsClubMinter_AL.mintTo(userAL.address, 2, Tier.ACCESS_LIST, proof)).to.changeTokenBalance(
            TheAssetsClub,
            userAL,
            2,
          );
        });

        for (const paid of [1, 2, 3]) {
          it(`should allow an access list member to mint two free + ${paid} paid tokens`, async () => {
            const value = SALE_PRICE * BigInt(paid);
            await expect(TheAssetsClubMinter_AL.mintTo(userAL.address, 2 + paid, Tier.ACCESS_LIST, proof, { value }))
              .to.changeTokenBalance(TheAssetsClub, userAL, 2 + paid)
              .and.to.changeEtherBalances([userAL, TheAssetsClubMinter], [-value, value]);
          });
        }
      });
    }

    describe('before private sale', () => {
      beforeEach(async () => {
        await increaseTo(START_DATE - 100);
      });

      testClosed();
    });

    describe('during the private sale', async () => {
      beforeEach(async () => {
        await increaseTo(START_DATE + 100);
      });

      testOG();
      testAccessList();
    });

    describe('during the public sale', async () => {
      beforeEach(async () => {
        await increaseTo(START_DATE + PRIVATE_SALE_DURATION + 100);
      });

      testOG();
      testAccessList();
    });

    describe('after the public sale', () => {
      beforeEach(async () => {
        await increaseTo(START_DATE + PRIVATE_SALE_DURATION + PUBLIC_SALE_DURATION + 100);
      });

      testClosed();
    });
  });

  describe('claim', () => {
    describe('before the private sale', () => {
      it('should revert if private sale has not yet started', async () => {
        increaseTo(START_DATE - 100);

        const proof = tree.getProof([user2.address, Proof.CLAIM, 1]);
        await expect(connect(TheAssetsClubMinter, user2).claimTo(user2, 1, proof))
          .to.be.revertedWithCustomError(TheAssetsClubMinter, 'Closed')
          .withArgs();
      });
    });

    function testClaimTo() {
      it('should revert a user tries to claim his reserved tokens twice', async () => {
        const proof = tree.getProof([user2.address, Proof.CLAIM, 1]);
        await connect(TheAssetsClubMinter, user2).claimTo(user2.address, 1, proof); // pass
        await expect(connect(TheAssetsClubMinter, user2).claimTo(user2.address, 1, proof))
          .to.be.revertedWithCustomError(TheAssetsClubMinter, 'AlreadyClaimed')
          .withArgs(user1.address, 1);
      });

      it('should revert if the Merkle Proof is invalid', async () => {
        await expect(connect(TheAssetsClubMinter, user1).claimTo(user1, 1, randomProof))
          .to.be.revertedWithCustomError(TheAssetsClubMinter, 'InvalidMerkleProof')
          .withArgs();
      });

      it('should allow user to claim his tokens', async () => {
        const proof = tree.getProof([user2.address, Proof.CLAIM, 1]);
        await expect(connect(TheAssetsClubMinter, user2).claimTo(user2, 1, proof)).to.changeTokenBalance(
          TheAssetsClub,
          user1,
          1,
        );
      });
    }
  });
});
