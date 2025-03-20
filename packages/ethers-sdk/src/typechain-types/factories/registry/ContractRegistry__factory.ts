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
import type {
  ContractRegistry,
  ContractRegistryInterface,
} from "../../registry/ContractRegistry";

const _abi = [
  {
    inputs: [],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "hash",
        type: "bytes32",
      },
    ],
    name: "AlreadyLocked",
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
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "string",
        name: "contractName",
        type: "string",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newAddress",
        type: "address",
      },
    ],
    name: "ContractUpdated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "bytes32",
        name: "hash",
        type: "bytes32",
      },
    ],
    name: "Locked",
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
    inputs: [],
    name: "ORG_LOCK",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "PASS_LOCK",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "acceptOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "couponRegistry",
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
    name: "discountRegistry",
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
    name: "orgAdmin",
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
    name: "organizationNFT",
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
    inputs: [],
    name: "paymentEscrow",
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
    name: "pricingCalculator",
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
    name: "pricingRegistry",
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
    name: "productPassNFT",
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
    name: "productRegistry",
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
    name: "productTransferOracle",
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
    name: "purchaseManager",
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
    name: "purchaseRegistry",
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
    name: "renounceOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_couponRegistry",
        type: "address",
      },
    ],
    name: "setCouponRegistry",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_discountRegistry",
        type: "address",
      },
    ],
    name: "setDiscountRegistry",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_orgAdmin",
        type: "address",
      },
    ],
    name: "setOrgAdmin",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_organizationNFT",
        type: "address",
      },
    ],
    name: "setOrganizationNFT",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_paymentEscrow",
        type: "address",
      },
    ],
    name: "setPaymentEscrow",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_pricingCalculator",
        type: "address",
      },
    ],
    name: "setPricingCalculator",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_pricingRegistry",
        type: "address",
      },
    ],
    name: "setPricingRegistry",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_productPassNFT",
        type: "address",
      },
    ],
    name: "setProductPassNFT",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_productRegistry",
        type: "address",
      },
    ],
    name: "setProductRegistry",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_productTransferOracle",
        type: "address",
      },
    ],
    name: "setProductTransferOracle",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_purchaseManager",
        type: "address",
      },
    ],
    name: "setPurchaseManager",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_purchaseRegistry",
        type: "address",
      },
    ],
    name: "setPurchaseRegistry",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_subscriptionEscrow",
        type: "address",
      },
    ],
    name: "setSubscriptionEscrow",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_subscriptionTransferOracle",
        type: "address",
      },
    ],
    name: "setSubscriptionTransferOracle",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_usageRecorder",
        type: "address",
      },
    ],
    name: "setUsageRecorder",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "subscriptionEscrow",
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
    name: "subscriptionTransferOracle",
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
  {
    inputs: [],
    name: "usageRecorder",
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
] as const;

