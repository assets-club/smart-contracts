import { BaseContract } from 'ethers';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';

export type AddressSubject = string | SignerWithAddress | BaseContract;

export default function getAddress(subject: AddressSubject) {
  return typeof subject === 'string' ? subject : subject.address;
}
