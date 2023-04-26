import { readFile } from 'fs/promises';
import { join } from 'path';
import { z } from 'zod';

const COLLECTION_PATH = join(__dirname, '../collection');
const metadataSchema = z.object({
  attributes: z.array(
    z.object({
      trait_type: z.string().min(1),
      value: z.string().min(1),
    }),
  ),
});

/**
 * This scripts parses the generated metadatas and outputs repartitions in STDOUT.
 */
export default async function main() {
  const stats: Record<string, Record<string, number>> = {};

  for (let i = 1; i <= 5777; i++) {
    const raw = await readFile(join(COLLECTION_PATH, `${i}.json`), { encoding: 'utf-8' });
    const data = await metadataSchema.parseAsync(JSON.parse(raw)).catch((err) => {
      console.log('err', i);
      throw err;
    });

    for (const raw of data.attributes) {
      const trait_type = raw.trait_type.trim();
      const value = raw.value.trim();

      if (!(trait_type in stats)) {
        stats[trait_type] = {};
      }

      if (!(value in stats[trait_type])) {
        stats[trait_type][value] = 0;
      }

      stats[trait_type][value]++;
    }
  }
  for (const [trait_type, data] of Object.entries(stats)) {
    console.log('Trait type:', trait_type);
    const table = Object.entries(data)
      .map(([label, count]) => {
        return {
          label,
          count,
          percentage: ((count * 100) / 5777).toFixed(3) + '%',
        };
      })
      .sort((a, b) => b.count - a.count); // Sort the table in descending order
    console.table(table);
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
