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

  return usage;
}
