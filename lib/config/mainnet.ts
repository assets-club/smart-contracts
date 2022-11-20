import { NULL_ADDRESS } from '../constants';
import Config from '../types/Config';

const mainnet: Config = {
  treasury: NULL_ADDRESS,
  vrf: {
    coordinator: '0x271682DEB8C4E0901D1a1550aD2e64D568E69909',
    keyHash: '0x9fe0eebf5e446e3c998ec9bb19951541aee00bb90ea201ae456421a2ded86805',
    subId: 0, // TBD
  },
};

export default mainnet;
