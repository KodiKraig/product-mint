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
  UsageRecorder,
  UsageRecorderInterface,
} from "../../usage/UsageRecorder";

const _abi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "_contractRegistry",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "organizationId",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "meterId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "bool",
        name: "isActive",
        type: "bool",
      },
    ],
    name: "MeterActiveSet",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "organizationId",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "meterId",
        type: "uint256",
      },
    ],
    name: "MeterCreated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "organizationId",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "meterId",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "usage",
        type: "uint256",
      },
    ],
    name: "MeterPaymentProcessed",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "organizationId",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "meterId",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "usage",
        type: "uint256",
      },
    ],
    name: "MeterUsageSet",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "meterId",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
    ],
    name: "adjustMeter",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "organizationId",
        type: "uint256",
      },
      {
        internalType: "enum IUsageRecorder.AggregationMethod",
        name: "aggregationMethod",
        type: "uint8",
      },
    ],
    name: "createMeter",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "organizationId",
        type: "uint256",
      },
    ],
    name: "getOrganizationMeters",
    outputs: [
      {
        internalType: "uint256[]",
        name: "",
        type: "uint256[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "meterId",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
    ],
    name: "increaseMeter",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "meterId",
        type: "uint256",
      },
      {
        internalType: "uint256[]",
        name: "tokenIds",
        type: "uint256[]",
      },
      {
        internalType: "uint256[]",
        name: "values",
        type: "uint256[]",
      },
    ],
    name: "increaseMeterBatch",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "meterId",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "incrementMeter",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "meterId",
        type: "uint256",
      },
      {
        internalType: "uint256[]",
        name: "tokenIds",
        type: "uint256[]",
      },
    ],
    name: "incrementMeterBatch",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "meterId",
        type: "uint256",
      },
    ],
    name: "isActiveOrgMeter",
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
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "passUsages",
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
        internalType: "uint256",
        name: "meterId",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "processMeterPayment",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "nonpayable",
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
        internalType: "uint256",
        name: "meterId",
        type: "uint256",
      },
      {
        internalType: "bool",
        name: "isActive",
        type: "bool",
      },
    ],
    name: "setMeterActive",
    outputs: [],
    stateMutability: "nonpayable",
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
    name: "totalMeterCount",
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
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "usageMeters",
    outputs: [
      {
        internalType: "uint256",
        name: "orgId",
        type: "uint256",
      },
      {
        internalType: "enum IUsageRecorder.AggregationMethod",
        name: "aggregationMethod",
        type: "uint8",
      },
      {
        internalType: "bool",
        name: "isActive",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;

const _bytecode =
  "0x60806040523480156200001157600080fd5b5060405162002327380380620023278339818101604052810190620000379190620000ea565b80806000806101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555050506200011c565b600080fd5b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b6000620000b28262000085565b9050919050565b620000c481620000a5565b8114620000d057600080fd5b50565b600081519050620000e481620000b9565b92915050565b60006020828403121562000103576200010262000080565b5b60006200011384828501620000d3565b91505092915050565b6121fb806200012c6000396000f3fe608060405234801561001057600080fd5b50600436106100f55760003560e01c8063a0d101b611610097578063c14ed61511610066578063c14ed61514610282578063c95fdd65146102b2578063f3cb5686146102e4578063ff277fb614610300576100f5565b8063a0d101b6146101fc578063af1af6771461022c578063b6011caa14610248578063beb0273f14610266576100f5565b8063452a2c2d116100d3578063452a2c2d146101765780637b103999146101925780638ec4d94a146101b05780639779f69b146101cc576100f5565b806301ffc9a7146100fa5780630b0c578e1461012a57806330452f7d14610146575b600080fd5b610114600480360381019061010f9190611537565b61031c565b604051610121919061157f565b60405180910390f35b610144600480360381019061013f9190611729565b6103ee565b005b610160600480360381019061015b9190611785565b6104c9565b60405161016d9190611870565b60405180910390f35b610190600480360381019061018b9190611892565b6104ed565b005b61019a61066c565b6040516101a7919061199c565b60405180910390f35b6101ca60048036038101906101c591906119dc565b610690565b005b6101e660048036038101906101e19190611a1c565b61079d565b6040516101f39190611a6b565b60405180910390f35b61021660048036038101906102119190611a1c565b6107c2565b6040516102239190611a6b565b60405180910390f35b61024660048036038101906102419190611a86565b61097d565b005b610250610a8b565b60405161025d9190611a6b565b60405180910390f35b610280600480360381019061027b9190611b05565b610a91565b005b61029c60048036038101906102979190611785565b610b3f565b6040516102a9919061157f565b60405180910390f35b6102cc60048036038101906102c79190611785565b610baf565b6040516102db93929190611bbc565b60405180910390f35b6102fe60048036038101906102f99190611a1c565b610bf3565b005b61031a60048036038101906103159190611a86565b610c9a565b005b60007f01ffc9a7000000000000000000000000000000000000000000000000000000007bffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916827bffffffffffffffffffffffffffffffffffffffffffffffffffffffff191614806103e757507f6459951b000000000000000000000000000000000000000000000000000000007bffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916827bffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916145b9050919050565b6034600083815260200190815260200160002060000154826104108282610d43565b61041982610dab565b6034600082815260200190815260200160002060010160019054906101000a900460ff1661047c576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161047390611c50565b60405180910390fd5b61048584610df6565b60005b83518110156104c2576104b5858583815181106104a8576104a7611c70565b5b6020026020010151610e82565b8080600101915050610488565b5050505050565b60606104e660336000848152602001908152602001600020610f34565b9050919050565b60346000848152602001908152602001600020600001548361050f8282610d43565b61051882610dab565b6034600082815260200190815260200160002060010160019054906101000a900460ff1661057b576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161057290611c50565b60405180910390fd5b60008451116105bf576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016105b690611ceb565b60405180910390fd5b8251845114610603576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016105fa90611d7d565b60405180910390fd5b61060c85610f55565b60005b8451811015610664576106578686838151811061062f5761062e611c70565b5b602002602001015186848151811061064a57610649611c70565b5b6020026020010151610fe2565b808060010191505061060f565b505050505050565b60008054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b8161069a81610dab565b603660008154809291906106ad90611dcc565b919050555082603460006036548152602001908152602001600020600001819055508160346000603654815260200190815260200160002060010160006101000a81548160ff0219169083600181111561070a57610709611b45565b5b0217905550600160346000603654815260200190815260200160002060010160016101000a81548160ff0219169083151502179055506107676036546033600086815260200190815260200160002061109690919063ffffffff16565b50603654837fa9ebf2e930c43255fd27946e8db3724cb89418b053bedbc87b1d5b5d281ef0a560405160405180910390a3505050565b6035602052816000526040600020602052806000526040600020600091509150505481565b60006034600084815260200190815260200160002060000154836107e68282610d43565b61087d60008054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1663fc9354fa6040518163ffffffff1660e01b8152600401602060405180830381865afa158015610854573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906108789190611e52565b6110b0565b6000603560008781526020019081526020016000206000868152602001908152602001600020549050600060356000888152602001908152602001600020600087815260200190815260200160002081905550848660346000898152602001908152602001600020600001547f8c4cd571e59e94c60c48db506ea19b2a32773e7b8536b59312c695a3b12fc4b260006040516109199190611eba565b60405180910390a4848660346000898152602001908152602001600020600001547f21e681faae0345da23c6db6eb681e8b3500e46a54de52de29deecb7c9030c524846040516109699190611a6b565b60405180910390a480935050505092915050565b60346000848152602001908152602001600020600001548361099f8282610d43565b6109a882610dab565b6034600082815260200190815260200160002060010160019054906101000a900460ff16610a0b576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610a0290611c50565b60405180910390fd5b8260356000878152602001908152602001600020600086815260200190815260200160002081905550838560346000888152602001908152602001600020600001547f8c4cd571e59e94c60c48db506ea19b2a32773e7b8536b59312c695a3b12fc4b286604051610a7c9190611a6b565b60405180910390a45050505050565b60365481565b603460008381526020019081526020016000206000015482610ab38282610d43565b610abc82610dab565b826034600086815260200190815260200160002060010160016101000a81548160ff0219169083151502179055508360346000868152602001908152602001600020600001547fb45813d8ee3cb56ae54437287ec3cfb61515c896efded410388197bcf8a6c7ba85604051610b31919061157f565b60405180910390a350505050565b6000610b7c82603360006034600087815260200190815260200160002060000154815260200190815260200160002061112890919063ffffffff16565b8015610ba857506034600083815260200190815260200160002060010160019054906101000a900460ff165b9050919050565b60346020528060005260406000206000915090508060000154908060010160009054906101000a900460ff16908060010160019054906101000a900460ff16905083565b603460008381526020019081526020016000206000015482610c158282610d43565b610c1e82610dab565b6034600082815260200190815260200160002060010160019054906101000a900460ff16610c81576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610c7890611c50565b60405180910390fd5b610c8a84610df6565b610c948484610e82565b50505050565b603460008481526020019081526020016000206000015483610cbc8282610d43565b610cc582610dab565b6034600082815260200190815260200160002060010160019054906101000a900460ff16610d28576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610d1f90611c50565b60405180910390fd5b610d3185610f55565b610d3c858585610fe2565b5050505050565b610d68816033600085815260200190815260200160002061112890919063ffffffff16565b610da7576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610d9e90611f47565b60405180910390fd5b5050565b610db481611142565b610df3576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610dea90611fb3565b60405180910390fd5b50565b600180811115610e0957610e08611b45565b5b6034600083815260200190815260200160002060010160009054906101000a900460ff166001811115610e3f57610e3e611b45565b5b14610e7f576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610e769061201f565b60405180910390fd5b50565b6035600083815260200190815260200160002060008281526020019081526020016000206000815480929190610eb790611dcc565b9190505550808260346000858152602001908152602001600020600001547f8c4cd571e59e94c60c48db506ea19b2a32773e7b8536b59312c695a3b12fc4b260356000878152602001908152602001600020600086815260200190815260200160002054604051610f289190611a6b565b60405180910390a45050565b60606000610f448360000161115c565b905060608190508092505050919050565b60006001811115610f6957610f68611b45565b5b6034600083815260200190815260200160002060010160009054906101000a900460ff166001811115610f9f57610f9e611b45565b5b14610fdf576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610fd69061208b565b60405180910390fd5b50565b80603560008581526020019081526020016000206000848152602001908152602001600020600082825461101691906120ab565b92505081905550818360346000868152602001908152602001600020600001547f8c4cd571e59e94c60c48db506ea19b2a32773e7b8536b59312c695a3b12fc4b2603560008881526020019081526020016000206000878152602001908152602001600020546040516110899190611a6b565b60405180910390a4505050565b60006110a8836000018360001b6111b8565b905092915050565b8073ffffffffffffffffffffffffffffffffffffffff166110cf611228565b73ffffffffffffffffffffffffffffffffffffffff1614611125576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161111c9061212b565b60405180910390fd5b50565b600061113a836000018360001b611230565b905092915050565b600061115582611150611228565b611253565b9050919050565b6060816000018054806020026020016040519081016040528092919081815260200182805480156111ac57602002820191906000526020600020905b815481526020019060010190808311611198575b50505050509050919050565b60006111c48383611230565b61121d578260000182908060018154018082558091505060019003906000526020600020016000909190919091505582600001805490508360010160008481526020019081526020016000208190555060019050611222565b600090505b92915050565b600033905090565b600080836001016000848152602001908152602001600020541415905092915050565b600061125f8383611378565b80611370575060008054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1663595439736040518163ffffffff1660e01b8152600401602060405180830381865afa1580156112d0573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906112f49190611e52565b73ffffffffffffffffffffffffffffffffffffffff1663146a291184846040518363ffffffff1660e01b815260040161132e92919061215a565b602060405180830381865afa15801561134b573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061136f9190612198565b5b905092915050565b60008173ffffffffffffffffffffffffffffffffffffffff1661139a846113b9565b73ffffffffffffffffffffffffffffffffffffffff1614905092915050565b60008060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1663cfd8fe0c6040518163ffffffff1660e01b8152600401602060405180830381865afa158015611427573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061144b9190611e52565b73ffffffffffffffffffffffffffffffffffffffff16636352211e836040518263ffffffff1660e01b81526004016114839190611a6b565b602060405180830381865afa1580156114a0573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906114c49190611e52565b9050919050565b6000604051905090565b600080fd5b600080fd5b60007fffffffff0000000000000000000000000000000000000000000000000000000082169050919050565b611514816114df565b811461151f57600080fd5b50565b6000813590506115318161150b565b92915050565b60006020828403121561154d5761154c6114d5565b5b600061155b84828501611522565b91505092915050565b60008115159050919050565b61157981611564565b82525050565b60006020820190506115946000830184611570565b92915050565b6000819050919050565b6115ad8161159a565b81146115b857600080fd5b50565b6000813590506115ca816115a4565b92915050565b600080fd5b6000601f19601f8301169050919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b61161e826115d5565b810181811067ffffffffffffffff8211171561163d5761163c6115e6565b5b80604052505050565b60006116506114cb565b905061165c8282611615565b919050565b600067ffffffffffffffff82111561167c5761167b6115e6565b5b602082029050602081019050919050565b600080fd5b60006116a56116a084611661565b611646565b905080838252602082019050602084028301858111156116c8576116c761168d565b5b835b818110156116f157806116dd88826115bb565b8452602084019350506020810190506116ca565b5050509392505050565b600082601f8301126117105761170f6115d0565b5b8135611720848260208601611692565b91505092915050565b600080604083850312156117405761173f6114d5565b5b600061174e858286016115bb565b925050602083013567ffffffffffffffff81111561176f5761176e6114da565b5b61177b858286016116fb565b9150509250929050565b60006020828403121561179b5761179a6114d5565b5b60006117a9848285016115bb565b91505092915050565b600081519050919050565b600082825260208201905092915050565b6000819050602082019050919050565b6117e78161159a565b82525050565b60006117f983836117de565b60208301905092915050565b6000602082019050919050565b600061181d826117b2565b61182781856117bd565b9350611832836117ce565b8060005b8381101561186357815161184a88826117ed565b975061185583611805565b925050600181019050611836565b5085935050505092915050565b6000602082019050818103600083015261188a8184611812565b905092915050565b6000806000606084860312156118ab576118aa6114d5565b5b60006118b9868287016115bb565b935050602084013567ffffffffffffffff8111156118da576118d96114da565b5b6118e6868287016116fb565b925050604084013567ffffffffffffffff811115611907576119066114da565b5b611913868287016116fb565b9150509250925092565b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b6000819050919050565b600061196261195d6119588461191d565b61193d565b61191d565b9050919050565b600061197482611947565b9050919050565b600061198682611969565b9050919050565b6119968161197b565b82525050565b60006020820190506119b1600083018461198d565b92915050565b600281106119c457600080fd5b50565b6000813590506119d6816119b7565b92915050565b600080604083850312156119f3576119f26114d5565b5b6000611a01858286016115bb565b9250506020611a12858286016119c7565b9150509250929050565b60008060408385031215611a3357611a326114d5565b5b6000611a41858286016115bb565b9250506020611a52858286016115bb565b9150509250929050565b611a658161159a565b82525050565b6000602082019050611a806000830184611a5c565b92915050565b600080600060608486031215611a9f57611a9e6114d5565b5b6000611aad868287016115bb565b9350506020611abe868287016115bb565b9250506040611acf868287016115bb565b9150509250925092565b611ae281611564565b8114611aed57600080fd5b50565b600081359050611aff81611ad9565b92915050565b60008060408385031215611b1c57611b1b6114d5565b5b6000611b2a858286016115bb565b9250506020611b3b85828601611af0565b9150509250929050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052602160045260246000fd5b60028110611b8557611b84611b45565b5b50565b6000819050611b9682611b74565b919050565b6000611ba682611b88565b9050919050565b611bb681611b9b565b82525050565b6000606082019050611bd16000830186611a5c565b611bde6020830185611bad565b611beb6040830184611570565b949350505050565b600082825260208201905092915050565b7f4d65746572206973206e6f742061637469766500000000000000000000000000600082015250565b6000611c3a601383611bf3565b9150611c4582611c04565b602082019050919050565b60006020820190508181036000830152611c6981611c2d565b9050919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b7f4e6f20746f6b656e204944732070726f76696465640000000000000000000000600082015250565b6000611cd5601583611bf3565b9150611ce082611c9f565b602082019050919050565b60006020820190508181036000830152611d0481611cc8565b9050919050565b7f546f6b656e2049447320616e642076616c756573206d7573742062652074686560008201527f2073616d65206c656e6774680000000000000000000000000000000000000000602082015250565b6000611d67602c83611bf3565b9150611d7282611d0b565b604082019050919050565b60006020820190508181036000830152611d9681611d5a565b9050919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b6000611dd78261159a565b91507fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff8203611e0957611e08611d9d565b5b600182019050919050565b6000611e1f8261191d565b9050919050565b611e2f81611e14565b8114611e3a57600080fd5b50565b600081519050611e4c81611e26565b92915050565b600060208284031215611e6857611e676114d5565b5b6000611e7684828501611e3d565b91505092915050565b6000819050919050565b6000611ea4611e9f611e9a84611e7f565b61193d565b61159a565b9050919050565b611eb481611e89565b82525050565b6000602082019050611ecf6000830184611eab565b92915050565b7f4d6574657220646f6573206e6f7420657869737420666f7220746865206f726760008201527f616e697a6174696f6e0000000000000000000000000000000000000000000000602082015250565b6000611f31602983611bf3565b9150611f3c82611ed5565b604082019050919050565b60006020820190508181036000830152611f6081611f24565b9050919050565b7f4e6f7420616e2061646d696e206f6620746865206f7267616e697a6174696f6e600082015250565b6000611f9d602083611bf3565b9150611fa882611f67565b602082019050919050565b60006020820190508181036000830152611fcc81611f90565b9050919050565b7f4d65746572206973206e6f74206120636f756e74206d65746572000000000000600082015250565b6000612009601a83611bf3565b915061201482611fd3565b602082019050919050565b6000602082019050818103600083015261203881611ffc565b9050919050565b7f4d65746572206973206e6f7420612073756d206d657465720000000000000000600082015250565b6000612075601883611bf3565b91506120808261203f565b602082019050919050565b600060208201905081810360008301526120a481612068565b9050919050565b60006120b68261159a565b91506120c18361159a565b92508282019050808211156120d9576120d8611d9d565b5b92915050565b7f43616c6c6572206e6f7420617574686f72697a65640000000000000000000000600082015250565b6000612115601583611bf3565b9150612120826120df565b602082019050919050565b6000602082019050818103600083015261214481612108565b9050919050565b61215481611e14565b82525050565b600060408201905061216f6000830185611a5c565b61217c602083018461214b565b9392505050565b60008151905061219281611ad9565b92915050565b6000602082840312156121ae576121ad6114d5565b5b60006121bc84828501612183565b9150509291505056fea2646970667358221220904417fcb09e78958e917caf50a0b96b459fd3a28ac6ec31f595e4fd5023864164736f6c63430008180033";

type UsageRecorderConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: UsageRecorderConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class UsageRecorder__factory extends ContractFactory {
  constructor(...args: UsageRecorderConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override getDeployTransaction(
    _contractRegistry: AddressLike,
    overrides?: NonPayableOverrides & { from?: string }
  ): Promise<ContractDeployTransaction> {
    return super.getDeployTransaction(_contractRegistry, overrides || {});
  }
  override deploy(
    _contractRegistry: AddressLike,
    overrides?: NonPayableOverrides & { from?: string }
  ) {
    return super.deploy(_contractRegistry, overrides || {}) as Promise<
      UsageRecorder & {
        deploymentTransaction(): ContractTransactionResponse;
      }
    >;
  }
  override connect(runner: ContractRunner | null): UsageRecorder__factory {
    return super.connect(runner) as UsageRecorder__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): UsageRecorderInterface {
    return new Interface(_abi) as UsageRecorderInterface;
  }
  static connect(
    address: string,
    runner?: ContractRunner | null
  ): UsageRecorder {
    return new Contract(address, _abi, runner) as unknown as UsageRecorder;
  }
}
