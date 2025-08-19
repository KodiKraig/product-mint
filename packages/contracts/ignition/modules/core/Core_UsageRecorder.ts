import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';

const Core_UsageRecorder = buildModule('Core_UsageRecorder', (m) => {
  const contractRegistryAddress = m.getParameter('contractRegistry');

  const usageRecorder = m.contract('UsageRecorder', [contractRegistryAddress]);

  return {
    usageRecorder,
  };
});

export default Core_UsageRecorder;
