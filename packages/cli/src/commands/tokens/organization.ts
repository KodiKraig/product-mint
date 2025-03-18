import { Command } from 'commander';
import { provider, signerWallet } from '../../provider';
import { OrganizationNFT__factory } from '@product-mint/ethers-sdk';
import { getContractAddress } from '../../contract-address';
import { waitTx } from '../../utils/tx';
import { AddressLike } from 'ethers';
import { parseCommaSeparatedList } from '../../utils/parsing';
import { parseMetadata } from '../../utils/metadata';

const organizationNFT = OrganizationNFT__factory.connect(
  getContractAddress('organizationNFT'),
  provider,
);

export default function registerOrganizationCommand(program: Command): Command {
  const organization = program
    .command('org')
    .description('Interact with the Organization NFT contract');

  /**
   * Total Supply
   */

  organization
    .command('totalSupply')
    .description('Get the total supply of Organization NFTs')
    .action(async () => {
      console.log('Total supply:', await organizationNFT.totalSupply());
    });

  /**
   * Minting
   */

  organization
    .command('mint')
    .description('Mint a new Organization NFT')
    .argument('<to>', 'The address to mint the NFT to')
    .action(async (to) => {
      await waitTx(organizationNFT.connect(signerWallet).mint(to));
    });

  organization
    .command('setMintOpen')
    .description('Set the mint open status')
    .argument('<mintOpen>', 'The mint open status')
    .action(async (mintOpen) => {
      await waitTx(organizationNFT.connect(signerWallet).setMintOpen(mintOpen));
    });

  organization
    .command('isMintOpen')
    .description('Check if the mint is open for all addresses')
    .action(async () => {
      console.log('Mint is open:', await organizationNFT.mintOpen());
    });

  /**
   * Owner of
   */

  organization
    .command('ownerOf')
    .description('Get the owner of a given Organization NFT')
    .argument('<tokenId>', 'The token ID of the Organization NFT')
    .action(async (tokenId) => {
      console.log('Owner:', await organizationNFT.ownerOf(tokenId));
    });

  /**
   * Whitelist Management
   */

  organization
    .command('setWhitelisted')
    .description('Set the whitelisted status for a given address')
    .argument(
      '<addresses>',
      'Comma separated addresses to set the whitelisted status for',
    )
    .argument('<isWhitelisted>', 'Comma separated whitelisted statuses')
    .action(async (addresses, isWhitelisted) => {
      const addressesArray = parseCommaSeparatedList<AddressLike>(
        addresses,
        'string',
      );
      const isWhitelistedArray = parseCommaSeparatedList<boolean>(
        isWhitelisted,
        'boolean',
      );

      if (addressesArray.length !== isWhitelistedArray.length) {
        throw new Error(
          'Addresses and isWhitelisted arrays must be the same length',
        );
      }

      if (addressesArray.length === 0) {
        throw new Error('Addresses array cannot be empty');
      }

      await waitTx(
        organizationNFT
          .connect(signerWallet)
          .setWhitelisted(addressesArray, isWhitelistedArray),
      );
    });

  organization
    .command('isWhitelisted')
    .description('Check if a given address is whitelisted')
    .argument('<address>', 'The address to check the whitelisted status for')
    .action(async (address) => {
      console.log(
        'Is whitelisted:',
        await organizationNFT.whitelisted(address),
      );
    });

  /**
   * Token URI
   */

  organization
    .command('tokenURI')
    .description('Get the token URI for a given Organization NFT')
    .argument('<tokenId>', 'The token ID of the Organization NFT')
    .action(async (tokenId) => {
      const tokenURI = await organizationNFT.tokenURI(tokenId);

      const { encoding, metadata } = parseMetadata(tokenURI);

      console.log('Encoding:', encoding);
      console.log('Metadata:', metadata);
    });

  return organization;
}
