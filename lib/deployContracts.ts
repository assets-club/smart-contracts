import { Signer } from 'ethers';
import { TheAssetsClub__factory, TheAssetsClubMinter__factory } from '../typechain-types';
import Config from './config/Config';
import createDeployer from './utils/createDeployer';
import waitTx from './utils/waitTx';

export default async function deployContracts(signer: Signer, config: Config) {
  const deploy = createDeployer(signer, {
    verify: config.verify,
    confirmations: config.confirmations,
    log: config.log,
  });

  const TheAssetsClub = await deploy(
    TheAssetsClub__factory,
    config.vrf.coordinator,
    config.vrf.keyHash,
    config.vrf.subId,
    config.treasury,
  );
  if (config.log) {
    console.log('TheAssetsClub deployed to', TheAssetsClub.target);
  }

  const TheAssetsClubMinter = await deploy(
    TheAssetsClubMinter__factory,
    TheAssetsClub.target,
    config.nftParis,
    config.admin,
    Object.keys(config.shares),
    Object.values(config.shares),
  );

  if (typeof TheAssetsClubMinter.target !== 'string') {
    throw new Error('TheAssetsClubMinter.target is not a string');
  }

  await waitTx(TheAssetsClub.initialize(config.admin, TheAssetsClubMinter.target));

  return { TheAssetsClub, TheAssetsClubMinter, config };
}
