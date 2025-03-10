// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.24;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {
    ReentrancyGuard
} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IERC165} from "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import {
    SafeERC20
} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

import {RegistryEnabled} from "../abstract/RegistryEnabled.sol";
import {IPaymentEscrow} from "./IPaymentEscrow.sol";
import {IFeeReducer} from "./IFeeReducer.sol";

/**
 * @title PaymentEscrow
 * @notice A contract for managing payments between organizations and users.
 * @dev Funds earned from product purchases are held in this contract for organizations.
 *
 * When fees are enabled, fees are applied to all native and ERC20 token transfers.
 *
 * Fees are only applied when upon a product purchase.
 * Organization token owners can withdraw their proceeds at any time.
 *
 * Fees are applied as a percentage of the total purchase amount.
 * 10 = 0.1%, 100 = 1%, 250 = 2.5%, 1000 = 10%, etc.
 *
 * Fees are collected in the contract and can be withdrawn by the fee withdraw role.
 *
 * By leveraging different roles, this contract supports the ability to create DAOs in the future to govern fees and other settings.
 *
 * Also incorporated is a fee reducer that can be used to reduce fees for certain organizations in the future.
 */
contract PaymentEscrow is
    AccessControl,
    RegistryEnabled,
    ReentrancyGuard,
    IPaymentEscrow
{
    // Organization ID => Token address => Balance
    mapping(uint256 => mapping(address => uint256)) public orgBalances;

    // Token address => Total Balances for organizations combined
    mapping(address => uint256) public totalBalances;

    // Whether fees are enabled during transfers
    bool public isFeeEnabled;

    // Token address => Fee
    mapping(address => uint256) public fees;

    // Blanket fee applied to tokens that do not have a specific fee set.
    uint256 public exoticFee;

    // Organization ID => Fee Exempt
    mapping(uint256 => bool) public feeExempt;

    // Token address => Whitelisted
    mapping(address => bool) public whitelistedTokens;

    // The denominator for the fee calculation and the maximum fee percentage
    uint256 public constant FEE_DENOMINATOR = 10000;

    // The fee reducer contract
    address public feeReducer;

    // Role for setting fee amounts
    bytes32 public constant FEE_SETTER_ROLE = keccak256("FEE_SETTER_ROLE");

    // Role for setting fee exemptions for organizations
    bytes32 public constant FEE_EXEMPT_ROLE = keccak256("FEE_EXEMPT_ROLE");

    // Role for setting if fees are enabled
    bytes32 public constant FEE_ENABLED_ROLE = keccak256("FEE_ENABLED_ROLE");

    // Role for withdrawing fees
    bytes32 public constant FEE_WITHDRAW_ROLE = keccak256("FEE_WITHDRAW_ROLE");

    // Role for whitelisting ERC20 tokens
    bytes32 public constant WHITELIST_ROLE = keccak256("WHITELIST_ROLE");

    constructor(
        address _contractRegistry
    ) AccessControl() RegistryEnabled(_contractRegistry) ReentrancyGuard() {
        _grantRole(DEFAULT_ADMIN_ROLE, _msgSender());
        _grantRole(FEE_SETTER_ROLE, _msgSender());
        _grantRole(FEE_EXEMPT_ROLE, _msgSender());
        _grantRole(FEE_ENABLED_ROLE, _msgSender());
        _grantRole(FEE_WITHDRAW_ROLE, _msgSender());
        _grantRole(WHITELIST_ROLE, _msgSender());
    }

    /**
     * Payment Processing
     */

    function transferDirect(
        uint256 orgId,
        address payable from,
        address token,
        uint256 amount
    ) external payable onlyRegistry(registry.purchaseManager()) nonReentrant {
        require(amount > 0, "Amount must be greater than 0");

        uint256 orgAmount = !isFeeEnabled || feeExempt[orgId]
            ? amount
            : amount - calculateFee(orgId, token, amount);

        if (token == address(0)) {
            require(msg.value == amount, "Insufficient funds");
        } else {
            require(whitelistedTokens[token], "Token is not whitelisted");
            require(
                IERC20(token).allowance(from, address(this)) >= amount,
                "Insufficient allowance"
            );
            require(
                IERC20(token).balanceOf(from) >= amount,
                "Insufficient balance"
            );
            SafeERC20.safeTransferFrom(
                IERC20(token),
                from,
                address(this),
                amount
            );
        }

        orgBalances[orgId][token] += orgAmount;
        totalBalances[token] += orgAmount;

        emit TransferAmount(orgId, from, token, amount, orgAmount);
    }

    /**
     * Token Whitelisting
     */

    function setWhitelistedToken(
        address token,
        bool isWhitelisted
    ) external onlyRole(WHITELIST_ROLE) {
        whitelistedTokens[token] = isWhitelisted;

        emit WhitelistedTokenSet(token, isWhitelisted);
    }

    /**
     * Balance Management
     */

    function withdrawOrgBalance(
        uint256 orgId,
        address token,
        uint256 amount
    ) external onlyOrgOwner(orgId) nonReentrant {
        require(orgBalances[orgId][token] >= amount, "Insufficient balance");

        if (token == address(0)) {
            (bool success, ) = payable(_msgSender()).call{value: amount}("");
            require(success, "Transfer failed");
        } else {
            SafeERC20.safeTransfer(IERC20(token), _msgSender(), amount);
        }

        orgBalances[orgId][token] -= amount;
        totalBalances[token] -= amount;

        emit OrgBalanceWithdrawn(orgId, token, amount);
    }

    /**
     * Fee Management
     */

    function setFeeEnabled(
        bool _isFeeEnabled
    ) external onlyRole(FEE_ENABLED_ROLE) {
        isFeeEnabled = _isFeeEnabled;

        emit FeeEnabled(_isFeeEnabled);
    }

    function setFee(
        address token,
        uint256 newFee
    ) external onlyRole(FEE_SETTER_ROLE) onlyValidFee(newFee) {
        fees[token] = newFee;

        emit FeeSet(token, newFee);
    }

    function setExoticFee(
        uint256 newFee
    ) external onlyRole(FEE_SETTER_ROLE) onlyValidFee(newFee) {
        exoticFee = newFee;

        emit ExoticFeeSet(newFee);
    }

    function setFeeExempt(
        uint256 orgId,
        bool isExempt
    ) external onlyRole(FEE_EXEMPT_ROLE) {
        _orgOwner(orgId);
        feeExempt[orgId] = isExempt;

        emit FeeExemptSet(orgId, isExempt);
    }

    function calculateFee(
        uint256 orgId,
        address token,
        uint256 amount
    ) public view returns (uint256) {
        uint256 fee = fees[token] == 0 && token != address(0)
            ? exoticFee
            : fees[token];

        if (fee > 0 && feeReducer != address(0)) {
            fee = IFeeReducer(feeReducer).reduceFee(orgId, token, fee);
        }

        return (amount * fee) / FEE_DENOMINATOR;
    }

    function withdrawFee(
        address token
    )
        external
        onlyRole(FEE_WITHDRAW_ROLE)
        nonReentrant
        returns (uint256 balance)
    {
        balance = getFeeBalance(token);

        require(balance > 0, "Insufficient balance");

        if (token == address(0)) {
            (bool success, ) = payable(_msgSender()).call{value: balance}("");
            require(success, "Transfer failed");
        } else {
            SafeERC20.safeTransfer(IERC20(token), _msgSender(), balance);
        }

        emit FeeWithdraw(token, balance);
    }

    function getFeeBalance(address token) public view returns (uint256) {
        if (token == address(0)) {
            return address(this).balance - totalBalances[token];
        } else {
            return
                IERC20(token).balanceOf(address(this)) - totalBalances[token];
        }
    }

    receive() external payable {}

    /**
     * Fee Reducer
     */

    function setFeeReducer(
        address _feeReducer
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(
            IERC165(_feeReducer).supportsInterface(
                type(IFeeReducer).interfaceId
            ),
            "Invalid fee reducer"
        );
        feeReducer = _feeReducer;

        emit FeeReducerSet(_feeReducer);
    }

    /**
     * Modifiers
     */

    modifier onlyValidFee(uint256 fee) {
        require(fee <= FEE_DENOMINATOR, "Invalid fee");
        _;
    }

    /**
     * ERC165
     */

    function supportsInterface(
        bytes4 interfaceId
    ) public view override returns (bool) {
        return
            interfaceId == type(IPaymentEscrow).interfaceId ||
            super.supportsInterface(interfaceId);
    }
}
