import hre from 'hardhat';
import { expect } from 'chai';
import DeployUniswapV2DynamicRouter from '../../ignition/modules/DeployUniswapV2DynamicRouter';

describe('DeployUniswapV2DynamicRouter', () => {
  it('should deploy the router', async () => {
    const UNISWAP_V2_ROUTER_ADDRESS =
      '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D';

    const { dynamicPriceRouter } = await hre.ignition.deploy(
      DeployUniswapV2DynamicRouter,
      {
        parameters: {
          DeployUniswapV2DynamicRouter: {
            uniswapV2RouterAddress: UNISWAP_V2_ROUTER_ADDRESS,
          },
        },
      },
    );

    expect(await dynamicPriceRouter.getAddress()).to.not.be.undefined;
    expect(await dynamicPriceRouter.uniswapV2Router()).to.equal(
      UNISWAP_V2_ROUTER_ADDRESS,
    );
  });
});
