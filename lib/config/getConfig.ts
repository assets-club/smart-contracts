import { network } from 'hardhat';
import Config from './Config';
import mainnet from './mainnet';
import sepolia from './sepolia';

/**
 * Get the configuration personalized for the current Hardhat network.
 */
export default function getConfig(): Config {
  switch (network.name) {
    case 'hardhat':
      return { ...sepolia, verify: false, confirmations: 0 };
    case 'local':
      return { ...sepolia, verify: false, confirmations: 0 };
    case 'sepolia':
      return sepolia;
    default:
      return mainnet;
  }
}
