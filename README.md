# ProductMint

NFT based payment system to mint products onchain with one-time payments or recurring permissionless subscriptions.

## Features

- **One-time product**  purchases
- **Recurring subscription products** with permissionless renewals
    - Flat Rate
    - Tiered (Total quantity; paid at start of billing cycle)
    - Usage (Metered; paid at the end of billing cycle)
    - Charge Frequency - Daily, Weekly, Monthly, Quarterly, Yearly
    - Individualized for each product
- Create pricing models with _native chain currency_ or an _ERC20_
- Purchase additional products and add to an existing Product Pass NFT
- No staking or escrow funding from users required
- Fully onchain metadata
- Apply coupons during initial purchase or with subscription renewals
- Create limited time and lifetime coupons*
- Upgrade/downgrade subscriptions*
- Airdrop passes, upgrades, renewals, and tier changes to users*
- Whitelist addresses for product mints*
- Restrict addresses for special pricing configurations*
- Pause subscriptions for trading*
- Product Pass transferability*
- Max product supply*

_* Additional settings configurable by the product owner_

## Packages

- __@product-mint/cli__: CLI tool for interacting with deployed contracts from the command line. (coming soon!)
- <a href="./packages/contracts/README.md">__@product-mint/contracts__</a>: Ethereum Solidity contracts.
- __@product-mint/ethers-sdk__: Auto generated TypeChain ethers.js v6 SDK for interacting with deployed contracts. (coming soon!)
