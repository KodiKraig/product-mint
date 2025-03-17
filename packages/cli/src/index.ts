import 'dotenv/config';
import { Command } from 'commander';
import { registerAllCommands } from './commands';
const program = new Command();

program
  .name('ProductMint')
  .description('Command line tool for interacting with the ProductMint system');

registerAllCommands(program);

program.parse();

/**
 * Hardhat local accounts
 * When deployed locally, the first account is the owner of the contracts.
 *
 * WARNING: These accounts, and their private keys, are publicly known.
 * Any funds sent to them on Mainnet or any other live network WILL BE LOST.
 *
 * Account #0: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 (10000 ETH)
 * Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
 *
 * Account #1: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8 (10000 ETH)
 * Private Key: 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d
 *
 * Account #2: 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC (10000 ETH)
 * Private Key: 0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a
 */
