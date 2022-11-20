import { ethers } from 'hardhat';

/**
 * Get the configured Hardhat signers mapped from indices to name.
 */
export default async function getTestAccounts() {
  const [deployer, treasury, waitListed, nobody] = await ethers.getSigners();
  return { deployer, treasury, waitListed, nobody };
}
