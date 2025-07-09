import 'dotenv/config';

import { HardhatUserConfig } from 'hardhat/config';
import '@nomicfoundation/hardhat-toolbox';
import 'hardhat-contract-sizer';

const PRIVATE_KEY = process.env.PRIVATE_KEY || '';

const config: HardhatUserConfig = {
  solidity: {
    version: '0.8.24',
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  contractSizer: {
    alphaSort: true,
    disambiguatePaths: false,
    runOnCompile: true,
    strict: true,
  },
  gasReporter: {
    enabled: false,
    gasPrice: 1, // gwei (L2)
    currency: 'USD',
    token: 'ETH',
    coinmarketcap: process.env.COINMARKETCAP_API_KEY,
  },
  // networks: {
  //   ethereum: {
  //     url: process.env.ETHEREUM_MAINNET_RPC_URL,
  //     accounts: [PRIVATE_KEY],
  //   },
  //   base: {
  //     url: process.env.BASE_MAINNET_RPC_URL,
  //     accounts: [PRIVATE_KEY],
  //   },
  //   baseSepolia: {
  //     url: process.env.BASE_SEPOLIA_RPC_URL,
  //     accounts: [PRIVATE_KEY],
  //   },
  // },
  // etherscan: {
  //   apiKey: process.env.ETHERSCAN_SCAN_API_KEY ?? '',
  // customChains: [
  //   {
  //     network: 'baseSepolia',
  //     chainId: 84532,
  //     urls: {
  //       apiURL: 'https://api.etherscan.io/v2/api?chainid=84532',
  //       browserURL: 'https://sepolia.basescan.org',
  //     },
  //   },
  // ],
  // },
};

export default config;
