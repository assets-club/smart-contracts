import { expect } from 'chai';
import { AddressLike, BigNumberish, EtherSymbol, formatEther, parseEther, toBeHex, zeroPadValue } from 'ethers';
import { ethers } from 'hardhat';
import { describe } from 'mocha';
import { faker } from '@faker-js/faker';
import { loadFixture, setBalance, time } from '@nomicfoundation/hardhat-network-helpers';
import '@nomicfoundation/hardhat-network-helpers/dist/src/helpers/time';
import { CustomEthersSigner } from '@nomiclabs/hardhat-ethers/signers';
import { StandardMerkleTree } from '@openzeppelin/merkle-tree';
import { getProof } from '@openzeppelin/merkle-tree/dist/core';
import Config from '../lib/config/Config';
import connect from '../lib/connect';
import {
  MAXIMUM_MINTS,
  PRIVATE_SALE_DURATION,
  PUBLIC_SALE_DURATION,
  ROYALTIES,
  SALE_PRICE,
  START_DATE,
} from '../lib/constants';
import getTestAccounts from '../lib/testing/getTestAccounts';
import stackFixture from '../lib/testing/stackFixture';
import Phase from '../lib/types/Phase';
import Proof from '../lib/types/Proof';
import Tier from '../lib/types/Tier';
import { ERC721Mock, TheAssetsClub, TheAssetsClubMock, VRFCoordinatorV2Mock } from '../typechain-types';

