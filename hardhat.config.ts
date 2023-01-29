import { config as loadConfig } from 'dotenv';
import 'hardhat-dependency-compiler';
import { HardhatUserConfig } from 'hardhat/config';
import { set } from 'lodash';
import '@nomicfoundation/hardhat-toolbox';

loadConfig();

const config: HardhatUserConfig = {
  solidity: {
    version: '0.8.17',
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
  },
  dependencyCompiler: {
    paths: [
      '@chainlink/contracts/src/v0.8/mocks/VRFCoordinatorV2Mock.sol',
      '@openzeppelin/contracts/finance/PaymentSplitter.sol',
    ],
  },
  typechain: {
    target: 'ethers-v5',
  },
  gasReporter: {
    enabled: Boolean(process.env.REPORT_GAS),
    currency: 'USD',
    coinmarketcap: process.env.COINMARKETCAP_API_KEY,
  },
};

if (process.env.MAINNET_RPC_URL) {
  set(config, 'networks.mainnet', {
    url: process.env.MAINNET_RPC_URL,
    chainId: 1,
    accounts: process.env.DEPLOYER_PRIVATE_KEY ? [process.env.DEPLOYER_PRIVATE_KEY] : [],
  });
}

if (process.env.GOERLI_RPC_URL) {
  set(config, 'networks.goerli', {
    url: process.env.GOERLI_RPC_URL,
    chainId: 1,
    accounts: process.env.DEPLOYER_PRIVATE_KEY ? [process.env.DEPLOYER_PRIVATE_KEY] : [],
  });
}

if (process.env.ETHERSCAN_API_KEY) {
  set(config, 'etherscan.apiKey.mainnet', process.env.ETHERSCAN_API_KEY);
  set(config, 'etherscan.apiKey.goerli', process.env.ETHERSCAN_API_KEY);
}

export default config;
