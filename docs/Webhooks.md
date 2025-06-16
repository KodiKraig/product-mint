# ProductMint Webhooks - IN-PROGRESS 🚀

ProductMint webhooks are a way to notify you when certain events happen in the ProductMint ecosystem. They are in-progress and coming soon!

You can also listen to the contract events directly with a web3 provider. For more information on how to do this check below.

## Targeted Initial Webhooks

The following are the list of webhooks that are currently in development.

### Main Events

- `pass.minted.success`
    - When a pass is minted successfully.
- `pass.product.purchased`
    - When a product is purchased and minted onto a pass.
    - Will fire for each product purchased event during the pass minting transaction and additional product purchases after the initial mint.

### Subscription Status Events

- `pass.subscription.renewal`
    - When a subscription renewal is processed with the following reasons. 
        - `success`
        - `failed`
        - `paused`
        - `cancelled`
    - _Access can be granted/revoked from the application._
- `pass.subscription.cycle.updated`
    - When a subscription billing cycle changes.
    - Will be emitted under the following conditions:
        - Subscription created
        - Subscription pricing model updated
        - Subscription billing cycle updated
        - Subscription paused
        - Subscription resumed
        - Subscription cancelled
- `pass.subscription.tiered.quantity.updated`
    - When a subscription with a tiered pricing model has it's unit quantity updated.

## Contract Events

The following are the list of contract events that can be used directly with a web3 provider.

### [PurchaseManager](../packages/contracts/contracts/manager/PurchaseManager.sol)

- `ProductsPurchased`
    - When a product is purchased and minted onto a pass.
- `SubscriptionRenewed`
    - When a subscription is successfully renewed through the purchase manager.

### [SubscriptionEscrow](../packages/contracts/contracts/escrow/SubscriptionEscrow.sol)

- `SubscriptionCycleUpdated`
    - When a subscription billing cycle changes.
- `UnitQuantitySet`
    - When a subscription with a tiered pricing model has it's unit quantity updated.

### [RenewalProcessor](../packages/contracts/contracts/renewal/RenewalProcessor.sol)

- `RenewalProcessed`
    - When a subscription renewal is processed.
