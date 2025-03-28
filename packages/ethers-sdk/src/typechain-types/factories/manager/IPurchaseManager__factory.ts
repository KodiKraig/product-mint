/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Interface, type ContractRunner } from "ethers";
import type {
  IPurchaseManager,
  IPurchaseManagerInterface,
} from "../../manager/IPurchaseManager";

const _abi = [
  {
    inputs: [],
    name: "InvalidCouponCode",
    type: "error",
  },
  {
    inputs: [],
    name: "NoProductsProvided",
    type: "error",
  },
  {
    inputs: [],
    name: "NotAuthorized",
    type: "error",
  },
  {
    inputs: [],
    name: "ProductIdsAndStatusesLengthMismatch",
    type: "error",
  },
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
        name: "passOwner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "purchaser",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address",
        name: "token",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amountPaid",
        type: "uint256",
      },
    ],
    name: "PerformPurchase",
    type: "event",
  },
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
        internalType: "uint256",
        name: "productPassId",
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
        internalType: "uint256[]",
        name: "productIds",
        type: "uint256[]",
      },
      {
        indexed: false,
        internalType: "uint256[]",
        name: "pricingIds",
        type: "uint256[]",
      },
      {
        indexed: false,
        internalType: "uint256[]",
        name: "quantities",
        type: "uint256[]",
      },
      {
        indexed: false,
        internalType: "address",
        name: "token",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amountPaid",
        type: "uint256",
      },
    ],
    name: "ProductsPurchased",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "productPassId",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "productId",
        type: "uint256",
      },
      {
        internalType: "bool",
        name: "cancel",
        type: "bool",
      },
    ],
    name: "cancelSubscription",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "productPassId",
        type: "uint256",
      },
      {
        internalType: "uint256[]",
        name: "productIds",
        type: "uint256[]",
      },
      {
        internalType: "bool[]",
        name: "cancel",
        type: "bool[]",
      },
    ],
    name: "cancelSubscriptionBatch",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "uint256",
            name: "orgId",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "productPassId",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "productId",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "newPricingId",
            type: "uint256",
          },
          {
            internalType: "bool",
            name: "airdrop",
            type: "bool",
          },
        ],
        internalType: "struct IPurchaseManager.ChangeSubscriptionPricingParams",
        name: "params",
        type: "tuple",
      },
    ],
    name: "changeSubscriptionPricing",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "productPassId",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "productId",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "quantity",
        type: "uint256",
      },
      {
        internalType: "bool",
        name: "airdrop",
        type: "bool",
      },
    ],
    name: "changeTieredSubscriptionUnitQuantity",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "passSupply",
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
    inputs: [],
    name: "pausePurchases",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "productPassId",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "productId",
        type: "uint256",
      },
      {
        internalType: "bool",
        name: "_pause",
        type: "bool",
      },
    ],
    name: "pauseSubscription",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "productPassId",
        type: "uint256",
      },
      {
        internalType: "uint256[]",
        name: "productIds",
        type: "uint256[]",
      },
      {
        internalType: "bool[]",
        name: "pause",
        type: "bool[]",
      },
    ],
    name: "pauseSubscriptionBatch",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "uint256",
            name: "productPassId",
            type: "uint256",
          },
          {
            internalType: "uint256[]",
            name: "productIds",
            type: "uint256[]",
          },
          {
            internalType: "uint256[]",
            name: "pricingIds",
            type: "uint256[]",
          },
          {
            internalType: "uint256[]",
            name: "quantities",
            type: "uint256[]",
          },
          {
            internalType: "string",
            name: "couponCode",
            type: "string",
          },
          {
            internalType: "bool",
            name: "airdrop",
            type: "bool",
          },
          {
            internalType: "bool",
            name: "pause",
            type: "bool",
          },
        ],
        internalType: "struct IPurchaseManager.AdditionalPurchaseParams",
        name: "params",
        type: "tuple",
      },
    ],
    name: "purchaseAdditionalProducts",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "address",
            name: "to",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "organizationId",
            type: "uint256",
          },
          {
            internalType: "uint256[]",
            name: "productIds",
            type: "uint256[]",
          },
          {
            internalType: "uint256[]",
            name: "pricingIds",
            type: "uint256[]",
          },
          {
            internalType: "uint256[]",
            name: "quantities",
            type: "uint256[]",
          },
          {
            internalType: "uint256[]",
            name: "discountIds",
            type: "uint256[]",
          },
          {
            internalType: "string",
            name: "couponCode",
            type: "string",
          },
          {
            internalType: "bool",
            name: "airdrop",
            type: "bool",
          },
          {
            internalType: "bool",
            name: "pause",
            type: "bool",
          },
        ],
        internalType: "struct IPurchaseManager.InitialPurchaseParams",
        name: "params",
        type: "tuple",
      },
    ],
    name: "purchaseProducts",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "productPassId",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "productId",
        type: "uint256",
      },
      {
        internalType: "bool",
        name: "airdrop",
        type: "bool",
      },
    ],
    name: "renewSubscription",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "productPassId",
        type: "uint256",
      },
      {
        internalType: "uint256[]",
        name: "productIds",
        type: "uint256[]",
      },
      {
        internalType: "bool",
        name: "airdrop",
        type: "bool",
      },
    ],
    name: "renewSubscriptionBatch",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "unpausePurchases",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

export class IPurchaseManager__factory {
  static readonly abi = _abi;
  static createInterface(): IPurchaseManagerInterface {
    return new Interface(_abi) as IPurchaseManagerInterface;
  }
  static connect(
    address: string,
    runner?: ContractRunner | null
  ): IPurchaseManager {
    return new Contract(address, _abi, runner) as unknown as IPurchaseManager;
  }
}
