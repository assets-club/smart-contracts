import Config from './Config';
import mainnet from './mainnet';

const config: Config = {
  ...mainnet,
  log: true,
  verify: false,
  confirmations: 10,

  admin: '0x635b5569810356Efa2d9aA3F6B45711a8C3D52ed',

  vrf: {
    coordinator: '0x8103b0a8a00be2ddc778e6e7eaa21791cd364625',
    keyHash: '0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c',
    subId: 1276,
  },
};

export default config;
