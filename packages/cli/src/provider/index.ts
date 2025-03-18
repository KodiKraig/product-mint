import { ethers } from 'ethers';

export const provider = new ethers.JsonRpcProvider(process.env.JSON_RPC_URL);

export const signerWallet = new ethers.Wallet(
  process.env.SIGNER_PRIVATE_KEY ||
    '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80', // Hardhat dev account #0
  provider,
);
