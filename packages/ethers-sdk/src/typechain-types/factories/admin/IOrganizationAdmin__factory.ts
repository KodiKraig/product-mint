/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Interface, type ContractRunner } from "ethers";
import type {
  IOrganizationAdmin,
  IOrganizationAdminInterface,
} from "../../admin/IOrganizationAdmin";

const _abi = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "orgId",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "address",
        name: "admin",
        type: "address",
      },
      {
        indexed: false,
        internalType: "bool",
        name: "status",
        type: "bool",
      },
    ],
    name: "OrgAdminUpdate",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "organizationId",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "admin",
        type: "address",
      },
    ],
    name: "addAdmin",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "organizationId",
        type: "uint256",
      },
    ],
    name: "getAdmins",
    outputs: [
      {
        internalType: "address[]",
        name: "",
        type: "address[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "organizationId",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "admin",
        type: "address",
      },
    ],
    name: "isAdmin",
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
  {
    inputs: [
      {
        internalType: "uint256",
        name: "organizationId",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "admin",
        type: "address",
      },
    ],
    name: "removeAdmin",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "organizationId",
        type: "uint256",
      },
    ],
    name: "removeAllAdmins",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

export class IOrganizationAdmin__factory {
  static readonly abi = _abi;
  static createInterface(): IOrganizationAdminInterface {
    return new Interface(_abi) as IOrganizationAdminInterface;
  }
  static connect(
    address: string,
    runner?: ContractRunner | null
  ): IOrganizationAdmin {
    return new Contract(address, _abi, runner) as unknown as IOrganizationAdmin;
  }
}
