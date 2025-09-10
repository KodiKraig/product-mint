import { UniswapV4DynamicPriceRouter__factory } from '@product-mint/ethers-sdk';
import { signerWallet } from '../../provider';
import { getContractAddress } from '../../contract-address';
import { Command } from 'commander';
import { formatEther, formatUnits, parseUnits } from 'ethers';

const contract = UniswapV4DynamicPriceRouter__factory.connect(
  getContractAddress('uniswapV4DynamicRouter'),
  signerWallet,
);

export default function registerUniswapV4DynamicRouterCommand(
  program: Command,
) {
  const uniswapV4DynamicRouterCommand = program
    .command('uniswapV4')
    .description('Uniswap V4 Dynamic Router');

  uniswapV4DynamicRouterCommand
    .command('price')
    .description('Find the price for a token swap')
    .action(async () => {
      // MAINNET TESTING EXAMPLE

      // USDC -> KONG 1%
      // USDC = 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48
      // KONG = 0x8db036f007841C21B97eFF7dfc2c187241d59BaF
      // const result = await contract.getPriceFeesRemoved.staticCall({
      //   exactCurrency: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      //   path: [
      //     {
      //       intermediateCurrency: '0x8db036f007841C21B97eFF7dfc2c187241d59BaF',
      //       fee: 10000,
      //       tickSpacing: 100,
      //       hooks: '0x0000000000000000000000000000000000000000',
      //       hookData: '0x',
      //     },
      //   ],
      //   exactAmount: parseUnits('1', 6),
      // });
      // console.log(`Result:\n${formatEther(result.toString())}`);

      // KONG -> USDC 1%
      // KONG = 0x8db036f007841C21B97eFF7dfc2c187241d59BaF
      // USDC = 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48
      const result = await contract.getPriceFeesRemoved.staticCall({
        exactCurrency: '0x8db036f007841C21B97eFF7dfc2c187241d59BaF',
        path: [
          {
            intermediateCurrency: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
            fee: 10000,
            tickSpacing: 100,
            hooks: '0x0000000000000000000000000000000000000000',
            hookData: '0x',
          },
        ],
        exactAmount: parseUnits('45', 18),
      });
      console.log(`Result:\n${formatUnits(result.toString(), 6)}`);
    });
}
