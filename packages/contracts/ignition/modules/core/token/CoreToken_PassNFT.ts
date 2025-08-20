import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';

const CoreToken_PassNFT = buildModule('CoreToken_PassNFT', (m) => {
  const contractRegistryAddress = m.getParameter('contractRegistry');

  const passAttributeProvider = m.contract('PassAttributeProvider', [
    contractRegistryAddress,
  ]);

  const passMetadataProvider = m.contract('PassMetadataProviderV2', [
    contractRegistryAddress,
    passAttributeProvider,
  ]);

  m.call(passMetadataProvider, 'setDefaultMetadata', [
    {
      name: 'Product Pass',
      description:
        'A Product Pass NFT unlocks exclusive access to products and subscriptions offered by its issuing organization on ProductMint.',
      externalUrl: 'https://productmint.io',
      image: 'https://productmint.io/assets/ProductMint_ProductPass.png',
      backgroundColor: '',
      animationUrl: '',
    },
  ]);

  return {
    passAttributeProvider,
    passMetadataProvider,
  };
});

export default CoreToken_PassNFT;
