/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import type {
  BaseContract,
  BigNumberish,
  BytesLike,
  FunctionFragment,
  Result,
  Interface,
  EventFragment,
  AddressLike,
  ContractRunner,
  ContractMethod,
  Listener,
} from "ethers";
import type {
  TypedContractEvent,
  TypedDeferredTopicFilter,
  TypedEventLog,
  TypedLogDescription,
  TypedListener,
  TypedContractMethod,
} from "../common";

export declare namespace IPricingRegistry {
  export type CreateFlatRateSubscriptionParamsStruct = {
    organizationId: BigNumberish;
    flatPrice: BigNumberish;
    token: AddressLike;
    chargeFrequency: BigNumberish;
    isRestricted: boolean;
  };

  export type CreateFlatRateSubscriptionParamsStructOutput = [
    organizationId: bigint,
    flatPrice: bigint,
    token: string,
    chargeFrequency: bigint,
    isRestricted: boolean
  ] & {
    organizationId: bigint;
    flatPrice: bigint;
    token: string;
    chargeFrequency: bigint;
    isRestricted: boolean;
  };

  export type CreateOneTimeParamsStruct = {
    organizationId: BigNumberish;
    flatPrice: BigNumberish;
    token: AddressLike;
    isRestricted: boolean;
  };

  export type CreateOneTimeParamsStructOutput = [
    organizationId: bigint,
    flatPrice: bigint,
    token: string,
    isRestricted: boolean
  ] & {
    organizationId: bigint;
    flatPrice: bigint;
    token: string;
    isRestricted: boolean;
  };

  export type CreateTieredSubscriptionParamsStruct = {
    organizationId: BigNumberish;
    token: AddressLike;
    chargeFrequency: BigNumberish;
    tiers: PricingUtils.PricingTierStruct[];
    isVolume: boolean;
    isRestricted: boolean;
  };

  export type CreateTieredSubscriptionParamsStructOutput = [
    organizationId: bigint,
    token: string,
    chargeFrequency: bigint,
    tiers: PricingUtils.PricingTierStructOutput[],
    isVolume: boolean,
    isRestricted: boolean
  ] & {
    organizationId: bigint;
    token: string;
    chargeFrequency: bigint;
    tiers: PricingUtils.PricingTierStructOutput[];
    isVolume: boolean;
    isRestricted: boolean;
  };

  export type CreateUsageBasedSubscriptionParamsStruct = {
    organizationId: BigNumberish;
    token: AddressLike;
    chargeFrequency: BigNumberish;
    tiers: PricingUtils.PricingTierStruct[];
    usageMeterId: BigNumberish;
    isVolume: boolean;
    isRestricted: boolean;
  };

  export type CreateUsageBasedSubscriptionParamsStructOutput = [
    organizationId: bigint,
    token: string,
    chargeFrequency: bigint,
    tiers: PricingUtils.PricingTierStructOutput[],
    usageMeterId: bigint,
    isVolume: boolean,
    isRestricted: boolean
  ] & {
    organizationId: bigint;
    token: string;
    chargeFrequency: bigint;
    tiers: PricingUtils.PricingTierStructOutput[];
    usageMeterId: bigint;
    isVolume: boolean;
    isRestricted: boolean;
  };
}

export declare namespace PricingUtils {
  export type PricingTierStruct = {
    lowerBound: BigNumberish;
    upperBound: BigNumberish;
    pricePerUnit: BigNumberish;
    priceFlatRate: BigNumberish;
  };

  export type PricingTierStructOutput = [
    lowerBound: bigint,
    upperBound: bigint,
    pricePerUnit: bigint,
    priceFlatRate: bigint
  ] & {
    lowerBound: bigint;
    upperBound: bigint;
    pricePerUnit: bigint;
    priceFlatRate: bigint;
  };

  export type PricingStruct = {
    orgId: BigNumberish;
    chargeStyle: BigNumberish;
    chargeFrequency: BigNumberish;
    tiers: PricingUtils.PricingTierStruct[];
    token: AddressLike;
    flatPrice: BigNumberish;
    usageMeterId: BigNumberish;
    isActive: boolean;
    isRestricted: boolean;
  };

