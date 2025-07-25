/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Interface, type ContractRunner } from "ethers";
import type {
  ICustomUniswapV3Router,
  ICustomUniswapV3RouterInterface,
} from "../../router/ICustomUniswapV3Router";

const _abi = [
  {
    inputs: [
      {
        internalType: "bytes",
        name: "path",
        type: "bytes",
      },
      {
        internalType: "uint256",
        name: "amountIn",
        type: "uint256",
      },
    ],
    name: "quoteExactInput",
    outputs: [
      {
        internalType: "uint256",
        name: "amountOut",
        type: "uint256",
      },
      {
        internalType: "uint160[]",
        name: "sqrtPriceX96AfterList",
        type: "uint160[]",
      },
      {
        internalType: "uint32[]",
        name: "initializedTicksCrossedList",
        type: "uint32[]",
      },
      {
        internalType: "uint256",
        name: "gasEstimate",
        type: "uint256",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

export class ICustomUniswapV3Router__factory {
  static readonly abi = _abi;
  static createInterface(): ICustomUniswapV3RouterInterface {
    return new Interface(_abi) as ICustomUniswapV3RouterInterface;
  }
  static connect(
    address: string,
    runner?: ContractRunner | null
  ): ICustomUniswapV3Router {
    return new Contract(
      address,
      _abi,
      runner
    ) as unknown as ICustomUniswapV3Router;
  }
}
