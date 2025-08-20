import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';

const CoreToken_OrgNFT = buildModule('CoreToken_OrgNFT', (m) => {
  const contractRegistryAddress = m.getParameter('contractRegistry');

  const organizationAttributeProvider = m.contract(
    'OrganizationAttributeProvider',
    [contractRegistryAddress],
  );

  const organizationMetadataProvider = m.contract(
    'OrganizationMetadataProvider',
    [contractRegistryAddress, organizationAttributeProvider],
  );

  m.call(organizationMetadataProvider, 'setDefaultMetadata', [
    {
      name: 'Organization',
      description:
        'A Organization NFT enables its owner to create and manage products with crypto subscription offerings within the ProductMint ecosystem.',
      externalUrl: 'https://productmint.io',
      image: 'https://productmint.io/assets/ProductMint_Org.png',
      backgroundColor: '',
      animationUrl: '',
    },
  ]);

  return {
    organizationAttributeProvider,
    organizationMetadataProvider,
  };
});

export default CoreToken_OrgNFT;
