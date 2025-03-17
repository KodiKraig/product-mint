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

export declare namespace MetadataUtils {
  export type MetadataStruct = {
    name: string;
    description: string;
    externalUrl: string;
    image: string;
    backgroundColor: string;
    animationUrl: string;
  };

  export type MetadataStructOutput = [
    name: string,
    description: string,
    externalUrl: string,
    image: string,
    backgroundColor: string,
    animationUrl: string
  ] & {
    name: string;
    description: string;
    externalUrl: string;
    image: string;
    backgroundColor: string;
    animationUrl: string;
  };
}

export interface OrganizationMetadataProviderInterface extends Interface {
  getFunction(
    nameOrSignature:
      | "acceptOwnership"
      | "attributeProvider"
      | "getCustomMetadata"
      | "getDefaultMetadata"
      | "getTokenMetadata"
      | "owner"
      | "pendingOwner"
      | "registry"
      | "renounceOwnership"
      | "setAttributeProvider"
      | "setCustomMetadata"
      | "setCustomMetadataField"
      | "setDefaultMetadata"
      | "setDefaultMetadataField"
      | "supportsInterface"
      | "transferOwnership"
  ): FunctionFragment;

  getEvent(
    nameOrSignatureOrTopic:
      | "AttributeProviderUpdated"
      | "CustomMetadataUpdated"
      | "DefaultMetadataUpdated"
      | "OwnershipTransferStarted"
      | "OwnershipTransferred"
  ): EventFragment;

