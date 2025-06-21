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

  return payment;
}
