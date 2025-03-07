// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.20;

interface IContractRegistry {
    /**
     * @notice Emitted when a contract is updated.
     * @param contractName The name of the contract.
     * @param newAddress The new address of the contract.
     */
    event ContractUpdated(
        string indexed contractName,
        address indexed newAddress
    );

    /**
     * Manager
     */

    function purchaseManager() external view returns (address);

    /**
     * Admin
     */

    function orgAdmin() external view returns (address);

    /**
     * NFTs
     */

    function productPassNFT() external view returns (address);

    function organizationNFT() external view returns (address);

    /**
     * Registry
     */

    function productRegistry() external view returns (address);

    function pricingRegistry() external view returns (address);

    function purchaseRegistry() external view returns (address);

    function couponRegistry() external view returns (address);

    /**
     * Calculator
     */

    function pricingCalculator() external view returns (address);

    /**
     * Oracles
     */

    function productTransferOracle() external view returns (address);

    function subscriptionTransferOracle() external view returns (address);

    /**
     * Escrow
     */

    function subscriptionEscrow() external view returns (address);

    function paymentEscrow() external view returns (address);

    /**
     * Usage Recorder
     */

    function usageRecorder() external view returns (address);
}
