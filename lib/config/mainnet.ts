import { ZeroAddress } from 'ethers';
import Config from './Config';

const treasury = '0xFa1fF100Ff5491583f8A0802Dc1F1301ec3B3043';

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
    '0x7c5541907c9877a0D24f0B7D4DF77A9aE4373812': 5,
  },
};

export default mainnet;
