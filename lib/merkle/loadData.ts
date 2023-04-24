import { getAddress } from 'ethers';
import { readFile } from 'fs/promises';
import neatCsv from 'neat-csv';
import { join } from 'path';
import MerkleTreeData from '../types/MerkleTreeData';
import normalizeAddresses from './normalizeAddresses';

const data = join(__dirname, '../../data');

async function loadFile(path: string) {
  const raw = await readFile(path, { encoding: 'utf8' });
  const clean = raw.split('\n').reduce((acc, line) => {
    const trimmed = line.trim();

    if (trimmed.length > 0) {
      acc += trimmed + '\n';
    }

    return acc;
  }, '');

  return clean.trim();
}

export default async function loadData(): Promise<MerkleTreeData> {
  const claimsFile = join(data, 'claims.csv');
  const claimsData = await neatCsv<{ address: string; quantity: number }>(await loadFile(claimsFile), {
    mapValues({ header, value }) {
      switch (header) {
        case 'address':
          return getAddress(value.toString().trim());
        case 'quantity':
          return Number(value);
        default:
          return value;
      }
    },
  });
  const ogFile = join(data, 'og.csv');
  const ogData = await neatCsv<{ address: string }>(await loadFile(ogFile));

  const accessListField = join(data, 'access_list.csv');
  const accessListData = await neatCsv<{ address: string }>(await loadFile(accessListField));

  return {
    claims: claimsData.reduce((map, claim) => {
      map[claim.address.trim()] = claim.quantity;
      return map;
    }, {} as Record<string, number>),
    og: normalizeAddresses(ogData.map((og) => og.address)),
    accessList: normalizeAddresses(accessListData.map((w) => w.address)),
  };
}
