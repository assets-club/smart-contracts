import { Presets, SingleBar } from 'cli-progress';
import { mkdir, readFile, writeFile } from 'fs/promises';
import range from 'lodash/range';
import { join } from 'path';
import { rimraf } from 'rimraf';
import sharp from 'sharp';
import { shuffle } from 'shuffle-seed';

// see https://etherscan.io/tx/0xc19f80906d944a0efd27e0c6d479d3320a9986aaad024ccfc35f80be8aeb7f00
const seed = '0xc19f80906d944a0efd27e0c6d479d3320a9986aaad024ccfc35f80be8aeb7f00';
const original = range(1, 5778);
const size = 557;

const inputDir = join(__dirname, '../metadata/raw');
const outputDir = join(__dirname, '../metadata/tokens');

async function generate(tokenId: number, destination: number) {
  const metadata = JSON.parse(await readFile(join(inputDir, destination + '.json'), { encoding: 'utf8' }));
  metadata.name = `Asset #${tokenId}`;
  metadata.description = `Asset #${tokenId}, part of TheAssetClub Original collection.`;
  metadata.image = `https://static.theassets.club/tokens/${tokenId}.png`;
  metadata.external_url = `https://theassets.club/gallery/${tokenId}`;

  await writeFile(join(outputDir, tokenId.toString()), JSON.stringify(metadata, undefined, 2));
  await sharp(join(inputDir, `${destination}.png`))
    .withMetadata({
      exif: {
        IFD0: {
          Copyright: 'TheAssetsClub',
        },
      },
    })
    .toFile(join(outputDir, `${tokenId}.png`));
}

async function main() {
  await rimraf(outputDir);
  await mkdir(outputDir, { recursive: true });

  const progress = new SingleBar({}, Presets.shades_classic);
  const final = shuffle(original, seed).slice(0, size);
  progress.start(size, 0);

  await Promise.all(
    [...final.entries()].map(async ([i, destination]) => {
      await generate(i + 1, destination);
      progress.increment();
    }),
  );

  progress.stop();
}

main().catch((err) => {
  console.error(err);
});
