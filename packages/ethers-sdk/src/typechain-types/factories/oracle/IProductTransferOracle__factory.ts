/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Interface, type ContractRunner } from "ethers";
import type {
  IProductTransferOracle,
  IProductTransferOracleInterface,
} from "../../oracle/IProductTransferOracle";

const _abi = [
  {
    inputs: [
      {
        internalType: "uint256[]",
        name: "productIds",
        type: "uint256[]",
      },
    ],
    name: "isTransferable",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;

export class IProductTransferOracle__factory {
  static readonly abi = _abi;
  static createInterface(): IProductTransferOracleInterface {
    return new Interface(_abi) as IProductTransferOracleInterface;
  }
  static connect(
    address: string,
    runner?: ContractRunner | null
  ): IProductTransferOracle {
    return new Contract(
      address,
      _abi,
      runner
    ) as unknown as IProductTransferOracle;
  }
}
