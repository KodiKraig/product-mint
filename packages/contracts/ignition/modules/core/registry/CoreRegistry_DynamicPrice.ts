import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';

const CoreRegistry_DynamicPrice = buildModule(
  'CoreRegistry_DynamicPrice',
  (m) => {
    const contractRegistryAddress = m.getParameter('contractRegistry');

    const dynamicPriceRegistry = m.contract('DynamicPriceRegistry', [
      contractRegistryAddress,
    ]);

    return {
      dynamicPriceRegistry,
    };
  },
);

export default CoreRegistry_DynamicPrice;
