import { network } from 'hardhat';
import Config from './Config';
import goerli from './goerli';
import mainnet from './mainnet';

/**
 * Get the configuration personalized for the current Hardhat network.
 */
export default function getConfig(): Config {
  switch (network.name) {
    case 'hardhat':
      return { ...mainnet, verify: false, confirmations: 0 };
    case 'local':
      return { ...goerli, verify: false, confirmations: 0 };
    case 'goerli':
      return goerli;
    default:
      return mainnet;
  }
}
