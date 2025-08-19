import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';

const Core_RenewalProcessor = buildModule('Core_RenewalProcessor', (m) => {
  const contractRegistryAddress = m.getParameter('contractRegistry');

  const renewalProcessor = m.contract('RenewalProcessor', [
    contractRegistryAddress,
  ]);

  return {
    renewalProcessor,
  };
});

export default Core_RenewalProcessor;
