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
import './lib/chai/assertions';

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
    mainnet: {
      chainId: 1,
      url: 'http://127.0.0.1:1248',
    },
    goerli: {
      chainId: 5,
      url: 'http://127.0.0.1:1248',
    },
    sepolia: {
      chainId: 11155111,
      url: 'http://127.0.0.1:1248',
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
    token: 'ETH',
    coinmarketcap: process.env.COINMARKETCAP_API_KEY,
    excludeContracts: ['ERC721Mock', 'VRFCoordinatorV2Mock', 'InvalidReceiver'],
  },
};

if (process.env.ETHERSCAN_API_KEY) {
  set(config, 'etherscan.apiKey.mainnet', process.env.ETHERSCAN_API_KEY);
  set(config, 'etherscan.apiKey.goerli', process.env.ETHERSCAN_API_KEY);
}

export default config;
