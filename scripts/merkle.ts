import { writeFile } from 'fs/promises';
import { join } from 'path';
import createMerkleTree from '../lib/merkle/createMerkleTree';
import loadData from '../lib/merkle/loadData';
import writeData from '../lib/merkle/writeData';

export default async function main() {
  const data = await loadData();
  await writeData(data);
  const { tree } = await createMerkleTree(data);
  await writeFile(join(__dirname, '../data/tree.json'), JSON.stringify(tree.dump()));
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
