import { StandardMerkleTree } from '@openzeppelin/merkle-tree';
import MerkleTreeData from '../types/MerkleTreeData';
import Proof from '../types/Proof';
import Tier from '../types/Tier';

export default async function getMerkleTree(input: MerkleTreeData) {
  const data: [string, Proof, number][] = [];
  let reserved = 0;

  for (const [address, quantity] of Object.entries(input.claims)) {
    data.push([address, Proof.CLAIM, quantity]);
    reserved += quantity;
  }

  for (const address of input.og) {
    data.push([address, Proof.MINT, Tier.OG]);
  }

  for (const address of input.waitlist) {
    data.push([address, Proof.MINT, Tier.WL]);
  }

  return {
    reserved,
    tree: StandardMerkleTree.of(data, ['address', 'uint8', 'uint256']),
  };
}
