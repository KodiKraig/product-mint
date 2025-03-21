/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import {
  Contract,
  ContractFactory,
  ContractTransactionResponse,
  Interface,
} from "ethers";
import type { Signer, ContractDeployTransaction, ContractRunner } from "ethers";
import type { NonPayableOverrides } from "../../common";
import type { MintToken, MintTokenInterface } from "../../tokens/MintToken";

const _abi = [
  {
    inputs: [],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "spender",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "allowance",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "needed",
        type: "uint256",
      },
    ],
    name: "ERC20InsufficientAllowance",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "sender",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "balance",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "needed",
        type: "uint256",
      },
    ],
    name: "ERC20InsufficientBalance",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "approver",
        type: "address",
      },
    ],
    name: "ERC20InvalidApprover",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "receiver",
        type: "address",
      },
    ],
    name: "ERC20InvalidReceiver",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "sender",
        type: "address",
      },
    ],
    name: "ERC20InvalidSender",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "spender",
        type: "address",
      },
    ],
    name: "ERC20InvalidSpender",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "spender",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
    ],
    name: "Approval",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
    ],
    name: "Transfer",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        internalType: "address",
        name: "spender",
        type: "address",
      },
    ],
    name: "allowance",
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
        internalType: "address",
        name: "spender",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
    ],
    name: "approve",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "balanceOf",
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
    name: "decimals",
    outputs: [
      {
        internalType: "uint8",
        name: "",
        type: "uint8",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "mint",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "name",
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
        internalType: "bytes4",
        name: "interfaceId",
        type: "bytes4",
      },
    ],
    name: "supportsInterface",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [],
    name: "symbol",
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
    inputs: [],
    name: "totalSupply",
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
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
    ],
    name: "transfer",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
    ],
    name: "transferFrom",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

