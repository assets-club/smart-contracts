import { ethers } from 'hardhat';

/**
 * Get the configured Hardhat signers mapped from indices to name.
 */
export default async function getTestAccounts() {
  const [deployer, admin, treasury, operator, user1, user2, user3, user4, user5] = await ethers.getSigners();

  return {
    deployer,
    admin,
    treasury,
    operator,
    user1,
    user2,
    user3,
    user4,
    user5,
  };
}
