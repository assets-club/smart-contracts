import { expect } from 'chai';
import { Signer, parseEther } from 'ethers';
import { ethers } from 'hardhat';
import { describe } from 'mocha';
import { faker } from '@faker-js/faker';
import { loadFixture, setBalance } from '@nomicfoundation/hardhat-network-helpers';
import connect from '../lib/connect';
import getTestAccounts from '../lib/testing/getTestAccounts';
import stackFixture from '../lib/testing/stackFixture';
import { TheAssetsClub, TheAssetsClubMinter, VRFCoordinatorV2Mock } from '../typechain-types';

describe('TheAssetsClub', () => {
  let admin: Signer;
  let treasury: Signer;
  let user1: Signer;
  let user2: Signer;
  let minter: Signer;

  let TheAssetsClub: TheAssetsClub;
  let TheAssetsClubMinter: TheAssetsClubMinter;
  let VRFCoordinatorV2: VRFCoordinatorV2Mock;

  beforeEach(async () => {
    ({ admin, treasury, user1, user2 } = await getTestAccounts());
    ({ TheAssetsClub, TheAssetsClubMinter, VRFCoordinatorV2 } = await loadFixture(stackFixture));

    // Mint a token to be able to call tokenURI
    minter = await ethers.getImpersonatedSigner(TheAssetsClubMinter.target as string);
    await setBalance(await minter.getAddress(), parseEther('10'));
  });

  describe('configuration', () => {
    it('should have ERC2981 creator earning recipient and value properly configured', async () => {
      const value = parseEther('1');
      const result = await TheAssetsClub.royaltyInfo(1, parseEther('1'));
      expect(result[0]).to.eq(await treasury.getAddress());
      expect(result[1]).to.eq((value * (await TheAssetsClub.ROYALTIES())) / 10000n);
    });
  });

  describe('setContractURI', () => {
    it('should revert if a non-owner tries to set the contract URI', async () => {
      await expect(connect(TheAssetsClub, user1).setContractURI('http://foobar')).to.be.revertedWith(
        'Ownable: caller is not the owner',
      );
    });

    it('should allow a the owner account to set the contract URI', async () => {
      const newContractURI = `${faker.internet.url()}/`;
      await connect(TheAssetsClub, admin).setContractURI(newContractURI);
      expect(await TheAssetsClub.contractURI()).to.equal(newContractURI);
    });
  });

  describe('setBaseURI', () => {
    it('should revert if a non-owner tries to set the base URI', async () => {
      await expect(connect(TheAssetsClub, user1).setBaseURI('http://foobar')).to.be.revertedWith(
        'Ownable: caller is not the owner',
      );
    });

    it('should allow a the owner account to set the contract URI', async () => {
      const newContractURI = `${faker.internet.url()}/`;
      await connect(TheAssetsClub, admin).setContractURI(newContractURI);
      expect(await TheAssetsClub.contractURI()).to.equal(newContractURI);
    });
  });

  describe('remaining', () => {
    it('should reduce the number of remaining tokens when calling mint', async () => {
      const current = await TheAssetsClub.remaining();
      const quantity = BigInt(faker.datatype.number(10) + 1);
      await connect(TheAssetsClub, minter).mint(user1, quantity);
      expect(current - quantity).to.equal(await TheAssetsClub.remaining());
    });
  });

  describe('burn', () => {
    let lastTokenId: bigint;

    beforeEach(async () => {
      await connect(TheAssetsClub, minter).mint(user1, 1);
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

  describe('mint', () => {});

  describe('reveal', () => {
    beforeEach(async () => {
      await connect(TheAssetsClub, minter).mint(user1, 1000);
    });

    it('should revert if a non-owner tries to set the base URI', async () => {
      await expect(connect(TheAssetsClub, user1).setBaseURI('http://foobar')).to.be.revertedWith(
        'Ownable: caller is not the owner',
      );
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
      await connect(TheAssetsClub, minter).mint(user1, await TheAssetsClubMinter.MAXIMUM_MINTS());
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
