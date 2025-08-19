import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';

const CoreRegistry_Pricing = buildModule('CoreRegistry_Pricing', (m) => {
  const contractRegistryAddress = m.getParameter('contractRegistry');

  const pricingRegistry = m.contract('PricingRegistry', [
    contractRegistryAddress,
  ]);

  return {
    pricingRegistry,
  };
});

export default CoreRegistry_Pricing;
