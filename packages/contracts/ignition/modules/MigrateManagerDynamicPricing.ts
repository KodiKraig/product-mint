import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';

const MigrateManagerDynamicPricing = buildModule(
  'MigrateManagerDynamicPricing',
  (m) => {
    const oldPurchaseManagerAddress = m.getParameter('oldPurchaseManager');
    const permissionRegistryAddress = m.getParameter('permissionRegistry');
    const contractRegistryAddress = m.getParameter('contractRegistry');

    // Deploy the dynamic pricing registry
    const dynamicPriceRegistry = m.contract('DynamicPriceRegistry', [
      contractRegistryAddress,
    ]);

    // Deploy the new purchase manager
    const purchaseManager = m.contract('PurchaseManager', [
      contractRegistryAddress,
      permissionRegistryAddress,
      oldPurchaseManagerAddress,
      dynamicPriceRegistry,
    ]);

    // Update the central contract registry with the new purchase manager
    const contractRegistry = m.contractAt(
      'ContractRegistry',
      contractRegistryAddress,
    );
    m.call(contractRegistry, 'setPurchaseManager', [purchaseManager]);

    return {
      dynamicPriceRegistry,
      purchaseManager,
    };
  },
);

export default MigrateManagerDynamicPricing;
