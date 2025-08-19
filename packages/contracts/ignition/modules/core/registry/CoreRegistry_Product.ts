import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';

const CoreRegistry_Product = buildModule('CoreRegistry_Product', (m) => {
  const contractRegistryAddress = m.getParameter('contractRegistry');

  const productRegistry = m.contract('ProductRegistry', [
    contractRegistryAddress,
  ]);

  return {
    productRegistry,
  };
});

export default CoreRegistry_Product;
