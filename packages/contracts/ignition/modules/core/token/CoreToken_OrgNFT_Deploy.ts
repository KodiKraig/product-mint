import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';

const CoreToken_OrgNFT_Deploy = buildModule('CoreToken_OrgNFT_Deploy', (m) => {
  const organizationMetadataProviderAddress = m.getParameter(
    'organizationMetadataProvider',
  );

  const organizationNFT = m.contract('OrganizationNFT', [
    organizationMetadataProviderAddress,
  ]);

  return {
    organizationNFT,
  };
});

export default CoreToken_OrgNFT_Deploy;
