import { Signer } from 'ethers';
import { TheAssetsClubMock__factory, TheAssetsClub__factory } from '../typechain-types';
import Config from './config/Config';
import createDeployer from './utils/createDeployer';

export default async function deployContracts(signer: Signer, config: Config) {
  const deploy = createDeployer(signer, {
    verify: config.verify,
    confirmations: config.confirmations,
    log: config.log,
  });

  const factory = config.mock ? TheAssetsClubMock__factory : TheAssetsClub__factory;
  const TheAssetsClub = await deploy(
    factory,
    config.admin,
    config.nftParis,
    config.vrf.coordinator,
    config.vrf.keyHash,
    config.vrf.subId,
  );

  if (config.log) {
    console.log('TheAssetsClub deployed to', TheAssetsClub.target);
  }

  return { TheAssetsClub, config };
}
