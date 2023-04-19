import { ERC721Mock__factory, VRFCoordinatorV2Mock__factory } from '../../typechain-types';
import testing from '../config/testing';
import connect from '../connect';
import deployContracts from '../deployContracts';
import createMerkleTree from '../merkle/createMerkleTree';
import getTestAccounts from './getTestAccounts';

export default async function stackFixture() {
  const { deployer, admin, treasury, user1, user2, user3, user4, user5 } = await getTestAccounts();

  // Set up the VRF coordinator
  const VRFCoordinatorV2 = await new VRFCoordinatorV2Mock__factory().connect(deployer).deploy(0, 0);
  await VRFCoordinatorV2.waitForDeployment();

  await VRFCoordinatorV2.createSubscription();
  const subId = 1;

  const NFTParis = await new ERC721Mock__factory().connect(deployer).deploy();
  await NFTParis.waitForDeployment();

  const { TheAssetsClub, TheAssetsClubMinter, ...contracts } = await deployContracts(deployer, {
    ...testing,
    admin: admin.address,
    treasury: treasury.address,
    nftParis: NFTParis.target.toString(),
    vrf: {
      ...testing.vrf,
      coordinator: VRFCoordinatorV2.target as string,
      subId,
    },
  });
  await VRFCoordinatorV2.addConsumer(subId, TheAssetsClub.target);

  // Generate Merkle tree
  const { tree, reserved } = await createMerkleTree({
    claims: {
      [user2.address]: 1,
      [user3.address]: 7,
    },
    og: [user4.address],
    accessList: [user5.address],
  });

  await connect(TheAssetsClubMinter, admin).setMintParameters(tree.root, reserved);

  return { TheAssetsClub, TheAssetsClubMinter, NFTParis, VRFCoordinatorV2, tree, ...contracts };
}
