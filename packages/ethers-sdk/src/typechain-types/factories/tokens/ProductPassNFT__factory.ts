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
  ProductPassNFT,
  ProductPassNFTInterface,
} from "../../tokens/ProductPassNFT";

const _abi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "_contractRegistry",
        type: "address",
      },
      {
        internalType: "address",
        name: "_metadataProvider",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
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
        name: "tokenId",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
    ],
    name: "ERC721IncorrectOwner",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "operator",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "ERC721InsufficientApproval",
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
    name: "ERC721InvalidApprover",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "operator",
        type: "address",
      },
    ],
    name: "ERC721InvalidOperator",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
    ],
    name: "ERC721InvalidOwner",
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
    name: "ERC721InvalidReceiver",
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
    name: "ERC721InvalidSender",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "ERC721NonexistentToken",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
    ],
    name: "OwnableInvalidOwner",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "OwnableUnauthorizedAccount",
    type: "error",
  },
  {
    inputs: [],
    name: "ProductsNotTransferable",
    type: "error",
  },
  {
    inputs: [],
    name: "SubscriptionsNotTransferable",
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
        name: "approved",
        type: "address",
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "tokenId",
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
        name: "owner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "operator",
        type: "address",
      },
      {
        indexed: false,
        internalType: "bool",
        name: "approved",
        type: "bool",
      },
    ],
    name: "ApprovalForAll",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "previousProvider",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newProvider",
        type: "address",
      },
    ],
    name: "MetadataProviderSet",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "previousOwner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "OwnershipTransferStarted",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "previousOwner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "OwnershipTransferred",
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
        indexed: true,
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "Transfer",
    type: "event",
  },
  {
    inputs: [],
    name: "acceptOwnership",
    outputs: [],
    stateMutability: "nonpayable",
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
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "approve",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "owner",
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
    inputs: [
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "canTransfer",
    outputs: [],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "getApproved",
    outputs: [
      {
        internalType: "address",
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
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        internalType: "address",
        name: "operator",
        type: "address",
      },
    ],
    name: "isApprovedForAll",
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
    inputs: [],
    name: "metadataProvider",
    outputs: [
      {
        internalType: "address",
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
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "tokenId",
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
    inputs: [],
    name: "owner",
    outputs: [
      {
        internalType: "address",
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
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "ownerOf",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "pendingOwner",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
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
    inputs: [],
    name: "renounceOwnership",
    outputs: [],
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
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "safeTransferFrom",
    outputs: [],
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
        name: "tokenId",
        type: "uint256",
      },
      {
        internalType: "bytes",
        name: "data",
        type: "bytes",
      },
    ],
    name: "safeTransferFrom",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "operator",
        type: "address",
      },
      {
        internalType: "bool",
        name: "approved",
        type: "bool",
      },
    ],
    name: "setApprovalForAll",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_metadataProvider",
        type: "address",
      },
    ],
    name: "setMetadataProvider",
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
    stateMutability: "view",
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
    inputs: [
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "tokenURI",
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
        internalType: "uint256[]",
        name: "tokenIds",
        type: "uint256[]",
      },
    ],
    name: "tokenURIBatch",
    outputs: [
      {
        internalType: "string[]",
        name: "",
        type: "string[]",
      },
    ],
    stateMutability: "view",
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
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "transferFrom",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

