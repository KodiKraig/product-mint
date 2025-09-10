import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';

const DeployDynamicKONG_USDC = buildModule('DeployDynamicKONG_USDC', (m) => {
  const baseToken = m.getParameter('baseToken');
  const quoteToken = m.getParameter('quoteToken');
  const dynamicPriceRouter = m.getParameter('dynamicPriceRouter');
  const baseToQuotePath = m.getParameter('baseToQuotePath');
  const quoteToBasePath = m.getParameter('quoteToBasePath');
  const baseToQuoteFees = m.getParameter('baseToQuoteFees');
  const quoteToBaseFees = m.getParameter('quoteToBaseFees');

  // Deploy the dynamic token
  const dynamicToken = m.contract('UniswapV4DynamicERC20', [
    'Uniswap V4 Dynamic KONG/USDC',
    'dKONG-USDC',
    baseToken,
    quoteToken,
    dynamicPriceRouter,
    baseToQuotePath,
    quoteToBasePath,
    baseToQuoteFees,
    quoteToBaseFees,
  ]);

  return {
    dynamicToken,
  };
});

export default DeployDynamicKONG_USDC;
