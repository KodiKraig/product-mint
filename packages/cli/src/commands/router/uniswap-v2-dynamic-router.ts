import { UniswapV2DynamicPriceRouter__factory } from '@product-mint/ethers-sdk';
import { signerWallet } from '../../provider';
import { getContractAddress } from '../../contract-address';
import { Command } from 'commander';
import { parseCommaSeparatedList } from '../../utils/parsing';

const contract = UniswapV2DynamicPriceRouter__factory.connect(
  getContractAddress('uniswapV2DynamicRouter'),
  signerWallet,
);

export default function registerUniswapV2DynamicRouterCommand(
  program: Command,
) {
  const uniswapV2DynamicRouterCommand = program
    .command('uniswapV2')
    .description('Uniswap V2 Dynamic Router');

  uniswapV2DynamicRouterCommand
    .command('price')
    .description('Get the price of a token from the last token in the path')
    .argument(
      '<amountIn>',
      'The amount going in the swap in decimals for the first token in the path',
    )
    .argument(
      '<path>',
      'A comma separated list of contract addresses of the tokens in the swap path',
    )
    .action(async (amountIn, path) => {
      const parsed = parseCommaSeparatedList<string>(path, 'string');
      const price = await contract.getPrice(amountIn, parsed);
      const priceFeesRemoved = await contract.getPriceFeesRemoved(
        amountIn,
        parsed,
      );
      console.log(`Amount in: ${amountIn}`);
      console.log(`Path: ${parsed.join(' -> ')}`);
      console.log(`Price: ${price}`);
      console.log(`Price fees removed: ${priceFeesRemoved}`);
    });
}
