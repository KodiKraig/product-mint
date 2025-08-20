import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';

const CoreToken_PassNFT_Deploy = buildModule(
  'CoreToken_PassNFT_Deploy',
  (m) => {
    const contractRegistryAddress = m.getParameter('contractRegistry');
    const passMetadataProviderAddress = m.getParameter('passMetadataProvider');

    const productPassNFT = m.contract('ProductPassNFT', [
      contractRegistryAddress,
      passMetadataProviderAddress,
    ]);

    return {
      productPassNFT,
    };
  },
);

export default CoreToken_PassNFT_Deploy;
