import { Command } from 'commander';
import registerPricingCommand from './pricing';

export default function registerRegistryCommands(program: Command) {
  const registry = program
    .command('registry')
    .description(
      'Create products, pricing configurations, coupons, and discounts',
    );

  registerPricingCommand(registry);
}
