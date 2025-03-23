/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Interface, type ContractRunner } from "ethers";
import type {
  IPurchaseRegistry,
  IPurchaseRegistryInterface,
} from "../../registry/IPurchaseRegistry";

const _abi = [
  {
    inputs: [],
    name: "AddressNotWhitelisted",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "organizationId",
        type: "uint256",
      },
    ],
    name: "GiftingIsDisabled",
    type: "error",
  },
  {
    inputs: [],
    name: "InvalidOrganization",
    type: "error",
  },
  {
    inputs: [],
    name: "MaxMintsReached",
    type: "error",
  },
  {
    inputs: [],
    name: "MaxSupplyReached",
    type: "error",
  },
  {
    inputs: [],
    name: "MintClosed",
    type: "error",
  },
  {
    inputs: [],
    name: "ProductAlreadyAdded",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "organizationId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "bool",
        name: "isGifting",
        type: "bool",
      },
    ],
    name: "GiftingStatusChanged",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "organizationId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "maxMints",
        type: "uint256",
      },
    ],
    name: "MaxMintsUpdated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "organizationId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "bool",
        name: "isMintClosed",
        type: "bool",
      },
    ],
    name: "MintClosedStatusChanged",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "organizationId",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "productId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "maxSupply",
        type: "uint256",
      },
    ],
    name: "ProductMaxSupplyUpdated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "organizationId",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "address",
        name: "passOwner",
        type: "address",
      },
      {
        indexed: false,
        internalType: "bool",
        name: "isWhitelisted",
        type: "bool",
      },
    ],
    name: "WhitelistPassOwnerUpdated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "organizationId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "bool",
        name: "isWhitelist",
        type: "bool",
      },
    ],
    name: "WhitelistStatusChanged",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "getPassProductIds",
    outputs: [
      {
        internalType: "uint256[]",
        name: "",
        type: "uint256[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
      {
        internalType: "uint256[]",
        name: "productIds",
        type: "uint256[]",
      },
    ],
    name: "hasPassPurchasedProducts",
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
        name: "orgId",
        type: "uint256",
      },
    ],
    name: "isGiftingEnabled",
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
    ],
    name: "isMintClosed",
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
    ],
    name: "isWhitelist",
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
    ],
    name: "maxMints",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
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
        name: "purchaser",
        type: "address",
      },
    ],
    name: "passMintCount",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "passOrganization",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "productId",
        type: "uint256",
      },
    ],
    name: "productMaxSupply",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "productId",
        type: "uint256",
      },
    ],
    name: "productSupply",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_organizationId",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_passId",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "_passOwner",
        type: "address",
      },
      {
        internalType: "address",
        name: "_purchaser",
        type: "address",
      },
      {
        internalType: "uint256[]",
        name: "_productIds",
        type: "uint256[]",
      },
      {
        internalType: "uint256[]",
        name: "_pricingIds",
        type: "uint256[]",
      },
    ],
    name: "recordProductPurchase",
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
      {
        internalType: "bool",
        name: "_isGifting",
        type: "bool",
      },
    ],
    name: "setGiftingEnabled",
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
      {
        internalType: "uint256",
        name: "_maxMints",
        type: "uint256",
      },
    ],
    name: "setMaxMints",
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
      {
        internalType: "bool",
        name: "_isMintClosed",
        type: "bool",
      },
    ],
    name: "setMintClosed",
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
      {
        internalType: "uint256",
        name: "productId",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_maxSupply",
        type: "uint256",
      },
    ],
    name: "setProductMaxSupply",
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
      {
        internalType: "bool",
        name: "_isWhitelist",
        type: "bool",
      },
    ],
    name: "setWhitelist",
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
    name: "totalPassMints",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
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
    ],
    name: "totalProductsSold",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
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
        internalType: "address[]",
        name: "_addresses",
        type: "address[]",
      },
      {
        internalType: "bool[]",
        name: "_isWhitelisted",
        type: "bool[]",
      },
    ],
    name: "whitelistPassOwners",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "orgId",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "purchaser",
        type: "address",
      },
    ],
    name: "whitelisted",
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

export class IPurchaseRegistry__factory {
  static readonly abi = _abi;
  static createInterface(): IPurchaseRegistryInterface {
    return new Interface(_abi) as IPurchaseRegistryInterface;
  }
  static connect(
    address: string,
    runner?: ContractRunner | null
  ): IPurchaseRegistry {
    return new Contract(address, _abi, runner) as unknown as IPurchaseRegistry;
  }
}
