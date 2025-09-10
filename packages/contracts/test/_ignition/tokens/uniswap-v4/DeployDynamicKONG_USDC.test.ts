import hre from 'hardhat';
import { expect } from 'chai';
import DeployDynamicKONG_USDC from '../../../../ignition/modules/tokens/uniswap-v4/DeployDynamicKONG_USDC';
import { ZeroAddress } from 'ethers';

describe('DeployDynamicKONG_USDC', () => {
  it('should deploy the dynamic token', async () => {
    // Deploy mock ERC20s
    const MintToken = await hre.ethers.getContractFactory('MintToken');
    const mintToken = await MintToken.deploy();
    const MintStableToken = await hre.ethers.getContractFactory(
      'MintStableToken',
    );
    const mintStableToken = await MintStableToken.deploy();

    // Deploy the mock Uniswap V4 router
    const MockUniswapV4Router = await hre.ethers.getContractFactory(
      'MockUniswapV4Router',
    );
    const mockUniswapV4Router = await MockUniswapV4Router.deploy();
    const UniswapV4DynamicPriceRouter = await hre.ethers.getContractFactory(
      'UniswapV4DynamicPriceRouter',
    );
    const uniswapV4DynamicPriceRouter =
      await UniswapV4DynamicPriceRouter.deploy(mockUniswapV4Router);

    // Set pricing
    await mockUniswapV4Router.setPrice(mintToken, 100);
    await mockUniswapV4Router.setPrice(mintStableToken, 1);

    // Deploy the dynamic token
    const { dynamicToken } = await hre.ignition.deploy(DeployDynamicKONG_USDC, {
      parameters: {
        DeployDynamicKONG_USDC: {
          baseToken: await mintToken.getAddress(),
          quoteToken: await mintStableToken.getAddress(),
          dynamicPriceRouter: await uniswapV4DynamicPriceRouter.getAddress(),
          baseToQuotePath: [
            await mintToken.getAddress(),
            await mintStableToken.getAddress(),
          ],
          quoteToBasePath: [
            await mintStableToken.getAddress(),
            await mintToken.getAddress(),
          ],
          baseToQuoteFees: [
            {
              fee: 100,
              tickSpacing: 1,
            },
          ],
          quoteToBaseFees: [
            {
              fee: 300,
              tickSpacing: 10,
            },
          ],
        },
      },
    });

    // ASSERTS
    expect(await dynamicToken.getAddress()).to.not.be.undefined;
    expect(await dynamicToken.name()).to.equal('Uniswap V4 Dynamic KONG/USDC');
    expect(await dynamicToken.symbol()).to.equal('dKONG-USDC');
    expect(await dynamicToken.baseToken()).to.equal(
      await mintToken.getAddress(),
    );
    expect(await dynamicToken.quoteToken()).to.equal(
      await mintStableToken.getAddress(),
    );
    expect(await dynamicToken.dynamicPriceRouter()).to.equal(
      await uniswapV4DynamicPriceRouter.getAddress(),
    );
    expect(await dynamicToken.getBaseToQuotePath()).to.deep.equal([
      await mintToken.getAddress(),
      await mintStableToken.getAddress(),
    ]);
    expect(await dynamicToken.getQuoteToBasePath()).to.deep.equal([
      await mintStableToken.getAddress(),
      await mintToken.getAddress(),
    ]);
    expect(await dynamicToken.getBaseToQuotePathKeys()).to.deep.equal([
      [await mintStableToken.getAddress(), 100, 1, ZeroAddress, '0x'],
    ]);
    expect(await dynamicToken.getQuoteToBasePathKeys()).to.deep.equal([
      [await mintToken.getAddress(), 300, 10, ZeroAddress, '0x'],
    ]);
  });
});
