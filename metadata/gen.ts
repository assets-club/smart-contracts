import { readFileSync } from 'node:fs';
import { writeFile } from 'node:fs/promises';

const raw = readFileSync('metadata/reveal.json', { encoding: 'utf-8' });

async function main() {
  for (let i = 1; i <= 5777; i++) {
    await writeFile('metadata/gen/' + i.toString(), raw.replaceAll('{number}', i.toString()));
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
