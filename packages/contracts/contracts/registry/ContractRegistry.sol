// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.24;

import {IERC165} from "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Ownable2Step} from "@openzeppelin/contracts/access/Ownable2Step.sol";

import {IContractRegistry} from "./IContractRegistry.sol";
import {IProductPassNFT} from "../tokens/IProductPassNFT.sol";
import {IOrganizationNFT} from "../tokens/IOrganizationNFT.sol";
import {IProductRegistry} from "./IProductRegistry.sol";
import {IPricingRegistry} from "./IPricingRegistry.sol";
import {ISubscriptionEscrow} from "../escrow/ISubscriptionEscrow.sol";
import {IPurchaseManager} from "../manager/IPurchaseManager.sol";
import {IPaymentEscrow} from "../escrow/IPaymentEscrow.sol";
import {IUsageRecorder} from "../usage/IUsageRecorder.sol";
import {IProductTransferOracle} from "../oracle/IProductTransferOracle.sol";
import {
    ISubscriptionTransferOracle
} from "../oracle/ISubscriptionTransferOracle.sol";
import {IPurchaseRegistry} from "./IPurchaseRegistry.sol";
import {IPricingCalculator} from "../calculator/IPricingCalculator.sol";
import {IOrganizationAdmin} from "../admin/IOrganizationAdmin.sol";
import {ICouponRegistry} from "./ICouponRegistry.sol";
import {IDiscountRegistry} from "./IDiscountRegistry.sol";
import {OneTimeLock} from "../utils/OneTimeLock.sol";

/*
 ____                 _            _   __  __ _       _   
|  _ \ _ __ ___   __| |_   _  ___| |_|  \/  (_)_ __ | |_ 
| |_) | '__/ _ \ / _` | | | |/ __| __| |\/| | | '_ \| __|
|  __/| | | (_) | (_| | |_| | (__| |_| |  | | | | | | |_ 
|_|   |_|  \___/ \__,_|\__,_|\___|\__|_|  |_|_|_| |_|\__|
 
 NFT based payment system to mint products onchain with one-time payments and 
 recurring permissionless subscriptions.

 https://productmint.io
*/

/**
 * @title ContractRegistry
 * @notice A contract that holds all the addresses of the contracts within the ProductMint system.
 *
 * All of the contracts within the system interface with one another to bring the system to life.
 *
 * All contracts can be swapped out by the owner to upgrade the system except the OrganizationNFT and ProductPassNFT.
 *
 * The OrganizationNFT and ProductPassNFT are used to represent ownership of the organization and product passes.
 * They cannot be changed or upgraded. This prevents the org owner from ever being locked out of the system and
 * losing access to their funds.
 */
