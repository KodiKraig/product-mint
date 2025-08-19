import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';

const Core_PricingCalculator = buildModule('Core_PricingCalculator', (m) => {
  const contractRegistryAddress = m.getParameter('contractRegistry');

  const pricingCalculator = m.contract('PricingCalculator', [
    contractRegistryAddress,
  ]);

  return {
    pricingCalculator,
  };
});

export default Core_PricingCalculator;
