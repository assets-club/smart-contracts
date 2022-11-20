import { expect } from 'chai';
import { BaseContract, ContractTransaction } from 'ethers';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import hashRole from '../../lib/roles';
import { IAccessControl } from '../../typings';

type AddressSubject = string | SignerWithAddress | BaseContract;

function getAddress(subject: AddressSubject) {
  return typeof subject === 'string' ? subject : subject.address;
}

function getRole(role: string) {
  return role.match(/^0x[\da-fA-F]+$/) ? role : hashRole(role);
}

export async function expectHasRole(contract: IAccessControl, subject: AddressSubject, role: string) {
  const actual = getAddress(subject);
  const hashedRole = getRole(role);

  expect(await contract.hasRole(hashedRole, actual)).to.eq(true, `${actual} was expected to have ${role} role`);
}

export async function expectMissingRole(tx: Promise<ContractTransaction>, subject: AddressSubject, role: string) {
  await expect(tx).to.be.revertedWith(
    `AccessControl: account ${getAddress(subject).toLowerCase()} is missing role ${getRole(role)}`,
  );
}
