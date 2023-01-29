import { VRFCoordinatorV2Mock__factory } from '../../typechain-types';
import testing from '../config/testing';
import deployContracts from '../deployContracts';
import getTestAccounts from './getTestAccounts';

export default async function stackFixture() {
  const { deployer, admin, treasury, operator } = await getTestAccounts();

  // Set up the VRF coordinator
  const VRFCoordinatorV2 = await new VRFCoordinatorV2Mock__factory().connect(deployer).deploy(0, 0);
  await VRFCoordinatorV2.deployed();

  await VRFCoordinatorV2.createSubscription();
  const subId = 1;

  const { TheAssetsClub, ...contracts } = await deployContracts(deployer, {
    ...testing,
    admin: admin.address,
    treasury: treasury.address,
    operators: [operator.address],
    vrf: {
      ...testing.vrf,
      coordinator: VRFCoordinatorV2.address,
      subId,
    },
  });

  await VRFCoordinatorV2.addConsumer(subId, TheAssetsClub.address);

  return { TheAssetsClub, VRFCoordinatorV2, ...contracts };
}
