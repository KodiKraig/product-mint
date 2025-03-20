/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import {
  Contract,
  ContractFactory,
  ContractTransactionResponse,
  Interface,
} from "ethers";
import type {
  Signer,
  AddressLike,
  ContractDeployTransaction,
  ContractRunner,
} from "ethers";
import type { NonPayableOverrides } from "../../common";
import type {
  PassAttributeProvider,
  PassAttributeProviderInterface,
} from "../../metadata/PassAttributeProvider";

const _abi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "registry",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "attributesForToken",
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
    name: "registry",
    outputs: [
      {
        internalType: "contract IContractRegistry",
        name: "",
        type: "address",
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
    stateMutability: "view",
    type: "function",
  },
] as const;

const _bytecode =
  "0x60806040523480156200001157600080fd5b506040516200249c3803806200249c8339818101604052810190620000379190620000ea565b80806000806101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555050506200011c565b600080fd5b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b6000620000b28262000085565b9050919050565b620000c481620000a5565b8114620000d057600080fd5b50565b600081519050620000e481620000b9565b92915050565b60006020828403121562000103576200010262000080565b5b60006200011384828501620000d3565b91505092915050565b612370806200012c6000396000f3fe608060405234801561001057600080fd5b50600436106100415760003560e01c806301ffc9a7146100465780637b10399914610076578063e0c099ed14610094575b600080fd5b610060600480360381019061005b91906114b9565b6100c4565b60405161006d9190611501565b60405180910390f35b61007e610196565b60405161008b919061159b565b60405180910390f35b6100ae60048036038101906100a991906115ec565b6101ba565b6040516100bb91906116a9565b60405180910390f35b60007fe0c099ed000000000000000000000000000000000000000000000000000000007bffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916827bffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916148061018f57507f01ffc9a7000000000000000000000000000000000000000000000000000000007bffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916827bffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916145b9050919050565b60008054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b606060008060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1663eebc3a696040518163ffffffff1660e01b8152600401602060405180830381865afa15801561022a573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061024e9190611709565b9050600061031b6040518060400160405280600c81526020017f4f7267616e697a6174696f6e000000000000000000000000000000000000000081525061030d8473ffffffffffffffffffffffffffffffffffffffff166382f205dd886040518263ffffffff1660e01b81526004016102c79190611745565b602060405180830381865afa1580156102e4573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906103089190611775565b6104e1565b6105af90919063ffffffff16565b610324856105db565b604051602001610335929190611804565b60405160208183030381529060405290506000610351856108dd565b9050600081511115610382578181604051602001610370929190611804565b60405160208183030381529060405291505b60008060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1663b46c70b26040518163ffffffff1660e01b8152600401602060405180830381865afa1580156103f0573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906104149190611709565b73ffffffffffffffffffffffffffffffffffffffff16632e50849b876040518263ffffffff1660e01b815260040161044c9190611745565b600060405180830381865afa158015610469573d6000803e3d6000fd5b505050506040513d6000823e3d601f19601f82011682018060405250810190610492919061197f565b90506000815111156104d557826104a882610c06565b6104b188610e25565b6040516020016104c3939291906119c8565b60405160208183030381529060405292505b82945050505050919050565b6060600060016104f084610f97565b01905060008167ffffffffffffffff81111561050f5761050e61183c565b5b6040519080825280601f01601f1916602001820160405280156105415781602001600182028036833780820191505090505b509050600082602001820190505b6001156105a4578080600190039150507f3031323334353637383961626364656600000000000000000000000000000000600a86061a8153600a858161059857610597611a17565b5b0494506000850361054f575b819350505050919050565b606081836040516020016105c4929190611ab8565b604051602081830303815290604052905092915050565b606060008060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1663eebc3a696040518163ffffffff1660e01b8152600401602060405180830381865afa15801561064b573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061066f9190611709565b73ffffffffffffffffffffffffffffffffffffffff1663036f8f9d846040518263ffffffff1660e01b81526004016106a79190611745565b600060405180830381865afa1580156106c4573d6000803e3d6000fd5b505050506040513d6000823e3d601f19601f820116820180604052508101906106ed919061197f565b905060008060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1663fff218c36040518163ffffffff1660e01b8152600401602060405180830381865afa15801561075d573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906107819190611709565b73ffffffffffffffffffffffffffffffffffffffff16632242d79b836040518263ffffffff1660e01b81526004016107b99190611bc7565b600060405180830381865afa1580156107d6573d6000803e3d6000fd5b505050506040513d6000823e3d601f19601f820116820180604052508101906107ff9190611d70565b90506000825167ffffffffffffffff81111561081e5761081d61183c565b5b60405190808252806020026020018201604052801561085157816020015b606081526020019060019003908161083c5790505b50905060005b83518110156108c95761089e84828151811061087657610875611db9565b5b602002602001015184838151811061089157610890611db9565b5b60200260200101516110ea565b8282815181106108b1576108b0611db9565b5b60200260200101819052508080600101915050610857565b506108d38161112e565b9350505050919050565b606060008060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1663fc9354fa6040518163ffffffff1660e01b8152600401602060405180830381865afa15801561094d573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906109719190611709565b73ffffffffffffffffffffffffffffffffffffffff166348f3c0e3846040518263ffffffff1660e01b81526004016109a99190611745565b600060405180830381865afa1580156109c6573d6000803e3d6000fd5b505050506040513d6000823e3d601f19601f820116820180604052508101906109ef919061197f565b90506000815103610a125760405180602001604052806000815250915050610c01565b60008060008054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1663fc9354fa6040518163ffffffff1660e01b8152600401602060405180830381865afa158015610a80573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610aa49190611709565b73ffffffffffffffffffffffffffffffffffffffff1663a3aa089c86856040518363ffffffff1660e01b8152600401610ade929190611de8565b600060405180830381865afa158015610afb573d6000803e3d6000fd5b505050506040513d6000823e3d601f19601f82011682018060405250810190610b2491906120a8565b915091506000825167ffffffffffffffff811115610b4557610b4461183c565b5b604051908082528060200260200182016040528015610b7857816020015b6060815260200190600190039081610b635790505b50905060005b8351811015610bf057610bc5838281518110610b9d57610b9c611db9565b5b6020026020010151868381518110610bb857610bb7611db9565b5b6020026020010151611202565b828281518110610bd857610bd7611db9565b5b60200260200101819052508080600101915050610b7e565b50610bfa8161112e565b9450505050505b919050565b606060008060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1663b46c70b26040518163ffffffff1660e01b8152600401602060405180830381865afa158015610c76573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610c9a9190611709565b73ffffffffffffffffffffffffffffffffffffffff16631ac11a98846040518263ffffffff1660e01b8152600401610cd29190611bc7565b600060405180830381865afa158015610cef573d6000803e3d6000fd5b505050506040513d6000823e3d601f19601f82011682018060405250810190610d189190611d70565b90506000835167ffffffffffffffff811115610d3757610d3661183c565b5b604051908082528060200260200182016040528015610d6a57816020015b6060815260200190600190039081610d555790505b50905060005b8451811015610e1257610de7610d9f868381518110610d9257610d91611db9565b5b60200260200101516104e1565b604051602001610daf9190612146565b604051602081830303815290604052848381518110610dd157610dd0611db9565b5b60200260200101516105af90919063ffffffff16565b828281518110610dfa57610df9611db9565b5b60200260200101819052508080600101915050610d70565b50610e1c8161112e565b92505050919050565b606060008060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1663b46c70b26040518163ffffffff1660e01b8152600401602060405180830381865afa158015610e95573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610eb99190611709565b73ffffffffffffffffffffffffffffffffffffffff1663232c795f846040518263ffffffff1660e01b8152600401610ef19190611745565b602060405180830381865afa158015610f0e573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610f329190611775565b9050610f8f6040518060400160405280600e81526020017f546f74616c20446973636f756e74000000000000000000000000000000000000815250610f816064846113b990919063ffffffff16565b6105af90919063ffffffff16565b915050919050565b600080600090507a184f03e93ff9f4daa797ed6e38ed64bf6a1f0100000000000000008310610ff5577a184f03e93ff9f4daa797ed6e38ed64bf6a1f0100000000000000008381610feb57610fea611a17565b5b0492506040810190505b6d04ee2d6d415b85acef81000000008310611032576d04ee2d6d415b85acef8100000000838161102857611027611a17565b5b0492506020810190505b662386f26fc10000831061106157662386f26fc10000838161105757611056611a17565b5b0492506010810190505b6305f5e100831061108a576305f5e10083816110805761107f611a17565b5b0492506008810190505b61271083106110af5761271083816110a5576110a4611a17565b5b0492506004810190505b606483106110d257606483816110c8576110c7611a17565b5b0492506002810190505b600a83106110e1576001810190505b80915050919050565b60606111266110f8846104e1565b6040516020016111089190612192565b604051602081830303815290604052836105af90919063ffffffff16565b905092915050565b60606000825103611150576040518060200160405280600081525090506111fd565b600182510361117c578160008151811061116d5761116c611db9565b5b602002602001015190506111fd565b60008260008151811061119257611191611db9565b5b602002602001015190506000600190505b83518110156111f757818482815181106111c0576111bf611db9565b5b60200260200101516040516020016111d9929190611804565b604051602081830303815290604052915080806001019150506111a3565b50809150505b919050565b606060006040518060400160405280600681526020017f4163746976650000000000000000000000000000000000000000000000000000815250905060016003811115611252576112516121b8565b5b846003811115611265576112646121b8565b5b036112a7576040518060400160405280600981526020017f43616e63656c6c656400000000000000000000000000000000000000000000008152509050611376565b600260038111156112bb576112ba6121b8565b5b8460038111156112ce576112cd6121b8565b5b03611310576040518060400160405280600881526020017f50617374204475650000000000000000000000000000000000000000000000008152509050611375565b600380811115611323576113226121b8565b5b846003811115611336576113356121b8565b5b03611374576040518060400160405280600681526020017f506175736564000000000000000000000000000000000000000000000000000081525090505b5b5b6113b0611382846104e1565b604051602001611392919061220d565b604051602081830303815290604052826105af90919063ffffffff16565b91505092915050565b6060600082846113c99190612233565b9050600083856113d99190612264565b90506000811461141a576113ec826104e1565b6113f5826104e1565b6040516020016114069291906122bb565b604051602081830303815290604052611424565b611423826104e1565b5b6040516020016114349190612314565b6040516020818303038152906040529250505092915050565b6000604051905090565b600080fd5b600080fd5b60007fffffffff0000000000000000000000000000000000000000000000000000000082169050919050565b61149681611461565b81146114a157600080fd5b50565b6000813590506114b38161148d565b92915050565b6000602082840312156114cf576114ce611457565b5b60006114dd848285016114a4565b91505092915050565b60008115159050919050565b6114fb816114e6565b82525050565b600060208201905061151660008301846114f2565b92915050565b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b6000819050919050565b600061156161155c6115578461151c565b61153c565b61151c565b9050919050565b600061157382611546565b9050919050565b600061158582611568565b9050919050565b6115958161157a565b82525050565b60006020820190506115b0600083018461158c565b92915050565b6000819050919050565b6115c9816115b6565b81146115d457600080fd5b50565b6000813590506115e6816115c0565b92915050565b60006020828403121561160257611601611457565b5b6000611610848285016115d7565b91505092915050565b600081519050919050565b600082825260208201905092915050565b60005b83811015611653578082015181840152602081019050611638565b60008484015250505050565b6000601f19601f8301169050919050565b600061167b82611619565b6116858185611624565b9350611695818560208601611635565b61169e8161165f565b840191505092915050565b600060208201905081810360008301526116c38184611670565b905092915050565b60006116d68261151c565b9050919050565b6116e6816116cb565b81146116f157600080fd5b50565b600081519050611703816116dd565b92915050565b60006020828403121561171f5761171e611457565b5b600061172d848285016116f4565b91505092915050565b61173f816115b6565b82525050565b600060208201905061175a6000830184611736565b92915050565b60008151905061176f816115c0565b92915050565b60006020828403121561178b5761178a611457565b5b600061179984828501611760565b91505092915050565b600081905092915050565b60006117b882611619565b6117c281856117a2565b93506117d2818560208601611635565b80840191505092915050565b7f2c00000000000000000000000000000000000000000000000000000000000000815250565b600061181082856117ad565b915061181b826117de565b60018201915061182b82846117ad565b91508190509392505050565b600080fd5b7f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b6118748261165f565b810181811067ffffffffffffffff821117156118935761189261183c565b5b80604052505050565b60006118a661144d565b90506118b2828261186b565b919050565b600067ffffffffffffffff8211156118d2576118d161183c565b5b602082029050602081019050919050565b600080fd5b60006118fb6118f6846118b7565b61189c565b9050808382526020820190506020840283018581111561191e5761191d6118e3565b5b835b8181101561194757806119338882611760565b845260208401935050602081019050611920565b5050509392505050565b600082601f83011261196657611965611837565b5b81516119768482602086016118e8565b91505092915050565b60006020828403121561199557611994611457565b5b600082015167ffffffffffffffff8111156119b3576119b261145c565b5b6119bf84828501611951565b91505092915050565b60006119d482866117ad565b91506119df826117de565b6001820191506119ef82856117ad565b91506119fa826117de565b600182019150611a0a82846117ad565b9150819050949350505050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601260045260246000fd5b7f7b2274726169745f74797065223a202200000000000000000000000000000000815250565b7f222c202276616c7565223a202200000000000000000000000000000000000000815250565b7f227d000000000000000000000000000000000000000000000000000000000000815250565b6000611ac382611a46565b601082019150611ad382856117ad565b9150611ade82611a6c565b600d82019150611aee82846117ad565b9150611af982611a92565b6002820191508190509392505050565b600081519050919050565b600082825260208201905092915050565b6000819050602082019050919050565b611b3e816115b6565b82525050565b6000611b508383611b35565b60208301905092915050565b6000602082019050919050565b6000611b7482611b09565b611b7e8185611b14565b9350611b8983611b25565b8060005b83811015611bba578151611ba18882611b44565b9750611bac83611b5c565b925050600181019050611b8d565b5085935050505092915050565b60006020820190508181036000830152611be18184611b69565b905092915050565b600067ffffffffffffffff821115611c0457611c0361183c565b5b602082029050602081019050919050565b600080fd5b600067ffffffffffffffff821115611c3557611c3461183c565b5b611c3e8261165f565b9050602081019050919050565b6000611c5e611c5984611c1a565b61189c565b905082815260208101848484011115611c7a57611c79611c15565b5b611c85848285611635565b509392505050565b600082601f830112611ca257611ca1611837565b5b8151611cb2848260208601611c4b565b91505092915050565b6000611cce611cc984611be9565b61189c565b90508083825260208201905060208402830185811115611cf157611cf06118e3565b5b835b81811015611d3857805167ffffffffffffffff811115611d1657611d15611837565b5b808601611d238982611c8d565b85526020850194505050602081019050611cf3565b5050509392505050565b600082601f830112611d5757611d56611837565b5b8151611d67848260208601611cbb565b91505092915050565b600060208284031215611d8657611d85611457565b5b600082015167ffffffffffffffff811115611da457611da361145c565b5b611db084828501611d42565b91505092915050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b6000604082019050611dfd6000830185611736565b8181036020830152611e0f8184611b69565b90509392505050565b600067ffffffffffffffff821115611e3357611e3261183c565b5b602082029050602081019050919050565b600080fd5b611e52816114e6565b8114611e5d57600080fd5b50565b600081519050611e6f81611e49565b92915050565b600060e08284031215611e8b57611e8a611e44565b5b611e9560e061189c565b90506000611ea584828501611760565b6000830152506020611eb984828501611760565b6020830152506040611ecd84828501611760565b6040830152506060611ee184828501611760565b6060830152506080611ef584828501611760565b60808301525060a0611f0984828501611e60565b60a08301525060c0611f1d84828501611e60565b60c08301525092915050565b6000611f3c611f3784611e18565b61189c565b90508083825260208201905060e08402830185811115611f5f57611f5e6118e3565b5b835b81811015611f885780611f748882611e75565b84526020840193505060e081019050611f61565b5050509392505050565b600082601f830112611fa757611fa6611837565b5b8151611fb7848260208601611f29565b91505092915050565b600067ffffffffffffffff821115611fdb57611fda61183c565b5b602082029050602081019050919050565b60048110611ff957600080fd5b50565b60008151905061200b81611fec565b92915050565b600061202461201f84611fc0565b61189c565b90508083825260208201905060208402830185811115612047576120466118e3565b5b835b81811015612070578061205c8882611ffc565b845260208401935050602081019050612049565b5050509392505050565b600082601f83011261208f5761208e611837565b5b815161209f848260208601612011565b91505092915050565b600080604083850312156120bf576120be611457565b5b600083015167ffffffffffffffff8111156120dd576120dc61145c565b5b6120e985828601611f92565b925050602083015167ffffffffffffffff81111561210a5761210961145c565b5b6121168582860161207a565b9150509250929050565b7f446973636f756e74200000000000000000000000000000000000000000000000815250565b600061215182612120565b60098201915061216182846117ad565b915081905092915050565b7f50726f6475637420000000000000000000000000000000000000000000000000815250565b600061219d8261216c565b6008820191506121ad82846117ad565b915081905092915050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052602160045260246000fd5b7f537562736372697074696f6e2000000000000000000000000000000000000000815250565b6000612218826121e7565b600d8201915061222882846117ad565b915081905092915050565b600061223e826115b6565b9150612249836115b6565b92508261225957612258611a17565b5b828204905092915050565b600061226f826115b6565b915061227a836115b6565b92508261228a57612289611a17565b5b828206905092915050565b7f2e00000000000000000000000000000000000000000000000000000000000000815250565b60006122c782856117ad565b91506122d282612295565b6001820191506122e282846117ad565b91508190509392505050565b7f2500000000000000000000000000000000000000000000000000000000000000815250565b600061232082846117ad565b915061232b826122ee565b6001820191508190509291505056fea264697066735822122015b18b6f4f93a6cda08e59e8fb9d91fd65dfe8c51b2478c9a96963fb9ce6531164736f6c63430008180033";

type PassAttributeProviderConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: PassAttributeProviderConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class PassAttributeProvider__factory extends ContractFactory {
  constructor(...args: PassAttributeProviderConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override getDeployTransaction(
    registry: AddressLike,
    overrides?: NonPayableOverrides & { from?: string }
  ): Promise<ContractDeployTransaction> {
    return super.getDeployTransaction(registry, overrides || {});
  }
  override deploy(
    registry: AddressLike,
    overrides?: NonPayableOverrides & { from?: string }
  ) {
    return super.deploy(registry, overrides || {}) as Promise<
      PassAttributeProvider & {
        deploymentTransaction(): ContractTransactionResponse;
      }
    >;
  }
  override connect(
    runner: ContractRunner | null
  ): PassAttributeProvider__factory {
    return super.connect(runner) as PassAttributeProvider__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): PassAttributeProviderInterface {
    return new Interface(_abi) as PassAttributeProviderInterface;
  }
  static connect(
    address: string,
    runner?: ContractRunner | null
  ): PassAttributeProvider {
    return new Contract(
      address,
      _abi,
      runner
    ) as unknown as PassAttributeProvider;
  }
}
