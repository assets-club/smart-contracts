import { ethers, network, run } from 'hardhat';
import { Logger } from 'tslog';
import { TheAssetsClubA__factory, TheAssetsClubOZ__factory, TheAssetsClubPsi__factory } from '../typings';

const MAX_SUPPLY = 10000;
const logger = new Logger({
  displayFunctionName: false,
  displayFilePath: 'hidden',
});

async function main() {
  const [deployer] = await ethers.getSigners();

  // OpenZeppelin
  const tacOZ = await new TheAssetsClubOZ__factory(deployer).deploy(10000);
  await tacOZ.deployed();
  logger.info('TheAssetsClubOZ deployed to', tacOZ.address);

  // Azuki's ERC721A
  const tacA = await new TheAssetsClubA__factory(deployer).deploy(10000);
  await tacA.deployed();
  logger.info('TheAssetsClubA deployed to', tacA.address);

  // Mediaval DAO ERC721Psi
  const tacPsi = await new TheAssetsClubPsi__factory(deployer).deploy(10000);
  await tacPsi.deployed();
  logger.info('TheAssetsClubPsi deployed to', tacPsi.address);

  if (network.name !== 'hardhat') {
    await run('verify:verify', { address: tacOZ.address, constructorArguments: [MAX_SUPPLY] });
    await run('verify:verify', { address: tacA.address, constructorArguments: [MAX_SUPPLY] });
    await run('verify:verify', { address: tacPsi.address, constructorArguments: [MAX_SUPPLY] });
  }
}

void main().catch((err) => {
  throw err;
});
