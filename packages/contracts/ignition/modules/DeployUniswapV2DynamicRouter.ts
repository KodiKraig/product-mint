import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';

const DeployUniswapV2DynamicRouter = buildModule(
  'DeployUniswapV2DynamicRouter',
  (m) => {
    // Get the Uniswap V2 router address
    // https://docs.uniswap.org/contracts/v2/reference/smart-contracts/v2-deployments
    const uniswapV2RouterAddress = m.getParameter('uniswapV2RouterAddress');

    // Deploy the dynamic price router
    const dynamicPriceRouter = m.contract('UniswapV2DynamicPriceRouter', [
      uniswapV2RouterAddress,
    ]);

    return {
      dynamicPriceRouter,
    };
  },
);

export default DeployUniswapV2DynamicRouter;
