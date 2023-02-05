import Config from './Config';
import mainnet from './mainnet';

const config: Config = {
  ...mainnet,
  verify: false,

  // see https://app.safe.global/gor:0xB4dD9680b65E8cbf215ec7d78FfFA36f6047F668
  admin: '0xB4dD9680b65E8cbf215ec7d78FfFA36f6047F668',
  treasury: '0xB4dD9680b65E8cbf215ec7d78FfFA36f6047F668',

  vrf: {
    coordinator: '0x2ca8e0c643bde4c2e08ab1fa0da3401adad7734d',
    keyHash: '0x79d3d8832d904592c0bf9818b621522c988bb8b0c05cdc3b15aea1b6e8db0c15',
    subId: 9234,
  },
};

export default config;
