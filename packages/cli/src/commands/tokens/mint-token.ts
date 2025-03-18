import { Command } from 'commander';
import { MintToken__factory } from '@product-mint/ethers-sdk';
import { getContractAddress } from '../../contract-address';
import { provider, signerWallet } from '../../provider';
import { parseUnits, formatUnits } from 'ethers';
import { waitTx } from '../../utils/tx';

const mintToken = MintToken__factory.connect(
  getContractAddress('mintToken'),
  provider,
);

export default function registerMintTokenCommand(program: Command): Command {
  const mintTokenCommand = program
    .command('mint-token')
    .description('ProductMint ERC20 tokens for testing purposes');

  mintTokenCommand
    .command('mint')
    .description('Mint tokens to an address')
    .argument('to', 'The address to mint the tokens to')
    .argument('amount', 'The amount of tokens to mint in human readable format')
    .action(async (to, amount) => {
      const decimals = await mintToken.decimals();

      await waitTx(
        mintToken.connect(signerWallet).mint(to, parseUnits(amount, decimals)),
      );
    });

  mintTokenCommand
    .command('balance')
    .description('Get the balance of a token')
    .argument('address', 'The address to get the balance of')
    .action(async (address) => {
      const balance = await mintToken.balanceOf(address);
      const decimals = await mintToken.decimals();
      console.log(
        `Balance of ${address}: ${balance} (${formatUnits(balance, decimals)})`,
      );
    });

  mintTokenCommand
    .command('approve')
    .description('Approve a spender to spend tokens on behalf of the owner')
    .argument('spender', 'The address to approve')
    .argument(
      'amount',
      'The amount of tokens to approve in human readable format',
    )
    .action(async (spender, amount) => {
      const decimals = await mintToken.decimals();

      await waitTx(
        mintToken
          .connect(signerWallet)
          .approve(spender, parseUnits(amount, decimals)),
      );
    });

  mintTokenCommand
    .command('allowance')
    .description('Get the allowance of a spender')
    .argument('owner', 'The address of the owner')
    .argument('spender', 'The address of the spender')
    .action(async (owner, spender) => {
      const allowance = await mintToken.allowance(owner, spender);
      const decimals = await mintToken.decimals();
      console.log(
        `Allowance of ${owner} to ${spender}: ${allowance} (${formatUnits(
          allowance,
          decimals,
        )})`,
      );
    });

  return mintTokenCommand;
}
