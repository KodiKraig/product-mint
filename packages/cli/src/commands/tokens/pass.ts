import { Command } from 'commander';
import { ProductPassNFT__factory } from '@product-mint/ethers-sdk';
import { getContractAddress } from '../../contract-address';
import { provider } from '../../provider';
import { parseMetadata } from '../../utils/metadata';

const passNFT = ProductPassNFT__factory.connect(
  getContractAddress('productPassNFT'),
  provider,
);

export default function registerProductPassCommand(program: Command): Command {
  const passCommand = program
    .command('pass')
    .description('Interact with the Product Pass NFT contract');

  passCommand
    .command('ownerOf')
    .description('Get the owner of a given Product Pass NFT')
    .argument('<tokenId>', 'The token ID of the Product Pass NFT')
    .action(async (tokenId) => {
      const owner = await passNFT.ownerOf(tokenId);

      console.log(`Pass ID: ${tokenId}`);
      console.log('Owner:', owner);
    });

  /**
   * Token URI
   */

  passCommand
    .command('tokenURI')
    .description('Get the token URI for a given Product Pass NFT')
    .argument('<tokenId>', 'The token ID of the Product Pass NFT')
    .action(async (tokenId) => {
      const tokenURI = await passNFT.tokenURI(tokenId);

      const { encoding, metadata } = parseMetadata(tokenURI);

      console.log('Encoding:', encoding);
      console.log('Metadata:', metadata);
    });

  return passCommand;
}
