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

export declare namespace IProductRegistry {
  export type CreateProductParamsStruct = {
    orgId: BigNumberish;
    name: string;
    description: string;
    imageUrl: string;
    externalUrl: string;
    isTransferable: boolean;
  };

  export type CreateProductParamsStructOutput = [
    orgId: bigint,
    name: string,
    description: string,
    imageUrl: string,
    externalUrl: string,
    isTransferable: boolean
  ] & {
    orgId: bigint;
    name: string;
    description: string;
    imageUrl: string;
    externalUrl: string;
    isTransferable: boolean;
  };

  export type ProductStruct = {
    orgId: BigNumberish;
    name: string;
    description: string;
    imageUrl: string;
    externalUrl: string;
    isTransferable: boolean;
    isActive: boolean;
  };

  export type ProductStructOutput = [
    orgId: bigint,
    name: string,
    description: string,
    imageUrl: string,
    externalUrl: string,
    isTransferable: boolean,
    isActive: boolean
  ] & {
    orgId: bigint;
    name: string;
    description: string;
    imageUrl: string;
    externalUrl: string;
    isTransferable: boolean;
    isActive: boolean;
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

export interface ProductRegistryInterface extends Interface {
  getFunction(
    nameOrSignature:
      | "canPurchaseProduct"
      | "canPurchaseProducts"
      | "createProduct"
      | "getOrgProductIds"
      | "getOrgProducts"
      | "getProduct"
      | "getProductNames"
      | "getProductPricing"
      | "getProductPricingBatch"
      | "getProductPricingIds"
      | "getProductsBatch"
      | "isOrgProduct"
      | "isTransferable"
      | "linkPricing"
      | "registry"
      | "setProductActive"
      | "setProductDescription"
      | "setProductExternalUrl"
      | "setProductImageUrl"
      | "setProductName"
      | "setProductTransferable"
      | "supportsInterface"
      | "totalProductSupply"
      | "unlinkPricing"
  ): FunctionFragment;

  getEvent(
    nameOrSignatureOrTopic:
      | "ProductCreated"
      | "ProductPricingLinkUpdate"
      | "ProductStatusChanged"
      | "ProductUpdated"
  ): EventFragment;

  encodeFunctionData(
    functionFragment: "canPurchaseProduct",
    values: [BigNumberish, BigNumberish, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "canPurchaseProducts",
    values: [BigNumberish, BigNumberish[], BigNumberish[]]
  ): string;
  encodeFunctionData(
    functionFragment: "createProduct",
    values: [IProductRegistry.CreateProductParamsStruct]
  ): string;
  encodeFunctionData(
    functionFragment: "getOrgProductIds",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "getOrgProducts",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "getProduct",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "getProductNames",
    values: [BigNumberish[]]
  ): string;
  encodeFunctionData(
    functionFragment: "getProductPricing",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "getProductPricingBatch",
    values: [BigNumberish[]]
  ): string;
  encodeFunctionData(
    functionFragment: "getProductPricingIds",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "getProductsBatch",
    values: [BigNumberish[]]
  ): string;
  encodeFunctionData(
    functionFragment: "isOrgProduct",
    values: [BigNumberish, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "isTransferable",
    values: [BigNumberish[]]
  ): string;
  encodeFunctionData(
    functionFragment: "linkPricing",
    values: [BigNumberish, BigNumberish[]]
  ): string;
  encodeFunctionData(functionFragment: "registry", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "setProductActive",
    values: [BigNumberish, boolean]
  ): string;
  encodeFunctionData(
    functionFragment: "setProductDescription",
    values: [BigNumberish, string]
  ): string;
  encodeFunctionData(
    functionFragment: "setProductExternalUrl",
    values: [BigNumberish, string]
  ): string;
  encodeFunctionData(
    functionFragment: "setProductImageUrl",
    values: [BigNumberish, string]
  ): string;
  encodeFunctionData(
    functionFragment: "setProductName",
    values: [BigNumberish, string]
  ): string;
  encodeFunctionData(
    functionFragment: "setProductTransferable",
    values: [BigNumberish, boolean]
  ): string;
  encodeFunctionData(
    functionFragment: "supportsInterface",
    values: [BytesLike]
  ): string;
  encodeFunctionData(
    functionFragment: "totalProductSupply",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "unlinkPricing",
    values: [BigNumberish, BigNumberish[]]
  ): string;

  decodeFunctionResult(
    functionFragment: "canPurchaseProduct",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "canPurchaseProducts",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "createProduct",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getOrgProductIds",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getOrgProducts",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "getProduct", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "getProductNames",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getProductPricing",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getProductPricingBatch",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getProductPricingIds",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getProductsBatch",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "isOrgProduct",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "isTransferable",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "linkPricing",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "registry", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "setProductActive",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "setProductDescription",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "setProductExternalUrl",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "setProductImageUrl",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "setProductName",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "setProductTransferable",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "supportsInterface",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "totalProductSupply",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "unlinkPricing",
    data: BytesLike
  ): Result;
}

export namespace ProductCreatedEvent {
  export type InputTuple = [
    organizationId: BigNumberish,
    productId: BigNumberish
  ];
  export type OutputTuple = [organizationId: bigint, productId: bigint];
  export interface OutputObject {
    organizationId: bigint;
    productId: bigint;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace ProductPricingLinkUpdateEvent {
  export type InputTuple = [
    organizationId: BigNumberish,
    productId: BigNumberish,
    pricingId: BigNumberish,
    isLinked: boolean
  ];
  export type OutputTuple = [
    organizationId: bigint,
    productId: bigint,
    pricingId: bigint,
    isLinked: boolean
  ];
  export interface OutputObject {
    organizationId: bigint;
    productId: bigint;
    pricingId: bigint;
    isLinked: boolean;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace ProductStatusChangedEvent {
  export type InputTuple = [
    organizationId: BigNumberish,
    productId: BigNumberish,
    isActive: boolean
  ];
  export type OutputTuple = [
    organizationId: bigint,
    productId: bigint,
    isActive: boolean
  ];
  export interface OutputObject {
    organizationId: bigint;
    productId: bigint;
    isActive: boolean;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace ProductUpdatedEvent {
  export type InputTuple = [
    organizationId: BigNumberish,
    productId: BigNumberish
  ];
  export type OutputTuple = [organizationId: bigint, productId: bigint];
  export interface OutputObject {
    organizationId: bigint;
    productId: bigint;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export interface ProductRegistry extends BaseContract {
  connect(runner?: ContractRunner | null): ProductRegistry;
  waitForDeployment(): Promise<this>;

  interface: ProductRegistryInterface;

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

  canPurchaseProduct: TypedContractMethod<
    [
      organizationId: BigNumberish,
      productId: BigNumberish,
      pricingId: BigNumberish
    ],
    [void],
    "view"
  >;

  canPurchaseProducts: TypedContractMethod<
    [
      _organizationId: BigNumberish,
      _productIds: BigNumberish[],
      _pricingIds: BigNumberish[]
    ],
    [void],
    "view"
  >;

  createProduct: TypedContractMethod<
    [params: IProductRegistry.CreateProductParamsStruct],
    [void],
    "nonpayable"
  >;

  getOrgProductIds: TypedContractMethod<
    [_organizationId: BigNumberish],
    [bigint[]],
    "view"
  >;

  getOrgProducts: TypedContractMethod<
    [_organizationId: BigNumberish],
    [[bigint[], IProductRegistry.ProductStructOutput[]]],
    "view"
  >;

  getProduct: TypedContractMethod<
    [productId: BigNumberish],
    [IProductRegistry.ProductStructOutput],
    "view"
  >;

  getProductNames: TypedContractMethod<
    [_productIds: BigNumberish[]],
    [string[]],
    "view"
  >;

  getProductPricing: TypedContractMethod<
    [productId: BigNumberish],
    [PricingUtils.PricingStructOutput[]],
    "view"
  >;

  getProductPricingBatch: TypedContractMethod<
    [_productIds: BigNumberish[]],
    [PricingUtils.PricingStructOutput[][]],
    "view"
  >;

  getProductPricingIds: TypedContractMethod<
    [productId: BigNumberish],
    [bigint[]],
    "view"
  >;

  getProductsBatch: TypedContractMethod<
    [_productIds: BigNumberish[]],
    [IProductRegistry.ProductStructOutput[]],
    "view"
  >;

  isOrgProduct: TypedContractMethod<
    [organizationId: BigNumberish, productId: BigNumberish],
    [boolean],
    "view"
  >;

  isTransferable: TypedContractMethod<
    [_productIds: BigNumberish[]],
    [boolean],
    "view"
  >;

  linkPricing: TypedContractMethod<
    [productId: BigNumberish, pricingIds: BigNumberish[]],
    [void],
    "nonpayable"
  >;

  registry: TypedContractMethod<[], [string], "view">;

  setProductActive: TypedContractMethod<
    [productId: BigNumberish, _isActive: boolean],
    [void],
    "nonpayable"
  >;

  setProductDescription: TypedContractMethod<
    [productId: BigNumberish, description: string],
    [void],
    "nonpayable"
  >;

  setProductExternalUrl: TypedContractMethod<
    [productId: BigNumberish, externalUrl: string],
    [void],
    "nonpayable"
  >;

  setProductImageUrl: TypedContractMethod<
    [productId: BigNumberish, imageUrl: string],
    [void],
    "nonpayable"
  >;

  setProductName: TypedContractMethod<
    [productId: BigNumberish, name: string],
    [void],
    "nonpayable"
  >;

  setProductTransferable: TypedContractMethod<
    [productId: BigNumberish, _isTransferable: boolean],
    [void],
    "nonpayable"
  >;

  supportsInterface: TypedContractMethod<
    [interfaceId: BytesLike],
    [boolean],
    "view"
  >;

  totalProductSupply: TypedContractMethod<[], [bigint], "view">;

  unlinkPricing: TypedContractMethod<
    [productId: BigNumberish, pricingIds: BigNumberish[]],
    [void],
    "nonpayable"
  >;

  getFunction<T extends ContractMethod = ContractMethod>(
    key: string | FunctionFragment
  ): T;

  getFunction(
    nameOrSignature: "canPurchaseProduct"
  ): TypedContractMethod<
    [
      organizationId: BigNumberish,
      productId: BigNumberish,
      pricingId: BigNumberish
    ],
    [void],
    "view"
  >;
  getFunction(
    nameOrSignature: "canPurchaseProducts"
  ): TypedContractMethod<
    [
      _organizationId: BigNumberish,
      _productIds: BigNumberish[],
      _pricingIds: BigNumberish[]
    ],
    [void],
    "view"
  >;
  getFunction(
    nameOrSignature: "createProduct"
  ): TypedContractMethod<
    [params: IProductRegistry.CreateProductParamsStruct],
    [void],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "getOrgProductIds"
  ): TypedContractMethod<[_organizationId: BigNumberish], [bigint[]], "view">;
  getFunction(
    nameOrSignature: "getOrgProducts"
  ): TypedContractMethod<
    [_organizationId: BigNumberish],
    [[bigint[], IProductRegistry.ProductStructOutput[]]],
    "view"
  >;
  getFunction(
    nameOrSignature: "getProduct"
  ): TypedContractMethod<
    [productId: BigNumberish],
    [IProductRegistry.ProductStructOutput],
    "view"
  >;
  getFunction(
    nameOrSignature: "getProductNames"
  ): TypedContractMethod<[_productIds: BigNumberish[]], [string[]], "view">;
  getFunction(
    nameOrSignature: "getProductPricing"
  ): TypedContractMethod<
    [productId: BigNumberish],
    [PricingUtils.PricingStructOutput[]],
    "view"
  >;
  getFunction(
    nameOrSignature: "getProductPricingBatch"
  ): TypedContractMethod<
    [_productIds: BigNumberish[]],
    [PricingUtils.PricingStructOutput[][]],
    "view"
  >;
  getFunction(
    nameOrSignature: "getProductPricingIds"
  ): TypedContractMethod<[productId: BigNumberish], [bigint[]], "view">;
  getFunction(
    nameOrSignature: "getProductsBatch"
  ): TypedContractMethod<
    [_productIds: BigNumberish[]],
    [IProductRegistry.ProductStructOutput[]],
    "view"
  >;
  getFunction(
    nameOrSignature: "isOrgProduct"
  ): TypedContractMethod<
    [organizationId: BigNumberish, productId: BigNumberish],
    [boolean],
    "view"
  >;
  getFunction(
    nameOrSignature: "isTransferable"
  ): TypedContractMethod<[_productIds: BigNumberish[]], [boolean], "view">;
  getFunction(
    nameOrSignature: "linkPricing"
  ): TypedContractMethod<
    [productId: BigNumberish, pricingIds: BigNumberish[]],
    [void],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "registry"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "setProductActive"
  ): TypedContractMethod<
    [productId: BigNumberish, _isActive: boolean],
    [void],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "setProductDescription"
  ): TypedContractMethod<
    [productId: BigNumberish, description: string],
    [void],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "setProductExternalUrl"
  ): TypedContractMethod<
    [productId: BigNumberish, externalUrl: string],
    [void],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "setProductImageUrl"
  ): TypedContractMethod<
    [productId: BigNumberish, imageUrl: string],
    [void],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "setProductName"
  ): TypedContractMethod<
    [productId: BigNumberish, name: string],
    [void],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "setProductTransferable"
  ): TypedContractMethod<
    [productId: BigNumberish, _isTransferable: boolean],
    [void],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "supportsInterface"
  ): TypedContractMethod<[interfaceId: BytesLike], [boolean], "view">;
  getFunction(
    nameOrSignature: "totalProductSupply"
  ): TypedContractMethod<[], [bigint], "view">;
  getFunction(
    nameOrSignature: "unlinkPricing"
  ): TypedContractMethod<
    [productId: BigNumberish, pricingIds: BigNumberish[]],
    [void],
    "nonpayable"
  >;

  getEvent(
    key: "ProductCreated"
  ): TypedContractEvent<
    ProductCreatedEvent.InputTuple,
    ProductCreatedEvent.OutputTuple,
    ProductCreatedEvent.OutputObject
  >;
  getEvent(
    key: "ProductPricingLinkUpdate"
  ): TypedContractEvent<
    ProductPricingLinkUpdateEvent.InputTuple,
    ProductPricingLinkUpdateEvent.OutputTuple,
    ProductPricingLinkUpdateEvent.OutputObject
  >;
  getEvent(
    key: "ProductStatusChanged"
  ): TypedContractEvent<
    ProductStatusChangedEvent.InputTuple,
    ProductStatusChangedEvent.OutputTuple,
    ProductStatusChangedEvent.OutputObject
  >;
  getEvent(
    key: "ProductUpdated"
  ): TypedContractEvent<
    ProductUpdatedEvent.InputTuple,
    ProductUpdatedEvent.OutputTuple,
    ProductUpdatedEvent.OutputObject
  >;

  filters: {
    "ProductCreated(uint256,uint256)": TypedContractEvent<
      ProductCreatedEvent.InputTuple,
      ProductCreatedEvent.OutputTuple,
      ProductCreatedEvent.OutputObject
    >;
    ProductCreated: TypedContractEvent<
      ProductCreatedEvent.InputTuple,
      ProductCreatedEvent.OutputTuple,
      ProductCreatedEvent.OutputObject
    >;

    "ProductPricingLinkUpdate(uint256,uint256,uint256,bool)": TypedContractEvent<
      ProductPricingLinkUpdateEvent.InputTuple,
      ProductPricingLinkUpdateEvent.OutputTuple,
      ProductPricingLinkUpdateEvent.OutputObject
    >;
    ProductPricingLinkUpdate: TypedContractEvent<
      ProductPricingLinkUpdateEvent.InputTuple,
      ProductPricingLinkUpdateEvent.OutputTuple,
      ProductPricingLinkUpdateEvent.OutputObject
    >;

    "ProductStatusChanged(uint256,uint256,bool)": TypedContractEvent<
      ProductStatusChangedEvent.InputTuple,
      ProductStatusChangedEvent.OutputTuple,
      ProductStatusChangedEvent.OutputObject
    >;
    ProductStatusChanged: TypedContractEvent<
      ProductStatusChangedEvent.InputTuple,
      ProductStatusChangedEvent.OutputTuple,
      ProductStatusChangedEvent.OutputObject
    >;

    "ProductUpdated(uint256,uint256)": TypedContractEvent<
      ProductUpdatedEvent.InputTuple,
      ProductUpdatedEvent.OutputTuple,
      ProductUpdatedEvent.OutputObject
    >;
    ProductUpdated: TypedContractEvent<
      ProductUpdatedEvent.InputTuple,
      ProductUpdatedEvent.OutputTuple,
      ProductUpdatedEvent.OutputObject
    >;
  };
}
