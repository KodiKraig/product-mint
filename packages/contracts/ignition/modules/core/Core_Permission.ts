import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';

const Core_Permission = buildModule('Core_Permission', (m) => {
  const contractRegistryAddress = m.getParameter('contractRegistry');

  const permissionFactory = m.contract('PermissionFactory');
  const permissionRegistry = m.contract('PermissionRegistry', [
    contractRegistryAddress,
    permissionFactory,
  ]);

  return {
    permissionFactory,
    permissionRegistry,
  };
});

export default Core_Permission;
