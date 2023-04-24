import { getAddress } from 'ethers';
import { writeFile } from 'node:fs/promises';
import MerkleTreeData from '../types/MerkleTreeData';
import { ACCESS_LIST_FILE, CLAIMS_FILE, OG_FILE } from './constants';

const normalizeAddresses = (addresses: string[]) => {
  const deduped = [...new Set(addresses.map((address) => getAddress(address)))];
  deduped.sort();
  return deduped;
};

export default async function writeData(data: MerkleTreeData) {
  // og.csv
  await writeFile(OG_FILE, ['address', ...data.og].join('\n'));

  // access_list.csv
  await writeFile(ACCESS_LIST_FILE, ['address', ...data.accessList].join('\n'));

  // claim.csv
  const claims = Object.entries(data.claims).map(([address, claims]) => `${address},${claims}`);
  claims.sort();
  claims.unshift('address,quantity');
  await writeFile(CLAIMS_FILE, claims.join('\n'));
}
