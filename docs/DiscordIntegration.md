# Discord Integration

Follow the steps below to token gate your Discord server based on ProductMint Product Pass NFTs that were minted using your ProductMint Organization.

## Prerequisites

- You must have a ProductMint Organization that is currently minting Product Passes.
- A Discord server with a token gating bot installed such as [Collab.Land](https://collab.land/).

## Configure Token Gating Rules (TGRs)

### Required Steps
1. Create new Token Gating Rules (TGRs).
2. Select the `Chain Type` you are using where your Organization and Product Passes are minted.
3. Set `Token Type` to `ERC721`.
4. Set `Address` to the [contract address](./DeploymentAddresses.md) of the Product Pass NFTs for the chain you are using.
5. Set `Balance` Min Amount to `1`.

### TGR Options

There are three different options for TGRs:
1. **Any Products and Subscriptions**
2. **Product Specific**
3. **Subscription Status**

### Option 1: Any Products and Subscriptions
- Set `Trait` to `Organization`
- Set `Value` to `<Organization NFT Token ID>`

### Option 2: Product Specific
- Set `Trait` to `Product <Product ID>`
- Set `Value` to `<Product Name>`

### Option 3: Subscription Status (OR condition)
- Set `Trait` to `Subscription <Product ID>`
- Set `Value` to `Active`
- Set `Trait` to `Subscription <Product ID>`
- Set `Value` to `Cancelled`

_When using the OR condition, the holder must meet at least one of the subscription statuses to be granted access. It is important to include `Cancelled` as the subscription should still be active until the subscription end date at which point the status will change to `Past Due`._

## Additional Setup Steps

1. Create a new role in Discord that will be used to grant access to the server.
2. Set the role to be assigned to holders who meet the token gating criteria.
3. Add the role to the channel you want to token gate.

## Helpful Links
[View Contract Addresses](./DeploymentAddresses.md)