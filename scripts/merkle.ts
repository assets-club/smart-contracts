import { writeFile } from 'fs/promises';
import { join } from 'path';
import getMerkleTree from '../lib/merkle/getMerkleTree';
import loadData from '../lib/merkle/loadData';

export default async function main() {
  const data = await loadData();
  const { tree } = await getMerkleTree(data);
  await writeFile(join(__dirname, '../data/tree.json'), JSON.stringify(tree.dump()));
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
