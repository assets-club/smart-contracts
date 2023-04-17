import { config as loadConfig } from 'dotenv';
import 'hardhat-abi-exporter';
import 'hardhat-dependency-compiler';
import 'hardhat-gas-reporter';
import 'hardhat-ignore-warnings';
import { HardhatUserConfig } from 'hardhat/config';
import { set } from 'lodash';
import 'solidity-coverage';
import '@nomicfoundation/hardhat-chai-matchers';
import '@nomiclabs/hardhat-ethers';
import '@nomiclabs/hardhat-etherscan';
import '@typechain/hardhat';

loadConfig();

const config: HardhatUserConfig = {
  solidity: {
    version: '0.8.18',
    settings: {
      optimizer: {
        enabled: true,
      },
    },
  },
  networks: {
    hardhat: {
      chainId: 1337,
      initialDate: '2023-04-01 00:00:00',
    },
  },
  dependencyCompiler: {
    paths: ['@chainlink/contracts/src/v0.8/mocks/VRFCoordinatorV2Mock.sol'],
  },
  warnings: {
    '@chainlink/contracts/src/v0.8/mocks/VRFCoordinatorV2Mock.sol': 'off',
  },
  abiExporter: {
    clear: true,
    runOnCompile: true,
    pretty: false,
    only: ['^contracts'],
    except: ['^contracts/testing'],
    path: 'abi',
    rename: (sourceName) => {
      return sourceName.replace(/^contracts\/(.*)\.sol$/, '$1');
    },
  },
  typechain: {
    target: 'ethers-v6',
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
    chainId: 5,
    accounts: process.env.DEPLOYER_PRIVATE_KEY ? [process.env.DEPLOYER_PRIVATE_KEY] : [],
  });
}

if (process.env.ETHERSCAN_API_KEY) {
  set(config, 'etherscan.apiKey.mainnet', process.env.ETHERSCAN_API_KEY);
  set(config, 'etherscan.apiKey.goerli', process.env.ETHERSCAN_API_KEY);
}

export default config;
