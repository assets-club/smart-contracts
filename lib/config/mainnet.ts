import { ZeroAddress } from 'ethers';
import Config from './Config';

const treasury = '0x635b5569810356Efa2d9aA3F6B45711a8C3D52ed'; // dummy address for now

const mainnet: Config = {
  log: true,
  verify: true,
  confirmations: 10,

  admin: treasury, // TBD
  treasury,
  nftParis: '0xD13fbE29dbd15Bd0175122a4f8c90072c568511d', // see https://etherscan.io/address/0xD13fbE29dbd15Bd0175122a4f8c90072c568511d

  vrf: {
    coordinator: '0x271682DEB8C4E0901D1a1550aD2e64D568E69909',
    keyHash: '0x9fe0eebf5e446e3c998ec9bb19951541aee00bb90ea201ae456421a2ded86805',
    subId: 712, // see https://vrf.chain.link/mainnet/712
  },

  shares: {
    [treasury]: 50,
    '0xe73B648F6DE254101052e126C0499c32ed736a37': 11,
    '0xEDe1dC6D877D5988eC6c9c53028F933ee731AE6b': 11,
    '0x41e2B01600a088ab81a946F6Ec9C7B31048fB1ad': 11,
    '0xA15D66Ba229bD23D814CEc32a138F0a24DB304a9': 11,
    '0x793DA7e448729d9638c4C9540a89C9099B01e93C': 5,
  },
};

export default mainnet;
