import { config as loadConfig } from 'dotenv';
import { HardhatUserConfig } from 'hardhat/config';
import { set } from 'lodash';
import { join } from 'path';
import '@nomicfoundation/hardhat-toolbox';

loadConfig({ path: join(process.cwd(), '.env.local') });

const config: HardhatUserConfig = {
  solidity: {
    version: '0.8.9',
    settings: {
      optimizer: {
        enabled: true,
      },
    },
  },
  networks: {
    hardhat: {
      chainId: 1337,
    },
    mainnet: {
      url: 'https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161',
      chainId: 1,
      accounts: process.env.MAINNET_PRIVATE_KEY ? [process.env.MAINNET_PRIVATE_KEY] : [],
    },
    goerli: {
      url: 'https://goerli.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161',
      chainId: 5,
      accounts: process.env.GOERLI_PRIVATE_KEY ? [process.env.GOERLI_PRIVATE_KEY] : [],
    },
    fuji: {
      url: 'https://api.avax-test.network/ext/bc/C/rpc',
      chainId: 43113,
      accounts: process.env.FUJI_PRIVATE_KEY ? [process.env.FUJI_PRIVATE_KEY] : [],
    },
  },
  typechain: {
    outDir: 'typings',
    target: 'ethers-v5',
  },
  gasReporter: {
    enabled: Boolean(process.env.REPORT_GAS),
    currency: 'USD',
    coinmarketcap: process.env.COINMARKETPCAP_API_KEY,
  },
};

if (process.env.ETHERSCAN_API_KEY) {
  set(config, 'etherscan.apiKey.mainnet', process.env.ETHERSCAN_API_KEY);
  set(config, 'etherscan.apiKey.goerli', process.env.ETHERSCAN_API_KEY);
}

if (process.env.SNOWTRACE_API_KEY) {
  set(config, 'etherscan.apiKey.avalanche', process.env.SNOWTRACE_API_KEY);
  set(config, 'etherscan.apiKey.avalancheFujiTestnet', process.env.SNOWTRACE_API_KEY);
}

export default config;
