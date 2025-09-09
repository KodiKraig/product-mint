import { UniswapV4DynamicPriceRouter__factory } from '@product-mint/ethers-sdk';
import { signerWallet } from '../../provider';
import { getContractAddress } from '../../contract-address';
import { Command } from 'commander';
import { parseUnits } from 'ethers';

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
    .description('Get the price for a token swap')
    .action(async () => {
      // ETH -> USDC 0.01%
      const result = await contract.getPrice.staticCall({
        exactCurrency: '0x0000000000000000000000000000000000000000',
        path: [
          {
            intermediateCurrency: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
            fee: 100,
            tickSpacing: 1,
            hooks: '0x0000000000000000000000000000000000000000',
            hookData: '0x',
          },
        ],
        exactAmount: parseUnits('1', 18),
      });

      console.log(`Result:\n${result.toString()}`);
    });
}
