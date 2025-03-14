// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.24;

interface IRestrictedAccess {
    /**
     * Events
     */

    /**
     * @notice Emitted when restricted access for a pass owner is updated
     */
    event RestrictedAccessUpdated(
        uint256 indexed orgId,
        uint256 indexed accessId,
        address indexed passOwner,
        bool restricted
    );

    /**
     * @notice Revert when the input length is invalid during restricted access updates
     */
    error InvalidRestrictedAccessInput();

    /**
     * Get Restricted Access
     */

    /**
     * @notice Get the restricted access for a pass owner
     * @param orgId Organization ID
     * @param passOwner Pass owner address
     * @return All IDs that the pass owner has restricted access to
     */
    function getRestrictedAccess(
        uint256 orgId,
        address passOwner
    ) external view returns (uint256[] memory);

    /**
     * @notice Check if a pass owner has restricted access to an access ID
     * @param orgId Organization ID
     * @param passOwner Pass owner address
     * @param accessId Access ID
     * @return True if the pass owner has restricted access to the access ID, else false
     */
    function hasRestrictedAccess(
        uint256 orgId,
        address passOwner,
        uint256 accessId
    ) external view returns (bool);
}
