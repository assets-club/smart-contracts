import Config from './Config';

const mainnet: Config = {
  log: true,
  verify: true,
  confirmations: 10,

  admin: '', // TBD
  treasury: 's',

  vrf: {
    coordinator: '0x271682DEB8C4E0901D1a1550aD2e64D568E69909',
    keyHash: '0x9fe0eebf5e446e3c998ec9bb19951541aee00bb90ea201ae456421a2ded86805',
    subId: 712, // TBD
  },

  shares: {
    '0xe73B648F6DE254101052e126C0499c32ed736a37': 11,
    '0x793DA7e448729d9638c4C9540a89C9099B01e93C': 5,
  },
};

export default mainnet;
