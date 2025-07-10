import {
  IDynamicERC20__factory,
  MintStableToken__factory,
} from '@product-mint/ethers-sdk';
import { Command } from 'commander';
import { provider } from '../../provider';

export default function registerDynamicTokenCommands(program: Command) {
  const dynamicCommand = program
    .command('dynamic')
    .description('Interact with dynamic ERC20 tokens');

  dynamicCommand
    .command('baseTokenPrice')
    .description('Get the price of the base token in the quote token')
    .argument('<dynamicTokenAddress>', 'The address of the dynamic token')
    .action(async (dynamicTokenAddress) => {
      const contract = IDynamicERC20__factory.connect(
        dynamicTokenAddress,
        provider,
      );

      const price = await contract.getBaseTokenPrice.staticCall();
      console.log(`Price: ${price}`);
    });

  dynamicCommand
    .command('getBaseTokenAmount')
    .description(
      'Get the amount of base tokens that would be received for a given amount of quote tokens',
    )
    .argument('<dynamicTokenAddress>', 'The address of the dynamic token')
    .argument(
      '<quoteTokenAmount>',
      'The amount of quote tokens to convert to base tokens',
    )
    .action(async (dynamicTokenAddress, quoteTokenAmount) => {
      const contract = IDynamicERC20__factory.connect(
        dynamicTokenAddress,
        provider,
      );
      const [baseToken, baseTokenAmount] =
        await contract.getBaseTokenAmount.staticCall(quoteTokenAmount);
      console.log(`Base token: ${baseToken}`);
      console.log(`Base token amount: ${baseTokenAmount}`);
    });

  dynamicCommand
    .command('getQuoteTokenAmount')
    .description(
      'Get the amount of quote tokens that would be received for a given amount of base tokens',
    )
    .argument('<dynamicTokenAddress>', 'The address of the dynamic token')
    .argument(
      '<baseTokenAmount>',
      'The amount of base tokens to convert to quote tokens',
    )
    .action(async (dynamicTokenAddress, baseTokenAmount) => {
      const contract = IDynamicERC20__factory.connect(
        dynamicTokenAddress,
        provider,
      );
      const [quoteToken, quoteTokenAmount] =
        await contract.getQuoteTokenAmount.staticCall(baseTokenAmount);
      console.log(`Quote token: ${quoteToken}`);
      console.log(`Quote token amount: ${quoteTokenAmount}`);
    });

  dynamicCommand
    .command('metadata')
    .description('Get the metadata of a dynamic token')
    .argument('<dynamicTokenAddress>', 'The address of the dynamic token')
    .action(async (dynamicTokenAddress) => {
      const contract = MintStableToken__factory.connect(
        dynamicTokenAddress,
        provider,
      );
      const name = await contract.name();
      const symbol = await contract.symbol();
      const decimals = await contract.decimals();

      console.log('--------------------------------');
      console.log(`Dynamic Token Address: ${dynamicTokenAddress}`);
      console.log(`Name: ${name}`);
      console.log(`Symbol: ${symbol}`);
      console.log(`Decimals: ${decimals}`);
    });
}
