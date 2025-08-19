import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';

const CoreRegistry_ContractRegistry = buildModule(
  'CoreRegistry_ContractRegistry',
  (m) => {
    const contractRegistry = m.contract('ContractRegistry');

    return {
      contractRegistry,
    };
  },
);

export default CoreRegistry_ContractRegistry;