  export type PricingStructOutput = [
    orgId: bigint,
    chargeStyle: bigint,
    chargeFrequency: bigint,
    tiers: PricingUtils.PricingTierStructOutput[],
    token: string,
    flatPrice: bigint,
    usageMeterId: bigint,
    isActive: boolean,
    isRestricted: boolean
  ] & {
    orgId: bigint;
    chargeStyle: bigint;
    chargeFrequency: bigint;
    tiers: PricingUtils.PricingTierStructOutput[];
    token: string;
    flatPrice: bigint;
    usageMeterId: bigint;
    isActive: boolean;
    isRestricted: boolean;
  };
}

export interface PricingRegistryInterface extends Interface {
  getFunction(
    nameOrSignature:
      | "createFlatRateSubscriptionPricing"
      | "createOneTimePricing"
      | "createTieredSubscriptionPricing"
      | "createUsageBasedSubscriptionPricing"
      | "getChargeFrequencyCycleDuration"
      | "getCycleDuration"
      | "getCycleDurationBatch"
      | "getOrgPricing"
      | "getOrgPricingIds"
      | "getPricing"
      | "getPricingBatch"
      | "pricingSupply"
      | "registry"
      | "restrictedAccess"
      | "setPricingActive"
      | "setPricingFlatPrice"
      | "setPricingRestricted"
      | "setPricingTiers"
      | "setPricingToken"
      | "setPricingUsageMeterId"
      | "setRestrictedAccess"
      | "supportsInterface"
      | "validateCheckout"
      | "validateCheckoutBatch"
      | "validateOrgPricing"
      | "validateTiers"
  ): FunctionFragment;

  getEvent(
    nameOrSignatureOrTopic:
      | "PricingCreated"
      | "PricingStatusChanged"
      | "PricingUpdated"
      | "RestrictedAccessGranted"
  ): EventFragment;

