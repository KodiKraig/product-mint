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
  AddressLike,
  ContractRunner,
  ContractMethod,
  Listener,
} from "ethers";
import type {
  TypedContractEvent,
  TypedDeferredTopicFilter,
  TypedEventLog,
  TypedListener,
  TypedContractMethod,
} from "../common";

export interface IDynamicERC20Interface extends Interface {
  getFunction(
    nameOrSignature:
      | "allowanceQuote"
      | "balanceOfQuote"
      | "baseToken"
      | "dynamicPriceRouter"
      | "getBaseToQuotePath"
      | "getBaseTokenAmount"
      | "getBaseTokenPrice"
      | "getQuoteToBasePath"
      | "getQuoteTokenAmount"
      | "quoteToken"
      | "routerName"
  ): FunctionFragment;

  encodeFunctionData(
    functionFragment: "allowanceQuote",
    values: [AddressLike, AddressLike]
  ): string;
  encodeFunctionData(
    functionFragment: "balanceOfQuote",
    values: [AddressLike]
  ): string;
  encodeFunctionData(functionFragment: "baseToken", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "dynamicPriceRouter",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "getBaseToQuotePath",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "getBaseTokenAmount",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "getBaseTokenPrice",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "getQuoteToBasePath",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "getQuoteTokenAmount",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "quoteToken",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "routerName",
    values?: undefined
  ): string;

  decodeFunctionResult(
    functionFragment: "allowanceQuote",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "balanceOfQuote",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "baseToken", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "dynamicPriceRouter",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getBaseToQuotePath",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getBaseTokenAmount",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getBaseTokenPrice",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getQuoteToBasePath",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getQuoteTokenAmount",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "quoteToken", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "routerName", data: BytesLike): Result;
}

export interface IDynamicERC20 extends BaseContract {
  connect(runner?: ContractRunner | null): IDynamicERC20;
  waitForDeployment(): Promise<this>;

  interface: IDynamicERC20Interface;

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

  allowanceQuote: TypedContractMethod<
    [owner: AddressLike, spender: AddressLike],
    [bigint],
    "nonpayable"
  >;

  balanceOfQuote: TypedContractMethod<
    [account: AddressLike],
    [bigint],
    "nonpayable"
  >;

  baseToken: TypedContractMethod<[], [string], "view">;

  dynamicPriceRouter: TypedContractMethod<[], [string], "view">;

  getBaseToQuotePath: TypedContractMethod<[], [string[]], "view">;

  getBaseTokenAmount: TypedContractMethod<
    [quoteTokenAmount: BigNumberish],
    [[string, bigint] & { baseToken: string; baseTokenAmount: bigint }],
    "nonpayable"
  >;

  getBaseTokenPrice: TypedContractMethod<[], [bigint], "nonpayable">;

  getQuoteToBasePath: TypedContractMethod<[], [string[]], "view">;

  getQuoteTokenAmount: TypedContractMethod<
    [baseTokenAmount: BigNumberish],
    [[string, bigint] & { quoteToken: string; quoteTokenAmount: bigint }],
    "nonpayable"
  >;

  quoteToken: TypedContractMethod<[], [string], "view">;

  routerName: TypedContractMethod<[], [string], "view">;

  getFunction<T extends ContractMethod = ContractMethod>(
    key: string | FunctionFragment
  ): T;

  getFunction(
    nameOrSignature: "allowanceQuote"
  ): TypedContractMethod<
    [owner: AddressLike, spender: AddressLike],
    [bigint],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "balanceOfQuote"
  ): TypedContractMethod<[account: AddressLike], [bigint], "nonpayable">;
  getFunction(
    nameOrSignature: "baseToken"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "dynamicPriceRouter"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "getBaseToQuotePath"
  ): TypedContractMethod<[], [string[]], "view">;
  getFunction(
    nameOrSignature: "getBaseTokenAmount"
  ): TypedContractMethod<
    [quoteTokenAmount: BigNumberish],
    [[string, bigint] & { baseToken: string; baseTokenAmount: bigint }],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "getBaseTokenPrice"
  ): TypedContractMethod<[], [bigint], "nonpayable">;
  getFunction(
    nameOrSignature: "getQuoteToBasePath"
  ): TypedContractMethod<[], [string[]], "view">;
  getFunction(
    nameOrSignature: "getQuoteTokenAmount"
  ): TypedContractMethod<
    [baseTokenAmount: BigNumberish],
    [[string, bigint] & { quoteToken: string; quoteTokenAmount: bigint }],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "quoteToken"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "routerName"
  ): TypedContractMethod<[], [string], "view">;

  filters: {};
}
