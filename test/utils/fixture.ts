import { utils } from 'ethers';
import mainnet from '../../lib/config/mainnet';
import deployContracts from '../../lib/deployContracts';
import { VRFCoordinatorV2Mock__factory } from '../../typings';
import getTestAccounts from './getTestAccounts';

export default async function fixture() {
  const { deployer, treasury } = await getTestAccounts();

  const VRFCoordinatorV2 = await new VRFCoordinatorV2Mock__factory().connect(deployer).deploy(0, 0);
  await VRFCoordinatorV2.deployed();
  await VRFCoordinatorV2.createSubscription();
  const subId = 1; // This is the only created subscription

  const { TheAssetsClub, TheAssetsClubMinter } = await deployContracts(deployer, {
    ...mainnet,
    treasury: treasury.address,
    vrf: {
      coordinator: VRFCoordinatorV2.address,
      keyHash: utils.solidityKeccak256(['string'], ['RANDOM_KEY_HASH']),
      subId,
    },
  });

  await VRFCoordinatorV2.addConsumer(subId, TheAssetsClub.address);

  return { TheAssetsClub, TheAssetsClubMinter, VRFCoordinatorV2 };
}
