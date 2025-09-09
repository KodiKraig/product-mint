import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';

const DeployUniswapV4DynamicRouter = buildModule(
  'DeployUniswapV4DynamicRouter',
  (m) => {
    // Get the Uniswap V4 router address
    // https://docs.uniswap.org/contracts/v4/deployments
    const uniswapV4QuoterAddress = m.getParameter('uniswapV4QuoterAddress');

    // Deploy the dynamic price router
    const dynamicPriceRouter = m.contract('UniswapV4DynamicPriceRouter', [
      uniswapV4QuoterAddress,
    ]);

    return {
      dynamicPriceRouter,
    };
  },
);

export default DeployUniswapV4DynamicRouter;
