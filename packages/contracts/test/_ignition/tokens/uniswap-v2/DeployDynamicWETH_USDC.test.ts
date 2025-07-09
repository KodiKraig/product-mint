import hre from 'hardhat';
import { expect } from 'chai';
import DeployDynamicWETH_USDC from '../../../../ignition/modules/tokens/uniswap-v2/DeployDynamicWETH_USDC';

describe('DeployDynamicWETH_USDC', () => {
  it('should deploy the dynamic token', async () => {
    // Deploy mock ERC20s
    const MintToken = await hre.ethers.getContractFactory('MintToken');
    const mintToken = await MintToken.deploy();
    const MintStableToken = await hre.ethers.getContractFactory(
      'MintStableToken',
    );
    const mintStableToken = await MintStableToken.deploy();

    // Deploy the mock Uniswap V2 router
    const MockUniswapV2Router = await hre.ethers.getContractFactory(
      'MockUniswapV2Router',
    );
    const mockUniswapV2Router = await MockUniswapV2Router.deploy();
    const UniswapV2DynamicPriceRouter = await hre.ethers.getContractFactory(
      'UniswapV2DynamicPriceRouter',
    );
    const uniswapV2DynamicPriceRouter =
      await UniswapV2DynamicPriceRouter.deploy(mockUniswapV2Router);

    // Set pricing
    await mockUniswapV2Router.setPrice(mintToken, 100);
    await mockUniswapV2Router.setPrice(mintStableToken, 1);

    // Deploy the dynamic token
    const { dynamicToken } = await hre.ignition.deploy(DeployDynamicWETH_USDC, {
      parameters: {
        DeployDynamicWETH_USDC: {
          baseToken: await mintToken.getAddress(),
          quoteToken: await mintStableToken.getAddress(),
          dynamicPriceRouter: await uniswapV2DynamicPriceRouter.getAddress(),
          baseToQuotePath: [
            await mintToken.getAddress(),
            await mintStableToken.getAddress(),
          ],
          quoteToBasePath: [
            await mintStableToken.getAddress(),
            await mintToken.getAddress(),
          ],
        },
      },
    });

    // ASSERTS
    expect(await dynamicToken.getAddress()).to.not.be.undefined;
    expect(await dynamicToken.baseToken()).to.equal(
      await mintToken.getAddress(),
    );
    expect(await dynamicToken.quoteToken()).to.equal(
      await mintStableToken.getAddress(),
    );
    expect(await dynamicToken.dynamicPriceRouter()).to.equal(
      await uniswapV2DynamicPriceRouter.getAddress(),
    );
    expect(await dynamicToken.getBaseToQuotePath()).to.deep.equal([
      await mintToken.getAddress(),
      await mintStableToken.getAddress(),
    ]);
    expect(await dynamicToken.getQuoteToBasePath()).to.deep.equal([
      await mintStableToken.getAddress(),
      await mintToken.getAddress(),
    ]);
  });
});
