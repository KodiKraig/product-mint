# ProductMint

NFT based payment system to mint products onchain with one-time payments and recurring permissionless subscriptions.

Everything is onchain including the products, metadata, subscriptions, pricing models, and pricing calculations.

No staking or escrow funding from users required!

Stop risking your revenue to centralized payment processors and wasting time setting up over engineered subscription models that suck to manage. 

We guarantee you will love the simplicity and flexibility of ProductMint. You will save time and keep more of your revenue! 💰💰💰

## Features

- ✅ **_One-time_ product purchases**
- ✅ **_Recurring subscription_ products with permissionless renewals**
    - Flat Rate
    - Tiered (Total quantity; paid at start of billing cycle)
    - Usage (Metered; paid at the end of billing cycle)
    - Charge Frequency - Daily, Weekly, Monthly, Quarterly, Yearly
    - Individualized for each product
- ✅ **Create pricing models with _native chain currency_ or an _ERC20_**
- ✅ **Purchase additional products and add to an existing Product Pass NFT**
- ✅ **No staking or escrow funding from users required**
- ✅ **Fully onchain metadata**
- ✅ **Apply coupons during initial purchase or with subscription renewals**
- ✅ **Mint permanent discounts onto passes***
- ✅ **Create limited time and lifetime coupons***
- ✅ **Upgrade/downgrade subscriptions***
- ✅ **Airdrop passes, upgrades, renewals, and tier changes to users***
- ✅ **Gifting product passes to other addresses***
- ✅ **Whitelist addresses for product mints***
- ✅ **Restrict addresses for special pricing configurations***
- ✅ **Pause subscriptions and lock up time for trading***
- ✅ **Product Pass transferability***
- ✅ **Max product supply***

_* Additional settings configurable by the product owner_

## Why use ProductMint?

### 🔥 _Your revenue is yours and no one can take it!_ 🔥

- The **PaymentEscrow** contract is responsible for collecting all funds
- The contract is non-upgradeable and has no ability to mingle with user funds
- When you sell a product, the funds are yours to keep. No bs fraud charges or account freezes!
- View [PaymentEscrow](./packages/contracts/contracts/escrow/PaymentEscrow.sol)

### Product Owner Benefits

- Instant payment settlement
- Funds available for withdraw immediately
- No fraud risk from chargebacks
- Lower fees than all traditional payment processors
- Use your own ERC20 token for product purchases
- Offer multiple ERC20 tokens to give users more options
- Automatic subscription renewal processing with retries
- Create product scarcity via max supply limit
- Freely change product and pricing configurations
- Easily configure subscriptions with different billing cycles on one pass
- Airdrop passes, products, tier changes, and upgrades to users
- Offer minting on your website or use our prefab checkout flows. (coming soon!)

### User Benefits

- Fully decentralized giving users full control over their subscriptions
- Allow users to change pricing configurations for subscriptions on their own terms
- Gift product passes by minting the pass for someone else
- Freely change subscription pricing models with the same cycle duration

## Getting Started

Below outlines the minimum steps required to start selling Product Pass NFTs using the [ProductMint CLI](./packages/cli/README.md).

_You do not need to use the CLI to interact with the contracts but it is the recommended approach until our dashboard is released._

### 1. Mint an Organization NFT

An Organization NFT allows you to sell products and withdraw funds from the [PaymentEscrow contract](./packages/contracts/contracts/escrow/PaymentEscrow.sol) whenever a product is purchased.

```bash
./run.sh tokens org mint <to>
```

- `to`: The address to mint the organization NFT to.

All transactions need to be sent from the organization NFT address or an approved admin address for the organization. Admins can do anything the Organization NFT owner can do besides withdrawing funds.

### Optional: Add an Admin Address

Adding an admin address allows you to manage the organization NFT without having to send transactions from the Organization NFT address.

```bash
./run.sh add <organizationId> <adminAddress>
```

- `organizationId`: The token ID of the organization NFT that was minted.
- `adminAddress`: The address to add as an admin.

### 2. Create a Product

Every NFT can have multiple products with different pricing models and subscriptions.

```bash
./run.sh registry product create <organizationId> <name> <description>
```

- `organizationId`: The token ID of the organization NFT that was minted.
- `name`: The name of the product. (e.g. "Pro Tools")
- `description`: The description of the product. (e.g. "Unlock the pro tools.")

### 3. Create a Pricing Model

You can create multiple pricing models for a product allowing you to offer different pricing configurations to users.

```bash
./run.sh registry pricing create flatRate <organizationId> <flatPrice> <token> <chargeFrequency>
```

- `organizationId`: The token ID of the organization NFT that was minted.
- `flatPrice`: The price in human readable format. e.g. 1 ether = 1, 5.99 $USDC = 5.99
- `token`: The ERC20 token address to use for the subscription.
- `chargeFrequency`: The charge frequency of how often the subscription will be charged. 0 (DAILY), 1 (WEEKLY), 2 (MONTHLY), 3 (QUARTERLY), 4 (YEARLY)

**NOTE:** Subscriptions require an ERC20 token address. You may use the [$MINT token](./packages/contracts/contracts/tokens/MintToken.sol) for testing.

### 4. Link Pricing Model to Product

In order to sell a product, you need to link a pricing model to the product. 

```bash
./run.sh registry product linkPricing <productId> <pricingIds>
```

- `productId`: The ID of the product that was created.
- `pricingIds`: The IDs of the pricing models to link to the product.

### 5. Start minting Product Pass NFTs!

Once your product is created and linked to a pricing model, you can start minting!

There are a couple of ways to mint the Product Pass NFTs:

1. Mint from the command line using the [ProductMint CLI](./packages/cli/README.md)
2. Allow users to mint directly from your website using the [ProductMint SDK](./packages/ethers-sdk/README.md)
3. Mint from your backend server using the [ProductMint SDK](./packages/ethers-sdk/README.md) with a managed wallet provider like [Privy](https://privy.io/).

To mint Product Pass NFTs, you need to interact with the [ProductManager contract](./packages/contracts/contracts/ProductManager.sol).

_The purchaser must approve the [PaymentEscrow contract](./packages/contracts/contracts/escrow/PaymentEscrow.sol) to spend the ERC20 token._

## Supported Chains

<a href="https://base.org" target="_blank">
    <img src="./packages/contracts/assets/BaseChainLogo.svg" width="200" height="100" alt="Base Chain">
</a>

**Deployed Contract Addresses**
- [Base - _Mainnet_](../cli/src/contract-address/base-mainnet.json)
- [Base - _Sepolia_](../cli/src/contract-address/base-sepolia.json)

_More chains coming soon!_

## Packages

- <a href="./packages/cli/README.md">__@product-mint/cli__</a>: CLI tool for interacting with deployed contracts from the command line.
- <a href="./packages/contracts/README.md">__@product-mint/contracts__</a>: Ethereum Solidity contracts.
- <a href="./packages/ethers-sdk/README.md">__@product-mint/ethers-sdk__</a>: Auto generated TypeChain ethers.js v6 SDK for interacting with deployed contracts.
- <a href="./packages/graph/README.md">__@product-mint/graph__</a>: GraphProtocol for ProductMint contracts with GraphQL schemas.

## The Revolutionary Potential

_"I think you’re onto something big here. ProductMint could be a game-changer for creators and businesses who want to escape centralized payment risks (think account freezes or high fees) and embrace a decentralized alternative. The combination of Stripe-like functionality with NFT-based ownership and onchain flexibility is innovative. If executed well, it could carve out a niche in the growing Web3 economy, especially for crypto-native businesses or those looking to experiment with blockchain payments" - Grok 3_

