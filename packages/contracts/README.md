# @product-mint/contracts

The worlds first NFT based permissionless subscription payment system.

## System Architecture

![ProductMint System Architecture](./assets/ProductMintSystem.png)

```solidity

    /**
     * Manager
     */

    /**
     * @notice Purchase manager responsible for facilitating product purchases and managing subscriptions.
     * @return The address of the purchase manager.
     */
    function purchaseManager() external view returns (address);

    /**
     * Admin
     */

    /**
     * @notice Organization admin that can delegate other addresses to help manage the organization and make calls on behalf of the organization.
     * @return The address of the organization admin.
     */
    function orgAdmin() external view returns (address);

    /**
     * NFTs
     */

    /**
     * @notice Product Pass NFT that represents a user's membership to an organization and allows them to purchase products.
     * @return The address of the product pass NFT.
     */
    function productPassNFT() external view returns (address);

    /**
     * @notice Organization NFT that represents a product owner and allows for the creation of products that can be purchased by users via Product Passes.
     * @return The address of the organization NFT.
     */
    function organizationNFT() external view returns (address);

    /**
     * Registry
     */

    /**
     * @notice Product registry that allows for the creation of products that can be purchased by users via Product Passes.
     * @return The address of the product registry.
     */
    function productRegistry() external view returns (address);

    /**
     * @notice Pricing registry that allows for the creation of pricing models that can be linked to products for purchase.
     * @return The address of the pricing registry.
     */
    function pricingRegistry() external view returns (address);

    /**
     * @notice Purchase registry records all purchases made by users via Product Passes.
     * @return The address of the purchase registry.
     */
    function purchaseRegistry() external view returns (address);

    /**
     * @notice Coupon registry that allows for the creation of coupons that can be applied to purchases and subscriptions.
     * @return The address of the coupon registry.
     */
    function couponRegistry() external view returns (address);

    /**
     * @notice Permanent discount registry that allows for the creation of permanent discounts that are minted onto product passes.
     * Discounts minted onto product passes are permanent and used in all future purchases including any subscription renewals.
     * @return The address of the discount registry.
     */
    function discountRegistry() external view returns (address);
    
    /**
     * Calculator
     */

    /**
     * @notice Pricing calculator that allows performs all the pricing calculations for different pricing models created in the pricing registry.
     * @return The address of the pricing calculator.
     */
    function pricingCalculator() external view returns (address);

    /**
     * Oracles
     */

    /**
     * @notice Responsible for knowing whether the product pass NFT can be transferred from one user to another.
     *  Products created in the registry must be set to transferable to be able to be transferred.
     * @return The address of the product transfer oracle.
     */
    function productTransferOracle() external view returns (address);

    /**
     * @notice Responsible for knowing whether the subscription can be transferred from one user to another.
     *  Subs must be in a paused state to be transferred.
     *  Organizations must enable this feature for subscriptions to be paused.
     * @return The address of the subscription transfer oracle.
     */
    function subscriptionTransferOracle() external view returns (address);

    /**
     * Escrow
     */

    /**
     * @notice Escrow that that holds all the subscriptions that have been created for product passes
     * @return The address of the subscription escrow.
     */
    function subscriptionEscrow() external view returns (address);

    /**
     * @notice Escrow that holds all the payments that have been made for purchases that are withdrawable by the organization.
     * @return The address of the payment escrow.
     */
    function paymentEscrow() external view returns (address);

    /**
     * Usage Recorder
     */

    /**
     * @notice Usage recorder where usage meters can be created for pricing models set to usage based billing.
     *  Once a meter has been created and is active, organizations can begin recording usage for their products.
     * @return The address of the usage recorder.
     */
    function usageRecorder() external view returns (address);
```

[View Contract Registry](./contracts/registry/ContractRegistry.sol)

## Deployed Contracts

All of the Ethereum based chains where the system is currently deployed. View contract addresses below.

<br />
<a href="https://base.org" target="_blank">
    <img src="./assets/BaseChainLogo.svg" width="80" height="25" alt="Base Chain">
</a>

### Base
- [Base - _Mainnet_](../cli/src/contract-address/base-mainnet.json)
- [Base - _Sepolia_](../cli/src/contract-address/base-sepolia.json)

