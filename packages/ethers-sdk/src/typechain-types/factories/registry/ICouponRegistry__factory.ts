/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Interface, type ContractRunner } from "ethers";
import type {
  ICouponRegistry,
  ICouponRegistryInterface,
} from "../../registry/ICouponRegistry";

const _abi = [
  {
    inputs: [
      {
        internalType: "uint256",
        name: "couponId",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "passOwner",
        type: "address",
      },
    ],
    name: "CouponAlreadyRedeemed",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "code",
        type: "string",
      },
    ],
    name: "CouponCodeNotFound",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "couponId",
        type: "uint256",
      },
    ],
    name: "CouponExpired",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "couponId",
        type: "uint256",
      },
    ],
    name: "CouponInitialPurchaseOnly",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "couponId",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "maxRedemptions",
        type: "uint256",
      },
    ],
    name: "CouponMaxRedemptionsReached",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "couponId",
        type: "uint256",
      },
    ],
    name: "CouponNotActive",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "couponId",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "passOwner",
        type: "address",
      },
    ],
    name: "CouponRestricted",
    type: "error",
  },
  {
    inputs: [],
    name: "InvalidCouponCode",
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
        internalType: "uint256",
        name: "couponId",
        type: "uint256",
      },
    ],
    name: "CouponCreated",
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
        name: "couponId",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "address",
        name: "passOwner",
        type: "address",
      },
    ],
    name: "CouponRedeemed",
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
        name: "couponId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "bool",
        name: "isActive",
        type: "bool",
      },
    ],
    name: "CouponStatusUpdated",
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
        name: "couponId",
        type: "uint256",
      },
    ],
    name: "CouponUpdated",
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
        internalType: "address",
        name: "passOwner",
        type: "address",
      },
      {
        indexed: false,
        internalType: "string",
        name: "code",
        type: "string",
      },
    ],
    name: "PassCouponCodeSet",
    type: "event",
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
            internalType: "string",
            name: "code",
            type: "string",
          },
          {
            internalType: "uint256",
            name: "discount",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "expiration",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "maxTotalRedemptions",
            type: "uint256",
          },
          {
            internalType: "bool",
            name: "isInitialPurchaseOnly",
            type: "bool",
          },
          {
            internalType: "bool",
            name: "isActive",
            type: "bool",
          },
          {
            internalType: "bool",
            name: "isRestricted",
            type: "bool",
          },
          {
            internalType: "bool",
            name: "isOneTimeUse",
            type: "bool",
          },
        ],
        internalType: "struct ICouponRegistry.CreateCouponParams",
        name: "params",
        type: "tuple",
      },
    ],
    name: "createCoupon",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "couponId",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "discountedAmount",
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
        name: "couponId",
        type: "uint256",
      },
    ],
    name: "getCoupon",
    outputs: [
      {
        components: [
          {
            internalType: "uint256",
            name: "orgId",
            type: "uint256",
          },
          {
            internalType: "string",
            name: "code",
            type: "string",
          },
          {
            internalType: "uint256",
            name: "discount",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "expiration",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "totalRedemptions",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "maxTotalRedemptions",
            type: "uint256",
          },
          {
            internalType: "bool",
            name: "isInitialPurchaseOnly",
            type: "bool",
          },
          {
            internalType: "bool",
            name: "isActive",
            type: "bool",
          },
          {
            internalType: "bool",
            name: "isRestricted",
            type: "bool",
          },
          {
            internalType: "bool",
            name: "isOneTimeUse",
            type: "bool",
          },
        ],
        internalType: "struct ICouponRegistry.Coupon",
        name: "",
        type: "tuple",
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
    name: "getOrgCouponIds",
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
        name: "orgId",
        type: "uint256",
      },
    ],
    name: "getOrgCoupons",
    outputs: [
      {
        components: [
          {
            internalType: "uint256",
            name: "orgId",
            type: "uint256",
          },
          {
            internalType: "string",
            name: "code",
            type: "string",
          },
          {
            internalType: "uint256",
            name: "discount",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "expiration",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "totalRedemptions",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "maxTotalRedemptions",
            type: "uint256",
          },
          {
            internalType: "bool",
            name: "isInitialPurchaseOnly",
            type: "bool",
          },
          {
            internalType: "bool",
            name: "isActive",
            type: "bool",
          },
          {
            internalType: "bool",
            name: "isRestricted",
            type: "bool",
          },
          {
            internalType: "bool",
            name: "isOneTimeUse",
            type: "bool",
          },
        ],
        internalType: "struct ICouponRegistry.Coupon[]",
        name: "",
        type: "tuple[]",
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
      {
        internalType: "address",
        name: "passOwner",
        type: "address",
      },
    ],
    name: "getRedeemedCoupons",
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
        name: "orgId",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "passOwner",
        type: "address",
      },
    ],
    name: "hasPassCouponCode",
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
      {
        internalType: "address",
        name: "passOwner",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "couponId",
        type: "uint256",
      },
    ],
    name: "hasRedeemedCoupon",
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
      {
        internalType: "address",
        name: "passOwner",
        type: "address",
      },
      {
        internalType: "string",
        name: "code",
        type: "string",
      },
      {
        internalType: "bool",
        name: "isInitialPurchase",
        type: "bool",
      },
    ],
    name: "isCodeRedeemable",
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
        name: "orgId",
        type: "uint256",
      },
      {
        internalType: "string",
        name: "code",
        type: "string",
      },
    ],
    name: "orgCouponCodes",
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
        name: "orgId",
        type: "uint256",
      },
      {
        internalType: "string",
        name: "code",
        type: "string",
      },
    ],
    name: "orgCouponExists",
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
      {
        internalType: "address",
        name: "passOwner",
        type: "address",
      },
    ],
    name: "passOwnerCodes",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
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
      {
        internalType: "address",
        name: "passOwner",
        type: "address",
      },
      {
        internalType: "bool",
        name: "isInitialPurchase",
        type: "bool",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "redeemCoupon",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
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
        name: "passOwner",
        type: "address",
      },
    ],
    name: "removePassCouponCode",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "couponId",
        type: "uint256",
      },
      {
        internalType: "bool",
        name: "active",
        type: "bool",
      },
    ],
    name: "setCouponActive",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "couponId",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "discount",
        type: "uint256",
      },
    ],
    name: "setCouponDiscount",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "couponId",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "expiration",
        type: "uint256",
      },
    ],
    name: "setCouponExpiration",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "couponId",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "maxTotalRedemptions",
        type: "uint256",
      },
    ],
    name: "setCouponMaxRedemptions",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "couponId",
        type: "uint256",
      },
      {
        internalType: "bool",
        name: "isInitialPurchaseOnly",
        type: "bool",
      },
    ],
    name: "setCouponNewCustomers",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "couponId",
        type: "uint256",
      },
      {
        internalType: "bool",
        name: "restricted",
        type: "bool",
      },
    ],
    name: "setCouponRestricted",
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
        name: "passOwner",
        type: "address",
      },
      {
        internalType: "string",
        name: "code",
        type: "string",
      },
    ],
    name: "setPassCouponCode",
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
        internalType: "address[]",
        name: "passOwners",
        type: "address[]",
      },
      {
        internalType: "string[]",
        name: "codes",
        type: "string[]",
      },
    ],
    name: "setPassCouponCodeBatch",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "couponId",
        type: "uint256",
      },
      {
        internalType: "address[]",
        name: "passOwners",
        type: "address[]",
      },
      {
        internalType: "bool[]",
        name: "restricted",
        type: "bool[]",
      },
    ],
    name: "setRestrictedAccess",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "totalCoupons",
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
] as const;

export class ICouponRegistry__factory {
  static readonly abi = _abi;
  static createInterface(): ICouponRegistryInterface {
    return new Interface(_abi) as ICouponRegistryInterface;
  }
  static connect(
    address: string,
    runner?: ContractRunner | null
  ): ICouponRegistry {
    return new Contract(address, _abi, runner) as unknown as ICouponRegistry;
  }
}
