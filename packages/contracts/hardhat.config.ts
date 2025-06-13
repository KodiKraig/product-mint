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
  //   apiKey: {
  //     base: process.env.BASE_SCAN_API_KEY ?? '',
  //     baseSepolia: process.env.BASE_SCAN_API_KEY ?? '',
  //   },
  //   customChains: [
  //     {
  //       network: 'baseSepolia',
  //       chainId: 84532,
  //       urls: {
  //         apiURL: 'https://api-sepolia.basescan.org/api',
  //         browserURL: 'https://sepolia.basescan.org',
  //       },
  //     },
  //   ],
  // },
};

export default config;