const _bytecode =
  "0x60806040523480156200001157600080fd5b5060405162001e2b38038062001e2b8339810160408190526200003491620002c3565b8133826040518060400160405280601c81526020017f50726f647563744d696e742050726f647563742050617373204e465400000000815250604051806040016040528060048152602001635041535360e01b81525081600090816200009b9190620003a2565b506001620000aa8282620003a2565b505050620000be816200012460201b60201c565b506001600160a01b038116620000ef57604051631e4fbdf760e01b8152600060048201526024015b60405180910390fd5b620000fa8162000236565b50603b80546001600160a01b0319166001600160a01b039290921691909117905550620004999050565b6040516301ffc9a760e01b8152636031680160e01b60048201526001600160a01b038216906301ffc9a790602401602060405180830381865afa15801562000170573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906200019691906200046e565b620001e45760405162461bcd60e51b815260206004820152601960248201527f496e76616c6964206d657461646174612070726f7669646572000000000000006044820152606401620000e6565b600680546001600160a01b038381166001600160a01b0319831681179093556040519116919082907fe0c13e13c39b03cb3360959923be0657f81f28d8f7f1c744dea0deb1726f322590600090a35050565b603a80546001600160a01b0319169055620002518162000254565b50565b603980546001600160a01b038381166001600160a01b0319831681179093556040519116919082907f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e090600090a35050565b80516001600160a01b0381168114620002be57600080fd5b919050565b60008060408385031215620002d757600080fd5b620002e283620002a6565b9150620002f260208401620002a6565b90509250929050565b634e487b7160e01b600052604160045260246000fd5b600181811c908216806200032657607f821691505b6020821081036200034757634e487b7160e01b600052602260045260246000fd5b50919050565b601f8211156200039d576000816000526020600020601f850160051c81016020861015620003785750805b601f850160051c820191505b81811015620003995782815560010162000384565b5050505b505050565b81516001600160401b03811115620003be57620003be620002fb565b620003d681620003cf845462000311565b846200034d565b602080601f8311600181146200040e5760008415620003f55750858301515b600019600386901b1c1916600185901b17855562000399565b600085815260208120601f198616915b828110156200043f578886015182559484019460019091019084016200041e565b50858210156200045e5787850151600019600388901b60f8161c191681555b5050505050600190811b01905550565b6000602082840312156200048157600080fd5b815180151581146200049257600080fd5b9392505050565b61198280620004a96000396000f3fe608060405234801561001057600080fd5b50600436106101585760003560e01c806379ba5097116100c3578063b88d4fde1161007c578063b88d4fde146102dc578063c87b56dd146102ef578063d3d72d2a14610302578063e30c397814610315578063e985e9c514610326578063f2fde38b1461033957600080fd5b806379ba5097146102755780637b1039991461027d5780638d38e365146102905780638da5cb5b146102b057806395d89b41146102c1578063a22cb465146102c957600080fd5b806342842e0e1161011557806342842e0e146102005780634d4f6ea9146102135780636352211e1461022657806364b094021461023957806370a082311461024c578063715018a61461026d57600080fd5b806301ffc9a71461015d57806306fdde0314610185578063081812fc1461019a578063095ea7b3146101c557806323b872dd146101da57806340c10f19146101ed575b600080fd5b61017061016b366004611318565b61034c565b60405190151581526020015b60405180910390f35b61018d610377565b60405161017c919061138c565b6101ad6101a836600461139f565b610409565b6040516001600160a01b03909116815260200161017c565b6101d86101d33660046113cd565b610432565b005b6101d86101e83660046113f9565b610441565b6101d86101fb3660046113cd565b6104d1565b6101d861020e3660046113f9565b610560565b6101d861022136600461139f565b61057b565b6101ad61023436600461139f565b61085f565b6101d861024736600461143a565b61086a565b61025f61025a36600461143a565b61087e565b60405190815260200161017c565b6101d86108c6565b6101d86108da565b603b546101ad906001600160a01b031681565b6102a361029e3660046114c2565b61091b565b60405161017c9190611558565b6039546001600160a01b03166101ad565b61018d6109c9565b6101d86102d73660046115ca565b6109d8565b6101d86102ea36600461162b565b6109e3565b61018d6102fd36600461139f565b6109fb565b6006546101ad906001600160a01b031681565b603a546001600160a01b03166101ad565b6101706103343660046116d5565b610a78565b6101d861034736600461143a565b610aa6565b60006001600160e01b031982166340c10f1960e01b1480610371575061037182610b17565b92915050565b60606000805461038690611703565b80601f01602080910402602001604051908101604052809291908181526020018280546103b290611703565b80156103ff5780601f106103d4576101008083540402835291602001916103ff565b820191906000526020600020905b8154815290600101906020018083116103e257829003601f168201915b5050505050905090565b600061041482610b67565b506000828152600460205260409020546001600160a01b0316610371565b61043d828233610ba0565b5050565b6001600160a01b03821661047057604051633250574960e11b8152600060048201526024015b60405180910390fd5b600061047d838333610bad565b9050836001600160a01b0316816001600160a01b0316146104cb576040516364283d7b60e01b81526001600160a01b0380861660048301526024820184905282166044820152606401610467565b50505050565b603b60009054906101000a90046001600160a01b03166001600160a01b0316635cbf60cc6040518163ffffffff1660e01b8152600401602060405180830381865afa158015610524573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610548919061173d565b61055181610be6565b61055b8383610c36565b505050565b61055b838383604051806020016040528060008152506109e3565b603b546040805163eebc3a6960e01b815290516000926001600160a01b03169163eebc3a699160048083019260209291908290030181865afa1580156105c5573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906105e9919061173d565b6001600160a01b031663036f8f9d836040518263ffffffff1660e01b815260040161061691815260200190565b600060405180830381865afa158015610633573d6000803e3d6000fd5b505050506040513d6000823e601f3d908101601f1916820160405261065b919081019061175a565b9050603b60009054906101000a90046001600160a01b03166001600160a01b0316635ee2173f6040518163ffffffff1660e01b8152600401602060405180830381865afa1580156106b0573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906106d4919061173d565b6001600160a01b0316635b2cfe1c826040518263ffffffff1660e01b81526004016106ff919061181c565b602060405180830381865afa15801561071c573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610740919061182f565b61075d57604051633ee7645360e21b815260040160405180910390fd5b603b60009054906101000a90046001600160a01b03166001600160a01b0316634ce918626040518163ffffffff1660e01b8152600401602060405180830381865afa1580156107b0573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906107d4919061173d565b6001600160a01b0316639503c02883836040518363ffffffff1660e01b815260040161080192919061184c565b602060405180830381865afa15801561081e573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610842919061182f565b61043d57604051633efe9b4360e11b815260040160405180910390fd5b600061037182610b67565b610872610c50565b61087b81610c7d565b50565b60006001600160a01b0382166108aa576040516322718ad960e21b815260006004820152602401610467565b506001600160a01b031660009081526003602052604090205490565b6108ce610c50565b6108d86000610d8a565b565b603a5433906001600160a01b031681146109125760405163118cdaa760e01b81526001600160a01b0382166004820152602401610467565b61087b81610d8a565b60606000825167ffffffffffffffff81111561093957610939611457565b60405190808252806020026020018201604052801561096c57816020015b60608152602001906001900390816109575790505b50905060005b83518110156109c25761099d84828151811061099057610990611865565b60200260200101516109fb565b8282815181106109af576109af611865565b6020908102919091010152600101610972565b5092915050565b60606001805461038690611703565b61043d338383610da3565b6109ee848484610441565b6104cb3385858585610e42565b6060610a0682610b67565b50600654604051636031680160e01b8152600481018490526001600160a01b0390911690636031680190602401600060405180830381865afa158015610a50573d6000803e3d6000fd5b505050506040513d6000823e601f3d908101601f19168201604052610371919081019061187b565b6001600160a01b03918216600090815260056020908152604080832093909416825291909152205460ff1690565b610aae610c50565b603a80546001600160a01b0383166001600160a01b03199091168117909155610adf6039546001600160a01b031690565b6001600160a01b03167f38d16b8cac22d99fc7c124b9cd0de2d3fa1faef420bfe791d8c362d765e2270060405160405180910390a350565b60006001600160e01b031982166380ac58cd60e01b1480610b4857506001600160e01b03198216635b5e139f60e01b145b8061037157506301ffc9a760e01b6001600160e01b0319831614610371565b6000818152600260205260408120546001600160a01b03168061037157604051637e27328960e01b815260048101849052602401610467565b61055b8383836001610f6d565b6000828152600260205260408120546001600160a01b031615610bd357610bd38361057b565b610bde848484611073565b949350505050565b336001600160a01b0382161461087b5760405162461bcd60e51b815260206004820152601560248201527410d85b1b195c881b9bdd08185d5d1a1bdc9a5e9959605a1b6044820152606401610467565b61043d82826040518060200160405280600081525061116c565b6039546001600160a01b031633146108d85760405163118cdaa760e01b8152336004820152602401610467565b6040516301ffc9a760e01b8152636031680160e01b60048201526001600160a01b038216906301ffc9a790602401602060405180830381865afa158015610cc8573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610cec919061182f565b610d385760405162461bcd60e51b815260206004820152601960248201527f496e76616c6964206d657461646174612070726f7669646572000000000000006044820152606401610467565b600680546001600160a01b038381166001600160a01b0319831681179093556040519116919082907fe0c13e13c39b03cb3360959923be0657f81f28d8f7f1c744dea0deb1726f322590600090a35050565b603a80546001600160a01b031916905561087b81611184565b6001600160a01b038216610dd557604051630b61174360e31b81526001600160a01b0383166004820152602401610467565b6001600160a01b03838116600081815260056020908152604080832094871680845294825291829020805460ff191686151590811790915591519182527f17307eab39ab6107e8899845ad3d59bd9653f200f220920489ca2b5937696c31910160405180910390a3505050565b6001600160a01b0383163b15610f6657604051630a85bd0160e11b81526001600160a01b0384169063150b7a0290610e849088908890879087906004016118f2565b6020604051808303816000875af1925050508015610ebf575060408051601f3d908101601f19168201909252610ebc9181019061192f565b60015b610f28573d808015610eed576040519150601f19603f3d011682016040523d82523d6000602084013e610ef2565b606091505b508051600003610f2057604051633250574960e11b81526001600160a01b0385166004820152602401610467565b805181602001fd5b6001600160e01b03198116630a85bd0160e11b14610f6457604051633250574960e11b81526001600160a01b0385166004820152602401610467565b505b5050505050565b8080610f8157506001600160a01b03821615155b15611043576000610f9184610b67565b90506001600160a01b03831615801590610fbd5750826001600160a01b0316816001600160a01b031614155b8015610fd05750610fce8184610a78565b155b15610ff95760405163a9fbf51f60e01b81526001600160a01b0384166004820152602401610467565b81156110415783856001600160a01b0316826001600160a01b03167f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b92560405160405180910390a45b505b5050600090815260046020526040902080546001600160a01b0319166001600160a01b0392909216919091179055565b6000828152600260205260408120546001600160a01b03908116908316156110a0576110a08184866111d6565b6001600160a01b038116156110de576110bd600085600080610f6d565b6001600160a01b038116600090815260036020526040902080546000190190555b6001600160a01b0385161561110d576001600160a01b0385166000908152600360205260409020805460010190555b60008481526002602052604080822080546001600160a01b0319166001600160a01b0389811691821790925591518793918516917fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef91a4949350505050565b611176838361123a565b61055b336000858585610e42565b603980546001600160a01b038381166001600160a01b0319831681179093556040519116919082907f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e090600090a35050565b6111e183838361129f565b61055b576001600160a01b03831661120f57604051637e27328960e01b815260048101829052602401610467565b60405163177e802f60e01b81526001600160a01b038316600482015260248101829052604401610467565b6001600160a01b03821661126457604051633250574960e11b815260006004820152602401610467565b600061127283836000610bad565b90506001600160a01b0381161561055b576040516339e3563760e11b815260006004820152602401610467565b60006001600160a01b03831615801590610bde5750826001600160a01b0316846001600160a01b031614806112d957506112d98484610a78565b80610bde5750506000908152600460205260409020546001600160a01b03908116911614919050565b6001600160e01b03198116811461087b57600080fd5b60006020828403121561132a57600080fd5b813561133581611302565b9392505050565b60005b8381101561135757818101518382015260200161133f565b50506000910152565b6000815180845261137881602086016020860161133c565b601f01601f19169290920160200192915050565b6020815260006113356020830184611360565b6000602082840312156113b157600080fd5b5035919050565b6001600160a01b038116811461087b57600080fd5b600080604083850312156113e057600080fd5b82356113eb816113b8565b946020939093013593505050565b60008060006060848603121561140e57600080fd5b8335611419816113b8565b92506020840135611429816113b8565b929592945050506040919091013590565b60006020828403121561144c57600080fd5b8135611335816113b8565b634e487b7160e01b600052604160045260246000fd5b604051601f8201601f1916810167ffffffffffffffff8111828210171561149657611496611457565b604052919050565b600067ffffffffffffffff8211156114b8576114b8611457565b5060051b60200190565b600060208083850312156114d557600080fd5b823567ffffffffffffffff8111156114ec57600080fd5b8301601f810185136114fd57600080fd5b803561151061150b8261149e565b61146d565b81815260059190911b8201830190838101908783111561152f57600080fd5b928401925b8284101561154d57833582529284019290840190611534565b979650505050505050565b600060208083016020845280855180835260408601915060408160051b87010192506020870160005b828110156115af57603f1988860301845261159d858351611360565b94509285019290850190600101611581565b5092979650505050505050565b801515811461087b57600080fd5b600080604083850312156115dd57600080fd5b82356115e8816113b8565b915060208301356115f8816115bc565b809150509250929050565b600067ffffffffffffffff82111561161d5761161d611457565b50601f01601f191660200190565b6000806000806080858703121561164157600080fd5b843561164c816113b8565b9350602085013561165c816113b8565b925060408501359150606085013567ffffffffffffffff81111561167f57600080fd5b8501601f8101871361169057600080fd5b803561169e61150b82611603565b8181528860208385010111156116b357600080fd5b8160208401602083013760006020838301015280935050505092959194509250565b600080604083850312156116e857600080fd5b82356116f3816113b8565b915060208301356115f8816113b8565b600181811c9082168061171757607f821691505b60208210810361173757634e487b7160e01b600052602260045260246000fd5b50919050565b60006020828403121561174f57600080fd5b8151611335816113b8565b6000602080838503121561176d57600080fd5b825167ffffffffffffffff81111561178457600080fd5b8301601f8101851361179557600080fd5b80516117a361150b8261149e565b81815260059190911b820183019083810190878311156117c257600080fd5b928401925b8284101561154d578351825292840192908401906117c7565b60008151808452602080850194506020840160005b83811015611811578151875295820195908201906001016117f5565b509495945050505050565b60208152600061133560208301846117e0565b60006020828403121561184157600080fd5b8151611335816115bc565b828152604060208201526000610bde60408301846117e0565b634e487b7160e01b600052603260045260246000fd5b60006020828403121561188d57600080fd5b815167ffffffffffffffff8111156118a457600080fd5b8201601f810184136118b557600080fd5b80516118c361150b82611603565b8181528560208385010111156118d857600080fd5b6118e982602083016020860161133c565b95945050505050565b6001600160a01b038581168252841660208201526040810183905260806060820181905260009061192590830184611360565b9695505050505050565b60006020828403121561194157600080fd5b81516113358161130256fea264697066735822122035167d5d45cccf2795be6773938cbf6e8811fae977f9474b6ff49f95c05a868864736f6c63430008180033";

type ProductPassNFTConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: ProductPassNFTConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class ProductPassNFT__factory extends ContractFactory {
  constructor(...args: ProductPassNFTConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override getDeployTransaction(
    _contractRegistry: AddressLike,
    _metadataProvider: AddressLike,
    overrides?: NonPayableOverrides & { from?: string }
  ): Promise<ContractDeployTransaction> {
    return super.getDeployTransaction(
      _contractRegistry,
      _metadataProvider,
      overrides || {}
    );
  }
  override deploy(
    _contractRegistry: AddressLike,
    _metadataProvider: AddressLike,
    overrides?: NonPayableOverrides & { from?: string }
  ) {
    return super.deploy(
      _contractRegistry,
      _metadataProvider,
      overrides || {}
    ) as Promise<
      ProductPassNFT & {
        deploymentTransaction(): ContractTransactionResponse;
      }
    >;
  }
  override connect(runner: ContractRunner | null): ProductPassNFT__factory {
    return super.connect(runner) as ProductPassNFT__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): ProductPassNFTInterface {
    return new Interface(_abi) as ProductPassNFTInterface;
  }
  static connect(
    address: string,
    runner?: ContractRunner | null
  ): ProductPassNFT {
    return new Contract(address, _abi, runner) as unknown as ProductPassNFT;
  }
}
