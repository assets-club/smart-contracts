import { expect } from 'chai';
import { ethers } from 'hardhat';
import { describe } from 'mocha';
import { faker } from '@faker-js/faker';
import { loadFixture, setBalance } from '@nomicfoundation/hardhat-network-helpers';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { MINTER, OPERATOR } from '../lib/constants';
import getTestAccounts from '../lib/testing/getTestAccounts';
import { expectHasRole, expectMissingRole } from '../lib/testing/roles';
import stackFixture from '../lib/testing/stackFixture';
import parseEther from '../lib/utils/parseEther';
import { TheAssetsClub, TheAssetsClubMinter, VRFCoordinatorV2Mock } from '../typechain-types';

describe('TheAssetsClub', () => {
  let admin: SignerWithAddress;
  let user1: SignerWithAddress;
  let user2: SignerWithAddress;
  let minter: SignerWithAddress;

  let TheAssetsClub: TheAssetsClub;
  let TheAssetsClubMinter: TheAssetsClubMinter;
  let VRFCoordinatorV2: VRFCoordinatorV2Mock;

  beforeEach(async () => {
    ({ admin, user1, user2 } = await getTestAccounts());
    ({ TheAssetsClub, TheAssetsClubMinter, VRFCoordinatorV2 } = await loadFixture(stackFixture));

    // Mint a token to be able to call tokenURI
    minter = await ethers.getImpersonatedSigner(TheAssetsClubMinter.address);
    await setBalance(minter.address, parseEther(10));
  });

  describe('configuration', () => {
    it('should have granted the OPERATOR role to the admin wallet', async () => {
      await expectHasRole(TheAssetsClub, admin, OPERATOR);
    });

    it('should have granted the MINTER role to the TheAssetsClubMinter contract', async () => {
      await expectHasRole(TheAssetsClub, TheAssetsClubMinter, MINTER);
    });
  });

  describe('setContractURI', () => {
    it('should revert if a non-OPERATOR tries to set the contract URI', async () => {
      await expectMissingRole(TheAssetsClub.connect(user1).setContractURI('foobar'), user1, OPERATOR);
    });

    it('should allow an OPERATOR account to set the contract URI', async () => {
      const newContractURI = `${faker.internet.url()}/`;
      expect(await TheAssetsClub.connect(admin).setContractURI(newContractURI)).to.not.be.reverted;
      expect(await TheAssetsClub.contractURI()).to.equal(newContractURI);
    });
  });

  describe('setBaseURI', () => {
    it('should revert if a non-OPERATOR tries to set the base URI', async () => {
      await expectMissingRole(TheAssetsClub.connect(user1).setBaseURI('foobar'), user1, OPERATOR);
    });

    it('should allow an OPERATOR account to set the base URI', async () => {
      const newBaseURI = `${faker.internet.url()}/`;
      expect(await TheAssetsClub.connect(admin).setBaseURI(newBaseURI)).to.not.be.reverted;
      await TheAssetsClub.connect(minter).mint(admin.address, 1);
      expect(await TheAssetsClub.tokenURI(0)).to.equal(`${newBaseURI}0.json`);
    });
  });

  describe('remaining', () => {
    it('should reduce the number of remaining tokens when calling mint', async () => {
      const current = await TheAssetsClub.remaining();
      const quantity = faker.datatype.number(10) + 1;
      await TheAssetsClub.connect(minter).mint(user1.address, quantity);
      expect(current.sub(quantity)).to.equal(await TheAssetsClub.remaining());
    });
  });

  describe('burn', () => {
    let lastTokenId: number;

    beforeEach(async () => {
      await TheAssetsClub.connect(minter).mint(user1.address, 1);
      lastTokenId = (await TheAssetsClub.nextTokenId()).toNumber() - 1;
    });

    it('should revert if account tries top mint non-existent token', async () => {
      await expect(TheAssetsClub.connect(user1).burn(lastTokenId + 5))
        .to.be.revertedWithCustomError(TheAssetsClub, 'OwnerQueryForNonexistentToken')
        .withArgs();
    });

    it('should revert if account tries top mint non-existent token', async () => {
      await expect(TheAssetsClub.connect(user2).burn(lastTokenId))
        .to.be.revertedWithCustomError(TheAssetsClub, 'TransferCallerNotOwnerNorApproved')
        .withArgs();
    });
  });

  describe('reveal', () => {
    beforeEach(async () => {
      await TheAssetsClub.connect(minter).mint(user1.address, 1000);
    });

    it('should revert if a non-OPERATOR tries to trigger the reveal', async () => {
      await expectMissingRole(TheAssetsClub.connect(user1).reveal(), user1, OPERATOR);
    });

    it('should revert if an OPERATOR to trigger the reveal twice', async () => {
      await TheAssetsClub.connect(admin).reveal(); // pass
      await expect(TheAssetsClub.connect(admin).reveal())
        .to.be.revertedWithCustomError(TheAssetsClub, 'OnlyUnrevealed')
        .withArgs();
    });

    it('should allow an OPERATOR to trigger the reveal', async () => {
      await TheAssetsClub.connect(admin).reveal();
    });
  });

  describe('fulfillRandomWords', () => {
    beforeEach(async () => {
      await TheAssetsClub.connect(minter).mint(user1.address, 5777);
      await TheAssetsClub.connect(admin).reveal();
    });

    it('should revert if passed VRF requestId is invalid', async () => {
      const invalidRequestId = faker.datatype.number();
      const VRFCoordinatorV2Signer = await ethers.getImpersonatedSigner(VRFCoordinatorV2.address);
      await setBalance(VRFCoordinatorV2Signer.address, parseEther('10'));

      await expect(TheAssetsClub.connect(VRFCoordinatorV2Signer).rawFulfillRandomWords(invalidRequestId, [4040]))
        .to.be.revertedWithCustomError(TheAssetsClub, 'InvalidVRFRequestId')
        .withArgs(1, invalidRequestId);
    });

    it('should revert if a non-VRFCoordinatorV2 tries to trigger the reveal', async () => {
      await expect(TheAssetsClub.connect(user1).rawFulfillRandomWords(1, [4242]))
        .to.be.revertedWithCustomError(TheAssetsClub, 'OnlyCoordinatorCanFulfill')
        .withArgs(user1.address, VRFCoordinatorV2.address);
    });

    it('should allow VRFCoordinatorV2 to reveal the collection', async () => {
      const seed = faker.datatype.number({ min: 0, max: Number.MAX_SAFE_INTEGER });
      await VRFCoordinatorV2.fulfillRandomWordsWithOverride(1, TheAssetsClub.address, [seed]);
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
