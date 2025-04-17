import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';

const CONTRACT_REGISTRY_ADDRESS = '0xe495E460649166B5d49Aac122198172DC07f31e0';

const RenewalProcessorModule = buildModule('RenewalProcessorModule', (m) => {
  const renewalProcessor = m.contract('RenewalProcessor', [
    CONTRACT_REGISTRY_ADDRESS,
  ]);

  return {
    renewalProcessor,
  };
});

export default RenewalProcessorModule;
