import { Command } from 'commander';
import { PaymentEscrow__factory } from '@product-mint/ethers-sdk';
import { provider, signerWallet } from '../../provider';
import { getContractAddress } from '../../contract-address';
import { waitTx } from '../../utils/tx';
import { ethers, formatUnits } from 'ethers';
import { getTokenDecimals } from '../../utils/tokens';
import { parseBooleanValue } from '../../utils/parsing';

const paymentEscrow = PaymentEscrow__factory.connect(
  getContractAddress('paymentEscrow'),
  provider,
);

export default function registerPaymentCommand(program: Command): Command {
  const payment = program
    .command('payment')
    .description(
      'Withdraw funds for organizations from the payment escrow contract.',
    );

  payment
    .command('whitelistedTokens')
    .description(
      'Check if an ERC20 token is whitelisted for the payment escrow contract.',
    )
    .argument('<token>', 'The token address to check.')
    .action(async (token) => {
      const whitelisted = await paymentEscrow.whitelistedTokens(token);
      console.log(`Token ${token} - Whitelisted: ${whitelisted}`);
    });

  payment
    .command('setWhitelistedToken')
    .description('Whitelist a token for the payment escrow contract.')
    .argument('<token>', 'The token address to whitelist.')
    .argument(
      '<whitelisted>',
      'Whether the token is whitelisted. true or false',
    )
    .action(async (token, whitelisted) => {
      await waitTx(
        paymentEscrow
          .connect(signerWallet)
          .setWhitelistedToken(token, parseBooleanValue(whitelisted)!),
      );
    });

  payment
    .command('orgBalance')
    .description('Get the balance of an organization.')
    .argument('<orgId>', 'The organization ID to get the balance of.')
    .option(
      '-t, --token <token>',
      'The token address to get the balance of. Defaults to native token.',
      ethers.ZeroAddress,
    )
    .action(async (orgId, options) => {
      const { token } = options;

      const balance = await paymentEscrow.orgBalances(orgId, token);

      const decimals = await getTokenDecimals(token);
      console.log(`Organization ${orgId}`);
      console.log(`Token ${token}`);
      console.log(`Balance ${balance} (${formatUnits(balance, decimals)})`);
    });

  payment
    .command('withdrawOrgBalance')
    .description('Withdraw all funds for an organization.')
    .argument('<orgId>', 'The organization ID to withdraw funds for.')
    .option(
      '-t, --token <token>',
      'The token address to get the balance of. Defaults to native token.',
      ethers.ZeroAddress,
    )
    .action(async (orgId, options) => {
      const { token } = options;

      const balance = await paymentEscrow.orgBalances(orgId, token);

      if (balance === 0n) {
        console.log('No balance to withdraw.');
        return;
      }

      console.log(`Withdrawing ${balance}...`);

      await waitTx(
        paymentEscrow
          .connect(signerWallet)
          .withdrawOrgBalance(orgId, token, balance),
      );
    });

  registerFeeCommand(payment);

  return payment;
}

const registerFeeCommand = (program: Command) => {
  const fee = program
    .command('fee')
    .description('Manage fees for the payment escrow contract.');

  fee
    .command('get')
    .description('Get the fee for a token.')
    .argument('<token>', 'The token address to get the fee for.')
    .action(async (token) => {
      const fee = await paymentEscrow.fees(token);
      console.log(`Fee for ${token}: ${fee} (${Number(fee) / 100}%)`);
    });

  fee
    .command('set')
    .description('Set the fee for a token.')
    .argument('<token>', 'The token address to set the fee for.')
    .argument('<fee>', 'The fee to set for the token.')
    .action(async (token, fee) => {
      await waitTx(paymentEscrow.connect(signerWallet).setFee(token, fee));
    });

  fee
    .command('enabled')
    .description('Are fees enabled for the payment escrow contract?')
    .action(async () => {
      const enabled = await paymentEscrow.isFeeEnabled();
      console.log(`Fees enabled: ${enabled}`);
    });

  fee
    .command('enable')
    .description('Enable the fees for the payment escrow contract.')
    .action(async () => {
      await waitTx(paymentEscrow.connect(signerWallet).setFeeEnabled(true));
    });

  fee
    .command('disable')
    .description('Disable fees for the payment escrow contract.')
    .action(async () => {
      await waitTx(paymentEscrow.connect(signerWallet).setFeeEnabled(false));
    });

  fee
    .command('balance')
    .description('Get the fee balance of the payment escrow contract.')
    .argument('<token>', 'The token address to get the balance of.')
    .action(async (token) => {
      const balance = await paymentEscrow.getFeeBalance(token);
      const decimals = await getTokenDecimals(token);
      console.log(`Token: ${token}`);
      console.log(`Balance: ${balance} (${formatUnits(balance, decimals)})`);
    });

  fee
    .command('withdraw')
    .description('Withdraw the fee balance of the payment escrow contract.')
    .argument('<token>', 'The token address to withdraw the balance of.')
    .action(async (token) => {
      await waitTx(paymentEscrow.connect(signerWallet).withdrawFee(token));
    });
};
