import { Command } from 'commander';
import { provider, signerWallet } from '../provider';
import { waitTx } from '../utils/tx';
import { UsageRecorder__factory } from '@product-mint/ethers-sdk';
import { getContractAddress } from '../contract-address';

const usageRecorder = UsageRecorder__factory.connect(
  getContractAddress('usageRecorder'),
  provider,
);

export default function registerUsageCommand(program: Command): Command {
  const usage = program
    .command('usage')
    .description('Manage usage meters and record usage');

  usage
    .command('createMeter')
    .description('Create a new usage meter')
    .argument('<organizationId>', 'The organization ID')
    .argument(
      '<aggregationMethod>',
      'The aggregation method for the meter. 0 (SUM), 1 (COUNT)',
    )
    .action(async (organizationId, aggregationMethod) => {
      await waitTx(
        usageRecorder
          .connect(signerWallet)
          .createMeter(organizationId, aggregationMethod),
      );
    });

  usage
    .command('listOrgMeters')
    .description('Get all meters for an organization')
    .argument('<organizationId>', 'The organization ID')
    .action(async (organizationId) => {
      const meters = await usageRecorder.getOrganizationMeters(organizationId);

      if (meters.length === 0) {
        console.log('No meters found');
        return;
      }

      for (const meter of meters) {
        const meterInfo = await usageRecorder.usageMeters(meter);
        console.log(`Meter ID: ${meter}`);
        console.log(`Organization ID: ${meterInfo.orgId}`);
        console.log(
          `Aggregation Method: ${meterInfo.aggregationMethod} (${
            meterInfo.aggregationMethod === 0n ? 'SUM' : 'COUNT'
          })`,
        );
        console.log(`Is Active: ${meterInfo.isActive}\n`);
      }
    });

  usage
    .command('getPassUsage')
    .description('Get the usage for a pass by token ID')
    .argument('<meterId>', 'The meter ID')
    .argument('<passId>', 'The pass ID')
    .action(async (meterId, passId) => {
      const usage = await usageRecorder.passUsages(meterId, passId);
      console.log(`Meter ID: ${meterId}`);
      console.log(`Pass ID: ${passId}`);
      console.log(`Usage: ${usage}`);
    });
  return usage;
}
