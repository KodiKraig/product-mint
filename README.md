# ProductMint

NFT based payment system to mint products onchain with one-time payments or recurring permissionless subscriptions.

## Features

- ✅ **One-time product**  purchases
- ✅ **Recurring subscription products** with permissionless renewals
    - Flat Rate
    - Tiered (Total quantity; paid at start of billing cycle)
    - Usage (Metered; paid at the end of billing cycle)
    - Charge Frequency - Daily, Weekly, Monthly, Quarterly, Yearly
    - Individualized for each product
- ✅ Create pricing models with _native chain currency_ or an _ERC20_
- ✅ Purchase additional products and add to an existing Product Pass NFT
- ✅ No staking or escrow funding from users required
- ✅ Fully onchain metadata
- ✅ Apply coupons during initial purchase or with subscription renewals
- ✅ Create limited time and lifetime coupons*
- ✅ Upgrade/downgrade subscriptions*
- ✅ Airdrop passes, upgrades, renewals, and tier changes to users*
- ✅ Whitelist addresses for product mints*
- ✅ Restrict addresses for special pricing configurations*
- ✅ Pause subscriptions and lock up time for trading*
- ✅ Product Pass transferability*
- ✅ Max product supply*

_* Additional settings configurable by the product owner_

## Why use ProductMint?

### 🔥 _Your revenue is yours and no one can take it!_ 🔥

- The **PaymentEscrow** contract is responsible for holding all funds
- The contract is non-upgradeable and has no ability to mingle with user funds
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

## Packages

This npm workspace aims to provide all the packages needed to build and interact with the ProductMint system. We will continue to add more packages as we expand the system with a focus on the developer experience. Open source everything will continue to be a priority.

- __@product-mint/cli__: CLI tool for interacting with deployed contracts from the command line. (coming soon!)
- <a href="./packages/contracts/README.md">__@product-mint/contracts__</a>: Ethereum Solidity contracts.
- __@product-mint/ethers-sdk__: Auto generated TypeChain ethers.js v6 SDK for interacting with deployed contracts. (coming soon!)

## Supported Chains

<a href="https://base.org" target="_blank">
    <img src="./packages/contracts/assets/BaseChainLogo.svg" width="200" height="100" alt="Base Chain">
</a>

_More chains coming soon!_