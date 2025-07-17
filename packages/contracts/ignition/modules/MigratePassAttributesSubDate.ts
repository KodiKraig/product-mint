import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';

const MigratePassAttributesSubDate = buildModule(
  'MigratePassAttributesSubDate',
  (m) => {
    const contractRegistryAddress = m.getParameter('contractRegistry');
    const passMetadataProviderAddress = m.getParameter('passMetadataProvider');

    // Existing contract used to generate the pass metadata
    const passMetadataProvider = m.contractAt(
      'PassMetadataProviderV2',
      passMetadataProviderAddress,
    );

    // Deploy the new attribute provider
    const attributeProvider = m.contract('PassAttributeProvider', [
      contractRegistryAddress,
    ]);

    // Update the metadata provider to use the new attribute provider
    m.call(passMetadataProvider, 'setAttributeProvider', [attributeProvider]);

    return {
      attributeProvider,
    };
  },
);

export default MigratePassAttributesSubDate;
