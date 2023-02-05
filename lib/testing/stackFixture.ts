import { VRFCoordinatorV2Mock__factory } from '../../typechain-types';
import testing from '../config/testing';
import deployContracts from '../deployContracts';
import getMerkleTree from '../merkle/getMerkleTree';
import getTestAccounts from './getTestAccounts';

export default async function stackFixture() {
  const { deployer, admin, treasury, user1, user2, user3, user4 } = await getTestAccounts();

  // Set up the VRF coordinator
  const VRFCoordinatorV2 = await new VRFCoordinatorV2Mock__factory().connect(deployer).deploy(0, 0);
  await VRFCoordinatorV2.deployed();

  await VRFCoordinatorV2.createSubscription();
  const subId = 1;

  const { TheAssetsClub, TheAssetsClubMinter, ...contracts } = await deployContracts(deployer, {
    ...testing,
    admin: admin.address,
    treasury: treasury.address,
    vrf: {
      ...testing.vrf,
      coordinator: VRFCoordinatorV2.address,
      subId,
    },
  });

  await VRFCoordinatorV2.addConsumer(subId, TheAssetsClub.address);

  // Generate Merkle tree
  const { tree, reserved } = await getMerkleTree({
    claims: {
      [user1.address]: 1,
      [user2.address]: 2,
    },
    og: [user2.address, user3.address],
    waitlist: [user3.address, user4.address],
  });

  await TheAssetsClubMinter.connect(admin).setMintParameters(tree.root, reserved);

  return { TheAssetsClub, TheAssetsClubMinter, VRFCoordinatorV2, tree, ...contracts };
}
