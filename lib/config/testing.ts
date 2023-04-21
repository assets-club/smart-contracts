import { ethers } from 'ethers';
import Config from './Config';
import mainnet from './mainnet';

/**
 * Testing configuration: it should be as close as possible as the mainnet config.
 */
const testing: Omit<Config, 'accounts'> = {
  ...mainnet,
  log: false,
  confirmations: 0,
  verify: false,

  mock: true,

  vrf: {
    ...mainnet.vrf,
    keyHash: ethers.solidityPackedKeccak256(['string'], ['RANDOM_KEY_HASH']),
  },
};

export default testing;
