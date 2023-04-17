import { utils } from 'ethers';
import { readFile } from 'fs/promises';
import neatCsv from 'neat-csv';
import { join } from 'path';
import MerkleTreeData from '../types/MerkleTreeData';

export default async function loadData(): Promise<MerkleTreeData> {
  const claimsFile = join(__dirname, '../../data/claims.csv');
  const claimsData = await neatCsv<{ address: string; quantity: number }>(await readFile(claimsFile), {
    mapValues({ header, value }) {
      switch (header) {
        case 'address':
          return utils.getAddress(value.toString().trim());
        case 'quantity':
          return Number(value);
        default:
          return value;
      }
    },
  });
  const ogFile = join(__dirname, '../../data/og.csv');
  const ogData = await neatCsv<{ address: string }>(await readFile(ogFile));

  const waitlistFile = join(__dirname, '../../data/waitlist.csv');
  const waitlistData = await neatCsv<{ address: string }>(await readFile(waitlistFile));

  return {
    claims: claimsData.reduce((map, claim) => {
      map[claim.address] = claim.quantity;
      return map;
    }, {} as Record<string, number>),
    og: ogData.map((og) => og.address),
    accessList: waitlistData.map((w) => w.address),
  };
}
