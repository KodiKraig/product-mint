import 'dotenv/config';

import { HardhatUserConfig } from 'hardhat/config';
import '@nomicfoundation/hardhat-toolbox';
import 'hardhat-contract-sizer';

const PRIVATE_KEY = process.env.PRIVATE_KEY || '';

const config: HardhatUserConfig = {
  solidity: '0.8.20',
  contractSizer: {
    alphaSort: true,
    disambiguatePaths: false,
    runOnCompile: true,
    strict: true,
  },
  gasReporter: {
    enabled: false,
    gasPrice: 10, // gwei (L2)
    currency: 'USD',
    token: 'ETH',
    coinmarketcap: process.env.COINMARKETCAP_API_KEY,
  },
  // networks: {
  //   hychainMainnet: {
  //     url: 'https://rpc.hychain.com/http',
  //     accounts: [PRIVATE_KEY],
  //   },
  //   hychainTestnet: {
  //     url: 'https://testnet-rpc.hychain.com/http',
  //     accounts: [PRIVATE_KEY],
  //   },
  // },
  // etherscan: {
  //   apiKey: {
  //     hychainMainnet: 'NO_API_KEY_NEEDED', // Blockscout doesn't require an API key
  //   },
  //   customChains: [
  //     {
  //       network: 'hychainMainnet',
  //       chainId: 2911,
  //       urls: {
  //         apiURL: 'https://hychain.calderaexplorer.xyz/api/v1',
  //         browserURL: 'https://explorer.hychain.com',
  //       },
  //     },
  //   ],
  // },
};

export default config;
