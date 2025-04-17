import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';

const CONTRACT_REGISTRY_ADDRESS = '0xcF6AA18E24B2904F4Bb007c78d2D0FAbF5961F41';

const RenewalProcessorModule = buildModule('RenewalProcessorModule', (m) => {
  const renewalProcessor = m.contract('RenewalProcessor', [
    CONTRACT_REGISTRY_ADDRESS,
  ]);

  return {
    renewalProcessor,
  };
});

export default RenewalProcessorModule;
