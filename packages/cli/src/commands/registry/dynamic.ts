import { Command } from 'commander';
import { IDynamicPriceRegistry__factory } from '@product-mint/ethers-sdk';
import { signerWallet } from '../../provider';
import { getContractAddress } from '../../contract-address';
import { waitTx } from '../../utils/tx';

const registry = IDynamicPriceRegistry__factory.connect(
  getContractAddress('dynamicPriceRegistry'),
  signerWallet,
);

export default function registerDynamicRegistryCommands(program: Command) {
  const dynamicCommand = program
    .command('dynamic')
    .description('Check registered Dynamic tokens');

  registerUpdateCommands(dynamicCommand.command('update'));

  dynamicCommand
    .command('list')
    .description('Get the registered tokens in the dynamic price registry')
    .action(async () => {
      const tokens = await registry.getTokens();

      if (tokens.length === 0) {
        console.log('No tokens registered');
      } else {
        console.log('Registered tokens:');
        tokens.forEach((token) => {
          console.log(`- ${token}`);
        });
      }
    });
}

const registerUpdateCommands = (command: Command) => {
  command
    .command('register')
    .description('Register a token in the dynamic price registry')
    .argument('<tokenAddress>', 'The address of the token to register')
    .action(async (tokenAddress) => {
      await waitTx(registry.registerToken(tokenAddress));
    });

  command
    .command('unregister')
    .description('Unregister a token in the dynamic price registry')
    .argument('<tokenAddress>', 'The address of the token to unregister')
    .action(async (tokenAddress) => {
      await waitTx(registry.unregisterToken(tokenAddress));
    });
};
