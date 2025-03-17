import { Command } from 'commander';
import { provider } from '../provider';
import { ethers } from 'ethers';
import { MintToken__factory } from '@product-mint/ethers-sdk';

export default function registerBalanceCommand(program: Command): Command {
  const balanceCommand = program
    .command('balance')
    .description('Check token balance for a given address');

  balanceCommand
    .command('native')
    .description('Get native token balance')
    .argument('<address>', 'wallet address')
    .action(async (address) => {
      const balance = await provider.getBalance(address);
      console.log(`Native token balance:\n${ethers.formatEther(balance)}`);
    });

  balanceCommand
    .command('erc20')
    .description('Get ERC20 token balance')
    .argument('<tokenAddress>', 'ERC20 contract address')
    .argument('<address>', 'wallet address')
    .action(async (tokenAddress, address) => {
      const token = new ethers.Contract(
        tokenAddress,
        MintToken__factory.abi,
        provider,
      );
      const decimals = await token.decimals();
      const balance = await token.balanceOf(address);
      console.log(`Decimals: ${decimals}`);
      console.log(
        `${tokenAddress} balance:\n${ethers.formatUnits(balance, decimals)}`,
      );
    });

  return program;
}
