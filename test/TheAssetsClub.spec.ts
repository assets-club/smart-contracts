import { expect } from 'chai';
import { parseEther } from 'ethers';
import { ethers } from 'hardhat';
import { describe } from 'mocha';
import { faker } from '@faker-js/faker';
import { loadFixture, setBalance } from '@nomicfoundation/hardhat-network-helpers';
import { CustomEthersSigner } from '@nomiclabs/hardhat-ethers/signers';
import Config from '../lib/config/Config';
import connect from '../lib/connect';
import getTestAccounts from '../lib/testing/getTestAccounts';
import stackFixture from '../lib/testing/stackFixture';
import { TheAssetsClub, TheAssetsClubMinter, TheAssetsClub__factory, VRFCoordinatorV2Mock } from '../typechain-types';

describe('TheAssetsClub', () => {
  let admin: CustomEthersSigner;
  let treasury: CustomEthersSigner;
  let user1: CustomEthersSigner;
  let user2: CustomEthersSigner;
  let minter: CustomEthersSigner;

  let config: Config;

  let TheAssetsClub: TheAssetsClub;
  let TheAssetsClubMinter: TheAssetsClubMinter;
  let VRFCoordinatorV2: VRFCoordinatorV2Mock;

  beforeEach(async () => {
    ({ admin, treasury, user1, user2 } = await getTestAccounts());
    ({ config, TheAssetsClub, TheAssetsClubMinter, VRFCoordinatorV2 } = await loadFixture(stackFixture));

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

  describe('initialize', () => {
    beforeEach(async () => {
      // We need to re-deploy a fresh instance of TheAssetsClub contract since initialize is called during initialization
      TheAssetsClub = await new TheAssetsClub__factory()
        .connect(user1)
        .deploy(config.vrf.coordinator, config.vrf.keyHash, config.vrf.subId, config.treasury);
    });

    it('should revert if non-owner attempts to initialize the minter', async () => {
      await expect(connect(TheAssetsClub, user2).initialize(user2, user2)).to.be.revertedOnlyOwner;
    });

    it('should revert if owner attempts to initialize the minter twice', async () => {
      // We need to re-deploy a fresh instance of TheAssetsClub contract since initialize is called during initialization
      TheAssetsClub = await new TheAssetsClub__factory()
        .connect(user1)
        .deploy(config.vrf.coordinator, config.vrf.keyHash, config.vrf.subId, config.treasury);

      expect(await TheAssetsClub.owner()).to.eq(user1.address);
      await connect(TheAssetsClub, user1).initialize(admin, user1); // transfer ownership to admin
      expect(await TheAssetsClub.owner()).to.eq(admin.address);

      // attempt to change the minter again: fail
      await expect(connect(TheAssetsClub, admin).initialize(admin, user2))
        .to.be.revertedWithCustomError(TheAssetsClub, 'MinterAlreadySet')
        .withArgs();
    });
  });

  describe('setContractURI', () => {
    it('should revert if a non-owner tries to set the contract URI', async () => {
      await expect(connect(TheAssetsClub, user1).setContractURI('http://foobar')).to.be.revertedOnlyOwner;
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

    it('should allow a the owner account to set the base URI', async () => {
      const newBaseURI = `${faker.internet.url()}/`;
      await connect(TheAssetsClub, admin).setBaseURI(newBaseURI);

      // mint a token to be 100% sure that the token exists
      await connect(TheAssetsClub, minter).mint(user1, 1);
      const tokenId = (await TheAssetsClub.nextTokenId()) - 1n;

      expect(await TheAssetsClub.tokenURI(tokenId)).to.eq(`${newBaseURI}${tokenId}.json`);
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

  describe('mint', () => {
    it('should revert if non-minter attempts to mint a token', async () => {
      await expect(connect(TheAssetsClub, user1).mint(user1, 5))
        .to.be.revertedWithCustomError(TheAssetsClub, 'OnlyMinter')
        .withArgs(minter.address, user1.address);
    });

    it('should revert if mint would exceed MAXIMUM_MINTS', async () => {
      const MAXIMUM_MINTS = await TheAssetsClub.MAXIMUM_MINTS();
      const delta = BigInt(faker.datatype.number({ min: 1, max: 20 }));
      await connect(TheAssetsClub, minter).mint(user1, MAXIMUM_MINTS - delta); // pass

      await expect(connect(TheAssetsClub, minter).mint(user1, delta + 1n)) // exceed quantity by 1
        .to.be.revertedWithCustomError(TheAssetsClub, 'MaximumMintsReached')
        .withArgs(delta + 1n, MAXIMUM_MINTS - delta);

      await expect(connect(TheAssetsClub, minter).mint(user1, delta)).to.not.be.reverted; // pass
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

  describe('reveal', () => {
    beforeEach(async () => {
      await connect(TheAssetsClub, minter).mint(user1, 1000);
    });

    it('should revert if a non-owner tries to reveal the collection', async () => {
      await expect(connect(TheAssetsClub, user1).reveal()).to.be.revertedOnlyOwner;
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
