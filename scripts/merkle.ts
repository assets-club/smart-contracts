import getMerkleTree from '../lib/merkle/getMerkleTree';
import loadData from '../lib/merkle/loadData';

export default async function main() {
  const data = await loadData();
  const { tree } = await getMerkleTree(data);
  console.log(JSON.stringify(tree.dump(), null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
