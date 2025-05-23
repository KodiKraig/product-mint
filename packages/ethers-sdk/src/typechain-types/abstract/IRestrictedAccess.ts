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

export interface IRestrictedAccessInterface extends Interface {
  getFunction(
    nameOrSignature: "getRestrictedAccess" | "hasRestrictedAccess"
  ): FunctionFragment;

  getEvent(nameOrSignatureOrTopic: "RestrictedAccessUpdated"): EventFragment;

  encodeFunctionData(
    functionFragment: "getRestrictedAccess",
    values: [BigNumberish, AddressLike]
  ): string;
  encodeFunctionData(
    functionFragment: "hasRestrictedAccess",
    values: [BigNumberish, AddressLike, BigNumberish]
  ): string;

  decodeFunctionResult(
    functionFragment: "getRestrictedAccess",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "hasRestrictedAccess",
    data: BytesLike
  ): Result;
}

export namespace RestrictedAccessUpdatedEvent {
  export type InputTuple = [
    orgId: BigNumberish,
    accessId: BigNumberish,
    passOwner: AddressLike,
    restricted: boolean
  ];
  export type OutputTuple = [
    orgId: bigint,
    accessId: bigint,
    passOwner: string,
    restricted: boolean
  ];
  export interface OutputObject {
    orgId: bigint;
    accessId: bigint;
    passOwner: string;
    restricted: boolean;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export interface IRestrictedAccess extends BaseContract {
  connect(runner?: ContractRunner | null): IRestrictedAccess;
  waitForDeployment(): Promise<this>;

  interface: IRestrictedAccessInterface;

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

  getRestrictedAccess: TypedContractMethod<
    [orgId: BigNumberish, passOwner: AddressLike],
    [bigint[]],
    "view"
  >;

  hasRestrictedAccess: TypedContractMethod<
    [orgId: BigNumberish, passOwner: AddressLike, accessId: BigNumberish],
    [boolean],
    "view"
  >;

  getFunction<T extends ContractMethod = ContractMethod>(
    key: string | FunctionFragment
  ): T;

  getFunction(
    nameOrSignature: "getRestrictedAccess"
  ): TypedContractMethod<
    [orgId: BigNumberish, passOwner: AddressLike],
    [bigint[]],
    "view"
  >;
  getFunction(
    nameOrSignature: "hasRestrictedAccess"
  ): TypedContractMethod<
    [orgId: BigNumberish, passOwner: AddressLike, accessId: BigNumberish],
    [boolean],
    "view"
  >;

  getEvent(
    key: "RestrictedAccessUpdated"
  ): TypedContractEvent<
    RestrictedAccessUpdatedEvent.InputTuple,
    RestrictedAccessUpdatedEvent.OutputTuple,
    RestrictedAccessUpdatedEvent.OutputObject
  >;

  filters: {
    "RestrictedAccessUpdated(uint256,uint256,address,bool)": TypedContractEvent<
      RestrictedAccessUpdatedEvent.InputTuple,
      RestrictedAccessUpdatedEvent.OutputTuple,
      RestrictedAccessUpdatedEvent.OutputObject
    >;
    RestrictedAccessUpdated: TypedContractEvent<
      RestrictedAccessUpdatedEvent.InputTuple,
      RestrictedAccessUpdatedEvent.OutputTuple,
      RestrictedAccessUpdatedEvent.OutputObject
    >;
  };
}
