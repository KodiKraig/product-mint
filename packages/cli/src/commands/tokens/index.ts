import { Command } from 'commander';
import registerOrganizationCommand from './organization';
import registerMintTokenCommand from './mint-token';
import registerProductPassCommand from './pass';
import registerDynamicTokenCommand from './dynamic';

export default function registerTokensCommand(program: Command) {
  const tokens = program
    .command('tokens')
    .description('Interact directly with the NFT and other token contracts');

  registerOrganizationCommand(tokens);
  registerMintTokenCommand(tokens);
  registerProductPassCommand(tokens);
  registerDynamicTokenCommand(tokens);
}
