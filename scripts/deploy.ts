import { parseEther } from 'ethers/lib/utils';
import { ethers, network, run } from 'hardhat';
import { Logger } from 'tslog';
import { TheAssetsClub__factory } from '../typings';

const logger = new Logger({
  displayFunctionName: false,
  displayFilePath: 'hidden',
});

const MAX_SUPPLY = 10000;
const MIN_ETH_BALANCE = parseEther('0.1');
const MAX_TAC_BALANCE = 3;
const LIMITS = [2000, 5000];
const QUANTITIES = [3, 2];

async function main() {
  const [deployer] = await ethers.getSigners();
  const args = [MAX_SUPPLY, MIN_ETH_BALANCE, MAX_TAC_BALANCE, LIMITS, QUANTITIES] as const;

  const tac = await new TheAssetsClub__factory(deployer).deploy(...args);
  await tac.deployed();
  await tac.deployTransaction.wait(3);
  logger.info('TheAssetsClub deployed to', tac.address);

  if (network.name !== 'hardhat') {
    await run('verify:verify', { address: tac.address, constructorArguments: args });
  }
}

void main().catch((err) => {
  throw err;
});
