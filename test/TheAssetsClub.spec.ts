import { expect } from 'chai';
import { utils } from 'ethers';
import { parseEther } from 'ethers/lib/utils';
import { ethers } from 'hardhat';
import { describe } from 'mocha';
import { faker } from '@faker-js/faker';
import { setBalance } from '@nomicfoundation/hardhat-network-helpers';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { MINTER, OPERATOR } from '../lib/roles';
import { TheAssetsClub, TheAssetsClubMinter, VRFCoordinatorV2Mock } from '../typings';
import fixture from './utils/fixture';
import getTestAccounts from './utils/getTestAccounts';
import { expectHasRole, expectMissingRole } from './utils/roles';

describe('TheAssetsClub', () => {
  let treasury: SignerWithAddress;
  let minter: SignerWithAddress;
  let nobody: SignerWithAddress;

  let TheAssetsClub: TheAssetsClub;
  let TheAssetsClubMinter: TheAssetsClubMinter;
  let VRFCoordinatorV2: VRFCoordinatorV2Mock;

  beforeEach(async () => {
    ({ treasury, nobody } = await getTestAccounts());
    ({ TheAssetsClub, TheAssetsClubMinter, VRFCoordinatorV2 } = await fixture());

    // Mint a token to be able to call tokenURI
    minter = await ethers.getImpersonatedSigner(TheAssetsClubMinter.address);
    await setBalance(minter.address, utils.parseEther('10'));
  });

  describe('configuration', () => {
    it('should have granted the OPERATOR role to treasury', async () => {
      await expectHasRole(TheAssetsClub, treasury, OPERATOR);
    });
    it('should have granted the MINTER role to the TheAssetsClubMinter contract', async () => {
      await expectHasRole(TheAssetsClub, TheAssetsClubMinter, MINTER);
    });
  });

  describe('setContractURI', () => {
    it('should allow an OPERATOR account to set the contract URI', async () => {
      const newContractURI = `${faker.internet.url()}/`;
      expect(await TheAssetsClub.connect(treasury).setContractURI(newContractURI)).to.not.be.reverted;
      expect(await TheAssetsClub.contractURI()).to.equal(newContractURI);
    });

    it('should revert if a non-OPERATOR tries to set the contract URI', async () => {
      await expectMissingRole(TheAssetsClub.connect(nobody).setContractURI('foobar'), nobody, OPERATOR);
    });
  });

  describe('setBaseURI', () => {
    it('should allow an OPERATOR account to set the base URI', async () => {
      const newBaseURI = `${faker.internet.url()}/`;
      expect(await TheAssetsClub.connect(treasury).setBaseURI(newBaseURI)).to.not.be.reverted;
      await TheAssetsClub.connect(minter).mint(nobody.address, 1);
      expect(await TheAssetsClub.tokenURI(1)).to.equal(`${newBaseURI}0.json`);
    });

    it('should revert if a non-OPERATOR tries to set the base URI', async () => {
      await expectMissingRole(TheAssetsClub.connect(nobody).setBaseURI('foobar'), nobody, OPERATOR);
    });
  });

  describe('mint', () => {
    let MAXIMUM_MINTS: number;

    beforeEach(async () => {
      MAXIMUM_MINTS = (await TheAssetsClub.MAXIMUM_MINTS()).toNumber();
    });

    it('should allow MINTER role to mint tokens freely', async () => {
      const quantity = faker.datatype.number(10) + 1;
      expect(await TheAssetsClub.connect(minter).mint(nobody.address, quantity)).to.changeTokenBalance(
        TheAssetsClub,
        nobody,
        quantity,
      );
    });

    it('should revert if a non-MINTER tries to mint tokens', async () => {
      await expectMissingRole(TheAssetsClub.connect(nobody).mint(nobody.address, 10), nobody, MINTER);
    });

    it('should revert if a mint would overflow maximum supply', async () => {
      expect(TheAssetsClub.connect(minter).mint(nobody.address, MAXIMUM_MINTS)).to.changeTokenBalance(
        TheAssetsClub,
        nobody,
        MAXIMUM_MINTS,
      );

      expect(TheAssetsClub.connect(minter).mint(nobody.address, 1))
        .to.be.revertedWithCustomError(TheAssetsClub, 'MaximumMintsReached')
        .withArgs(1, MAXIMUM_MINTS);
    });
  });

  describe('reveal', async () => {
    beforeEach(async () => {
      await TheAssetsClub.connect(minter).mint(nobody.address, 1000);
    });

    it('should allow an OPERATOR to trigger the reveal', async () => {
      await TheAssetsClub.connect(treasury).reveal();
    });

    it('should revert if a non-OPERATOR tries to trigger the reveal', async () => {
      await expectMissingRole(TheAssetsClub.connect(nobody).reveal(), nobody, OPERATOR);
    });

    it('should revert an OPERATOR to trigger the reveal twice', async () => {
      await TheAssetsClub.connect(treasury).reveal(); // pass
      await expect(TheAssetsClub.connect(treasury).reveal())
        .to.be.revertedWithCustomError(TheAssetsClub, 'OnlyUnrevealed')
        .withArgs();
    });
  });

  describe('fulfillRandomWords', () => {
    beforeEach(async () => {
      await TheAssetsClub.connect(minter).mint(nobody.address, 5777);
      await TheAssetsClub.connect(treasury).reveal();
    });

    it('should allow VRFCoordinatorV2 to reveal the collection', async () => {
      const seed = faker.datatype.number({ min: 0, max: Number.MAX_SAFE_INTEGER });
      await VRFCoordinatorV2.fulfillRandomWordsWithOverride(1, TheAssetsClub.address, [seed]);
      expect(await TheAssetsClub.seed()).to.equal(seed);
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
      await expect(TheAssetsClub.connect(nobody).rawFulfillRandomWords(1, [4242]))
        .to.be.revertedWithCustomError(TheAssetsClub, 'OnlyCoordinatorCanFulfill')
        .withArgs(nobody.address, VRFCoordinatorV2.address);
    });
  });

  describe('supportsInterface', () => {
    const interfaces = [
      ['0x01ffc9a7', 'ERC165'],
      //['0x80ac58cd', 'ERC721'],
      ['0x01ffc9a7', 'ERC721Metadata'],
    ];

    for (const [interfaceId, description] of interfaces) {
      it(`should return true for interface ${interfaceId} (${description})`, async () => {
        expect(await TheAssetsClub.supportsInterface(interfaceId)).to.be.true;
      });
    }
  });
});
