import { Command } from 'commander';
import registerPricingCommand from './pricing';
import registerProductCommand from './product';
import registerPurchaseCommand from './purchase';
import registerCouponCommand from './coupon';

export default function registerRegistryCommands(program: Command) {
  const registry = program
    .command('registry')
    .description(
      'Create products, pricing configurations, coupons, and discounts',
    );

  registerPricingCommand(registry);
  registerProductCommand(registry);
  registerPurchaseCommand(registry);
  registerCouponCommand(registry);
}
