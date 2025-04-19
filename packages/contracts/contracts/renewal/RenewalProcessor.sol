// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.24;

import {
    ReentrancyGuard
} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {IERC165} from "@openzeppelin/contracts/utils/introspection/IERC165.sol";

import {RegistryEnabled} from "../abstract/RegistryEnabled.sol";
import {IPurchaseManager} from "../manager/IPurchaseManager.sol";
import {IPurchaseRegistry} from "../registry/IPurchaseRegistry.sol";
import {ISubscriptionEscrow} from "../escrow/ISubscriptionEscrow.sol";
import {IRenewalProcessor} from "./IRenewalProcessor.sol";

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
 * @title RenewalProcessor
 * @notice A contract used to batch process subscription renewals for product passes.
 *
 * Subscription renewals are permissionless and can be called by anyone.
 *
 * Looking to listen when renewals are processed?
 * Use the `RenewalProcessed` event. This event can only be emitted when the subscription is past due. When you
 * receive this event, you can grant/revoke access to your application.
 */
contract RenewalProcessor is
    RegistryEnabled,
    IRenewalProcessor,
    ReentrancyGuard,
    IERC165
{
    constructor(
        address _registry
    ) RegistryEnabled(_registry) ReentrancyGuard() {}

    /**
     * View Renewal Status
     */

    function getAllPassRenewalStatus(
        uint256 _passId
    ) external view validPassId(_passId) returns (PassRenewalStatus[] memory) {
        return _getAllPassRenewalStatus(_passId);
    }

    function getAllPassRenewalStatusBatch(
        uint256[] calldata _passIds
    ) external view returns (PassRenewalStatus[][] memory passRenewalStatus) {
        _checkPassIdLength(_passIds);

        passRenewalStatus = new PassRenewalStatus[][](_passIds.length);

        uint256 passSupply = IPurchaseManager(registry.purchaseManager())
            .passSupply();

        for (uint256 i = 0; i < _passIds.length; i++) {
            _checkPassId(_passIds[i], passSupply);
            passRenewalStatus[i] = _getAllPassRenewalStatus(_passIds[i]);
        }
    }

    function getSingleProductRenewalStatus(
        uint256 _passId,
        uint256 _productId
    ) external view validPassId(_passId) returns (PassRenewalStatus memory) {
        return _getSingleProductRenewalStatus(_passId, _productId);
    }

    function getSingleProductRenewalStatusBatch(
        uint256[] calldata _passIds,
        uint256[] calldata _productIds
    ) external view returns (PassRenewalStatus[] memory passRenewalStatus) {
        _checkIdLengths(_passIds, _productIds);

        passRenewalStatus = new PassRenewalStatus[](_passIds.length);

        uint256 passSupply = IPurchaseManager(registry.purchaseManager())
            .passSupply();

        for (uint256 i = 0; i < _passIds.length; i++) {
            _checkPassId(_passIds[i], passSupply);
            passRenewalStatus[i] = _getSingleProductRenewalStatus(
                _passIds[i],
                _productIds[i]
            );
        }
    }

    function _getAllPassRenewalStatus(
        uint256 _passId
    ) internal view returns (PassRenewalStatus[] memory passRenewalStatus) {
        uint256[] memory subProductIds = ISubscriptionEscrow(
            registry.subscriptionEscrow()
        ).getPassSubs(_passId);

        passRenewalStatus = new PassRenewalStatus[](subProductIds.length);

        for (uint256 i = 0; i < subProductIds.length; i++) {
            passRenewalStatus[i] = _getSingleProductRenewalStatus(
                _passId,
                subProductIds[i]
            );
        }
    }

    function _getSingleProductRenewalStatus(
        uint256 _passId,
        uint256 _productId
    ) internal view returns (PassRenewalStatus memory passRenewalStatus) {
        (
            ISubscriptionEscrow.Subscription memory subscription,
            ISubscriptionEscrow.SubscriptionStatus subStatus
        ) = ISubscriptionEscrow(registry.subscriptionEscrow()).getSubscription(
                _passId,
                _productId
            );

        passRenewalStatus.passId = _passId;
        passRenewalStatus.productId = _productId;
        passRenewalStatus.subscription = subscription;
        passRenewalStatus.subStatus = subStatus;

        if (!_isRenewable(subscription)) {
            passRenewalStatus.renewalStatus = RenewalStatus.NOT_READY;
        } else if (subscription.isCancelled) {
            passRenewalStatus.renewalStatus = RenewalStatus.CANCELLED;
        } else if (subscription.isPaused) {
            passRenewalStatus.renewalStatus = RenewalStatus.PAUSED;
        } else {
            passRenewalStatus.renewalStatus = RenewalStatus.READY;
        }
    }

    /**
     * Renewal Processing
     */

    function processAllPassRenewal(
        uint256 _passId
    ) external validPassId(_passId) nonReentrant {
        _processAllPassRenewal(_passId);
    }

    function processAllPassRenewalBatch(
        uint256[] calldata _passIds
    ) external nonReentrant {
        _checkPassIdLength(_passIds);

        uint256 passSupply = IPurchaseManager(registry.purchaseManager())
            .passSupply();

        for (uint256 i = 0; i < _passIds.length; i++) {
            _checkPassId(_passIds[i], passSupply);
            _processAllPassRenewal(_passIds[i]);
        }
    }

    function processSingleProductRenewal(
        uint256 _passId,
        uint256 _productId
    ) external validPassId(_passId) nonReentrant {
        _processSingleProductRenewal(_passId, _productId);
    }

    function processSingleProductRenewalBatch(
        uint256[] calldata _passIds,
        uint256[] calldata _productIds
    ) external nonReentrant {
        _checkIdLengths(_passIds, _productIds);

        uint256 passSupply = IPurchaseManager(registry.purchaseManager())
            .passSupply();

        for (uint256 i = 0; i < _passIds.length; i++) {
            _checkPassId(_passIds[i], passSupply);
            _processSingleProductRenewal(_passIds[i], _productIds[i]);
        }
    }

    function _processAllPassRenewal(uint256 _passId) internal {
        uint256[] memory subProductIds = ISubscriptionEscrow(
            registry.subscriptionEscrow()
        ).getPassSubs(_passId);

        for (uint256 i = 0; i < subProductIds.length; i++) {
            _processSingleProductRenewal(_passId, subProductIds[i]);
        }
    }

    function _processSingleProductRenewal(
        uint256 _passId,
        uint256 _productId
    ) internal {
        RenewalStatus status;

        (ISubscriptionEscrow.Subscription memory sub, ) = ISubscriptionEscrow(
            registry.subscriptionEscrow()
        ).getSubscription(_passId, _productId);

        if (!_isRenewable(sub)) {
            status = RenewalStatus.NOT_READY;
        } else if (sub.isCancelled) {
            status = RenewalStatus.CANCELLED;
        } else if (sub.isPaused) {
            status = RenewalStatus.PAUSED;
        } else {
            try
                IPurchaseManager(registry.purchaseManager()).renewSubscription(
                    _passId,
                    _productId,
                    false
                )
            {
                status = RenewalStatus.SUCCESS;
            } catch {
                status = RenewalStatus.FAILED;
            }
        }

        if (status != RenewalStatus.NOT_READY) {
            emit RenewalProcessed(
                IPurchaseRegistry(registry.purchaseRegistry()).passOrganization(
                    _passId
                ),
                _passId,
                _productId,
                status
            );
        }
    }

    /**
     * Helpers
     */

    function _isRenewable(
        ISubscriptionEscrow.Subscription memory sub
    ) internal view returns (bool) {
        return sub.endDate < block.timestamp;
    }

    /**
     * Modifiers
     */

    modifier validPassId(uint256 _passId) {
        _checkPassId(
            _passId,
            IPurchaseManager(registry.purchaseManager()).passSupply()
        );
        _;
    }

    /**
     * Checks
     */

    function _checkPassId(uint256 _passId, uint256 _passSupply) internal pure {
        require(_passId > 0, "Pass ID must be greater than 0");
        require(
            _passId <= _passSupply,
            "Pass ID must be less than total supply"
        );
    }

    function _checkPassIdLength(uint256[] memory _passIds) internal pure {
        require(_passIds.length > 0, "No pass IDs provided");
    }

    function _checkIdLengths(
        uint256[] memory _passIds,
        uint256[] memory _productIds
    ) internal pure {
        _checkPassIdLength(_passIds);
        require(_productIds.length > 0, "No product IDs provided");
        require(
            _passIds.length == _productIds.length,
            "Pass IDs and product IDs must be the same length"
        );
    }

    /**
     * Supports Interface
     */

    function supportsInterface(
        bytes4 interfaceId
    ) public view virtual returns (bool) {
        return
            interfaceId == type(IRenewalProcessor).interfaceId ||
            interfaceId == type(IERC165).interfaceId;
    }
}
