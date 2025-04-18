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
  RenewalProcessor,
  RenewalProcessorInterface,
} from "../../renewal/RenewalProcessor";

const _abi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "_registry",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [],
    name: "ReentrancyGuardReentrantCall",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "orgId",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "productPassId",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "productId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "enum IRenewalProcessor.RenewalStatus",
        name: "status",
        type: "uint8",
      },
    ],
    name: "RenewalProcessed",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_passId",
        type: "uint256",
      },
    ],
    name: "getAllPassRenewalStatus",
    outputs: [
      {
        components: [
          {
            internalType: "uint256",
            name: "passId",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "productId",
            type: "uint256",
          },
          {
            components: [
              {
                internalType: "uint256",
                name: "orgId",
                type: "uint256",
              },
              {
                internalType: "uint256",
                name: "pricingId",
                type: "uint256",
              },
              {
                internalType: "uint256",
                name: "startDate",
                type: "uint256",
              },
              {
                internalType: "uint256",
                name: "endDate",
                type: "uint256",
              },
              {
                internalType: "uint256",
                name: "timeRemaining",
                type: "uint256",
              },
              {
                internalType: "bool",
                name: "isCancelled",
                type: "bool",
              },
              {
                internalType: "bool",
                name: "isPaused",
                type: "bool",
              },
            ],
            internalType: "struct ISubscriptionEscrow.Subscription",
            name: "subscription",
            type: "tuple",
          },
          {
            internalType: "enum ISubscriptionEscrow.SubscriptionStatus",
            name: "subStatus",
            type: "uint8",
          },
          {
            internalType: "enum IRenewalProcessor.RenewalStatus",
            name: "renewalStatus",
            type: "uint8",
          },
        ],
        internalType: "struct IRenewalProcessor.PassRenewalStatus[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256[]",
        name: "_passIds",
        type: "uint256[]",
      },
    ],
    name: "getAllPassRenewalStatusBatch",
    outputs: [
      {
        components: [
          {
            internalType: "uint256",
            name: "passId",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "productId",
            type: "uint256",
          },
          {
            components: [
              {
                internalType: "uint256",
                name: "orgId",
                type: "uint256",
              },
              {
                internalType: "uint256",
                name: "pricingId",
                type: "uint256",
              },
              {
                internalType: "uint256",
                name: "startDate",
                type: "uint256",
              },
              {
                internalType: "uint256",
                name: "endDate",
                type: "uint256",
              },
              {
                internalType: "uint256",
                name: "timeRemaining",
                type: "uint256",
              },
              {
                internalType: "bool",
                name: "isCancelled",
                type: "bool",
              },
              {
                internalType: "bool",
                name: "isPaused",
                type: "bool",
              },
            ],
            internalType: "struct ISubscriptionEscrow.Subscription",
            name: "subscription",
            type: "tuple",
          },
          {
            internalType: "enum ISubscriptionEscrow.SubscriptionStatus",
            name: "subStatus",
            type: "uint8",
          },
          {
            internalType: "enum IRenewalProcessor.RenewalStatus",
            name: "renewalStatus",
            type: "uint8",
          },
        ],
        internalType: "struct IRenewalProcessor.PassRenewalStatus[][]",
        name: "passRenewalStatus",
        type: "tuple[][]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_passId",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_productId",
        type: "uint256",
      },
    ],
    name: "getSingleProductRenewalStatus",
    outputs: [
      {
        components: [
          {
            internalType: "uint256",
            name: "passId",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "productId",
            type: "uint256",
          },
          {
            components: [
              {
                internalType: "uint256",
                name: "orgId",
                type: "uint256",
              },
              {
                internalType: "uint256",
                name: "pricingId",
                type: "uint256",
              },
              {
                internalType: "uint256",
                name: "startDate",
                type: "uint256",
              },
              {
                internalType: "uint256",
                name: "endDate",
                type: "uint256",
              },
              {
                internalType: "uint256",
                name: "timeRemaining",
                type: "uint256",
              },
              {
                internalType: "bool",
                name: "isCancelled",
                type: "bool",
              },
              {
                internalType: "bool",
                name: "isPaused",
                type: "bool",
              },
            ],
            internalType: "struct ISubscriptionEscrow.Subscription",
            name: "subscription",
            type: "tuple",
          },
          {
            internalType: "enum ISubscriptionEscrow.SubscriptionStatus",
            name: "subStatus",
            type: "uint8",
          },
          {
            internalType: "enum IRenewalProcessor.RenewalStatus",
            name: "renewalStatus",
            type: "uint8",
          },
        ],
        internalType: "struct IRenewalProcessor.PassRenewalStatus",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256[]",
        name: "_passIds",
        type: "uint256[]",
      },
      {
        internalType: "uint256[]",
        name: "_productIds",
        type: "uint256[]",
      },
    ],
    name: "getSingleProductRenewalStatusBatch",
    outputs: [
      {
        components: [
          {
            internalType: "uint256",
            name: "passId",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "productId",
            type: "uint256",
          },
          {
            components: [
              {
                internalType: "uint256",
                name: "orgId",
                type: "uint256",
              },
              {
                internalType: "uint256",
                name: "pricingId",
                type: "uint256",
              },
              {
                internalType: "uint256",
                name: "startDate",
                type: "uint256",
              },
              {
                internalType: "uint256",
                name: "endDate",
                type: "uint256",
              },
              {
                internalType: "uint256",
                name: "timeRemaining",
                type: "uint256",
              },
              {
                internalType: "bool",
                name: "isCancelled",
                type: "bool",
              },
              {
                internalType: "bool",
                name: "isPaused",
                type: "bool",
              },
            ],
            internalType: "struct ISubscriptionEscrow.Subscription",
            name: "subscription",
            type: "tuple",
          },
          {
            internalType: "enum ISubscriptionEscrow.SubscriptionStatus",
            name: "subStatus",
            type: "uint8",
          },
          {
            internalType: "enum IRenewalProcessor.RenewalStatus",
            name: "renewalStatus",
            type: "uint8",
          },
        ],
        internalType: "struct IRenewalProcessor.PassRenewalStatus[]",
        name: "passRenewalStatus",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_passId",
        type: "uint256",
      },
    ],
    name: "processAllPassRenewal",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256[]",
        name: "_passIds",
        type: "uint256[]",
      },
    ],
    name: "processAllPassRenewalBatch",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_passId",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_productId",
        type: "uint256",
      },
    ],
    name: "processSingleProductRenewal",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256[]",
        name: "_passIds",
        type: "uint256[]",
      },
      {
        internalType: "uint256[]",
        name: "_productIds",
        type: "uint256[]",
      },
    ],
    name: "processSingleProductRenewalBatch",
    outputs: [],
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
  "0x608060405234801561001057600080fd5b50604051611a51380380611a5183398101604081905261002f91610059565b600080546001600160a01b0319166001600160a01b03929092169190911790556001603355610089565b60006020828403121561006b57600080fd5b81516001600160a01b038116811461008257600080fd5b9392505050565b6119b9806100986000396000f3fe608060405234801561001057600080fd5b506004361061009e5760003560e01c8063a02b046e11610066578063a02b046e1461014b578063a07ca4f81461015e578063a4047f1b1461017e578063b9dfd48614610191578063d8bb4c20146101a457600080fd5b806301ffc9a7146100a35780636d966025146100cb5780637b103999146100eb5780638ea1b2da146101165780639552a1e81461012b575b600080fd5b6100b66100b1366004611426565b6101b7565b60405190151581526020015b60405180910390f35b6100de6100d9366004611553565b6101ee565b6040516100c29190611645565b6000546100fe906001600160a01b031681565b6040516001600160a01b0390911681526020016100c2565b6101296101243660046116da565b6103a1565b005b61013e6101393660046116da565b6104a2565b6040516100c291906116fc565b61012961015936600461170b565b610512565b61017161016c366004611724565b610587565b6040516100c29190611788565b61012961018c366004611724565b61074e565b61017161019f36600461170b565b6108ac565b6101296101b2366004611553565b610914565b60006001600160e01b03198216632cd48d0f60e21b14806101e857506001600160e01b031982166301ffc9a760e01b145b92915050565b60606101f982610a5a565b815167ffffffffffffffff81111561021357610213611450565b60405190808252806020026020018201604052801561024657816020015b60608152602001906001900390816102315790505b50905060008060009054906101000a90046001600160a01b03166001600160a01b0316635cbf60cc6040518163ffffffff1660e01b8152600401602060405180830381865afa15801561029d573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906102c191906117d7565b6001600160a01b03166346dab4956040518163ffffffff1660e01b8152600401602060405180830381865afa1580156102fe573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906103229190611800565b905060005b835181101561039a5761035384828151811061034557610345611819565b602002602001015183610aa7565b61037584828151811061036857610368611819565b6020026020010151610b56565b83828151811061038757610387611819565b6020908102919091010152600101610327565b5050919050565b816104818160008054906101000a90046001600160a01b03166001600160a01b0316635cbf60cc6040518163ffffffff1660e01b8152600401602060405180830381865afa1580156103f7573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061041b91906117d7565b6001600160a01b03166346dab4956040518163ffffffff1660e01b8152600401602060405180830381865afa158015610458573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061047c9190611800565b610aa7565b610489610cd7565b6104938383610d01565b61049d6001603355565b505050565b6104aa6113b6565b826105008160008054906101000a90046001600160a01b03166001600160a01b0316635cbf60cc6040518163ffffffff1660e01b8152600401602060405180830381865afa1580156103f7573d6000803e3d6000fd5b61050a848461104b565b949350505050565b806105688160008054906101000a90046001600160a01b03166001600160a01b0316635cbf60cc6040518163ffffffff1660e01b8152600401602060405180830381865afa1580156103f7573d6000803e3d6000fd5b610570610cd7565b610579826111dc565b6105836001603355565b5050565b606061059383836112f2565b825167ffffffffffffffff8111156105ad576105ad611450565b6040519080825280602002602001820160405280156105e657816020015b6105d36113b6565b8152602001906001900390816105cb5790505b50905060008060009054906101000a90046001600160a01b03166001600160a01b0316635cbf60cc6040518163ffffffff1660e01b8152600401602060405180830381865afa15801561063d573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061066191906117d7565b6001600160a01b03166346dab4956040518163ffffffff1660e01b8152600401602060405180830381865afa15801561069e573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906106c29190611800565b905060005b8451811015610746576106e585828151811061034557610345611819565b6107218582815181106106fa576106fa611819565b602002602001015185838151811061071457610714611819565b602002602001015161104b565b83828151811061073357610733611819565b60209081029190910101526001016106c7565b505092915050565b610756610cd7565b61076082826112f2565b60008060009054906101000a90046001600160a01b03166001600160a01b0316635cbf60cc6040518163ffffffff1660e01b8152600401602060405180830381865afa1580156107b4573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906107d891906117d7565b6001600160a01b03166346dab4956040518163ffffffff1660e01b8152600401602060405180830381865afa158015610815573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906108399190611800565b905060005b83518110156108a05761085c84828151811061034557610345611819565b61089884828151811061087157610871611819565b602002602001015184838151811061088b5761088b611819565b6020026020010151610d01565b60010161083e565b50506105836001603355565b6060816109048160008054906101000a90046001600160a01b03166001600160a01b0316635cbf60cc6040518163ffffffff1660e01b8152600401602060405180830381865afa1580156103f7573d6000803e3d6000fd5b61090d83610b56565b9392505050565b61091c610cd7565b61092581610a5a565b60008060009054906101000a90046001600160a01b03166001600160a01b0316635cbf60cc6040518163ffffffff1660e01b8152600401602060405180830381865afa158015610979573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061099d91906117d7565b6001600160a01b03166346dab4956040518163ffffffff1660e01b8152600401602060405180830381865afa1580156109da573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906109fe9190611800565b905060005b8251811015610a4b57610a2183828151811061034557610345611819565b610a43838281518110610a3657610a36611819565b60200260200101516111dc565b600101610a03565b5050610a576001603355565b50565b6000815111610a575760405162461bcd60e51b8152602060048201526014602482015273139bc81c185cdcc812511cc81c1c9bdd9a59195960621b60448201526064015b60405180910390fd5b60008211610af75760405162461bcd60e51b815260206004820152601e60248201527f50617373204944206d7573742062652067726561746572207468616e203000006044820152606401610a9e565b808211156105835760405162461bcd60e51b815260206004820152602660248201527f50617373204944206d757374206265206c657373207468616e20746f74616c20604482015265737570706c7960d01b6064820152608401610a9e565b6000805460408051637e49aa7d60e11b81529051606093926001600160a01b03169163fc9354fa9160048083019260209291908290030181865afa158015610ba2573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610bc691906117d7565b6001600160a01b03166348f3c0e3846040518263ffffffff1660e01b8152600401610bf391815260200190565b600060405180830381865afa158015610c10573d6000803e3d6000fd5b505050506040513d6000823e601f3d908101601f19168201604052610c38919081019061182f565b9050805167ffffffffffffffff811115610c5457610c54611450565b604051908082528060200260200182016040528015610c8d57816020015b610c7a6113b6565b815260200190600190039081610c725790505b50915060005b815181101561039a57610cb28483838151811061071457610714611819565b838281518110610cc457610cc4611819565b6020908102919091010152600101610c93565b600260335403610cfa57604051633ee5aeb560e01b815260040160405180910390fd5b6002603355565b6000805460408051637e49aa7d60e11b8152905183926001600160a01b03169163fc9354fa9160048083019260209291908290030181865afa158015610d4b573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610d6f91906117d7565b60405163a461efb960e01b815260048101869052602481018590526001600160a01b03919091169063a461efb99060440161010060405180830381865afa158015610dbe573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610de291906118e4565b509050610df28160600151421190565b610dff5760029150610f0f565b8060a0015115610e125760039150610f0f565b8060c0015115610e255760049150610f0f565b60008054906101000a90046001600160a01b03166001600160a01b0316635cbf60cc6040518163ffffffff1660e01b8152600401602060405180830381865afa158015610e76573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610e9a91906117d7565b604051633bc8fa8160e11b81526004810186905260248101859052600060448201526001600160a01b039190911690637791f50290606401600060405180830381600087803b158015610eec57600080fd5b505af1925050508015610efd575060015b610f0a5760019150610f0f565b600091505b6002826005811115610f2357610f23611588565b1461104557828460008054906101000a90046001600160a01b03166001600160a01b031663eebc3a696040518163ffffffff1660e01b8152600401602060405180830381865afa158015610f7b573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610f9f91906117d7565b6001600160a01b03166382f205dd876040518263ffffffff1660e01b8152600401610fcc91815260200190565b602060405180830381865afa158015610fe9573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061100d9190611800565b7f98309b18044647fd2d369a17c729e099f429fdc51683b0c21cdadd14f48f26ae8560405161103c9190611975565b60405180910390a45b50505050565b6110536113b6565b6000805460408051637e49aa7d60e11b8152905183926001600160a01b03169163fc9354fa9160048083019260209291908290030181865afa15801561109d573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906110c191906117d7565b60405163a461efb960e01b815260048101879052602481018690526001600160a01b03919091169063a461efb99060440161010060405180830381865afa158015611110573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061113491906118e4565b868552602085018690526040850182905290925090506060830181600381111561116057611160611588565b9081600381111561117357611173611588565b905250606082015142116111a3576080830160025b9081600581111561119b5761119b611588565b905250610746565b8160a00151156111b857608083016003611188565b8160c00151156111cd57608083016004611188565b50506005608082015292915050565b60008060009054906101000a90046001600160a01b03166001600160a01b031663fc9354fa6040518163ffffffff1660e01b8152600401602060405180830381865afa158015611230573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061125491906117d7565b6001600160a01b03166348f3c0e3836040518263ffffffff1660e01b815260040161128191815260200190565b600060405180830381865afa15801561129e573d6000803e3d6000fd5b505050506040513d6000823e601f3d908101601f191682016040526112c6919081019061182f565b905060005b815181101561049d576112ea8383838151811061088b5761088b611819565b6001016112cb565b6112fb82610a5a565b600081511161134c5760405162461bcd60e51b815260206004820152601760248201527f4e6f2070726f64756374204944732070726f76696465640000000000000000006044820152606401610a9e565b80518251146105835760405162461bcd60e51b815260206004820152603060248201527f506173732049447320616e642070726f6475637420494473206d75737420626560448201526f040e8d0ca40e6c2daca40d8cadccee8d60831b6064820152608401610a9e565b6040518060a0016040528060008152602001600081526020016114136040518060e0016040528060008152602001600081526020016000815260200160008152602001600081526020016000151581526020016000151581525090565b8152602001600081526020016000905290565b60006020828403121561143857600080fd5b81356001600160e01b03198116811461090d57600080fd5b634e487b7160e01b600052604160045260246000fd5b60405160e0810167ffffffffffffffff8111828210171561148957611489611450565b60405290565b604051601f8201601f1916810167ffffffffffffffff811182821017156114b8576114b8611450565b604052919050565b600067ffffffffffffffff8211156114da576114da611450565b5060051b60200190565b600082601f8301126114f557600080fd5b8135602061150a611505836114c0565b61148f565b8083825260208201915060208460051b87010193508684111561152c57600080fd5b602086015b848110156115485780358352918301918301611531565b509695505050505050565b60006020828403121561156557600080fd5b813567ffffffffffffffff81111561157c57600080fd5b61050a848285016114e4565b634e487b7160e01b600052602160045260246000fd5b600481106115ae576115ae611588565b9052565b600681106115ae576115ae611588565b80518252602081015160208301526040810151805160408401526020810151606084015260408101516080840152606081015160a0840152608081015160c084015260a0810151151560e084015260c0810151151561010084015250606081015161163161012084018261159e565b50608081015161049d6101408401826115b2565b6000602080830181845280855180835260408601915060408160051b87010192508387016000805b838110156116cc57888603603f19018552825180518088529088019088880190845b818110156116b6576116a28385516115c2565b928a0192610160929092019160010161168f565b509097505050938601939186019160010161166d565b509398975050505050505050565b600080604083850312156116ed57600080fd5b50508035926020909101359150565b61016081016101e882846115c2565b60006020828403121561171d57600080fd5b5035919050565b6000806040838503121561173757600080fd5b823567ffffffffffffffff8082111561174f57600080fd5b61175b868387016114e4565b9350602085013591508082111561177157600080fd5b5061177e858286016114e4565b9150509250929050565b6020808252825182820181905260009190848201906040850190845b818110156117cb576117b78385516115c2565b9284019261016092909201916001016117a4565b50909695505050505050565b6000602082840312156117e957600080fd5b81516001600160a01b038116811461090d57600080fd5b60006020828403121561181257600080fd5b5051919050565b634e487b7160e01b600052603260045260246000fd5b6000602080838503121561184257600080fd5b825167ffffffffffffffff81111561185957600080fd5b8301601f8101851361186a57600080fd5b8051611878611505826114c0565b81815260059190911b8201830190838101908783111561189757600080fd5b928401925b828410156118b55783518252928401929084019061189c565b979650505050505050565b805180151581146118d057600080fd5b919050565b8051600481106118d057600080fd5b6000808284036101008112156118f957600080fd5b60e081121561190757600080fd5b50611910611466565b835181526020840151602082015260408401516040820152606084015160608201526080840151608082015261194860a085016118c0565b60a082015261195960c085016118c0565b60c0820152915061196c60e084016118d5565b90509250929050565b602081016101e882846115b256fea26469706673582212201667206d9e024eda547d2fee8eb5745a55a076ae2f86c9abf558fb7bdfeb6bd564736f6c63430008180033";

type RenewalProcessorConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: RenewalProcessorConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class RenewalProcessor__factory extends ContractFactory {
  constructor(...args: RenewalProcessorConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override getDeployTransaction(
    _registry: AddressLike,
    overrides?: NonPayableOverrides & { from?: string }
  ): Promise<ContractDeployTransaction> {
    return super.getDeployTransaction(_registry, overrides || {});
  }
  override deploy(
    _registry: AddressLike,
    overrides?: NonPayableOverrides & { from?: string }
  ) {
    return super.deploy(_registry, overrides || {}) as Promise<
      RenewalProcessor & {
        deploymentTransaction(): ContractTransactionResponse;
      }
    >;
  }
  override connect(runner: ContractRunner | null): RenewalProcessor__factory {
    return super.connect(runner) as RenewalProcessor__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): RenewalProcessorInterface {
    return new Interface(_abi) as RenewalProcessorInterface;
  }
  static connect(
    address: string,
    runner?: ContractRunner | null
  ): RenewalProcessor {
    return new Contract(address, _abi, runner) as unknown as RenewalProcessor;
  }
}