contract ContractRegistry is
    Ownable2Step,
    OneTimeLock,
    IContractRegistry,
    IERC165
{
    // Manager
    address public purchaseManager;

    // Admin
    address public orgAdmin;

    // NFTs
    address public productPassNFT;
    address public organizationNFT;

    // Registry
    address public productRegistry;
    address public pricingRegistry;
    address public purchaseRegistry;
    address public couponRegistry;
    address public discountRegistry;

    // Calculator
    address public pricingCalculator;

    // Oracles
    address public productTransferOracle;
    address public subscriptionTransferOracle;

    // Escrow
    address public subscriptionEscrow;
    address public paymentEscrow;

    // Usage recorder
    address public usageRecorder;

    // Locks
    bytes32 public constant PASS_LOCK = keccak256("IProductPassNFT");
    bytes32 public constant ORG_LOCK = keccak256("IOrganizationNFT");

    constructor() Ownable(_msgSender()) {}

    // Manager

    function setPurchaseManager(address _purchaseManager) external onlyOwner {
        _setPurchaseManager(_purchaseManager);
    }

    function _setPurchaseManager(address _purchaseManager) internal {
        _checkInterface(
            _purchaseManager,
            type(IPurchaseManager).interfaceId,
            "IPurchaseManager"
        );

        purchaseManager = _purchaseManager;

        emit ContractUpdated("PurchaseManager", _purchaseManager);
    }

    // Admin

    function setOrgAdmin(address _orgAdmin) external onlyOwner {
        _setOrgAdmin(_orgAdmin);
    }

    function _setOrgAdmin(address _orgAdmin) internal {
        _checkInterface(
            _orgAdmin,
            type(IOrganizationAdmin).interfaceId,
            "IOrganizationAdmin"
        );

        orgAdmin = _orgAdmin;

        emit ContractUpdated("OrganizationAdmin", _orgAdmin);
    }

    // NFTs

    function setProductPassNFT(address _productPassNFT) external onlyOwner {
        _setProductPassNFT(_productPassNFT);
    }

    function _setProductPassNFT(address _productPassNFT) internal {
        _checkInterface(_productPassNFT, type(IERC721).interfaceId, "IERC721");
        _checkInterface(
            _productPassNFT,
            type(IProductPassNFT).interfaceId,
            "IProductPassNFT"
        );

        lock(PASS_LOCK);

        productPassNFT = _productPassNFT;

        emit ContractUpdated("ProductPassNFT", _productPassNFT);
    }

    function setOrganizationNFT(address _organizationNFT) external onlyOwner {
        _setOrganizationNFT(_organizationNFT);
    }

    function _setOrganizationNFT(address _organizationNFT) internal {
        _checkInterface(_organizationNFT, type(IERC721).interfaceId, "IERC721");
        _checkInterface(
            _organizationNFT,
            type(IOrganizationNFT).interfaceId,
            "IOrganizationNFT"
        );

        lock(ORG_LOCK);

        organizationNFT = _organizationNFT;

        emit ContractUpdated("OrganizationNFT", _organizationNFT);
    }

    // Registry

    function setProductRegistry(address _productRegistry) external onlyOwner {
        _setProductRegistry(_productRegistry);
    }

    function _setProductRegistry(address _productRegistry) internal {
        _checkInterface(
            _productRegistry,
            type(IProductRegistry).interfaceId,
            "IProductRegistry"
        );

        productRegistry = _productRegistry;

        emit ContractUpdated("ProductRegistry", _productRegistry);
    }

    function setPricingRegistry(address _pricingRegistry) external onlyOwner {
        _setPricingRegistry(_pricingRegistry);
    }

    function _setPricingRegistry(address _pricingRegistry) internal {
        _checkInterface(
            _pricingRegistry,
            type(IPricingRegistry).interfaceId,
            "IPricingRegistry"
        );

        pricingRegistry = _pricingRegistry;

        emit ContractUpdated("PricingRegistry", _pricingRegistry);
    }

    function setPurchaseRegistry(address _purchaseRegistry) external onlyOwner {
        _setPurchaseRegistry(_purchaseRegistry);
    }

    function _setPurchaseRegistry(address _purchaseRegistry) internal {
        _checkInterface(
            _purchaseRegistry,
            type(IPurchaseRegistry).interfaceId,
            "IPurchaseRegistry"
        );

        purchaseRegistry = _purchaseRegistry;

        emit ContractUpdated("PurchaseRegistry", _purchaseRegistry);
    }

    function setCouponRegistry(address _couponRegistry) external onlyOwner {
        _setCouponRegistry(_couponRegistry);
    }

    function _setCouponRegistry(address _couponRegistry) internal {
        _checkInterface(
            _couponRegistry,
            type(ICouponRegistry).interfaceId,
            "ICouponRegistry"
        );

        couponRegistry = _couponRegistry;

        emit ContractUpdated("CouponRegistry", _couponRegistry);
    }

    function setDiscountRegistry(address _discountRegistry) external onlyOwner {
        _setDiscountRegistry(_discountRegistry);
    }

    function _setDiscountRegistry(address _discountRegistry) internal {
        _checkInterface(
            _discountRegistry,
            type(IDiscountRegistry).interfaceId,
            "IDiscountRegistry"
        );

        discountRegistry = _discountRegistry;

        emit ContractUpdated("DiscountRegistry", _discountRegistry);
    }

    // Calculator

    function setPricingCalculator(
        address _pricingCalculator
    ) external onlyOwner {
        _setPricingCalculator(_pricingCalculator);
    }

    function _setPricingCalculator(address _pricingCalculator) internal {
        _checkInterface(
            _pricingCalculator,
            type(IPricingCalculator).interfaceId,
            "IPricingCalculator"
        );

        pricingCalculator = _pricingCalculator;

        emit ContractUpdated("PricingCalculator", _pricingCalculator);
    }

    // Oracles

    function setProductTransferOracle(
        address _productTransferOracle
    ) external onlyOwner {
        _setProductTransferOracle(_productTransferOracle);
    }

    function _setProductTransferOracle(
        address _productTransferOracle
    ) internal {
        _checkInterface(
            _productTransferOracle,
            type(IProductTransferOracle).interfaceId,
            "IProductTransferOracle"
        );

        productTransferOracle = _productTransferOracle;

        emit ContractUpdated("ProductTransferOracle", _productTransferOracle);
    }

    function setSubscriptionTransferOracle(
        address _subscriptionTransferOracle
    ) external onlyOwner {
        _setSubscriptionTransferOracle(_subscriptionTransferOracle);
    }

    function _setSubscriptionTransferOracle(
        address _subscriptionTransferOracle
    ) internal {
        _checkInterface(
            _subscriptionTransferOracle,
            type(ISubscriptionTransferOracle).interfaceId,
            "ISubscriptionTransferOracle"
        );

        subscriptionTransferOracle = _subscriptionTransferOracle;

        emit ContractUpdated(
            "SubscriptionTransferOracle",
            _subscriptionTransferOracle
        );
    }

    // Escrow system

    function setSubscriptionEscrow(
        address _subscriptionEscrow
    ) external onlyOwner {
        _setSubscriptionEscrow(_subscriptionEscrow);
    }

    function _setSubscriptionEscrow(address _subscriptionEscrow) internal {
        _checkInterface(
            _subscriptionEscrow,
            type(ISubscriptionEscrow).interfaceId,
            "ISubscriptionEscrow"
        );

        subscriptionEscrow = _subscriptionEscrow;

        emit ContractUpdated("SubscriptionEscrow", _subscriptionEscrow);
    }

    function setPaymentEscrow(address _paymentEscrow) external onlyOwner {
        _setPaymentEscrow(_paymentEscrow);
    }

    function _setPaymentEscrow(address _paymentEscrow) internal {
        _checkInterface(
            _paymentEscrow,
            type(IPaymentEscrow).interfaceId,
            "IPaymentEscrow"
        );

        paymentEscrow = _paymentEscrow;

        emit ContractUpdated("PaymentEscrow", _paymentEscrow);
    }

    // Usage recorder

    function setUsageRecorder(address _usageRecorder) external onlyOwner {
        _setUsageRecorder(_usageRecorder);
    }

    function _setUsageRecorder(address _usageRecorder) internal {
        _checkInterface(
            _usageRecorder,
            type(IUsageRecorder).interfaceId,
            "IUsageRecorder"
        );

        usageRecorder = _usageRecorder;

        emit ContractUpdated("UsageRecorder", _usageRecorder);
    }

    // Batch Setup

    function batchSetContracts(
        BatchSetupContracts memory _contracts
    ) external onlyOwner {
        // Manager
        _setPurchaseManager(_contracts.purchaseManager);

        // Admin
        _setOrgAdmin(_contracts.orgAdmin);

        // NFTs
        _setProductPassNFT(_contracts.productPassNFT);
        _setOrganizationNFT(_contracts.organizationNFT);

        // Registry
        _setProductRegistry(_contracts.productRegistry);
        _setPricingRegistry(_contracts.pricingRegistry);
        _setPurchaseRegistry(_contracts.purchaseRegistry);
        _setCouponRegistry(_contracts.couponRegistry);
        _setDiscountRegistry(_contracts.discountRegistry);

        // Calculator
        _setPricingCalculator(_contracts.pricingCalculator);

        // Oracles
        _setProductTransferOracle(_contracts.productTransferOracle);
        _setSubscriptionTransferOracle(_contracts.subscriptionTransferOracle);

        // Escrow
        _setSubscriptionEscrow(_contracts.subscriptionEscrow);
        _setPaymentEscrow(_contracts.paymentEscrow);

        // Usage recorder
        _setUsageRecorder(_contracts.usageRecorder);
    }

    /**
     * Helpers
     */

    function _checkInterface(
        address contractAddress,
        bytes4 interfaceId,
        string memory contractName
    ) private view {
        require(
            IERC165(contractAddress).supportsInterface(interfaceId),
            string.concat("Must implement ", contractName)
        );
    }

    /**
     * ERC165
     */

    function supportsInterface(
        bytes4 interfaceId
    ) external pure returns (bool) {
        return
            interfaceId == type(IContractRegistry).interfaceId ||
            interfaceId == type(IERC165).interfaceId;
    }
}
