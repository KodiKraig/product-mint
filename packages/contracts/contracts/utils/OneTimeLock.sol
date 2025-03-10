// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.24;

/**
 * @title OneTimeLock
 * @notice A contract for locking calls to a caller.
 * Once locked, there is no way to unlock the caller.
 */
contract OneTimeLock {
    /**
     * @dev The error emitted when the caller is already locked.
     */
    error AlreadyLocked();

    /**
     * @dev The event emitted when the caller is locked.
     */
    event Locked(address caller);

    /**
     * @dev The caller => locked
     */
    mapping(address => bool) private _locked;

    /**
     * @notice Locks the caller.
     * @dev The function can only be called once with the same caller.
     * If the function is called more than once, the second and subsequent calls will revert.
     */
    function lock(address caller) internal {
        if (_locked[caller]) {
            revert AlreadyLocked();
        }

        _locked[caller] = true;

        emit Locked(caller);
    }
}
