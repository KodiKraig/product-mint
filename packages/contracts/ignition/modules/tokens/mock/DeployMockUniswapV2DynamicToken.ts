import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';

const DeployMockUniswapV2DynamicToken = buildModule(
  'DeployMockUniswapV2DynamicToken',
  (m) => {
    const mintTokenAddress = m.getParameter('mintToken');

    // Deploy the test stable token
    const mintStableToken = m.contract('MintStableToken');

    // Deploy the mock uniswap v2 router
    const mockUniswapV2Router = m.contract('MockUniswapV2Router');

    // Set prices for each token
    m.call(mockUniswapV2Router, 'setPriceBatch', [
      [mintTokenAddress, mintStableToken],
      [100, 1],
    ]);

    // Deploy the dynamic uniswap v2 router
    const dynamicUniswapV2Router = m.contract('UniswapV2DynamicPriceRouter', [
      mockUniswapV2Router,
    ]);

    // Deploy the dynamic ERC20 token
    const dynamicToken = m.contract('UniswapV2DynamicERC20', [
      'Mock UniswapV2 Dynamic Token MINT/USDC',
      'dMINT-USDC',
      mintTokenAddress,
      mintStableToken,
      dynamicUniswapV2Router,
      [mintTokenAddress, mintStableToken],
      [mintStableToken, mintTokenAddress],
    ]);

    return {
      mintStableToken,
      mockUniswapV2Router,
      dynamicUniswapV2Router,
      dynamicToken,
    };
  },
);

export default DeployMockUniswapV2DynamicToken;
