import { Signer } from 'ethers';
import { TheAssetsClub__factory, TheAssetsClubMinter__factory } from '../typings';
import { DEFAULT_ADMIN_ROLE, MINTER, OPERATOR } from './roles';
import Config from './types/Config';
import waitTx from './utils/waitTx';

export default async function deployContracts(deployer: Signer, config: Config) {
  const deployerAddress = await deployer.getAddress();

  // Step 1: deploy the contracts
  const TheAssetsClub = await new TheAssetsClub__factory()
    .connect(deployer)
    .deploy(config.vrf.coordinator, config.vrf.keyHash, config.vrf.subId);
  await TheAssetsClub.deployed();

  const TheAssetsClubMinter = await new TheAssetsClubMinter__factory()
    .connect(deployer)
    .deploy(TheAssetsClub.address, config.treasury);
  await TheAssetsClub.deployed();

  // Step 2: set the permissions
  await waitTx(TheAssetsClub.grantRole(MINTER, TheAssetsClubMinter.address));
  await waitTx(TheAssetsClub.grantRole(OPERATOR, config.treasury));
  await waitTx(TheAssetsClubMinter.grantRole(OPERATOR, config.treasury));

  // Step 3: renounce admin privileges
  await waitTx(TheAssetsClub.renounceRole(DEFAULT_ADMIN_ROLE, deployerAddress));
  await waitTx(TheAssetsClubMinter.renounceRole(DEFAULT_ADMIN_ROLE, deployerAddress));

  return { TheAssetsClub, TheAssetsClubMinter };
}
