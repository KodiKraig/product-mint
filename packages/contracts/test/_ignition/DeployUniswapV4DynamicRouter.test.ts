import hre from 'hardhat';
import { expect } from 'chai';
import DeployUniswapV4DynamicRouter from '../../ignition/modules/DeployUniswapV4DynamicRouter';

describe('DeployUniswapV4DynamicRouter', () => {
  it('should deploy the router', async () => {
    const UNISWAP_V4_QUOTER_ADDRESS =
      '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D';

    const { dynamicPriceRouter } = await hre.ignition.deploy(
      DeployUniswapV4DynamicRouter,
      {
        parameters: {
          DeployUniswapV4DynamicRouter: {
            uniswapV4QuoterAddress: UNISWAP_V4_QUOTER_ADDRESS,
          },
        },
      },
    );

    expect(await dynamicPriceRouter.getAddress()).to.not.be.undefined;
    expect(await dynamicPriceRouter.v4Quoter()).to.equal(
      UNISWAP_V4_QUOTER_ADDRESS,
    );
  });
});
