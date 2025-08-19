import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';

const CoreRegistry_Purchase = buildModule('CoreRegistry_Purchase', (m) => {
  const contractRegistryAddress = m.getParameter('contractRegistry');

  const purchaseRegistry = m.contract('PurchaseRegistry', [
    contractRegistryAddress,
  ]);

  return {
    purchaseRegistry,
  };
});

export default CoreRegistry_Purchase;
