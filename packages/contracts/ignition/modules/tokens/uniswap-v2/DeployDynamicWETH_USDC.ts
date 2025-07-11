import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';

const DeployDynamicWETH_USDC = buildModule('DeployDynamicWETH_USDC', (m) => {
  const baseToken = m.getParameter('baseToken');
  const quoteToken = m.getParameter('quoteToken');
  const dynamicPriceRouter = m.getParameter('dynamicPriceRouter');
  const baseToQuotePath = m.getParameter('baseToQuotePath');
  const quoteToBasePath = m.getParameter('quoteToBasePath');

  // Deploy the dynamic token
  const dynamicToken = m.contract('UniswapV2DynamicERC20', [
    'Uniswap V2 Dynamic WETH/USDC',
    'dWETH-USDC',
    baseToken,
    quoteToken,
    dynamicPriceRouter,
    baseToQuotePath,
    quoteToBasePath,
  ]);

  return {
    dynamicToken,
  };
});

export default DeployDynamicWETH_USDC;
