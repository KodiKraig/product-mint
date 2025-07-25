/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import type {
  BaseContract,
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

export interface IDynamicPriceRegistryInterface extends Interface {
  getFunction(
    nameOrSignature:
      | "REGISTER_TOKEN_ROLE"
      | "UNREGISTER_TOKEN_ROLE"
      | "getTokenCount"
      | "getTokens"
      | "isTokenRegistered"
      | "isTokenRegisteredBatch"
      | "registerToken"
      | "unregisterToken"
  ): FunctionFragment;

  getEvent(
    nameOrSignatureOrTopic: "DynamicTokenRegistrationUpdated"
  ): EventFragment;

  encodeFunctionData(
    functionFragment: "REGISTER_TOKEN_ROLE",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "UNREGISTER_TOKEN_ROLE",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "getTokenCount",
    values?: undefined
  ): string;
  encodeFunctionData(functionFragment: "getTokens", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "isTokenRegistered",
    values: [AddressLike]
  ): string;
  encodeFunctionData(
    functionFragment: "isTokenRegisteredBatch",
    values: [AddressLike[]]
  ): string;
  encodeFunctionData(
    functionFragment: "registerToken",
    values: [AddressLike]
  ): string;
  encodeFunctionData(
    functionFragment: "unregisterToken",
    values: [AddressLike]
  ): string;

  decodeFunctionResult(
    functionFragment: "REGISTER_TOKEN_ROLE",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "UNREGISTER_TOKEN_ROLE",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getTokenCount",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "getTokens", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "isTokenRegistered",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "isTokenRegisteredBatch",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "registerToken",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "unregisterToken",
    data: BytesLike
  ): Result;
}

export namespace DynamicTokenRegistrationUpdatedEvent {
  export type InputTuple = [token: AddressLike, registered: boolean];
  export type OutputTuple = [token: string, registered: boolean];
  export interface OutputObject {
    token: string;
    registered: boolean;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export interface IDynamicPriceRegistry extends BaseContract {
  connect(runner?: ContractRunner | null): IDynamicPriceRegistry;
  waitForDeployment(): Promise<this>;

  interface: IDynamicPriceRegistryInterface;

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

  REGISTER_TOKEN_ROLE: TypedContractMethod<[], [string], "view">;

  UNREGISTER_TOKEN_ROLE: TypedContractMethod<[], [string], "view">;

  getTokenCount: TypedContractMethod<[], [bigint], "view">;

  getTokens: TypedContractMethod<[], [string[]], "view">;

  isTokenRegistered: TypedContractMethod<
    [token: AddressLike],
    [boolean],
    "view"
  >;

  isTokenRegisteredBatch: TypedContractMethod<
    [tokens: AddressLike[]],
    [boolean],
    "view"
  >;

  registerToken: TypedContractMethod<
    [token: AddressLike],
    [void],
    "nonpayable"
  >;

  unregisterToken: TypedContractMethod<
    [token: AddressLike],
    [void],
    "nonpayable"
  >;

  getFunction<T extends ContractMethod = ContractMethod>(
    key: string | FunctionFragment
  ): T;

  getFunction(
    nameOrSignature: "REGISTER_TOKEN_ROLE"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "UNREGISTER_TOKEN_ROLE"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "getTokenCount"
  ): TypedContractMethod<[], [bigint], "view">;
  getFunction(
    nameOrSignature: "getTokens"
  ): TypedContractMethod<[], [string[]], "view">;
  getFunction(
    nameOrSignature: "isTokenRegistered"
  ): TypedContractMethod<[token: AddressLike], [boolean], "view">;
  getFunction(
    nameOrSignature: "isTokenRegisteredBatch"
  ): TypedContractMethod<[tokens: AddressLike[]], [boolean], "view">;
  getFunction(
    nameOrSignature: "registerToken"
  ): TypedContractMethod<[token: AddressLike], [void], "nonpayable">;
  getFunction(
    nameOrSignature: "unregisterToken"
  ): TypedContractMethod<[token: AddressLike], [void], "nonpayable">;

  getEvent(
    key: "DynamicTokenRegistrationUpdated"
  ): TypedContractEvent<
    DynamicTokenRegistrationUpdatedEvent.InputTuple,
    DynamicTokenRegistrationUpdatedEvent.OutputTuple,
    DynamicTokenRegistrationUpdatedEvent.OutputObject
  >;

  filters: {
    "DynamicTokenRegistrationUpdated(address,bool)": TypedContractEvent<
      DynamicTokenRegistrationUpdatedEvent.InputTuple,
      DynamicTokenRegistrationUpdatedEvent.OutputTuple,
      DynamicTokenRegistrationUpdatedEvent.OutputObject
    >;
    DynamicTokenRegistrationUpdated: TypedContractEvent<
      DynamicTokenRegistrationUpdatedEvent.InputTuple,
      DynamicTokenRegistrationUpdatedEvent.OutputTuple,
      DynamicTokenRegistrationUpdatedEvent.OutputObject
    >;
  };
}