const _bytecode =
  "0x60806040523480156200001157600080fd5b506040518060400160405280600981526020017f4d696e74546f6b656e00000000000000000000000000000000000000000000008152506040518060400160405280600481526020017f4d494e540000000000000000000000000000000000000000000000000000000081525081600390816200008f919062000324565b508060049081620000a1919062000324565b5050506200040b565b600081519050919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b7f4e487b7100000000000000000000000000000000000000000000000000000000600052602260045260246000fd5b600060028204905060018216806200012c57607f821691505b602082108103620001425762000141620000e4565b5b50919050565b60008190508160005260206000209050919050565b60006020601f8301049050919050565b600082821b905092915050565b600060088302620001ac7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff826200016d565b620001b886836200016d565b95508019841693508086168417925050509392505050565b6000819050919050565b6000819050919050565b600062000205620001ff620001f984620001d0565b620001da565b620001d0565b9050919050565b6000819050919050565b6200022183620001e4565b6200023962000230826200020c565b8484546200017a565b825550505050565b600090565b6200025062000241565b6200025d81848462000216565b505050565b5b8181101562000285576200027960008262000246565b60018101905062000263565b5050565b601f821115620002d4576200029e8162000148565b620002a9846200015d565b81016020851015620002b9578190505b620002d1620002c8856200015d565b83018262000262565b50505b505050565b600082821c905092915050565b6000620002f960001984600802620002d9565b1980831691505092915050565b6000620003148383620002e6565b9150826002028217905092915050565b6200032f82620000aa565b67ffffffffffffffff8111156200034b576200034a620000b5565b5b62000357825462000113565b6200036482828562000289565b600060209050601f8311600181146200039c576000841562000387578287015190505b62000393858262000306565b86555062000403565b601f198416620003ac8662000148565b60005b82811015620003d657848901518255600182019150602085019450602081019050620003af565b86831015620003f65784890151620003f2601f891682620002e6565b8355505b6001600288020188555050505b505050505050565b61109f806200041b6000396000f3fe608060405234801561001057600080fd5b50600436106100a95760003560e01c8063313ce56711610071578063313ce5671461017a57806340c10f191461019857806370a08231146101b457806395d89b41146101e4578063a9059cbb14610202578063dd62ed3e14610232576100a9565b806301ffc9a7146100ae57806306fdde03146100de578063095ea7b3146100fc57806318160ddd1461012c57806323b872dd1461014a575b600080fd5b6100c860048036038101906100c39190610c3b565b610262565b6040516100d59190610c83565b60405180910390f35b6100e6610334565b6040516100f39190610d2e565b60405180910390f35b61011660048036038101906101119190610de4565b6103c6565b6040516101239190610c83565b60405180910390f35b6101346103e9565b6040516101419190610e33565b60405180910390f35b610164600480360381019061015f9190610e4e565b6103f3565b6040516101719190610c83565b60405180910390f35b610182610422565b60405161018f9190610ebd565b60405180910390f35b6101b260048036038101906101ad9190610de4565b61042b565b005b6101ce60048036038101906101c99190610ed8565b610439565b6040516101db9190610e33565b60405180910390f35b6101ec610481565b6040516101f99190610d2e565b60405180910390f35b61021c60048036038101906102179190610de4565b610513565b6040516102299190610c83565b60405180910390f35b61024c60048036038101906102479190610f05565b610536565b6040516102599190610e33565b60405180910390f35b60007f01ffc9a7000000000000000000000000000000000000000000000000000000007bffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916827bffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916148061032d57507f36372b07000000000000000000000000000000000000000000000000000000007bffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916827bffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916145b9050919050565b60606003805461034390610f74565b80601f016020809104026020016040519081016040528092919081815260200182805461036f90610f74565b80156103bc5780601f10610391576101008083540402835291602001916103bc565b820191906000526020600020905b81548152906001019060200180831161039f57829003601f168201915b5050505050905090565b6000806103d16105bd565b90506103de8185856105c5565b600191505092915050565b6000600254905090565b6000806103fe6105bd565b905061040b8582856105d7565b61041685858561066c565b60019150509392505050565b60006012905090565b6104358282610760565b5050565b60008060008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020549050919050565b60606004805461049090610f74565b80601f01602080910402602001604051908101604052809291908181526020018280546104bc90610f74565b80156105095780601f106104de57610100808354040283529160200191610509565b820191906000526020600020905b8154815290600101906020018083116104ec57829003601f168201915b5050505050905090565b60008061051e6105bd565b905061052b81858561066c565b600191505092915050565b6000600160008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002054905092915050565b600033905090565b6105d283838360016107e2565b505050565b60006105e38484610536565b90507fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff8110156106665781811015610656578281836040517ffb8f41b200000000000000000000000000000000000000000000000000000000815260040161064d93929190610fb4565b60405180910390fd5b610665848484840360006107e2565b5b50505050565b600073ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff16036106de5760006040517f96c6fd1e0000000000000000000000000000000000000000000000000000000081526004016106d59190610feb565b60405180910390fd5b600073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff16036107505760006040517fec442f050000000000000000000000000000000000000000000000000000000081526004016107479190610feb565b60405180910390fd5b61075b8383836109b9565b505050565b600073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff16036107d25760006040517fec442f050000000000000000000000000000000000000000000000000000000081526004016107c99190610feb565b60405180910390fd5b6107de600083836109b9565b5050565b600073ffffffffffffffffffffffffffffffffffffffff168473ffffffffffffffffffffffffffffffffffffffff16036108545760006040517fe602df0500000000000000000000000000000000000000000000000000000000815260040161084b9190610feb565b60405180910390fd5b600073ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff16036108c65760006040517f94280d620000000000000000000000000000000000000000000000000000000081526004016108bd9190610feb565b60405180910390fd5b81600160008673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000208190555080156109b3578273ffffffffffffffffffffffffffffffffffffffff168473ffffffffffffffffffffffffffffffffffffffff167f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925846040516109aa9190610e33565b60405180910390a35b50505050565b600073ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff1603610a0b5780600260008282546109ff9190611035565b92505081905550610ade565b60008060008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002054905081811015610a97578381836040517fe450d38c000000000000000000000000000000000000000000000000000000008152600401610a8e93929190610fb4565b60405180910390fd5b8181036000808673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002081905550505b600073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff1603610b275780600260008282540392505081905550610b74565b806000808473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020600082825401925050819055505b8173ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef83604051610bd19190610e33565b60405180910390a3505050565b600080fd5b60007fffffffff0000000000000000000000000000000000000000000000000000000082169050919050565b610c1881610be3565b8114610c2357600080fd5b50565b600081359050610c3581610c0f565b92915050565b600060208284031215610c5157610c50610bde565b5b6000610c5f84828501610c26565b91505092915050565b60008115159050919050565b610c7d81610c68565b82525050565b6000602082019050610c986000830184610c74565b92915050565b600081519050919050565b600082825260208201905092915050565b60005b83811015610cd8578082015181840152602081019050610cbd565b60008484015250505050565b6000601f19601f8301169050919050565b6000610d0082610c9e565b610d0a8185610ca9565b9350610d1a818560208601610cba565b610d2381610ce4565b840191505092915050565b60006020820190508181036000830152610d488184610cf5565b905092915050565b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b6000610d7b82610d50565b9050919050565b610d8b81610d70565b8114610d9657600080fd5b50565b600081359050610da881610d82565b92915050565b6000819050919050565b610dc181610dae565b8114610dcc57600080fd5b50565b600081359050610dde81610db8565b92915050565b60008060408385031215610dfb57610dfa610bde565b5b6000610e0985828601610d99565b9250506020610e1a85828601610dcf565b9150509250929050565b610e2d81610dae565b82525050565b6000602082019050610e486000830184610e24565b92915050565b600080600060608486031215610e6757610e66610bde565b5b6000610e7586828701610d99565b9350506020610e8686828701610d99565b9250506040610e9786828701610dcf565b9150509250925092565b600060ff82169050919050565b610eb781610ea1565b82525050565b6000602082019050610ed26000830184610eae565b92915050565b600060208284031215610eee57610eed610bde565b5b6000610efc84828501610d99565b91505092915050565b60008060408385031215610f1c57610f1b610bde565b5b6000610f2a85828601610d99565b9250506020610f3b85828601610d99565b9150509250929050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052602260045260246000fd5b60006002820490506001821680610f8c57607f821691505b602082108103610f9f57610f9e610f45565b5b50919050565b610fae81610d70565b82525050565b6000606082019050610fc96000830186610fa5565b610fd66020830185610e24565b610fe36040830184610e24565b949350505050565b60006020820190506110006000830184610fa5565b92915050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b600061104082610dae565b915061104b83610dae565b925082820190508082111561106357611062611006565b5b9291505056fea26469706673582212206689d7341befd77822667b22c22c4aefdc998674e21b80bbc9ee5b004d1afe1364736f6c63430008180033";

type MintTokenConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: MintTokenConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class MintToken__factory extends ContractFactory {
  constructor(...args: MintTokenConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override getDeployTransaction(
    overrides?: NonPayableOverrides & { from?: string }
  ): Promise<ContractDeployTransaction> {
    return super.getDeployTransaction(overrides || {});
  }
  override deploy(overrides?: NonPayableOverrides & { from?: string }) {
    return super.deploy(overrides || {}) as Promise<
      MintToken & {
        deploymentTransaction(): ContractTransactionResponse;
      }
    >;
  }
  override connect(runner: ContractRunner | null): MintToken__factory {
    return super.connect(runner) as MintToken__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): MintTokenInterface {
    return new Interface(_abi) as MintTokenInterface;
  }
  static connect(address: string, runner?: ContractRunner | null): MintToken {
    return new Contract(address, _abi, runner) as unknown as MintToken;
  }
}