const _bytecode =
  "0x60806040523480156200001157600080fd5b5062000022620000af60201b60201c565b600073ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff1603620000975760006040517f1e4fbdf70000000000000000000000000000000000000000000000000000000081526004016200008e9190620001f9565b60405180910390fd5b620000a881620000b760201b60201c565b5062000216565b600033905090565b600160006101000a81549073ffffffffffffffffffffffffffffffffffffffff0219169055620000ed81620000f060201b60201c565b50565b60008060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff169050816000806101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055508173ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff167f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e060405160405180910390a35050565b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b6000620001e182620001b4565b9050919050565b620001f381620001d4565b82525050565b6000602082019050620002106000830184620001e8565b92915050565b61282480620002266000396000f3fe608060405234801561001057600080fd5b50600436106102325760003560e01c806390f22e9311610130578063d8a2848d116100b8578063f5a7754a1161007c578063f5a7754a146105e5578063f808468414610601578063fb147d311461061d578063fc9354fa14610639578063fff218c31461065757610232565b8063d8a2848d14610553578063e30c39781461056f578063eebc3a691461058d578063f11466cc146105ab578063f2fde38b146105c957610232565b8063a292f7d3116100ff578063a292f7d3146104c1578063aa6afd0d146104df578063b46c70b2146104fb578063bb9d0aaa14610519578063cfd8fe0c1461053557610232565b806390f22e931461044f578063943f0c901461046d57806396b79c9814610489578063a0ee33cb146104a557610232565b806359543973116101be578063715018a611610182578063715018a6146103e3578063758d5931146103ed57806379ba50971461040b5780638a949cb6146104155780638da5cb5b1461043157610232565b8063595439731461034f5780635cbf60cc1461036d5780635ceac7541461038b5780635ee2173f146103a757806365f13673146103c557610232565b8063402cbe8111610205578063402cbe81146102bd5780634ce91862146102db5780634e6bdd97146102f95780635188779314610315578063559735001461033357610232565b806301ffc9a7146102375780630a641392146102675780631e88eff2146102855780632e6c94d9146102a1575b600080fd5b610251600480360381019061024c9190611f36565b610675565b60405161025e9190611f7e565b60405180910390f35b61026f610747565b60405161027c9190611fda565b60405180910390f35b61029f600480360381019061029a9190612021565b61076d565b005b6102bb60048036038101906102b69190612021565b610870565b005b6102c56109fc565b6040516102d29190612067565b60405180910390f35b6102e3610a20565b6040516102f09190611fda565b60405180910390f35b610313600480360381019061030e9190612021565b610a46565b005b61031d610b49565b60405161032a9190611fda565b60405180910390f35b61034d60048036038101906103489190612021565b610b6f565b005b610357610c72565b6040516103649190611fda565b60405180910390f35b610375610c98565b6040516103829190611fda565b60405180910390f35b6103a560048036038101906103a09190612021565b610cbe565b005b6103af610e4a565b6040516103bc9190611fda565b60405180910390f35b6103cd610e70565b6040516103da9190611fda565b60405180910390f35b6103eb610e96565b005b6103f5610eaa565b6040516104029190611fda565b60405180910390f35b610413610ed0565b005b61042f600480360381019061042a9190612021565b610f5f565b005b610439611062565b6040516104469190611fda565b60405180910390f35b61045761108b565b6040516104649190612067565b60405180910390f35b61048760048036038101906104829190612021565b6110af565b005b6104a3600480360381019061049e9190612021565b6111b2565b005b6104bf60048036038101906104ba9190612021565b6112b5565b005b6104c96113b8565b6040516104d69190611fda565b60405180910390f35b6104f960048036038101906104f49190612021565b6113de565b005b6105036114e1565b6040516105109190611fda565b60405180910390f35b610533600480360381019061052e9190612021565b611507565b005b61053d61160a565b60405161054a9190611fda565b60405180910390f35b61056d60048036038101906105689190612021565b611630565b005b610577611733565b6040516105849190611fda565b60405180910390f35b61059561175d565b6040516105a29190611fda565b60405180910390f35b6105b3611783565b6040516105c09190611fda565b60405180910390f35b6105e360048036038101906105de9190612021565b6117a9565b005b6105ff60048036038101906105fa9190612021565b611856565b005b61061b60048036038101906106169190612021565b611959565b005b61063760048036038101906106329190612021565b611a5c565b005b610641611b5f565b60405161064e9190611fda565b60405180910390f35b61065f611b85565b60405161066c9190611fda565b60405180910390f35b60007f4941a442000000000000000000000000000000000000000000000000000000007bffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916827bffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916148061074057507f01ffc9a7000000000000000000000000000000000000000000000000000000007bffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916827bffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916145b9050919050565b600860009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b610775611bab565b6107d5817fa6bd1209000000000000000000000000000000000000000000000000000000006040518060400160405280601281526020017f494f7267616e697a6174696f6e41646d696e0000000000000000000000000000815250611c32565b80600460006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055508073ffffffffffffffffffffffffffffffffffffffff16604051610839906120d9565b60405180910390207ff611fec7babefd259c57ea5b6006acff8140ab17bb816c65ba0aa7e36c09caa860405160405180910390a350565b610878611bab565b6108d8817f80ac58cd000000000000000000000000000000000000000000000000000000006040518060400160405280600781526020017f4945524337323100000000000000000000000000000000000000000000000000815250611c32565b610938817f232d1a69000000000000000000000000000000000000000000000000000000006040518060400160405280601081526020017f494f7267616e697a6174696f6e4e465400000000000000000000000000000000815250611c32565b6109617f5898b3d6d8c01364c32543fbc9aca6145e8f452630878d1e265409183a608330611d13565b80600660006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055508073ffffffffffffffffffffffffffffffffffffffff166040516109c59061213a565b60405180910390207ff611fec7babefd259c57ea5b6006acff8140ab17bb816c65ba0aa7e36c09caa860405160405180910390a350565b7f4488ea798b08fd87ab47d585ed91f1ba62f7a5c8f52231f3af11236d9fcfa01081565b600e60009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b610a4e611bab565b610aae817f5b2cfe1c000000000000000000000000000000000000000000000000000000006040518060400160405280601681526020017f4950726f647563745472616e736665724f7261636c6500000000000000000000815250611c32565b80600d60006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055508073ffffffffffffffffffffffffffffffffffffffff16604051610b129061219b565b60405180910390207ff611fec7babefd259c57ea5b6006acff8140ab17bb816c65ba0aa7e36c09caa860405160405180910390a350565b600a60009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b610b77611bab565b610bd7817f7831b28e000000000000000000000000000000000000000000000000000000006040518060400160405280601181526020017f4950757263686173655265676973747279000000000000000000000000000000815250611c32565b80600960006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055508073ffffffffffffffffffffffffffffffffffffffff16604051610c3b906121fc565b60405180910390207ff611fec7babefd259c57ea5b6006acff8140ab17bb816c65ba0aa7e36c09caa860405160405180910390a350565b600460009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b600360009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b610cc6611bab565b610d26817f80ac58cd000000000000000000000000000000000000000000000000000000006040518060400160405280600781526020017f4945524337323100000000000000000000000000000000000000000000000000815250611c32565b610d86817f40c10f19000000000000000000000000000000000000000000000000000000006040518060400160405280600f81526020017f4950726f64756374506173734e46540000000000000000000000000000000000815250611c32565b610daf7f4488ea798b08fd87ab47d585ed91f1ba62f7a5c8f52231f3af11236d9fcfa010611d13565b80600560006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055508073ffffffffffffffffffffffffffffffffffffffff16604051610e139061225d565b60405180910390207ff611fec7babefd259c57ea5b6006acff8140ab17bb816c65ba0aa7e36c09caa860405160405180910390a350565b600d60009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b601160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b610e9e611bab565b610ea86000611ddc565b565b600560009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b6000610eda611e0d565b90508073ffffffffffffffffffffffffffffffffffffffff16610efb611733565b73ffffffffffffffffffffffffffffffffffffffff1614610f5357806040517f118cdaa7000000000000000000000000000000000000000000000000000000008152600401610f4a9190611fda565b60405180910390fd5b610f5c81611ddc565b50565b610f67611bab565b610fc7817f5b104bcc000000000000000000000000000000000000000000000000000000006040518060400160405280601381526020017f49537562736372697074696f6e457363726f7700000000000000000000000000815250611c32565b80600f60006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055508073ffffffffffffffffffffffffffffffffffffffff1660405161102b906122be565b60405180910390207ff611fec7babefd259c57ea5b6006acff8140ab17bb816c65ba0aa7e36c09caa860405160405180910390a350565b60008060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff16905090565b7f5898b3d6d8c01364c32543fbc9aca6145e8f452630878d1e265409183a60833081565b6110b7611bab565b611117817f2a7feeb8000000000000000000000000000000000000000000000000000000006040518060400160405280600e81526020017f4955736167655265636f72646572000000000000000000000000000000000000815250611c32565b80601160006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055508073ffffffffffffffffffffffffffffffffffffffff1660405161117b9061231f565b60405180910390207ff611fec7babefd259c57ea5b6006acff8140ab17bb816c65ba0aa7e36c09caa860405160405180910390a350565b6111ba611bab565b61121a817f02a09aa3000000000000000000000000000000000000000000000000000000006040518060400160405280601281526020017f4950726963696e6743616c63756c61746f720000000000000000000000000000815250611c32565b80600c60006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055508073ffffffffffffffffffffffffffffffffffffffff1660405161127e90612380565b60405180910390207ff611fec7babefd259c57ea5b6006acff8140ab17bb816c65ba0aa7e36c09caa860405160405180910390a350565b6112bd611bab565b61131d817ffa1da54c000000000000000000000000000000000000000000000000000000006040518060400160405280600f81526020017f49436f75706f6e52656769737472790000000000000000000000000000000000815250611c32565b80600a60006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055508073ffffffffffffffffffffffffffffffffffffffff16604051611381906123e1565b60405180910390207ff611fec7babefd259c57ea5b6006acff8140ab17bb816c65ba0aa7e36c09caa860405160405180910390a350565b601060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b6113e6611bab565b611446817feeeb3984000000000000000000000000000000000000000000000000000000006040518060400160405280601181526020017f49446973636f756e745265676973747279000000000000000000000000000000815250611c32565b80600b60006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055508073ffffffffffffffffffffffffffffffffffffffff166040516114aa90612442565b60405180910390207ff611fec7babefd259c57ea5b6006acff8140ab17bb816c65ba0aa7e36c09caa860405160405180910390a350565b600b60009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b61150f611bab565b61156f817f88f1cef6000000000000000000000000000000000000000000000000000000006040518060400160405280601081526020017f4950757263686173654d616e6167657200000000000000000000000000000000815250611c32565b80600360006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055508073ffffffffffffffffffffffffffffffffffffffff166040516115d3906124a3565b60405180910390207ff611fec7babefd259c57ea5b6006acff8140ab17bb816c65ba0aa7e36c09caa860405160405180910390a350565b600660009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b611638611bab565b611698817f855e2fc4000000000000000000000000000000000000000000000000000000006040518060400160405280600e81526020017f495061796d656e74457363726f77000000000000000000000000000000000000815250611c32565b80601060006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055508073ffffffffffffffffffffffffffffffffffffffff166040516116fc90612504565b60405180910390207ff611fec7babefd259c57ea5b6006acff8140ab17bb816c65ba0aa7e36c09caa860405160405180910390a350565b6000600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff16905090565b600960009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b600c60009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b6117b1611bab565b80600160006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055508073ffffffffffffffffffffffffffffffffffffffff16611811611062565b73ffffffffffffffffffffffffffffffffffffffff167f38d16b8cac22d99fc7c124b9cd0de2d3fa1faef420bfe791d8c362d765e2270060405160405180910390a350565b61185e611bab565b6118be817fc0087dd9000000000000000000000000000000000000000000000000000000006040518060400160405280601081526020017f4950726f64756374526567697374727900000000000000000000000000000000815250611c32565b80600760006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055508073ffffffffffffffffffffffffffffffffffffffff1660405161192290612565565b60405180910390207ff611fec7babefd259c57ea5b6006acff8140ab17bb816c65ba0aa7e36c09caa860405160405180910390a350565b611961611bab565b6119c1817f9503c028000000000000000000000000000000000000000000000000000000006040518060400160405280601b81526020017f49537562736372697074696f6e5472616e736665724f7261636c650000000000815250611c32565b80600e60006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055508073ffffffffffffffffffffffffffffffffffffffff16604051611a25906125c6565b60405180910390207ff611fec7babefd259c57ea5b6006acff8140ab17bb816c65ba0aa7e36c09caa860405160405180910390a350565b611a64611bab565b611ac4817f3ac7ac05000000000000000000000000000000000000000000000000000000006040518060400160405280601081526020017f4950726963696e67526567697374727900000000000000000000000000000000815250611c32565b80600860006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055508073ffffffffffffffffffffffffffffffffffffffff16604051611b2890612627565b60405180910390207ff611fec7babefd259c57ea5b6006acff8140ab17bb816c65ba0aa7e36c09caa860405160405180910390a350565b600f60009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b600760009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b611bb3611e0d565b73ffffffffffffffffffffffffffffffffffffffff16611bd1611062565b73ffffffffffffffffffffffffffffffffffffffff1614611c3057611bf4611e0d565b6040517f118cdaa7000000000000000000000000000000000000000000000000000000008152600401611c279190611fda565b60405180910390fd5b565b8273ffffffffffffffffffffffffffffffffffffffff166301ffc9a7836040518263ffffffff1660e01b8152600401611c6b919061264b565b602060405180830381865afa158015611c88573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190611cac9190612692565b81604051602001611cbd919061274b565b60405160208183030381529060405290611d0d576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401611d0491906127cc565b60405180910390fd5b50505050565b6002600082815260200190815260200160002060009054906101000a900460ff1615611d7657806040517f64890191000000000000000000000000000000000000000000000000000000008152600401611d6d9190612067565b60405180910390fd5b60016002600083815260200190815260200160002060006101000a81548160ff0219169083151502179055507f3223c64d0518f39e3854050c1ea77cb9f25539e39168510c5a0cc7aad992b30681604051611dd19190612067565b60405180910390a150565b600160006101000a81549073ffffffffffffffffffffffffffffffffffffffff0219169055611e0a81611e15565b50565b600033905090565b60008060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff169050816000806101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055508173ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff167f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e060405160405180910390a35050565b600080fd5b60007fffffffff0000000000000000000000000000000000000000000000000000000082169050919050565b611f1381611ede565b8114611f1e57600080fd5b50565b600081359050611f3081611f0a565b92915050565b600060208284031215611f4c57611f4b611ed9565b5b6000611f5a84828501611f21565b91505092915050565b60008115159050919050565b611f7881611f63565b82525050565b6000602082019050611f936000830184611f6f565b92915050565b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b6000611fc482611f99565b9050919050565b611fd481611fb9565b82525050565b6000602082019050611fef6000830184611fcb565b92915050565b611ffe81611fb9565b811461200957600080fd5b50565b60008135905061201b81611ff5565b92915050565b60006020828403121561203757612036611ed9565b5b60006120458482850161200c565b91505092915050565b6000819050919050565b6120618161204e565b82525050565b600060208201905061207c6000830184612058565b92915050565b600081905092915050565b7f4f7267616e697a6174696f6e41646d696e000000000000000000000000000000600082015250565b60006120c3601183612082565b91506120ce8261208d565b601182019050919050565b60006120e4826120b6565b9150819050919050565b7f4f7267616e697a6174696f6e4e46540000000000000000000000000000000000600082015250565b6000612124600f83612082565b915061212f826120ee565b600f82019050919050565b600061214582612117565b9150819050919050565b7f50726f647563745472616e736665724f7261636c650000000000000000000000600082015250565b6000612185601583612082565b91506121908261214f565b601582019050919050565b60006121a682612178565b9150819050919050565b7f5075726368617365526567697374727900000000000000000000000000000000600082015250565b60006121e6601083612082565b91506121f1826121b0565b601082019050919050565b6000612207826121d9565b9150819050919050565b7f50726f64756374506173734e4654000000000000000000000000000000000000600082015250565b6000612247600e83612082565b915061225282612211565b600e82019050919050565b60006122688261223a565b9150819050919050565b7f537562736372697074696f6e457363726f770000000000000000000000000000600082015250565b60006122a8601283612082565b91506122b382612272565b601282019050919050565b60006122c98261229b565b9150819050919050565b7f55736167655265636f7264657200000000000000000000000000000000000000600082015250565b6000612309600d83612082565b9150612314826122d3565b600d82019050919050565b600061232a826122fc565b9150819050919050565b7f50726963696e6743616c63756c61746f72000000000000000000000000000000600082015250565b600061236a601183612082565b915061237582612334565b601182019050919050565b600061238b8261235d565b9150819050919050565b7f436f75706f6e5265676973747279000000000000000000000000000000000000600082015250565b60006123cb600e83612082565b91506123d682612395565b600e82019050919050565b60006123ec826123be565b9150819050919050565b7f446973636f756e74526567697374727900000000000000000000000000000000600082015250565b600061242c601083612082565b9150612437826123f6565b601082019050919050565b600061244d8261241f565b9150819050919050565b7f50757263686173654d616e616765720000000000000000000000000000000000600082015250565b600061248d600f83612082565b915061249882612457565b600f82019050919050565b60006124ae82612480565b9150819050919050565b7f5061796d656e74457363726f7700000000000000000000000000000000000000600082015250565b60006124ee600d83612082565b91506124f9826124b8565b600d82019050919050565b600061250f826124e1565b9150819050919050565b7f50726f6475637452656769737472790000000000000000000000000000000000600082015250565b600061254f600f83612082565b915061255a82612519565b600f82019050919050565b600061257082612542565b9150819050919050565b7f537562736372697074696f6e5472616e736665724f7261636c65000000000000600082015250565b60006125b0601a83612082565b91506125bb8261257a565b601a82019050919050565b60006125d1826125a3565b9150819050919050565b7f50726963696e6752656769737472790000000000000000000000000000000000600082015250565b6000612611600f83612082565b915061261c826125db565b600f82019050919050565b600061263282612604565b9150819050919050565b61264581611ede565b82525050565b6000602082019050612660600083018461263c565b92915050565b61266f81611f63565b811461267a57600080fd5b50565b60008151905061268c81612666565b92915050565b6000602082840312156126a8576126a7611ed9565b5b60006126b68482850161267d565b91505092915050565b7f4d75737420696d706c656d656e74200000000000000000000000000000000000815250565b600081519050919050565b60005b8381101561270e5780820151818401526020810190506126f3565b60008484015250505050565b6000612725826126e5565b61272f8185612082565b935061273f8185602086016126f0565b80840191505092915050565b6000612756826126bf565b600f82019150612766828461271a565b915081905092915050565b600082825260208201905092915050565b6000601f19601f8301169050919050565b600061279e826126e5565b6127a88185612771565b93506127b88185602086016126f0565b6127c181612782565b840191505092915050565b600060208201905081810360008301526127e68184612793565b90509291505056fea264697066735822122089690e3a69b48d0c2d11bc5e16a5584c240237b6ca3ae8a1874f395a894daa9864736f6c63430008180033";

type ContractRegistryConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: ContractRegistryConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class ContractRegistry__factory extends ContractFactory {
  constructor(...args: ContractRegistryConstructorParams) {
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
      ContractRegistry & {
        deploymentTransaction(): ContractTransactionResponse;
      }
    >;
  }
  override connect(runner: ContractRunner | null): ContractRegistry__factory {
    return super.connect(runner) as ContractRegistry__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): ContractRegistryInterface {
    return new Interface(_abi) as ContractRegistryInterface;
  }
  static connect(
    address: string,
    runner?: ContractRunner | null
  ): ContractRegistry {
    return new Contract(address, _abi, runner) as unknown as ContractRegistry;
  }
}
