import { ethers } from 'ethers';
import { provider } from '../provider';
import { MintToken__factory } from '@product-mint/ethers-sdk';

export const getTokenDecimals = async (
  tokenAddress: string,
): Promise<number> => {
  if (tokenAddress === ethers.ZeroAddress) {
    return 18;
  }

  const token = new ethers.Contract(
    tokenAddress,
    MintToken__factory.abi,
    provider,
  );
  return await token.decimals();
};
