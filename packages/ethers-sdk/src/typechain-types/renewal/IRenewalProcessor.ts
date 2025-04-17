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

export interface IRenewalProcessorInterface extends Interface {
  getFunction(
    nameOrSignature:
      | "processAllPassRenewal"
      | "processAllPassRenewalBatch"
      | "processSingleProductRenewal"
  ): FunctionFragment;

  getEvent(nameOrSignatureOrTopic: "RenewalProcessed"): EventFragment;

  encodeFunctionData(
    functionFragment: "processAllPassRenewal",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "processAllPassRenewalBatch",
    values: [BigNumberish, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "processSingleProductRenewal",
    values: [BigNumberish, BigNumberish]
  ): string;

  decodeFunctionResult(
    functionFragment: "processAllPassRenewal",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "processAllPassRenewalBatch",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "processSingleProductRenewal",
    data: BytesLike
  ): Result;
}

export namespace RenewalProcessedEvent {
  export type InputTuple = [
    orgId: BigNumberish,
    productPassId: BigNumberish,
    productId: BigNumberish,
    status: BigNumberish
  ];
  export type OutputTuple = [
    orgId: bigint,
    productPassId: bigint,
    productId: bigint,
    status: bigint
  ];
  export interface OutputObject {
    orgId: bigint;
    productPassId: bigint;
    productId: bigint;
    status: bigint;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export interface IRenewalProcessor extends BaseContract {
  connect(runner?: ContractRunner | null): IRenewalProcessor;
  waitForDeployment(): Promise<this>;

  interface: IRenewalProcessorInterface;

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

  processAllPassRenewal: TypedContractMethod<
    [_passId: BigNumberish],
    [void],
    "nonpayable"
  >;

  processAllPassRenewalBatch: TypedContractMethod<
    [_startPassId: BigNumberish, _endPassId: BigNumberish],
    [void],
    "nonpayable"
  >;

  processSingleProductRenewal: TypedContractMethod<
    [_passId: BigNumberish, _productId: BigNumberish],
    [void],
    "nonpayable"
  >;

  getFunction<T extends ContractMethod = ContractMethod>(
    key: string | FunctionFragment
  ): T;

  getFunction(
    nameOrSignature: "processAllPassRenewal"
  ): TypedContractMethod<[_passId: BigNumberish], [void], "nonpayable">;
  getFunction(
    nameOrSignature: "processAllPassRenewalBatch"
  ): TypedContractMethod<
    [_startPassId: BigNumberish, _endPassId: BigNumberish],
    [void],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "processSingleProductRenewal"
  ): TypedContractMethod<
    [_passId: BigNumberish, _productId: BigNumberish],
    [void],
    "nonpayable"
  >;

  getEvent(
    key: "RenewalProcessed"
  ): TypedContractEvent<
    RenewalProcessedEvent.InputTuple,
    RenewalProcessedEvent.OutputTuple,
    RenewalProcessedEvent.OutputObject
  >;

  filters: {
    "RenewalProcessed(uint256,uint256,uint256,uint8)": TypedContractEvent<
      RenewalProcessedEvent.InputTuple,
      RenewalProcessedEvent.OutputTuple,
      RenewalProcessedEvent.OutputObject
    >;
    RenewalProcessed: TypedContractEvent<
      RenewalProcessedEvent.InputTuple,
      RenewalProcessedEvent.OutputTuple,
      RenewalProcessedEvent.OutputObject
    >;
  };
}
