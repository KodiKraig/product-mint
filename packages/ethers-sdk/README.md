# @product-mint/ethers-sdk

Auto generated TypeChain ethers.js v6 SDK for interacting with ProductMint deployed contracts.

## Installation

```bash
npm install @product-mint/ethers-sdk
```

## Usage

Using the ProductMint Ethers SDK requires using [ethers](https://docs.ethers.org/v6/) to interact with the contracts with type safety provided by [TypeChain](https://www.npmjs.com/package/typechain).

### Minting a Product Pass NFT

```typescript
import { PurchaseManager__factory } from '@product-mint/ethers-sdk';
import { ethers } from 'ethers';

// Initialize the provider and signer wallet
// Replace API_KEY with your Alchemy API key or your own RPC URL from any RPC provider
const provider = new ethers.JsonRpcProvider('https://base-mainnet.g.alchemy.com/v2/API_KEY');

// Replace <PRIVATE_KEY> with your wallet's private key
const signerWallet = new ethers.Wallet(
  '<PRIVATE_KEY>',
  provider,
);

// Set contract address for the PurchaseManager contract
const contractAddress = "0xBf31aD908EA3b7930aa85AD06eC290Ac9A11103D";

// Connect to the PurchaseManager contract
const purchaseManager = PurchaseManager__factory.connect(
  contractAddress,
  provider,
);

// Mint a Product Pass NFT by purchasing product(s)
const tx = await purchaseManager.connect(signerWallet).purchaseProducts(
  {
    to: signerWallet.address, // Where to mint the NFT
    organizationId: 1, // Organization ID
    productIds: [1], // Product IDs
    pricingIds: [1], // Pricing IDs
    quantities: [0], // Quantities (Used for TIERED pricing only. Else set to 0.)
    discountIds: [], // Discount IDs (Optional)
    couponCode: '', // Coupon Code (Optional)
    airdrop: false, // Airdrop (Only allowed for Organization Owner/Admin)
    pause: false, // Should any subscriptions be paused? (Must be enabled first)
  },
);

console.log(`Waiting for transaction ${tx.hash} to be confirmed...`);

const receipt = await tx.wait();

if (receipt.status === 0) {
  throw new Error('Transaction reverted!');
} else {
  console.log('Transaction confirmed!');
  console.log(`Transaction hash: ${tx.hash}`);
  console.log(`Block number: ${receipt.blockNumber}`);
}
```



