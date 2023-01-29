import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { PaymentSplitter__factory, TheAssetsClub__factory, TheAssetsClubMinter__factory } from '../typechain-types';
import Config from './config/Config';
import { DEFAULT_ADMIN_ROLE, MINTER } from './constants';
import createDeployer from './utils/createDeployer';
import waitTx from './utils/waitTx';

export default async function deployContracts(signer: SignerWithAddress, config: Config) {
  const deploy = createDeployer(signer, { verify: config.verify, confirmations: config.confirmations });

  const TheAssetsClub = await deploy(
    TheAssetsClub__factory,
    config.vrf.coordinator,
    config.vrf.keyHash,
    config.vrf.subId,
    config.admin,
    config.treasury,
  );

  const TheAssetsClubSplitter = await deploy(
    PaymentSplitter__factory,
    Object.keys(config.shares),
    Object.values(config.shares),
  );

  const TheAssetsClubMinter = await deploy(
    TheAssetsClubMinter__factory,
    TheAssetsClub.address,
    TheAssetsClubSplitter.address,
    Object.keys(config.reservations),
    Object.values(config.reservations),
    config.admin,
  );

  // Grant roles
  await waitTx(TheAssetsClub.grantRole(MINTER, TheAssetsClubMinter.address));
  await waitTx(TheAssetsClub.renounceRole(DEFAULT_ADMIN_ROLE, signer.address));

  return { TheAssetsClub, TheAssetsClubSplitter, TheAssetsClubMinter, config };
}
