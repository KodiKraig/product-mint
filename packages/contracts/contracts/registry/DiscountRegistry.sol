// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.24;

import {
    EnumerableSet
} from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

import {IDiscountRegistry} from "./IDiscountRegistry.sol";
import {RegistryEnabled} from "../abstract/RegistryEnabled.sol";
import {DiscountCalculator} from "../abstract/DiscountCalculator.sol";
import {RestrictedAccess} from "../abstract/RestrictedAccess.sol";
import {IPurchaseRegistry} from "./IPurchaseRegistry.sol";

contract DiscountRegistry is
    RegistryEnabled,
    DiscountCalculator,
    RestrictedAccess,
    IDiscountRegistry
{
    using EnumerableSet for EnumerableSet.UintSet;

    // Discount ID => Discount
    mapping(uint256 => Discount) private discounts;

    // Organization ID => Discount IDs
    mapping(uint256 => EnumerableSet.UintSet) private orgDiscounts;

    // Product Pass Token ID => Discount IDs
    mapping(uint256 => EnumerableSet.UintSet) private passDiscounts;

    // Total discounts created
    uint256 public totalDiscounts;

    constructor(address registry) RegistryEnabled(registry) {}

    /**
     * Get Discounts
     */

    function getDiscount(
        uint256 discountId
    ) external view returns (Discount memory) {
        return discounts[discountId];
    }

    function getDiscountBatch(
        uint256[] calldata discountIds
    ) external view returns (Discount[] memory) {
        Discount[] memory _discounts = new Discount[](discountIds.length);

        for (uint256 i = 0; i < discountIds.length; i++) {
            _discounts[i] = discounts[discountIds[i]];
        }

        return _discounts;
    }

    function getDiscountNames(
        uint256[] calldata discountIds
    ) external view returns (string[] memory) {
        string[] memory _discountNames = new string[](discountIds.length);

        for (uint256 i = 0; i < discountIds.length; i++) {
            _discountNames[i] = discounts[discountIds[i]].name;
        }

        return _discountNames;
    }

    function getOrgDiscountIds(
        uint256 orgId
    ) external view returns (uint256[] memory) {
        return orgDiscounts[orgId].values();
    }

    function getPassDiscountIds(
        uint256 passId
    ) external view returns (uint256[] memory) {
        return passDiscounts[passId].values();
    }

    function hasPassDiscount(
        uint256 passId,
        uint256 discountId
    ) external view returns (bool) {
        return passDiscounts[passId].contains(discountId);
    }

    function getTotalDiscount(
        uint256[] memory discountIds
    ) public view returns (uint256) {
        uint256 totalDiscount = 0;

        for (uint256 i = 0; i < discountIds.length; i++) {
            _checkDiscountExists(discountIds[i]);
            totalDiscount += discounts[discountIds[i]].discount;
        }

        return totalDiscount;
    }

    function getTotalPassDiscount(
        uint256 passId
    ) external view returns (uint256) {
        return getTotalDiscount(passDiscounts[passId].values());
    }

    /**
     * Mint Discounts
     */

    function canMintDiscount(
        uint256 orgId,
        uint256 passId,
        address passOwner,
        uint256 discountId
    ) public view returns (bool) {
        Discount memory _discount = discounts[discountId];

        if (_discount.orgId != orgId) {
            return false;
        }

        if (!_discount.isActive) {
            return false;
        }

        if (
            _discount.isRestricted &&
            !restrictedAccess[orgId][passOwner].contains(discountId)
        ) {
            return false;
        }

        if (_discount.totalMints >= _discount.maxMints) {
            return false;
        }

        if (passDiscounts[passId].contains(discountId)) {
            return false;
        }

        return true;
    }

    function mintDiscountsToPass(
        uint256 orgId,
        uint256 passId,
        address passOwner,
        uint256[] calldata discountIds
    ) external onlyRegistry(registry.purchaseManager()) {
        _mintDiscountsToPass(orgId, passId, passOwner, discountIds);
    }

    function mintDiscountsToPassByOwner(
        uint256 passId,
        uint256[] calldata discountIds
    ) external onlyPassOwner(passId) {
        _mintDiscountsToPass(
            IPurchaseRegistry(registry.purchaseRegistry()).passOrganization(
                passId
            ),
            passId,
            _passOwner(passId),
            discountIds
        );
    }

    function mintDiscountsToPassByOrg(
        uint256 orgId,
        uint256[] calldata passIds,
        uint256[] calldata discountIds
    ) external onlyOrgAdmin(orgId) {
        require(passIds.length > 0, "No passes provided");

        for (uint256 i = 0; i < passIds.length; i++) {
            _mintDiscountsToPassById(orgId, passIds[i], discountIds);
        }
    }

    function _mintDiscountsToPassById(
        uint256 orgId,
        uint256 passId,
        uint256[] calldata discountIds
    ) internal {
        uint256 passOrgId = IPurchaseRegistry(registry.purchaseRegistry())
            .passOrganization(passId);

        if (passOrgId != orgId) {
            revert PassNotOrgMember(orgId, passId);
        }

        _mintDiscountsToPass(orgId, passId, _passOwner(passId), discountIds);
    }

    function _mintDiscountsToPass(
        uint256 orgId,
        uint256 passId,
        address passOwner,
        uint256[] calldata discountIds
    ) internal {
        require(discountIds.length > 0, "Invalid discount ids");

        for (uint256 i = 0; i < discountIds.length; i++) {
            if (!canMintDiscount(orgId, passId, passOwner, discountIds[i])) {
                revert CannotMintDiscount(passId, discountIds[i]);
            }

            discounts[discountIds[i]].totalMints++;
            passDiscounts[passId].add(discountIds[i]);
            restrictedAccess[orgId][passOwner].remove(discountIds[i]);

            emit DiscountMinted(orgId, passId, discountIds[i]);
        }
    }

    /**
     * Calculations
     */

    function calculateTotalDiscountedAmount(
        uint256[] memory discountIds,
        uint256 amount
    ) public view returns (uint256) {
        uint256 totalDiscount = getTotalDiscount(discountIds);

        if (totalDiscount >= _getDiscountDenominator()) {
            return 0;
        }

        return _calculateDiscountAmount(totalDiscount, amount);
    }

    function calculateTotalPassDiscountedAmount(
        uint256 passId,
        uint256 amount
    ) external view returns (uint256) {
        uint256[] memory _discountIds = passDiscounts[passId].values();

        if (_discountIds.length == 0) {
            return amount;
        }

        return calculateTotalDiscountedAmount(_discountIds, amount);
    }

    /**
     * Create Discount
     */

    function createDiscount(
        CreateDiscountParams calldata params
    ) external onlyOrgAdmin(params.orgId) {
        totalDiscounts++;

        Discount storage _discount = discounts[totalDiscounts];

        _discount.orgId = params.orgId;
        _setDiscountName(_discount, params.name);
        _setDiscount(_discount, params.discount);
        _setDiscountMaxMints(_discount, params.maxMints);
        _discount.isActive = params.isActive;
        _discount.isRestricted = params.isRestricted;

        orgDiscounts[params.orgId].add(totalDiscounts);

        emit DiscountCreated(
            params.orgId,
            totalDiscounts,
            params.name,
            params.discount
        );
    }

    /**
     * Update Discount
     */

    function setDiscountName(
        uint256 discountId,
        string calldata name
    ) external onlyOrgAdmin(discounts[discountId].orgId) {
        _setDiscountName(discounts[discountId], name);

        emit DiscountUpdated(discounts[discountId].orgId, discountId);
    }

    function _setDiscountName(
        Discount storage discount,
        string calldata name
    ) internal {
        require(bytes(name).length > 0, "Name cannot be empty");
        require(
            bytes(name).length <= 32,
            "Name cannot be longer than 32 characters"
        );

        discount.name = name;
    }

    function setDiscount(
        uint256 discountId,
        uint256 discount
    ) external onlyOrgAdmin(discounts[discountId].orgId) {
        _setDiscount(discounts[discountId], discount);

        emit DiscountUpdated(discounts[discountId].orgId, discountId);
    }

    function _setDiscount(
        Discount storage discount,
        uint256 _discount
    ) internal {
        require(_isDiscountValid(_discount), "Invalid discount");

        discount.discount = _discount;
    }

    function setDiscountMaxMints(
        uint256 discountId,
        uint256 maxMints
    ) external onlyOrgAdmin(discounts[discountId].orgId) {
        _setDiscountMaxMints(discounts[discountId], maxMints);

        emit DiscountUpdated(discounts[discountId].orgId, discountId);
    }

    function _setDiscountMaxMints(
        Discount storage discount,
        uint256 _maxMints
    ) internal {
        require(
            _maxMints == 0 || _maxMints >= discount.totalMints,
            "Invalid max mints"
        );

        discount.maxMints = _maxMints;
    }

    function setDiscountActive(
        uint256 discountId,
        bool isActive
    ) external onlyOrgAdmin(discounts[discountId].orgId) {
        discounts[discountId].isActive = isActive;

        emit DiscountUpdated(discounts[discountId].orgId, discountId);
    }

    function setDiscountRestricted(
        uint256 discountId,
        bool isRestricted
    ) external onlyOrgAdmin(discounts[discountId].orgId) {
        discounts[discountId].isRestricted = isRestricted;

        emit DiscountUpdated(discounts[discountId].orgId, discountId);
    }

    /**
     * Restricted Access
     */

    function setRestrictedAccess(
        uint256 discountId,
        address[] calldata passOwners,
        bool[] calldata restricted
    ) external onlyOrgAdmin(discounts[discountId].orgId) {
        _setRestrictedAccess(
            discounts[discountId].orgId,
            discountId,
            passOwners,
            restricted
        );
    }

    /**
     * Checks
     */

    function _checkDiscountExists(uint256 discountId) internal view {
        if (discounts[discountId].orgId == 0) {
            revert DiscountDoesNotExist(discountId);
        }
    }

    /**
     * ERC165
     */

    function supportsInterface(
        bytes4 interfaceId
    ) public view override returns (bool) {
        return
            interfaceId == type(IDiscountRegistry).interfaceId ||
            super.supportsInterface(interfaceId);
    }
}