  encodeFunctionData(
    functionFragment: "createFlatRateSubscriptionPricing",
    values: [IPricingRegistry.CreateFlatRateSubscriptionParamsStruct]
  ): string;
  encodeFunctionData(
    functionFragment: "createOneTimePricing",
    values: [IPricingRegistry.CreateOneTimeParamsStruct]
  ): string;
  encodeFunctionData(
    functionFragment: "createTieredSubscriptionPricing",
    values: [IPricingRegistry.CreateTieredSubscriptionParamsStruct]
  ): string;
  encodeFunctionData(
    functionFragment: "createUsageBasedSubscriptionPricing",
    values: [IPricingRegistry.CreateUsageBasedSubscriptionParamsStruct]
  ): string;
  encodeFunctionData(
    functionFragment: "getChargeFrequencyCycleDuration",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "getCycleDuration",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "getCycleDurationBatch",
    values: [BigNumberish[]]
  ): string;
  encodeFunctionData(
    functionFragment: "getOrgPricing",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "getOrgPricingIds",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "getPricing",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "getPricingBatch",
    values: [BigNumberish[]]
  ): string;
  encodeFunctionData(
    functionFragment: "pricingSupply",
    values?: undefined
  ): string;
  encodeFunctionData(functionFragment: "registry", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "restrictedAccess",
    values: [BigNumberish, AddressLike]
  ): string;
  encodeFunctionData(
    functionFragment: "setPricingActive",
    values: [BigNumberish, boolean]
  ): string;
  encodeFunctionData(
    functionFragment: "setPricingFlatPrice",
    values: [BigNumberish, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "setPricingRestricted",
    values: [BigNumberish, boolean]
  ): string;
  encodeFunctionData(
    functionFragment: "setPricingTiers",
    values: [BigNumberish, PricingUtils.PricingTierStruct[]]
  ): string;
  encodeFunctionData(
    functionFragment: "setPricingToken",
    values: [BigNumberish, AddressLike]
  ): string;
  encodeFunctionData(
    functionFragment: "setPricingUsageMeterId",
    values: [BigNumberish, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "setRestrictedAccess",
    values: [BigNumberish, AddressLike[], boolean[]]
  ): string;
  encodeFunctionData(
    functionFragment: "supportsInterface",
    values: [BytesLike]
  ): string;
  encodeFunctionData(
    functionFragment: "validateCheckout",
    values: [BigNumberish, AddressLike, BigNumberish, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "validateCheckoutBatch",
    values: [BigNumberish, AddressLike, BigNumberish[], BigNumberish[]]
  ): string;
  encodeFunctionData(
    functionFragment: "validateOrgPricing",
    values: [BigNumberish, BigNumberish[]]
  ): string;
  encodeFunctionData(
    functionFragment: "validateTiers",
    values: [PricingUtils.PricingTierStruct[], BigNumberish]
  ): string;

  decodeFunctionResult(
    functionFragment: "createFlatRateSubscriptionPricing",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "createOneTimePricing",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "createTieredSubscriptionPricing",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "createUsageBasedSubscriptionPricing",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getChargeFrequencyCycleDuration",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getCycleDuration",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getCycleDurationBatch",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getOrgPricing",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getOrgPricingIds",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "getPricing", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "getPricingBatch",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "pricingSupply",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "registry", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "restrictedAccess",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "setPricingActive",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "setPricingFlatPrice",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "setPricingRestricted",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "setPricingTiers",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "setPricingToken",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "setPricingUsageMeterId",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "setRestrictedAccess",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "supportsInterface",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "validateCheckout",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "validateCheckoutBatch",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "validateOrgPricing",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "validateTiers",
    data: BytesLike
  ): Result;
}

export namespace PricingCreatedEvent {
  export type InputTuple = [
    organizationId: BigNumberish,
    pricingId: BigNumberish
  ];
  export type OutputTuple = [organizationId: bigint, pricingId: bigint];
  export interface OutputObject {
    organizationId: bigint;
    pricingId: bigint;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace PricingStatusChangedEvent {
  export type InputTuple = [
    organizationId: BigNumberish,
    pricingId: BigNumberish,
    isActive: boolean
  ];
  export type OutputTuple = [
    organizationId: bigint,
    pricingId: bigint,
    isActive: boolean
  ];
  export interface OutputObject {
    organizationId: bigint;
    pricingId: bigint;
    isActive: boolean;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace PricingUpdatedEvent {
  export type InputTuple = [
    organizationId: BigNumberish,
    pricingId: BigNumberish
  ];
  export type OutputTuple = [organizationId: bigint, pricingId: bigint];
  export interface OutputObject {
    organizationId: bigint;
    pricingId: bigint;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace RestrictedAccessGrantedEvent {
  export type InputTuple = [
    organizationId: BigNumberish,
    pricingId: BigNumberish,
    productPassOwner: AddressLike,
    isRestricted: boolean
  ];
  export type OutputTuple = [
    organizationId: bigint,
    pricingId: bigint,
    productPassOwner: string,
    isRestricted: boolean
  ];
  export interface OutputObject {
    organizationId: bigint;
    pricingId: bigint;
    productPassOwner: string;
    isRestricted: boolean;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export interface PricingRegistry extends BaseContract {
  connect(runner?: ContractRunner | null): PricingRegistry;
  waitForDeployment(): Promise<this>;

  interface: PricingRegistryInterface;

  queryFilter<TCEvent extends TypedContractEvent>(
    event: TCEvent,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TypedEventLog<TCEvent>>>;
  queryFilter<TCEvent extends TypedContractEvent>(
    filter: TypedDeferredTopicFilter<TCEvent>,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TypedEventLog<TCEvent>>>;

  on<TCEvent extends TypedContractEvent>(
    event: TCEvent,
    listener: TypedListener<TCEvent>
  ): Promise<this>;
  on<TCEvent extends TypedContractEvent>(
    filter: TypedDeferredTopicFilter<TCEvent>,
    listener: TypedListener<TCEvent>
  ): Promise<this>;

  once<TCEvent extends TypedContractEvent>(
    event: TCEvent,
    listener: TypedListener<TCEvent>
  ): Promise<this>;
  once<TCEvent extends TypedContractEvent>(
    filter: TypedDeferredTopicFilter<TCEvent>,
    listener: TypedListener<TCEvent>
  ): Promise<this>;

  listeners<TCEvent extends TypedContractEvent>(
    event: TCEvent
  ): Promise<Array<TypedListener<TCEvent>>>;
  listeners(eventName?: string): Promise<Array<Listener>>;
  removeAllListeners<TCEvent extends TypedContractEvent>(
    event?: TCEvent
  ): Promise<this>;

  createFlatRateSubscriptionPricing: TypedContractMethod<
    [params: IPricingRegistry.CreateFlatRateSubscriptionParamsStruct],
    [void],
    "nonpayable"
  >;

  createOneTimePricing: TypedContractMethod<
    [params: IPricingRegistry.CreateOneTimeParamsStruct],
    [void],
    "nonpayable"
  >;

  createTieredSubscriptionPricing: TypedContractMethod<
    [params: IPricingRegistry.CreateTieredSubscriptionParamsStruct],
    [void],
    "nonpayable"
  >;

  createUsageBasedSubscriptionPricing: TypedContractMethod<
    [params: IPricingRegistry.CreateUsageBasedSubscriptionParamsStruct],
    [void],
    "nonpayable"
  >;

  getChargeFrequencyCycleDuration: TypedContractMethod<
    [chargeFrequency: BigNumberish],
    [bigint],
    "view"
  >;

  getCycleDuration: TypedContractMethod<
    [pricingId: BigNumberish],
    [bigint],
    "view"
  >;

  getCycleDurationBatch: TypedContractMethod<
    [_pricingIds: BigNumberish[]],
    [bigint[]],
    "view"
  >;

  getOrgPricing: TypedContractMethod<
    [organizationId: BigNumberish],
    [[bigint[], PricingUtils.PricingStructOutput[]]],
    "view"
  >;

  getOrgPricingIds: TypedContractMethod<
    [organizationId: BigNumberish],
    [bigint[]],
    "view"
  >;

  getPricing: TypedContractMethod<
    [pricingId: BigNumberish],
    [PricingUtils.PricingStructOutput],
    "view"
  >;

  getPricingBatch: TypedContractMethod<
    [_pricingIds: BigNumberish[]],
    [PricingUtils.PricingStructOutput[]],
    "view"
  >;

  pricingSupply: TypedContractMethod<[], [bigint], "view">;

  registry: TypedContractMethod<[], [string], "view">;

  restrictedAccess: TypedContractMethod<
    [arg0: BigNumberish, arg1: AddressLike],
    [boolean],
    "view"
  >;

  setPricingActive: TypedContractMethod<
    [pricingId: BigNumberish, isActive: boolean],
    [void],
    "nonpayable"
  >;

  setPricingFlatPrice: TypedContractMethod<
    [pricingId: BigNumberish, flatPrice: BigNumberish],
    [void],
    "nonpayable"
  >;

  setPricingRestricted: TypedContractMethod<
    [pricingId: BigNumberish, isRestricted: boolean],
    [void],
    "nonpayable"
  >;

  setPricingTiers: TypedContractMethod<
    [pricingId: BigNumberish, tiers: PricingUtils.PricingTierStruct[]],
    [void],
    "nonpayable"
  >;

  setPricingToken: TypedContractMethod<
    [pricingId: BigNumberish, token: AddressLike],
    [void],
    "nonpayable"
  >;

  setPricingUsageMeterId: TypedContractMethod<
    [pricingId: BigNumberish, usageMeterId: BigNumberish],
    [void],
    "nonpayable"
  >;

  setRestrictedAccess: TypedContractMethod<
    [
      pricingId: BigNumberish,
      productPassOwners: AddressLike[],
      isRestricted: boolean[]
    ],
    [void],
    "nonpayable"
  >;

  supportsInterface: TypedContractMethod<
    [interfaceId: BytesLike],
    [boolean],
    "view"
  >;

  validateCheckout: TypedContractMethod<
    [
      _organizationId: BigNumberish,
      _productPassOwner: AddressLike,
      _pricingId: BigNumberish,
      _quantity: BigNumberish
    ],
    [bigint],
    "view"
  >;

  validateCheckoutBatch: TypedContractMethod<
    [
      _organizationId: BigNumberish,
      _productPassOwner: AddressLike,
      _pricingIds: BigNumberish[],
      _quantities: BigNumberish[]
    ],
    [[string, bigint[]] & { token: string; cycleDurations: bigint[] }],
    "view"
  >;

  validateOrgPricing: TypedContractMethod<
    [_organizationId: BigNumberish, _pricingIds: BigNumberish[]],
    [void],
    "view"
  >;

  validateTiers: TypedContractMethod<
    [tiers: PricingUtils.PricingTierStruct[], chargeStyle: BigNumberish],
    [void],
    "view"
  >;

  getFunction<T extends ContractMethod = ContractMethod>(
    key: string | FunctionFragment
  ): T;

  getFunction(
    nameOrSignature: "createFlatRateSubscriptionPricing"
  ): TypedContractMethod<
    [params: IPricingRegistry.CreateFlatRateSubscriptionParamsStruct],
    [void],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "createOneTimePricing"
  ): TypedContractMethod<
    [params: IPricingRegistry.CreateOneTimeParamsStruct],
    [void],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "createTieredSubscriptionPricing"
  ): TypedContractMethod<
    [params: IPricingRegistry.CreateTieredSubscriptionParamsStruct],
    [void],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "createUsageBasedSubscriptionPricing"
  ): TypedContractMethod<
    [params: IPricingRegistry.CreateUsageBasedSubscriptionParamsStruct],
    [void],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "getChargeFrequencyCycleDuration"
  ): TypedContractMethod<[chargeFrequency: BigNumberish], [bigint], "view">;
  getFunction(
    nameOrSignature: "getCycleDuration"
  ): TypedContractMethod<[pricingId: BigNumberish], [bigint], "view">;
  getFunction(
    nameOrSignature: "getCycleDurationBatch"
  ): TypedContractMethod<[_pricingIds: BigNumberish[]], [bigint[]], "view">;
  getFunction(
    nameOrSignature: "getOrgPricing"
  ): TypedContractMethod<
    [organizationId: BigNumberish],
    [[bigint[], PricingUtils.PricingStructOutput[]]],
    "view"
  >;
  getFunction(
    nameOrSignature: "getOrgPricingIds"
  ): TypedContractMethod<[organizationId: BigNumberish], [bigint[]], "view">;
  getFunction(
    nameOrSignature: "getPricing"
  ): TypedContractMethod<
    [pricingId: BigNumberish],
    [PricingUtils.PricingStructOutput],
    "view"
  >;
  getFunction(
    nameOrSignature: "getPricingBatch"
  ): TypedContractMethod<
    [_pricingIds: BigNumberish[]],
    [PricingUtils.PricingStructOutput[]],
    "view"
  >;
  getFunction(
    nameOrSignature: "pricingSupply"
  ): TypedContractMethod<[], [bigint], "view">;
  getFunction(
    nameOrSignature: "registry"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "restrictedAccess"
  ): TypedContractMethod<
    [arg0: BigNumberish, arg1: AddressLike],
    [boolean],
    "view"
  >;
  getFunction(
    nameOrSignature: "setPricingActive"
  ): TypedContractMethod<
    [pricingId: BigNumberish, isActive: boolean],
    [void],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "setPricingFlatPrice"
  ): TypedContractMethod<
    [pricingId: BigNumberish, flatPrice: BigNumberish],
    [void],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "setPricingRestricted"
  ): TypedContractMethod<
    [pricingId: BigNumberish, isRestricted: boolean],
    [void],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "setPricingTiers"
  ): TypedContractMethod<
    [pricingId: BigNumberish, tiers: PricingUtils.PricingTierStruct[]],
    [void],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "setPricingToken"
  ): TypedContractMethod<
    [pricingId: BigNumberish, token: AddressLike],
    [void],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "setPricingUsageMeterId"
  ): TypedContractMethod<
    [pricingId: BigNumberish, usageMeterId: BigNumberish],
    [void],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "setRestrictedAccess"
  ): TypedContractMethod<
    [
      pricingId: BigNumberish,
      productPassOwners: AddressLike[],
      isRestricted: boolean[]
    ],
    [void],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "supportsInterface"
  ): TypedContractMethod<[interfaceId: BytesLike], [boolean], "view">;
  getFunction(
    nameOrSignature: "validateCheckout"
  ): TypedContractMethod<
    [
      _organizationId: BigNumberish,
      _productPassOwner: AddressLike,
      _pricingId: BigNumberish,
      _quantity: BigNumberish
    ],
    [bigint],
    "view"
  >;
  getFunction(
    nameOrSignature: "validateCheckoutBatch"
  ): TypedContractMethod<
    [
      _organizationId: BigNumberish,
      _productPassOwner: AddressLike,
      _pricingIds: BigNumberish[],
      _quantities: BigNumberish[]
    ],
    [[string, bigint[]] & { token: string; cycleDurations: bigint[] }],
    "view"
  >;
  getFunction(
    nameOrSignature: "validateOrgPricing"
  ): TypedContractMethod<
    [_organizationId: BigNumberish, _pricingIds: BigNumberish[]],
    [void],
    "view"
  >;
  getFunction(
    nameOrSignature: "validateTiers"
  ): TypedContractMethod<
    [tiers: PricingUtils.PricingTierStruct[], chargeStyle: BigNumberish],
    [void],
    "view"
  >;

  getEvent(
    key: "PricingCreated"
  ): TypedContractEvent<
    PricingCreatedEvent.InputTuple,
    PricingCreatedEvent.OutputTuple,
    PricingCreatedEvent.OutputObject
  >;
  getEvent(
    key: "PricingStatusChanged"
  ): TypedContractEvent<
    PricingStatusChangedEvent.InputTuple,
    PricingStatusChangedEvent.OutputTuple,
    PricingStatusChangedEvent.OutputObject
  >;
  getEvent(
    key: "PricingUpdated"
  ): TypedContractEvent<
    PricingUpdatedEvent.InputTuple,
    PricingUpdatedEvent.OutputTuple,
    PricingUpdatedEvent.OutputObject
  >;
  getEvent(
    key: "RestrictedAccessGranted"
  ): TypedContractEvent<
    RestrictedAccessGrantedEvent.InputTuple,
    RestrictedAccessGrantedEvent.OutputTuple,
    RestrictedAccessGrantedEvent.OutputObject
  >;

  filters: {
    "PricingCreated(uint256,uint256)": TypedContractEvent<
      PricingCreatedEvent.InputTuple,
      PricingCreatedEvent.OutputTuple,
      PricingCreatedEvent.OutputObject
    >;
    PricingCreated: TypedContractEvent<
      PricingCreatedEvent.InputTuple,
      PricingCreatedEvent.OutputTuple,
      PricingCreatedEvent.OutputObject
    >;

    "PricingStatusChanged(uint256,uint256,bool)": TypedContractEvent<
      PricingStatusChangedEvent.InputTuple,
      PricingStatusChangedEvent.OutputTuple,
      PricingStatusChangedEvent.OutputObject
    >;
    PricingStatusChanged: TypedContractEvent<
      PricingStatusChangedEvent.InputTuple,
      PricingStatusChangedEvent.OutputTuple,
      PricingStatusChangedEvent.OutputObject
    >;

    "PricingUpdated(uint256,uint256)": TypedContractEvent<
      PricingUpdatedEvent.InputTuple,
      PricingUpdatedEvent.OutputTuple,
      PricingUpdatedEvent.OutputObject
    >;
    PricingUpdated: TypedContractEvent<
      PricingUpdatedEvent.InputTuple,
      PricingUpdatedEvent.OutputTuple,
      PricingUpdatedEvent.OutputObject
    >;

    "RestrictedAccessGranted(uint256,uint256,address,bool)": TypedContractEvent<
      RestrictedAccessGrantedEvent.InputTuple,
      RestrictedAccessGrantedEvent.OutputTuple,
      RestrictedAccessGrantedEvent.OutputObject
    >;
    RestrictedAccessGranted: TypedContractEvent<
      RestrictedAccessGrantedEvent.InputTuple,
      RestrictedAccessGrantedEvent.OutputTuple,
      RestrictedAccessGrantedEvent.OutputObject
    >;
  };
}
