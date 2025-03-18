import devAddresses from './dev.json';

export type ContractAddresses = keyof typeof devAddresses;

export type AddressMode = 'prod' | 'test' | 'dev';

export function getContractAddress(contract: ContractAddresses): string {
  let address: string;

  const mode = process.env.CONTRACT_ENVIRONMENT;

  if (mode === 'dev') {
    address = devAddresses[contract];
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
