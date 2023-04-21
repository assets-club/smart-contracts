import { ZeroAddress } from 'ethers';
import Config from './Config';

const mainnet: Config = {
  log: true,
  verify: true,
  confirmations: 10,

  // https://etherscan.io/address/0xFa1fF100Ff5491583f8A0802Dc1F1301ec3B3043
  admin: '0xFa1fF100Ff5491583f8A0802Dc1F1301ec3B3043',

  // https://etherscan.io/address/0xD13fbE29dbd15Bd0175122a4f8c90072c568511d
  nftParis: '0xD13fbE29dbd15Bd0175122a4f8c90072c568511d',

  vrf: {
    coordinator: '0x271682DEB8C4E0901D1a1550aD2e64D568E69909',
    keyHash: '0x9fe0eebf5e446e3c998ec9bb19951541aee00bb90ea201ae456421a2ded86805',
    subId: 712, // see https://vrf.chain.link/mainnet/712
  },
};

export default mainnet;
