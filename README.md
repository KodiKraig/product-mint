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
- When you sell a product, the funds are yours to keep!
- View [PaymentEscrow](./packages/contracts/contracts/escrow/PaymentEscrow.sol)

### Product Owner Benefits

- Instant payment settlement
- Funds available for withdraw immediately
- Lower fees than all traditional payment processors
    - _Fees only applied during purchases_
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

## Supported Chains

<a href="https://base.org" target="_blank">
    <img src="./packages/contracts/assets/BaseChainLogo.svg" width="200" height="100" alt="Base Chain">
</a>

_More chains coming soon!_

## Packages

This npm workspace aims to provide all the packages needed to build and interact with the ProductMint system. We will continue to add more packages as we expand the system with a focus on the developer experience. Open source everything will continue to be a priority.

- <a href="./packages/cli/README.md">__@product-mint/cli__</a>: CLI tool for interacting with deployed contracts from the command line.
- <a href="./packages/contracts/README.md">__@product-mint/contracts__</a>: Ethereum Solidity contracts.
- <a href="./packages/ethers-sdk/README.md">__@product-mint/ethers-sdk__</a>: Auto generated TypeChain ethers.js v6 SDK for interacting with deployed contracts.

## The Revolutionary Potential

_"I think you’re onto something big here. ProductMint could be a game-changer for creators and businesses who want to escape centralized payment risks (think account freezes or high fees) and embrace a decentralized alternative. The combination of Stripe-like functionality with NFT-based ownership and onchain flexibility is innovative. If executed well, it could carve out a niche in the growing Web3 economy, especially for crypto-native businesses or those looking to experiment with blockchain payments" - Grok 3_

