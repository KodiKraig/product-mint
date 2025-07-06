// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.24;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {ERC165} from "@openzeppelin/contracts/utils/introspection/ERC165.sol";
import {IERC165} from "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import {
    IERC20Metadata
} from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";

import {IDynamicERC20} from "../tokens/IDynamicERC20.sol";
import {IDynamicPriceRouter} from "../router/IDynamicPriceRouter.sol";

abstract contract DynamicERC20 is ERC20, ERC165, IDynamicERC20 {
    // Token used for payment
    address public immutable baseToken;

    // Token used for price targeting
    address public immutable quoteToken;

    // Path used to convert the base token to the quote token
    address[] internal baseToQuotePath;

    // Path used to convert the quote token to the base token
    address[] internal quoteToBasePath;

    // Dynamic price router to interact with the dex
    address public dynamicPriceRouter;

    constructor(
        address _baseToken,
        address _quoteToken,
        address _dynamicPriceRouter
    ) {
        require(_baseToken != address(0), "Base token cannot be zero address");
        require(
            _quoteToken != address(0),
            "Quote token cannot be zero address"
        );
        require(
            _baseToken != _quoteToken,
            "Base and quote token cannot be the same"
        );

        baseToken = _baseToken;
        quoteToken = _quoteToken;

        _setDynamicPriceRouter(_dynamicPriceRouter);
    }

    /**
     * IDynamicERC20
     */

    function routerName() external view virtual returns (string memory) {
        return IDynamicPriceRouter(dynamicPriceRouter).ROUTER_NAME();
    }

    /**
     * Paths
     */

    function getBaseToQuotePath()
        external
        view
        virtual
        returns (address[] memory)
    {
        return baseToQuotePath;
    }

    function _checkBaseToQuotePath(address[] memory _path) internal virtual {
        require(_path.length > 1, "Path must have at least 2 tokens");
        require(_path[0] == baseToken, "Base token must be first in path");
        require(
            _path[_path.length - 1] == quoteToken,
            "Quote token must be last in path"
        );
    }

    function getQuoteToBasePath()
        external
        view
        virtual
        returns (address[] memory)
    {
        return quoteToBasePath;
    }

    function _checkQuoteToBasePath(address[] memory _path) internal virtual {
        require(_path.length > 1, "Path must have at least 2 tokens");
        require(_path[0] == quoteToken, "Quote token must be first in path");
        require(
            _path[_path.length - 1] == baseToken,
            "Base token must be last in path"
        );
    }

    /**
     * ERC20 view overrides
     */

    function totalSupply() public view virtual override returns (uint256) {
        return IERC20(baseToken).totalSupply();
    }

    function decimals() public view virtual override returns (uint8) {
        return IERC20Metadata(quoteToken).decimals();
    }

    /**
     * @dev State changing functions are not allowed
     */

    error TransferNotAllowed();
    error ApproveNotAllowed();

    function transfer(address, uint256) public pure override returns (bool) {
        revert TransferNotAllowed();
    }

    function transferFrom(
        address,
        address,
        uint256
    ) public pure override returns (bool) {
        revert TransferNotAllowed();
    }

    function approve(address, uint256) public pure override returns (bool) {
        revert ApproveNotAllowed();
    }

    /**
     * Dynamic price router updates
     */

    /**
     * @notice Emitted when the dynamic price router is set
     * @param dynamicERC20 The address of the current dynamic ERC20 contract
     * @param dynamicPriceRouter The address of the dynamic price router
     */
    event DynamicPriceRouterSet(
        address indexed dynamicERC20,
        address indexed dynamicPriceRouter
    );

    function _setDynamicPriceRouter(
        address _dynamicPriceRouter
    ) internal virtual {
        dynamicPriceRouter = _dynamicPriceRouter;

        emit DynamicPriceRouterSet(address(this), _dynamicPriceRouter);
    }

    /**
     * ERC165
     */

    function supportsInterface(
        bytes4 interfaceId
    ) public view virtual override returns (bool) {
        return
            interfaceId == type(IDynamicERC20).interfaceId ||
            interfaceId == type(IERC20).interfaceId ||
            interfaceId == type(IERC20Metadata).interfaceId ||
            super.supportsInterface(interfaceId);
    }
}
