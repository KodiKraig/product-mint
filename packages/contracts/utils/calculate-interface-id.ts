import { ethers } from 'hardhat';

export default function calculateInterfaceId(functionNames: string[]): string {
  const selectors = functionNames.map((functionName) => {
    return ethers.id(functionName).slice(0, 10);
  });

  const interfaceId = selectors.reduce((acc, selector) => {
    return acc ^ BigInt(selector);
  }, BigInt(0));

  return '0x' + interfaceId.toString(16).padStart(8, '0');
}
