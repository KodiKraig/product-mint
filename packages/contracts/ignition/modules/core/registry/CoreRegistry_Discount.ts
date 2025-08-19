import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';

const CoreRegistry_Discount = buildModule('CoreRegistry_Discount', (m) => {
  const contractRegistryAddress = m.getParameter('contractRegistry');

  const discountRegistry = m.contract('DiscountRegistry', [
    contractRegistryAddress,
  ]);

  return {
    discountRegistry,
  };
});

export default CoreRegistry_Discount;
