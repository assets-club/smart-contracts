import { expect } from 'chai';
import { ethers } from 'hardhat';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { Whitelist, Whitelist__factory } from '../typings';

describe('Whitelist', () => {
  let deployer: SignerWithAddress;
  let accounts: SignerWithAddress[];
  let whitelist: Whitelist;

  beforeEach(async () => {
    [deployer, ...accounts] = await ethers.getSigners();
    whitelist = await new Whitelist__factory(deployer).deploy();
    await whitelist.deployed();
  });

  it('should add an account to the whitelist', async () => {
    expect(await whitelist.isWhitelisted(accounts[0].address)).to.eq(false);
    await whitelist.add([accounts[0].address]);
    expect(await whitelist.isWhitelisted(accounts[0].address)).to.eq(true);
  });

  it('should delete an account to the whitelist', async () => {
    await whitelist.add([accounts[0].address]);
    expect(await whitelist.isWhitelisted(accounts[0].address)).to.eq(true);
    await whitelist.remove([accounts[0].address]);
    expect(await whitelist.isWhitelisted(accounts[0].address)).to.eq(false);
  });
});