describe('TheAssetsClub', () => {
  let admin: CustomEthersSigner;

  let user1: CustomEthersSigner;
  let user2: CustomEthersSigner; // 1 claimable token
  let user3: CustomEthersSigner; // 7 claimable tokens
  let userOG: CustomEthersSigner; // user4
  let userAL: CustomEthersSigner; // user5

  let config: Config;
  let tree: StandardMerkleTree<[string, Proof, number]>;

  let TheAssetsClub: TheAssetsClubMock;
  let VRFCoordinatorV2: VRFCoordinatorV2Mock;
  let NFTParis: ERC721Mock;

  let randomProof: string[];

  beforeEach(async () => {
    ({ admin, user1, user2, user3, user4: userOG, user5: userAL } = await getTestAccounts());
    ({ TheAssetsClub, VRFCoordinatorV2, NFTParis: NFTParis, config, tree } = await loadFixture(stackFixture));
    randomProof = [ethers.solidityPackedKeccak256(['string'], [faker.datatype.string()])];
  });

  async function mint(to: AddressLike, quantity: BigNumberish) {
    await connect(TheAssetsClub, admin).mint(to, quantity);
  }

  describe('configuration', () => {
    it('should have ERC2981 creator earning recipient and value properly configured', async () => {
      const value = parseEther('1');
      const result = await TheAssetsClub.royaltyInfo(1, parseEther('1'));
      expect(result[0]).to.eq(await admin.getAddress());
      expect(result[1]).to.eq((value * ROYALTIES) / 10000n);
    });

    it('should have configured the owner as the admin wallet', async () => {
      expect(await TheAssetsClub.owner()).to.be.eq(await admin.getAddress());
    });
  });

  describe('setContractURI', () => {
    it('should revert if a non-owner tries to set the contract URI', async () => {
      await expect(connect(TheAssetsClub, user1).setContractURI('http://foobar')).to.be.revertedOnlyOwner(
        TheAssetsClub,
      );
    });

    it('should allow a the owner account to set the contract URI', async () => {
      const newContractURI = 'ipfs://bafybeihdwdcefgh4dqkjv67uzcmw7ojee6xedzdetojuzjevtenxquvyku';
      await connect(TheAssetsClub, admin).setContractURI(newContractURI);
      expect(await TheAssetsClub.contractURI()).to.equal(newContractURI);
    });
  });

  describe('setBaseURI', () => {
    const newBaseURI = 'ipfs://bafybeihdwdcefgh4dqkjv67uzcmw7ojee6xedzdetojuzjevtenxquvyku/';

    it('should revert if a non-owner tries to set the base URI', async () => {
      await expect(connect(TheAssetsClub, user1).setBaseURI(newBaseURI)).to.be.revertedOnlyOwner(TheAssetsClub);
    });

    it('should allow a the owner account to set the base URI', async () => {
      await connect(TheAssetsClub, admin).setBaseURI(newBaseURI);

      // mint a token to be 100% sure that the token exists
      await mint(user1, 1);
      const tokenId = (await TheAssetsClub.nextTokenId()) - 1n;

      expect(await TheAssetsClub.tokenURI(tokenId)).to.eq(`${newBaseURI}${tokenId}`);
    });
  });

  describe('remaining', () => {
    it('should reduce the number of remaining tokens when calling mint', async () => {
      const current = await TheAssetsClub.remaining();
      const quantity = BigInt(faker.datatype.number(10) + 1);
      await mint(user1, quantity);
      expect(current - quantity).to.equal(await TheAssetsClub.remaining());
    });
  });

  describe('phase', () => {
    it('should return CLOSED before the private sale', async () => {
      await time.increaseTo(START_DATE - 10n);
      expect(await TheAssetsClub.phase()).to.eq(Phase.CLOSED);
    });

    it('should return PRIVATE_SALE after the start date', async () => {
      await time.increaseTo(START_DATE + 100n);
      expect(await TheAssetsClub.phase()).to.eq(Phase.PRIVATE_SALE);
    });

    it('should return PUBLIC_SALE after the public sale', async () => {
      await time.increaseTo(START_DATE + PRIVATE_SALE_DURATION + 100n);
      expect(await TheAssetsClub.phase()).to.eq(Phase.PUBLIC_SALE);
    });

    it('should return CLOSED after the public sale', async () => {
      await time.increaseTo(START_DATE + PRIVATE_SALE_DURATION + PUBLIC_SALE_DURATION + 100n);
      expect(await TheAssetsClub.phase()).to.eq(Phase.CLOSED);
    });
  });

  describe('getPrice', () => {
    it('should revert if quantity is zero', async () => {
      await expect(TheAssetsClub.getPrice(Tier.PUBLIC, 0, 0))
        .to.be.revertedWithCustomError(TheAssetsClub, 'InvalidPricing')
        .withArgs(Tier.PUBLIC, 0, 0);
    });

    it('should revert if quantity is greater than 3', async () => {
      const invalidQuantity = 4 + faker.datatype.number();
      await expect(TheAssetsClub.getPrice(Tier.PUBLIC, invalidQuantity, 0))
        .to.be.revertedWithCustomError(TheAssetsClub, 'InvalidPricing')
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
        expect(await TheAssetsClub.getPrice(tier, quantity, skip)).to.equal(expectedPrice);
      });
    }
  });

  describe('burn', () => {
    let lastTokenId: bigint;

    beforeEach(async () => {
      await mint(user1, 1);
      lastTokenId = (await TheAssetsClub.nextTokenId()) - 1n;
    });

    it('should revert if account tries top burn non-existent token', async () => {
      const nonExistingTokenId = lastTokenId + 5n;
      await expect(connect(TheAssetsClub, user1).burn(nonExistingTokenId))
        .to.be.revertedWithCustomError(TheAssetsClub, 'OwnerQueryForNonexistentToken')
        .withArgs();
    });

    it('should revert if account tries to burn a token it does not own', async () => {
      await expect(connect(TheAssetsClub, user2).burn(lastTokenId))
        .to.be.revertedWithCustomError(TheAssetsClub, 'TransferCallerNotOwnerNorApproved')
        .withArgs();
    });
  });

  describe('setMintParameters', () => {
    it('should revert if a non-owner attempts to change the mint parameters', async () => {
      await expect(connect(TheAssetsClub, user1).setMintParameters(randomProof[0], 10)).to.be.revertedOnlyOwner;
    });
  });

  describe('mintTo', () => {
    let TheAssetsClub_OG: TheAssetsClub;
    let TheAssetsClub_AL: TheAssetsClub;
    let TheAssetsClub_public: TheAssetsClub;

    beforeEach(() => {
      TheAssetsClub_OG = connect(TheAssetsClub, userOG);
      TheAssetsClub_AL = connect(TheAssetsClub, userAL);
      TheAssetsClub_public = connect(TheAssetsClub, user1);
    });

    function testClosed() {
      it('should revert if an OG attempts to mint a token with valid proof', async () => {
        const proof = tree.getProof([userOG.address, Proof.MINT, Tier.OG]);
        await expect(TheAssetsClub_OG.mintTo(userOG.address, 1, Tier.OG, proof))
          .to.be.revertedWithCustomError(TheAssetsClub, 'Closed')
          .withArgs();
      });

      it('should revert if an access list member the attempts to mint a token with valid proof', async () => {
        const proof = tree.getProof([userAL.address, Proof.MINT, Tier.ACCESS_LIST]);
        await expect(TheAssetsClub_OG.mintTo(userAL.address, 1, Tier.ACCESS_LIST, proof))
          .to.be.revertedWithCustomError(TheAssetsClub, 'Closed')
          .withArgs();
      });

      it('should revert if an account attempts to mint a token', async () => {
        await expect(TheAssetsClub_public.mintTo(userAL.address, 1, Tier.PUBLIC, []))
          .to.be.revertedWithCustomError(TheAssetsClub, 'Closed')
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
          await expect(TheAssetsClub_OG.mintTo(userOG.address, 3, Tier.OG, proof)).to.changeTokenBalance(
            TheAssetsClub,
            userOG,
            3,
          );
        });

        for (const paid of [1, 2]) {
          it(`should allow an OG to mint three free + ${paid} paid tokens`, async () => {
            const proof = tree.getProof([userOG.address, Proof.MINT, Tier.OG]);
            const value = SALE_PRICE * BigInt(paid);
            await expect(TheAssetsClub_OG.mintTo(userOG.address, 3 + paid, Tier.OG, proof, { value }))
              .to.changeTokenBalance(TheAssetsClub, userOG, 3 + paid)
              .and.to.changeEtherBalances([userOG, TheAssetsClub], [-value, value]);
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
          await expect(TheAssetsClub_AL.mintTo(userAL.address, 2, Tier.ACCESS_LIST, proof)).to.changeTokenBalance(
            TheAssetsClub,
            userAL,
            2,
          );
        });

        for (const paid of [1, 2, 3]) {
          it(`should allow an access list member to mint two free + ${paid} paid tokens`, async () => {
            const value = SALE_PRICE * BigInt(paid);
            await expect(TheAssetsClub_AL.mintTo(userAL.address, 2 + paid, Tier.ACCESS_LIST, proof, { value }))
              .to.changeTokenBalance(TheAssetsClub, userAL, 2 + paid)
              .and.to.changeEtherBalances([userAL, TheAssetsClub], [-value, value]);
          });
        }
      });
    }

    function testNFTParis() {
      let tokenId: bigint;

      beforeEach(async () => {
        await NFTParis.mintTo(user1, 1); // token zero
        tokenId = 0n;
      });

      function getProof(tokenId: bigint) {
        return [zeroPadValue(NFTParis.target.toString(), 32), toBeHex(tokenId, 32)];
      }

      it('should revert if a non-holder of a NFT Paris token tries to mint as an access list member', async () => {
        await expect(connect(TheAssetsClub, user2).mintTo(user2, 2n, Tier.ACCESS_LIST, getProof(tokenId)))
          .to.revertedWithCustomError(TheAssetsClub, 'NFTParisNotHolder')
          .withArgs(tokenId);
      });

      it('should revert if a NFT Paris holder attempts to mint twice with the same token', async () => {
        connect(TheAssetsClub, user1).mintTo(user1, 2n, Tier.ACCESS_LIST, getProof(tokenId)); // pass
        await expect(connect(TheAssetsClub, user1).mintTo(user1, 2n, Tier.ACCESS_LIST, getProof(tokenId)))
          .to.revertedWithCustomError(TheAssetsClub, 'NFTParisAlreadyUsed')
          .withArgs(tokenId);
      });

      it('should allow a NFT Paris holder to be considered as an access list member', async () => {
        await expect(
          connect(TheAssetsClub, user1).mintTo(user1, 2n, Tier.ACCESS_LIST, getProof(tokenId)),
        ).to.changeTokenBalance(TheAssetsClub, user1, 2);
      });
    }

    describe('before private sale', () => {
      beforeEach(async () => {
        await time.increaseTo(START_DATE - 100n);
      });

      testClosed();
    });

    describe('during the private sale', async () => {
      beforeEach(async () => {
        await time.increaseTo(START_DATE + 100n);
      });

      it('should revert if the proof is invalid', async () => {
        await expect(TheAssetsClub_AL.mintTo(userAL, 2, Tier.ACCESS_LIST, randomProof))
          .to.be.revertedWithCustomError(TheAssetsClub, 'InvalidMerkleProof')
          .withArgs(userAL.address);
      });

      it('should revert if sender is not a member of the access list nor an OG', async () => {
        await expect(connect(TheAssetsClub, user1).mintTo(user1, 2, Tier.PUBLIC, []))
          .to.be.revertedWithCustomError(TheAssetsClub, 'InsufficientTier')
          .withArgs(user1.address, Tier.PUBLIC);
      });

      testOG();
      testAccessList();
      testNFTParis();
    });

    describe('during the public sale', async () => {
      beforeEach(async () => {
        await time.increaseTo(START_DATE + PRIVATE_SALE_DURATION + 100n);
      });

      testOG();
      testAccessList();
      testNFTParis();

      it('should revert if mint would exceed maxmimum supply', async () => {
        const quantity = 5n;
        const price = await TheAssetsClub.getPrice(Tier.PUBLIC, quantity, 0);

        await mint(user1, MAXIMUM_MINTS - quantity + 1n);
        // only 4 tokens left

        await expect(connect(TheAssetsClub, user1).mintTo(user1, quantity, Tier.PUBLIC, [], { value: price }))
          .to.be.revertedWithCustomError(TheAssetsClub, 'InsufficientSupply')
          .withArgs(4n, quantity);
      });

      it('should revert if sender does not forward enough ether with the transaction', async () => {
        const quantity = 5n;
        const price = await TheAssetsClub.getPrice(Tier.PUBLIC, quantity, 0);
        const value = price - 1n;

        await expect(connect(TheAssetsClub, user1).mintTo(user1, quantity, Tier.PUBLIC, [], { value }))
          .to.be.revertedWithCustomError(TheAssetsClub, 'InsufficientValue')
          .withArgs(quantity, value, price);
      });
    });

    describe('after the public sale', () => {
      beforeEach(async () => {
        await time.increaseTo(START_DATE + PRIVATE_SALE_DURATION + PUBLIC_SALE_DURATION + 100n);
      });

      testClosed();
    });
  });

  describe('claimTo', () => {
    describe('before the private sale', () => {
      it('should revert if private sale has not yet started', async () => {
        await time.increaseTo(START_DATE - 100n);

        const proof = tree.getProof([user2.address, Proof.CLAIM, 1]);
        await expect(connect(TheAssetsClub, user2).claimTo(user2, 1, proof))
          .to.be.revertedWithCustomError(TheAssetsClub, 'Closed')
          .withArgs();
      });
    });

    function testClaimTo() {
      it('should revert a user tries to claim his reserved tokens twice', async () => {
        const proof = tree.getProof([user2.address, Proof.CLAIM, 1]);
        await connect(TheAssetsClub, user2).claimTo(user2.address, 1, proof); // pass
        await expect(connect(TheAssetsClub, user2).claimTo(user2.address, 1, proof))
          .to.be.revertedWithCustomError(TheAssetsClub, 'AlreadyClaimed')
          .withArgs(user2.address, 1);
      });

      it('should revert if the Merkle Proof is invalid', async () => {
        await expect(connect(TheAssetsClub, user1).claimTo(user1, 1, randomProof))
          .to.be.revertedWithCustomError(TheAssetsClub, 'InvalidMerkleProof')
          .withArgs(user1.address);
      });

      it('should revert if the remaining supply is insufficient', async () => {
        const quantity = 7;
        const proof = tree.getProof([user3.address, Proof.CLAIM, quantity]);

        await mint(admin, MAXIMUM_MINTS - BigInt(quantity) + 1n);

        await expect(connect(TheAssetsClub, user3).claimTo(user3, quantity, proof))
          .to.be.revertedWithCustomError(TheAssetsClub, 'InsufficientSupply')
          .withArgs(quantity - 1, quantity);
      });

      it('should allow user to claim his tokens', async () => {
        const proof = tree.getProof([user2.address, Proof.CLAIM, 1]);
        await expect(connect(TheAssetsClub, user2).claimTo(user2, 1, proof)).to.changeTokenBalance(
          TheAssetsClub,
          user2.address,
          1,
        );
      });
    }

    describe('during the private sale', async () => {
      beforeEach(async () => {
        await time.increaseTo(START_DATE + 100n);
      });

      testClaimTo();
    });

    describe('during the public sale', async () => {
      beforeEach(async () => {
        await time.increaseTo(START_DATE + PRIVATE_SALE_DURATION + 100n);
      });

      testClaimTo();
    });
  });

  describe('reveal', () => {
    beforeEach(async () => {
      await mint(user1, 1000);
    });

    it('should revert if a non-owner tries to reveal the collection', async () => {
      await expect(connect(TheAssetsClub, user1).reveal()).to.be.revertedOnlyOwner(TheAssetsClub);
    });

    it('should revert if the owner attempts to trigger the reveal twice', async () => {
      await connect(TheAssetsClub, admin).reveal(); // pass
      await expect(connect(TheAssetsClub, admin).reveal())
        .to.be.revertedWithCustomError(TheAssetsClub, 'OnlyUnrevealed')
        .withArgs();
    });

    it('should allow the owner to trigger the reveal', async () => {
      await connect(TheAssetsClub, admin).reveal();
    });
  });

  describe('fulfillRandomWords', () => {
    let seed: bigint;

    beforeEach(async () => {
      await mint(user1, MAXIMUM_MINTS);
      await connect(TheAssetsClub, admin).reveal();
      seed = await faker.datatype.bigInt(2n ** 256n - 1n);
    });

    it('should revert if passed VRF requestId is invalid', async () => {
      const invalidRequestId = faker.datatype.number();
      const VRFCoordinatorV2Signer = await ethers.getImpersonatedSigner(VRFCoordinatorV2.target as string);
      await setBalance(VRFCoordinatorV2Signer.address, parseEther('10'));

      await expect(connect(TheAssetsClub, VRFCoordinatorV2Signer).rawFulfillRandomWords(invalidRequestId, [seed]))
        .to.be.revertedWithCustomError(TheAssetsClub, 'InvalidVRFRequestId')
        .withArgs(1, invalidRequestId);
    });

    it('should revert if a non-VRFCoordinatorV2 tries to trigger the reveal', async () => {
      await expect(connect(TheAssetsClub, user1).rawFulfillRandomWords(1, [seed]))
        .to.be.revertedWithCustomError(TheAssetsClub, 'OnlyCoordinatorCanFulfill')
        .withArgs(await user1.getAddress(), VRFCoordinatorV2.target);
    });

    it('should allow VRFCoordinatorV2 to reveal the collection', async () => {
      await VRFCoordinatorV2.fulfillRandomWordsWithOverride(1, TheAssetsClub.target as string, [seed]);
      expect(await TheAssetsClub.seed()).to.equal(seed);
    });
  });

  describe('supportsInterface', () => {
    const interfaces = {
      IERC165: '0x01ffc9a7',
      IERC721: '0x80ac58cd',
      IERC721Metadata: '0x5b5e139f',
      IERC2981: '0x2a55205a',
    };

    for (const [name, interfaceId] of Object.entries(interfaces)) {
      it(`should return true for interface ${interfaceId} (${name})`, async () => {
        expect(await TheAssetsClub.supportsInterface(interfaceId)).to.be.true;
      });
    }
  });
});
