import { writeFile } from 'fs/promises';
import { join } from 'path';
import createMerkleTree from '../lib/merkle/createMerkleTree';
import loadData from '../lib/merkle/loadData';

export default async function main() {
  const data = await loadData();
  const { tree } = await createMerkleTree(data);
  await writeFile(join(__dirname, '../data/tree.json'), JSON.stringify(tree.dump()));
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
