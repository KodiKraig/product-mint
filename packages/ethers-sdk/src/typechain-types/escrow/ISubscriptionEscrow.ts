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

export declare namespace ISubscriptionEscrow {
  export type SubscriptionStruct = {
    orgId: BigNumberish;
    pricingId: BigNumberish;
    startDate: BigNumberish;
    endDate: BigNumberish;
    timeRemaining: BigNumberish;
    isCancelled: boolean;
    isPaused: boolean;
  };

  export type SubscriptionStructOutput = [
    orgId: bigint,
    pricingId: bigint,
    startDate: bigint,
    endDate: bigint,
    timeRemaining: bigint,
    isCancelled: boolean,
    isPaused: boolean
  ] & {
    orgId: bigint;
    pricingId: bigint;
    startDate: bigint;
    endDate: bigint;
    timeRemaining: bigint;
    isCancelled: boolean;
    isPaused: boolean;
  };

  export type UnitQuantityStruct = {
    orgId: BigNumberish;
    quantity: BigNumberish;
    maxQuantity: BigNumberish;
  };

  export type UnitQuantityStructOutput = [
    orgId: bigint,
    quantity: bigint,
    maxQuantity: bigint
  ] & { orgId: bigint; quantity: bigint; maxQuantity: bigint };
}

export interface ISubscriptionEscrowInterface extends Interface {
  getFunction(
    nameOrSignature:
      | "cancelSubscription"
      | "changeSubscriptionPricing"
      | "changeSubscriptionUnitQuantity"
      | "createSubscriptions"
      | "getPassSubs"
      | "getRenewalCost"
      | "getRenewalCostBatch"
      | "getSubscription"
      | "getSubscriptionBatch"
      | "getUnitQuantity"
      | "getUnitQuantityFull"
      | "ownerChangePricing"
      | "pauseSubscription"
      | "renewSubscription"
      | "setOwnerChangePricing"
      | "setSubscriptionsPausable"
      | "subscriptionsPauseable"
  ): FunctionFragment;

  getEvent(
    nameOrSignatureOrTopic:
      | "OwnerChangePricingSet"
      | "SubscriptionCycleUpdated"
      | "SubscriptionPausableSet"
      | "SubscriptionPricingChanged"
      | "UnitQuantitySet"
  ): EventFragment;

