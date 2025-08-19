import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';

const CoreRegistry_OrganizationAdmin = buildModule(
  'CoreRegistry_OrganizationAdmin',
  (m) => {
    const contractRegistryAddress = m.getParameter('contractRegistry');

    const orgAdmin = m.contract('OrganizationAdmin', [contractRegistryAddress]);

    return {
      orgAdmin,
    };
  },
);

export default CoreRegistry_OrganizationAdmin;
