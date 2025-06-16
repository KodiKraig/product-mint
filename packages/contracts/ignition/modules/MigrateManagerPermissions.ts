import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';

const MigrateManagerPermissions = buildModule(
  'MigrateManagerPermissions',
  (m) => {
    // Get the existing contract addresses
    const contractRegistryAddress = m.getParameter('contractRegistryAddress');
    const oldPurchaseManagerAddress = m.getParameter(
      'oldPurchaseManagerAddress',
    );

    // Deploy the new permissions
    const permissionFactory = m.contract('PermissionFactory', []);
    const permissionRegistry = m.contract('PermissionRegistry', [
      contractRegistryAddress,
      permissionFactory,
    ]);

    // Deploy the new purchase manager
    const purchaseManager = m.contract('PurchaseManager', [
      contractRegistryAddress,
      permissionRegistry,
      oldPurchaseManagerAddress,
    ]);

    // Update the purchase manager in the contract registry
    const contractRegistry = m.contractAt(
      'ContractRegistry',
      contractRegistryAddress,
    );
    m.call(contractRegistry, 'setPurchaseManager', [purchaseManager]);

    return {
      purchaseManager,
      permissionRegistry,
      permissionFactory,
    };
  },
);

export default MigrateManagerPermissions;
