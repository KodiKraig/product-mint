import { Command } from 'commander';
import registerPaymentCommand from './payment';
import registerSubscriptionCommands from './subscription';

export default function registerEscrowCommands(program: Command) {
  const escrow = program
    .command('escrow')
    .description('Manage payments and subscriptions');

  registerPaymentCommand(escrow);
  registerSubscriptionCommands(escrow);
}
