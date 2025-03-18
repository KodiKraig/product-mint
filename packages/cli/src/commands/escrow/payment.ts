import { Command } from 'commander';
import { PaymentEscrow__factory } from '@product-mint/ethers-sdk';
import { provider, signerWallet } from '../../provider';
import { getContractAddress } from '../../contract-address';
import { waitTx } from '../../utils/tx';

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
          .setWhitelistedToken(token, whitelisted),
      );
    });

  return payment;
}
