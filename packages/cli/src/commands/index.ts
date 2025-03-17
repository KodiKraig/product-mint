import { Command } from 'commander';
import balanceCommand from './balance';
import managerCommand from './manager';

export function registerAllCommands(program: Command): Command {
  balanceCommand(program);
  managerCommand(program);
  return program;
}
