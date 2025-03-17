import { ethers } from 'ethers';

export const provider = new ethers.JsonRpcProvider(process.env.JSON_RPC_URL);