  encodeFunctionData(
    functionFragment: "acceptOwnership",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "attributeProvider",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "getCustomMetadata",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "getDefaultMetadata",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "getTokenMetadata",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(functionFragment: "owner", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "pendingOwner",
    values?: undefined
  ): string;
  encodeFunctionData(functionFragment: "registry", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "renounceOwnership",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "setAttributeProvider",
    values: [AddressLike]
  ): string;
  encodeFunctionData(
    functionFragment: "setCustomMetadata",
    values: [BigNumberish, MetadataUtils.MetadataStruct]
  ): string;
  encodeFunctionData(
    functionFragment: "setCustomMetadataField",
    values: [BigNumberish, BigNumberish, string]
  ): string;
  encodeFunctionData(
    functionFragment: "setDefaultMetadata",
    values: [MetadataUtils.MetadataStruct]
  ): string;
  encodeFunctionData(
    functionFragment: "setDefaultMetadataField",
    values: [BigNumberish, string]
  ): string;
  encodeFunctionData(
    functionFragment: "supportsInterface",
    values: [BytesLike]
  ): string;
  encodeFunctionData(
    functionFragment: "transferOwnership",
    values: [AddressLike]
  ): string;

  decodeFunctionResult(
    functionFragment: "acceptOwnership",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "attributeProvider",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getCustomMetadata",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getDefaultMetadata",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getTokenMetadata",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "owner", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "pendingOwner",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "registry", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "renounceOwnership",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "setAttributeProvider",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "setCustomMetadata",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "setCustomMetadataField",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "setDefaultMetadata",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "setDefaultMetadataField",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "supportsInterface",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "transferOwnership",
    data: BytesLike
  ): Result;
}

export namespace AttributeProviderUpdatedEvent {
  export type InputTuple = [attributeProvider: AddressLike];
  export type OutputTuple = [attributeProvider: string];
  export interface OutputObject {
    attributeProvider: string;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace CustomMetadataUpdatedEvent {
  export type InputTuple = [organizationId: BigNumberish];
  export type OutputTuple = [organizationId: bigint];
  export interface OutputObject {
    organizationId: bigint;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace DefaultMetadataUpdatedEvent {
  export type InputTuple = [];
  export type OutputTuple = [];
  export interface OutputObject {}
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace OwnershipTransferStartedEvent {
  export type InputTuple = [previousOwner: AddressLike, newOwner: AddressLike];
  export type OutputTuple = [previousOwner: string, newOwner: string];
  export interface OutputObject {
    previousOwner: string;
    newOwner: string;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace OwnershipTransferredEvent {
  export type InputTuple = [previousOwner: AddressLike, newOwner: AddressLike];
  export type OutputTuple = [previousOwner: string, newOwner: string];
  export interface OutputObject {
    previousOwner: string;
    newOwner: string;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export interface OrganizationMetadataProvider extends BaseContract {
  connect(runner?: ContractRunner | null): OrganizationMetadataProvider;
  waitForDeployment(): Promise<this>;

  interface: OrganizationMetadataProviderInterface;

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

  acceptOwnership: TypedContractMethod<[], [void], "nonpayable">;

  attributeProvider: TypedContractMethod<[], [string], "view">;

  getCustomMetadata: TypedContractMethod<
    [organizationId: BigNumberish],
    [MetadataUtils.MetadataStructOutput],
    "view"
  >;

  getDefaultMetadata: TypedContractMethod<
    [],
    [MetadataUtils.MetadataStructOutput],
    "view"
  >;

  getTokenMetadata: TypedContractMethod<
    [tokenId: BigNumberish],
    [string],
    "view"
  >;

  owner: TypedContractMethod<[], [string], "view">;

  pendingOwner: TypedContractMethod<[], [string], "view">;

  registry: TypedContractMethod<[], [string], "view">;

  renounceOwnership: TypedContractMethod<[], [void], "nonpayable">;

  setAttributeProvider: TypedContractMethod<
    [_attributeProvider: AddressLike],
    [void],
    "nonpayable"
  >;

  setCustomMetadata: TypedContractMethod<
    [organizationId: BigNumberish, metadata: MetadataUtils.MetadataStruct],
    [void],
    "nonpayable"
  >;

  setCustomMetadataField: TypedContractMethod<
    [organizationId: BigNumberish, field: BigNumberish, value: string],
    [void],
    "nonpayable"
  >;

  setDefaultMetadata: TypedContractMethod<
    [metadata: MetadataUtils.MetadataStruct],
    [void],
    "nonpayable"
  >;

  setDefaultMetadataField: TypedContractMethod<
    [field: BigNumberish, value: string],
    [void],
    "nonpayable"
  >;

  supportsInterface: TypedContractMethod<
    [interfaceId: BytesLike],
    [boolean],
    "view"
  >;

  transferOwnership: TypedContractMethod<
    [newOwner: AddressLike],
    [void],
    "nonpayable"
  >;

  getFunction<T extends ContractMethod = ContractMethod>(
    key: string | FunctionFragment
  ): T;

  getFunction(
    nameOrSignature: "acceptOwnership"
  ): TypedContractMethod<[], [void], "nonpayable">;
  getFunction(
    nameOrSignature: "attributeProvider"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "getCustomMetadata"
  ): TypedContractMethod<
    [organizationId: BigNumberish],
    [MetadataUtils.MetadataStructOutput],
    "view"
  >;
  getFunction(
    nameOrSignature: "getDefaultMetadata"
  ): TypedContractMethod<[], [MetadataUtils.MetadataStructOutput], "view">;
  getFunction(
    nameOrSignature: "getTokenMetadata"
  ): TypedContractMethod<[tokenId: BigNumberish], [string], "view">;
  getFunction(
    nameOrSignature: "owner"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "pendingOwner"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "registry"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "renounceOwnership"
  ): TypedContractMethod<[], [void], "nonpayable">;
  getFunction(
    nameOrSignature: "setAttributeProvider"
  ): TypedContractMethod<
    [_attributeProvider: AddressLike],
    [void],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "setCustomMetadata"
  ): TypedContractMethod<
    [organizationId: BigNumberish, metadata: MetadataUtils.MetadataStruct],
    [void],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "setCustomMetadataField"
  ): TypedContractMethod<
    [organizationId: BigNumberish, field: BigNumberish, value: string],
    [void],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "setDefaultMetadata"
  ): TypedContractMethod<
    [metadata: MetadataUtils.MetadataStruct],
    [void],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "setDefaultMetadataField"
  ): TypedContractMethod<
    [field: BigNumberish, value: string],
    [void],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "supportsInterface"
  ): TypedContractMethod<[interfaceId: BytesLike], [boolean], "view">;
  getFunction(
    nameOrSignature: "transferOwnership"
  ): TypedContractMethod<[newOwner: AddressLike], [void], "nonpayable">;

  getEvent(
    key: "AttributeProviderUpdated"
  ): TypedContractEvent<
    AttributeProviderUpdatedEvent.InputTuple,
    AttributeProviderUpdatedEvent.OutputTuple,
    AttributeProviderUpdatedEvent.OutputObject
  >;
  getEvent(
    key: "CustomMetadataUpdated"
  ): TypedContractEvent<
    CustomMetadataUpdatedEvent.InputTuple,
    CustomMetadataUpdatedEvent.OutputTuple,
    CustomMetadataUpdatedEvent.OutputObject
  >;
  getEvent(
    key: "DefaultMetadataUpdated"
  ): TypedContractEvent<
    DefaultMetadataUpdatedEvent.InputTuple,
    DefaultMetadataUpdatedEvent.OutputTuple,
    DefaultMetadataUpdatedEvent.OutputObject
  >;
  getEvent(
    key: "OwnershipTransferStarted"
  ): TypedContractEvent<
    OwnershipTransferStartedEvent.InputTuple,
    OwnershipTransferStartedEvent.OutputTuple,
    OwnershipTransferStartedEvent.OutputObject
  >;
  getEvent(
    key: "OwnershipTransferred"
  ): TypedContractEvent<
    OwnershipTransferredEvent.InputTuple,
    OwnershipTransferredEvent.OutputTuple,
    OwnershipTransferredEvent.OutputObject
  >;

  filters: {
    "AttributeProviderUpdated(address)": TypedContractEvent<
      AttributeProviderUpdatedEvent.InputTuple,
      AttributeProviderUpdatedEvent.OutputTuple,
      AttributeProviderUpdatedEvent.OutputObject
    >;
    AttributeProviderUpdated: TypedContractEvent<
      AttributeProviderUpdatedEvent.InputTuple,
      AttributeProviderUpdatedEvent.OutputTuple,
      AttributeProviderUpdatedEvent.OutputObject
    >;

    "CustomMetadataUpdated(uint256)": TypedContractEvent<
      CustomMetadataUpdatedEvent.InputTuple,
      CustomMetadataUpdatedEvent.OutputTuple,
      CustomMetadataUpdatedEvent.OutputObject
    >;
    CustomMetadataUpdated: TypedContractEvent<
      CustomMetadataUpdatedEvent.InputTuple,
      CustomMetadataUpdatedEvent.OutputTuple,
      CustomMetadataUpdatedEvent.OutputObject
    >;

    "DefaultMetadataUpdated()": TypedContractEvent<
      DefaultMetadataUpdatedEvent.InputTuple,
      DefaultMetadataUpdatedEvent.OutputTuple,
      DefaultMetadataUpdatedEvent.OutputObject
    >;
    DefaultMetadataUpdated: TypedContractEvent<
      DefaultMetadataUpdatedEvent.InputTuple,
      DefaultMetadataUpdatedEvent.OutputTuple,
      DefaultMetadataUpdatedEvent.OutputObject
    >;

    "OwnershipTransferStarted(address,address)": TypedContractEvent<
      OwnershipTransferStartedEvent.InputTuple,
      OwnershipTransferStartedEvent.OutputTuple,
      OwnershipTransferStartedEvent.OutputObject
    >;
    OwnershipTransferStarted: TypedContractEvent<
      OwnershipTransferStartedEvent.InputTuple,
      OwnershipTransferStartedEvent.OutputTuple,
      OwnershipTransferStartedEvent.OutputObject
    >;

    "OwnershipTransferred(address,address)": TypedContractEvent<
      OwnershipTransferredEvent.InputTuple,
      OwnershipTransferredEvent.OutputTuple,
      OwnershipTransferredEvent.OutputObject
    >;
    OwnershipTransferred: TypedContractEvent<
      OwnershipTransferredEvent.InputTuple,
      OwnershipTransferredEvent.OutputTuple,
      OwnershipTransferredEvent.OutputObject
    >;
  };
}
