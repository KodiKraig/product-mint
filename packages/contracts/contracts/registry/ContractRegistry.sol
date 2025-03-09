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

contract ContractRegistry is Ownable2Step, IContractRegistry, IERC165 {
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

    constructor() Ownable(_msgSender()) {}

    // Manager

    function setPurchaseManager(address _purchaseManager) external onlyOwner {
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
        _checkInterface(_productPassNFT, type(IERC721).interfaceId, "IERC721");
        _checkInterface(
            _productPassNFT,
            type(IProductPassNFT).interfaceId,
            "IProductPassNFT"
        );

        productPassNFT = _productPassNFT;

        emit ContractUpdated("ProductPassNFT", _productPassNFT);
    }

    function setOrganizationNFT(address _organizationNFT) external onlyOwner {
        _checkInterface(_organizationNFT, type(IERC721).interfaceId, "IERC721");
        _checkInterface(
            _organizationNFT,
            type(IOrganizationNFT).interfaceId,
            "IOrganizationNFT"
        );

        organizationNFT = _organizationNFT;

        emit ContractUpdated("OrganizationNFT", _organizationNFT);
    }

    // Registry

    function setProductRegistry(address _productRegistry) external onlyOwner {
        _checkInterface(
            _productRegistry,
            type(IProductRegistry).interfaceId,
            "IProductRegistry"
        );

        productRegistry = _productRegistry;

        emit ContractUpdated("ProductRegistry", _productRegistry);
    }

    function setPricingRegistry(address _pricingRegistry) external onlyOwner {
        _checkInterface(
            _pricingRegistry,
            type(IPricingRegistry).interfaceId,
            "IPricingRegistry"
        );

        pricingRegistry = _pricingRegistry;

        emit ContractUpdated("PricingRegistry", _pricingRegistry);
    }

    function setPurchaseRegistry(address _purchaseRegistry) external onlyOwner {
        _checkInterface(
            _purchaseRegistry,
            type(IPurchaseRegistry).interfaceId,
            "IPurchaseRegistry"
        );

        purchaseRegistry = _purchaseRegistry;

        emit ContractUpdated("PurchaseRegistry", _purchaseRegistry);
    }

    function setCouponRegistry(address _couponRegistry) external onlyOwner {
        _checkInterface(
            _couponRegistry,
            type(ICouponRegistry).interfaceId,
            "ICouponRegistry"
        );

        couponRegistry = _couponRegistry;

        emit ContractUpdated("CouponRegistry", _couponRegistry);
    }

    // Calculator

    function setPricingCalculator(
        address _pricingCalculator
    ) external onlyOwner {
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
        _checkInterface(
            _subscriptionEscrow,
            type(ISubscriptionEscrow).interfaceId,
            "ISubscriptionEscrow"
        );

        subscriptionEscrow = _subscriptionEscrow;

        emit ContractUpdated("SubscriptionEscrow", _subscriptionEscrow);
    }

    function setPaymentEscrow(address _paymentEscrow) external onlyOwner {
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
        _checkInterface(
            _usageRecorder,
            type(IUsageRecorder).interfaceId,
            "IUsageRecorder"
        );

        usageRecorder = _usageRecorder;

        emit ContractUpdated("UsageRecorder", _usageRecorder);
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
