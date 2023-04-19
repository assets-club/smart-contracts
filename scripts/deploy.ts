import getConfig from '../lib/config/getConfig';
import deployContracts from '../lib/deployContracts';
import getSigner from '../lib/getSigner';

async function main() {
  const signer = await getSigner();
  const config = getConfig();

  await deployContracts(signer, config);
  return;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