  encodeFunctionData(
    functionFragment: "cancelSubscription",
    values: [BigNumberish, BigNumberish, boolean]
  ): string;
  encodeFunctionData(
    functionFragment: "changeSubscriptionPricing",
    values: [BigNumberish, BigNumberish, BigNumberish, boolean]
  ): string;
  encodeFunctionData(
    functionFragment: "changeSubscriptionUnitQuantity",
    values: [BigNumberish, BigNumberish, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "createSubscriptions",
    values: [
      BigNumberish,
      BigNumberish,
      BigNumberish[],
      BigNumberish[],
      BigNumberish[],
      BigNumberish[],
      boolean
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "getPassSubs",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "getRenewalCost",
    values: [BigNumberish, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "getRenewalCostBatch",
    values: [BigNumberish, BigNumberish[]]
  ): string;
  encodeFunctionData(
    functionFragment: "getSubscription",
    values: [BigNumberish, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "getSubscriptionBatch",
    values: [BigNumberish, BigNumberish[]]
  ): string;
  encodeFunctionData(
    functionFragment: "getUnitQuantity",
    values: [BigNumberish, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "getUnitQuantityFull",
    values: [BigNumberish, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "ownerChangePricing",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "pauseSubscription",
    values: [BigNumberish, BigNumberish, boolean]
  ): string;
  encodeFunctionData(
    functionFragment: "renewSubscription",
    values: [BigNumberish, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "setOwnerChangePricing",
    values: [BigNumberish, boolean]
  ): string;
  encodeFunctionData(
    functionFragment: "setSubscriptionsPausable",
    values: [BigNumberish, boolean]
  ): string;
  encodeFunctionData(
    functionFragment: "subscriptionsPauseable",
    values: [BigNumberish]
  ): string;

  decodeFunctionResult(
    functionFragment: "cancelSubscription",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "changeSubscriptionPricing",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "changeSubscriptionUnitQuantity",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "createSubscriptions",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getPassSubs",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getRenewalCost",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getRenewalCostBatch",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getSubscription",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getSubscriptionBatch",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getUnitQuantity",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getUnitQuantityFull",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "ownerChangePricing",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "pauseSubscription",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "renewSubscription",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "setOwnerChangePricing",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "setSubscriptionsPausable",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "subscriptionsPauseable",
    data: BytesLike
  ): Result;
}

export namespace OwnerChangePricingSetEvent {
  export type InputTuple = [organizationId: BigNumberish, canChange: boolean];
  export type OutputTuple = [organizationId: bigint, canChange: boolean];
  export interface OutputObject {
    organizationId: bigint;
    canChange: boolean;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace SubscriptionCycleUpdatedEvent {
  export type InputTuple = [
    organizationId: BigNumberish,
    productPassId: BigNumberish,
    productId: BigNumberish,
    status: BigNumberish,
    startDate: BigNumberish,
    endDate: BigNumberish
  ];
  export type OutputTuple = [
    organizationId: bigint,
    productPassId: bigint,
    productId: bigint,
    status: bigint,
    startDate: bigint,
    endDate: bigint
  ];
  export interface OutputObject {
    organizationId: bigint;
    productPassId: bigint;
    productId: bigint;
    status: bigint;
    startDate: bigint;
    endDate: bigint;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace SubscriptionPausableSetEvent {
  export type InputTuple = [organizationId: BigNumberish, pausable: boolean];
  export type OutputTuple = [organizationId: bigint, pausable: boolean];
  export interface OutputObject {
    organizationId: bigint;
    pausable: boolean;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace SubscriptionPricingChangedEvent {
  export type InputTuple = [
    organizationId: BigNumberish,
    productPassId: BigNumberish,
    productId: BigNumberish,
    newPricingId: BigNumberish
  ];
  export type OutputTuple = [
    organizationId: bigint,
    productPassId: bigint,
    productId: bigint,
    newPricingId: bigint
  ];
  export interface OutputObject {
    organizationId: bigint;
    productPassId: bigint;
    productId: bigint;
    newPricingId: bigint;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace UnitQuantitySetEvent {
  export type InputTuple = [
    productPassId: BigNumberish,
    productId: BigNumberish,
    quantity: BigNumberish,
    maxQuantity: BigNumberish
  ];
  export type OutputTuple = [
    productPassId: bigint,
    productId: bigint,
    quantity: bigint,
    maxQuantity: bigint
  ];
  export interface OutputObject {
    productPassId: bigint;
    productId: bigint;
    quantity: bigint;
    maxQuantity: bigint;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export interface ISubscriptionEscrow extends BaseContract {
  connect(runner?: ContractRunner | null): ISubscriptionEscrow;
  waitForDeployment(): Promise<this>;

  interface: ISubscriptionEscrowInterface;

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

  cancelSubscription: TypedContractMethod<
    [productPassId: BigNumberish, productId: BigNumberish, cancel: boolean],
    [boolean],
    "nonpayable"
  >;

  changeSubscriptionPricing: TypedContractMethod<
    [
      productPassId: BigNumberish,
      productId: BigNumberish,
      newPricingId: BigNumberish,
      isPassOwner: boolean
    ],
    [[string, bigint] & { token: string; amount: bigint }],
    "nonpayable"
  >;

  changeSubscriptionUnitQuantity: TypedContractMethod<
    [
      productPassId: BigNumberish,
      productId: BigNumberish,
      quantity: BigNumberish
    ],
    [
      [bigint, string, bigint] & {
        orgId: bigint;
        token: string;
        amount: bigint;
      }
    ],
    "nonpayable"
  >;

  createSubscriptions: TypedContractMethod<
    [
      _organizationId: BigNumberish,
      _productPassId: BigNumberish,
      _productIds: BigNumberish[],
      _pricingIds: BigNumberish[],
      _cycleDurations: BigNumberish[],
      _unitQuantities: BigNumberish[],
      _pause: boolean
    ],
    [void],
    "nonpayable"
  >;

  getPassSubs: TypedContractMethod<
    [productPassId: BigNumberish],
    [bigint[]],
    "view"
  >;

  getRenewalCost: TypedContractMethod<
    [productPassId: BigNumberish, productId: BigNumberish],
    [
      [bigint, string, bigint] & { orgId: bigint; token: string; price: bigint }
    ],
    "view"
  >;

  getRenewalCostBatch: TypedContractMethod<
    [productPassId: BigNumberish, productIds: BigNumberish[]],
    [
      [bigint, string[], bigint[]] & {
        orgId: bigint;
        tokens: string[];
        prices: bigint[];
      }
    ],
    "view"
  >;

  getSubscription: TypedContractMethod<
    [productPassId: BigNumberish, productId: BigNumberish],
    [[ISubscriptionEscrow.SubscriptionStructOutput, bigint]],
    "view"
  >;

  getSubscriptionBatch: TypedContractMethod<
    [productPassId: BigNumberish, productIds: BigNumberish[]],
    [
      [ISubscriptionEscrow.SubscriptionStructOutput[], bigint[]] & {
        _subs: ISubscriptionEscrow.SubscriptionStructOutput[];
        _statuses: bigint[];
      }
    ],
    "view"
  >;

  getUnitQuantity: TypedContractMethod<
    [productPassId: BigNumberish, productId: BigNumberish],
    [bigint],
    "view"
  >;

  getUnitQuantityFull: TypedContractMethod<
    [productPassId: BigNumberish, productId: BigNumberish],
    [ISubscriptionEscrow.UnitQuantityStructOutput],
    "view"
  >;

  ownerChangePricing: TypedContractMethod<
    [orgId: BigNumberish],
    [boolean],
    "view"
  >;

  pauseSubscription: TypedContractMethod<
    [productPassId: BigNumberish, productId: BigNumberish, pause: boolean],
    [boolean],
    "nonpayable"
  >;

  renewSubscription: TypedContractMethod<
    [productPassId: BigNumberish, productId: BigNumberish],
    [
      [bigint, string, bigint] & { orgId: bigint; token: string; price: bigint }
    ],
    "nonpayable"
  >;

  setOwnerChangePricing: TypedContractMethod<
    [orgId: BigNumberish, canChange: boolean],
    [void],
    "nonpayable"
  >;

  setSubscriptionsPausable: TypedContractMethod<
    [orgId: BigNumberish, _pausable: boolean],
    [void],
    "nonpayable"
  >;

  subscriptionsPauseable: TypedContractMethod<
    [orgId: BigNumberish],
    [boolean],
    "view"
  >;

  getFunction<T extends ContractMethod = ContractMethod>(
    key: string | FunctionFragment
  ): T;

  getFunction(
    nameOrSignature: "cancelSubscription"
  ): TypedContractMethod<
    [productPassId: BigNumberish, productId: BigNumberish, cancel: boolean],
    [boolean],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "changeSubscriptionPricing"
  ): TypedContractMethod<
    [
      productPassId: BigNumberish,
      productId: BigNumberish,
      newPricingId: BigNumberish,
      isPassOwner: boolean
    ],
    [[string, bigint] & { token: string; amount: bigint }],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "changeSubscriptionUnitQuantity"
  ): TypedContractMethod<
    [
      productPassId: BigNumberish,
      productId: BigNumberish,
      quantity: BigNumberish
    ],
    [
      [bigint, string, bigint] & {
        orgId: bigint;
        token: string;
        amount: bigint;
      }
    ],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "createSubscriptions"
  ): TypedContractMethod<
    [
      _organizationId: BigNumberish,
      _productPassId: BigNumberish,
      _productIds: BigNumberish[],
      _pricingIds: BigNumberish[],
      _cycleDurations: BigNumberish[],
      _unitQuantities: BigNumberish[],
      _pause: boolean
    ],
    [void],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "getPassSubs"
  ): TypedContractMethod<[productPassId: BigNumberish], [bigint[]], "view">;
  getFunction(
    nameOrSignature: "getRenewalCost"
  ): TypedContractMethod<
    [productPassId: BigNumberish, productId: BigNumberish],
    [
      [bigint, string, bigint] & { orgId: bigint; token: string; price: bigint }
    ],
    "view"
  >;
  getFunction(
    nameOrSignature: "getRenewalCostBatch"
  ): TypedContractMethod<
    [productPassId: BigNumberish, productIds: BigNumberish[]],
    [
      [bigint, string[], bigint[]] & {
        orgId: bigint;
        tokens: string[];
        prices: bigint[];
      }
    ],
    "view"
  >;
  getFunction(
    nameOrSignature: "getSubscription"
  ): TypedContractMethod<
    [productPassId: BigNumberish, productId: BigNumberish],
    [[ISubscriptionEscrow.SubscriptionStructOutput, bigint]],
    "view"
  >;
  getFunction(
    nameOrSignature: "getSubscriptionBatch"
  ): TypedContractMethod<
    [productPassId: BigNumberish, productIds: BigNumberish[]],
    [
      [ISubscriptionEscrow.SubscriptionStructOutput[], bigint[]] & {
        _subs: ISubscriptionEscrow.SubscriptionStructOutput[];
        _statuses: bigint[];
      }
    ],
    "view"
  >;
  getFunction(
    nameOrSignature: "getUnitQuantity"
  ): TypedContractMethod<
    [productPassId: BigNumberish, productId: BigNumberish],
    [bigint],
    "view"
  >;
  getFunction(
    nameOrSignature: "getUnitQuantityFull"
  ): TypedContractMethod<
    [productPassId: BigNumberish, productId: BigNumberish],
    [ISubscriptionEscrow.UnitQuantityStructOutput],
    "view"
  >;
  getFunction(
    nameOrSignature: "ownerChangePricing"
  ): TypedContractMethod<[orgId: BigNumberish], [boolean], "view">;
  getFunction(
    nameOrSignature: "pauseSubscription"
  ): TypedContractMethod<
    [productPassId: BigNumberish, productId: BigNumberish, pause: boolean],
    [boolean],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "renewSubscription"
  ): TypedContractMethod<
    [productPassId: BigNumberish, productId: BigNumberish],
    [
      [bigint, string, bigint] & { orgId: bigint; token: string; price: bigint }
    ],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "setOwnerChangePricing"
  ): TypedContractMethod<
    [orgId: BigNumberish, canChange: boolean],
    [void],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "setSubscriptionsPausable"
  ): TypedContractMethod<
    [orgId: BigNumberish, _pausable: boolean],
    [void],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "subscriptionsPauseable"
  ): TypedContractMethod<[orgId: BigNumberish], [boolean], "view">;

  getEvent(
    key: "OwnerChangePricingSet"
  ): TypedContractEvent<
    OwnerChangePricingSetEvent.InputTuple,
    OwnerChangePricingSetEvent.OutputTuple,
    OwnerChangePricingSetEvent.OutputObject
  >;
  getEvent(
    key: "SubscriptionCycleUpdated"
  ): TypedContractEvent<
    SubscriptionCycleUpdatedEvent.InputTuple,
    SubscriptionCycleUpdatedEvent.OutputTuple,
    SubscriptionCycleUpdatedEvent.OutputObject
  >;
  getEvent(
    key: "SubscriptionPausableSet"
  ): TypedContractEvent<
    SubscriptionPausableSetEvent.InputTuple,
    SubscriptionPausableSetEvent.OutputTuple,
    SubscriptionPausableSetEvent.OutputObject
  >;
  getEvent(
    key: "SubscriptionPricingChanged"
  ): TypedContractEvent<
    SubscriptionPricingChangedEvent.InputTuple,
    SubscriptionPricingChangedEvent.OutputTuple,
    SubscriptionPricingChangedEvent.OutputObject
  >;
  getEvent(
    key: "UnitQuantitySet"
  ): TypedContractEvent<
    UnitQuantitySetEvent.InputTuple,
    UnitQuantitySetEvent.OutputTuple,
    UnitQuantitySetEvent.OutputObject
  >;

  filters: {
    "OwnerChangePricingSet(uint256,bool)": TypedContractEvent<
      OwnerChangePricingSetEvent.InputTuple,
      OwnerChangePricingSetEvent.OutputTuple,
      OwnerChangePricingSetEvent.OutputObject
    >;
    OwnerChangePricingSet: TypedContractEvent<
      OwnerChangePricingSetEvent.InputTuple,
      OwnerChangePricingSetEvent.OutputTuple,
      OwnerChangePricingSetEvent.OutputObject
    >;

    "SubscriptionCycleUpdated(uint256,uint256,uint256,uint8,uint256,uint256)": TypedContractEvent<
      SubscriptionCycleUpdatedEvent.InputTuple,
      SubscriptionCycleUpdatedEvent.OutputTuple,
      SubscriptionCycleUpdatedEvent.OutputObject
    >;
    SubscriptionCycleUpdated: TypedContractEvent<
      SubscriptionCycleUpdatedEvent.InputTuple,
      SubscriptionCycleUpdatedEvent.OutputTuple,
      SubscriptionCycleUpdatedEvent.OutputObject
    >;

    "SubscriptionPausableSet(uint256,bool)": TypedContractEvent<
      SubscriptionPausableSetEvent.InputTuple,
      SubscriptionPausableSetEvent.OutputTuple,
      SubscriptionPausableSetEvent.OutputObject
    >;
    SubscriptionPausableSet: TypedContractEvent<
      SubscriptionPausableSetEvent.InputTuple,
      SubscriptionPausableSetEvent.OutputTuple,
      SubscriptionPausableSetEvent.OutputObject
    >;

    "SubscriptionPricingChanged(uint256,uint256,uint256,uint256)": TypedContractEvent<
      SubscriptionPricingChangedEvent.InputTuple,
      SubscriptionPricingChangedEvent.OutputTuple,
      SubscriptionPricingChangedEvent.OutputObject
    >;
    SubscriptionPricingChanged: TypedContractEvent<
      SubscriptionPricingChangedEvent.InputTuple,
      SubscriptionPricingChangedEvent.OutputTuple,
      SubscriptionPricingChangedEvent.OutputObject
    >;

    "UnitQuantitySet(uint256,uint256,uint256,uint256)": TypedContractEvent<
      UnitQuantitySetEvent.InputTuple,
      UnitQuantitySetEvent.OutputTuple,
      UnitQuantitySetEvent.OutputObject
    >;
    UnitQuantitySet: TypedContractEvent<
      UnitQuantitySetEvent.InputTuple,
      UnitQuantitySetEvent.OutputTuple,
      UnitQuantitySetEvent.OutputObject
    >;
  };
}
