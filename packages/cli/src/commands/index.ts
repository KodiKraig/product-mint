import { Command } from 'commander';
import registerBalanceCommand from './balance';
import registerManagerCommand from './manager';
import registerRegistryCommands from './registry';
import registerTokensCommand from './tokens';
import registerEscrowCommands from './escrow';
import registerUsageCommand from './usage';

export function registerAllCommands(program: Command) {
  registerBalanceCommand(program);
  registerManagerCommand(program);
  registerRegistryCommands(program);
  registerTokensCommand(program);
  registerEscrowCommands(program);
  registerUsageCommand(program);
}
