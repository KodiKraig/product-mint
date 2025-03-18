import { BigNumberish, ethers } from 'ethers';
import { provider } from '../provider';
import { MintToken__factory } from '@product-mint/ethers-sdk';

export const convertToUnits = async (params: {
  tokenAddress: string;
  amount: string;
}): Promise<BigNumberish> => {
  const { tokenAddress, amount } = params;

  if (tokenAddress !== ethers.ZeroAddress) {
    const token = new ethers.Contract(
      tokenAddress,
      MintToken__factory.abi,
      provider,
    );
    const decimals = await token.decimals();

    return ethers.parseUnits(amount, decimals);
  }

  return ethers.parseEther(amount);
};

export const convertFromUnits = async (params: {
  tokenAddress: string;
  amount: BigNumberish;
}): Promise<string> => {
  const { tokenAddress, amount } = params;

  if (tokenAddress !== ethers.ZeroAddress) {
    const token = new ethers.Contract(
      tokenAddress,
      MintToken__factory.abi,
      provider,
    );

    const decimals = await token.decimals();

    return ethers.formatUnits(amount, decimals);
  }

  return ethers.formatEther(amount);
};
