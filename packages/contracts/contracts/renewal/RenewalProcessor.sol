// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.24;

import {
    ReentrancyGuard
} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

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
    ReentrancyGuard
{
    constructor(
        address _registry
    ) RegistryEnabled(_registry) ReentrancyGuard() {}

    function processAllPassRenewalBatch(
        uint256 _startPassId,
        uint256 _endPassId
    ) external nonReentrant {
        for (uint256 i = _startPassId; i <= _endPassId; i++) {
            _processAllPassRenewal(i);
        }
    }

    function processAllPassRenewal(uint256 _passId) external nonReentrant {
        _processAllPassRenewal(_passId);
    }

    function processSingleProductRenewal(
        uint256 _passId,
        uint256 _productId
    ) external nonReentrant {
        _processSingleProductRenewal(_passId, _productId);
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

        if (sub.endDate > block.timestamp) {
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
}
