# ProductMint - DynamicERC20

DynamicERC20 is a concept unique to ProductMint allowing organizations to create pricing models that target a specific price. DynamicERC20s are not mintable or transferable. Currently we support Uniswap V2 and Uniswap V3 to use for price 

## How it works

DynamicERC20 are composed of two ERC20s:

- The base token (e.g. WETH)
- The quote token (e.g. USDC)

The base token is the token that is used for payment. The quote token is the token that is used to price the base token. An organization can then create a pricing model using the DynamicERC20 token based on the price of the quote token.

### Example

Assume an organizations wants to be paid in 100 USD worth of WETH for their subscription. To achieve this, the organization would create the pricing model using the DynamicERC20 with a price target of 100 USDC. Then, whenever the subscription is minted or renewed, 100 USDC worth of WETH would be paid.

## DynamicERC20 Contract Addresses

### Base - Mainnet
- _dWETH-USDC_: `0x3eB0f547a95A9a52cA19E65917f5a06Cb28f06d2`
