import devAddresses from './dev.json';
import baseSepoliaAddresses from './base-sepolia.json';
export type ContractAddresses = keyof typeof devAddresses;

export type AddressMode = 'dev' | 'base-sepolia';

export function getContractAddress(contract: ContractAddresses): string {
  let address: string;

  const mode = process.env.CONTRACT_ENVIRONMENT;

  if (mode === 'dev') {
    address = devAddresses[contract];
  } else if (mode === 'base-sepolia') {
    address = baseSepoliaAddresses[contract];
  } else {
    throw new Error(`Unsupported address mode: ${mode}`);
  }

  if (!address) {
    throw new Error(
      `Contract address not found for ${contract} in ${mode} mode`,
    );
  }

  return address;
}
