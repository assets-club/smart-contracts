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
  if (config.log) {
    console.log('TheAssetsClub deployed to', TheAssetsClub.address);
  }

  const PaymentSplitter = await deploy(
    PaymentSplitter__factory,
    Object.keys(config.shares),
    Object.values(config.shares),
  );
  if (config.log) {
    console.log('PaymentSplitter deployed to', PaymentSplitter.address);
  }

  const TheAssetsClubMinter = await deploy(
    TheAssetsClubMinter__factory,
    TheAssetsClub.address,
    PaymentSplitter.address,
    config.admin,
  );
  if (config.log) {
    console.log('TheAssetsClubMinter deployed to', TheAssetsClubMinter.address);
  }

  // Grant roles
  await waitTx(TheAssetsClub.grantRole(MINTER, TheAssetsClubMinter.address));
  await waitTx(TheAssetsClub.renounceRole(DEFAULT_ADMIN_ROLE, signer.address));

  return { TheAssetsClub, TheAssetsClubMinter, Treasury: PaymentSplitter, config };
}
