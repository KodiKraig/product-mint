import { loadFixture } from '@nomicfoundation/hardhat-toolbox/network-helpers';
import { expect } from 'chai';
import hre from 'hardhat';
import { parseUnits, ZeroAddress } from 'ethers';
import calculateInterfaceId from '../../utils/calculate-interface-id';

describe('UniswapV3DynamicERC20', () => {
  async function deployDynamicERC20() {
    const [owner, otherAccount] = await hre.ethers.getSigners();

    // Router

    const MockUniswapV3Router = await hre.ethers.getContractFactory(
      'MockUniswapV3Router',
    );
    const mockUniswapV3Router = await MockUniswapV3Router.deploy();

    const UniswapV3DynamicPriceRouter = await hre.ethers.getContractFactory(
      'UniswapV3DynamicPriceRouter',
    );
    const uniswapV3DynamicPriceRouter =
      await UniswapV3DynamicPriceRouter.deploy(mockUniswapV3Router);

    // Tokens

    const MintToken = await hre.ethers.getContractFactory('MintToken');
    const mintToken = await MintToken.deploy();
    const mintToken2 = await MintToken.deploy();

    const MintStableToken = await hre.ethers.getContractFactory(
      'MintStableToken',
    );
    const mintStableToken = await MintStableToken.deploy();

    await mockUniswapV3Router
      .connect(owner)
      .setPrice(await mintToken.getAddress(), 20);
    await mockUniswapV3Router
      .connect(owner)
      .setPrice(await mintStableToken.getAddress(), 5);

    const UniswapV3DynamicERC20 = await hre.ethers.getContractFactory(
      'UniswapV3DynamicERC20',
    );
    const dynamicERC20 = await UniswapV3DynamicERC20.deploy(
      'Dynamic WETH vs USDC',
      'WETHusdc',
      await mintToken.getAddress(),
      await mintStableToken.getAddress(),
      await uniswapV3DynamicPriceRouter.getAddress(),
      [
        await mintToken.getAddress(),
        await mintToken2.getAddress(),
        await mintStableToken.getAddress(),
      ],
      [
        await mintStableToken.getAddress(),
        await mintToken2.getAddress(),
        await mintToken.getAddress(),
      ],
      [2, 2],
      [1, 3],
    );

    return {
      UniswapV3DynamicERC20,
      dynamicERC20,
      owner,
      otherAccount,
      mintToken,
      mintToken2,
      mintStableToken,
      uniswapV3DynamicPriceRouter,
      mockUniswapV3Router,
    };
  }

  describe('Deployment', () => {
    it('initial state is correct', async () => {
      const {
        dynamicERC20,
        mintToken,
        mintStableToken,
        uniswapV3DynamicPriceRouter,
        mintToken2,
      } = await loadFixture(deployDynamicERC20);

      expect(await dynamicERC20.name()).to.equal('Dynamic WETH vs USDC');
      expect(await dynamicERC20.symbol()).to.equal('WETHusdc');

      expect(await dynamicERC20.baseToken()).to.equal(
        await mintToken.getAddress(),
      );

      expect(await dynamicERC20.quoteToken()).to.equal(
        await mintStableToken.getAddress(),
      );

      expect(await dynamicERC20.getBaseToQuotePath()).to.deep.equal([
        await mintToken.getAddress(),
        await mintToken2.getAddress(),
        await mintStableToken.getAddress(),
      ]);

      expect(await dynamicERC20.getQuoteToBasePath()).to.deep.equal([
        await mintStableToken.getAddress(),
        await mintToken2.getAddress(),
        await mintToken.getAddress(),
      ]);

      expect(await dynamicERC20.dynamicPriceRouter()).to.equal(
        await uniswapV3DynamicPriceRouter.getAddress(),
      );

      expect(await dynamicERC20.baseToQuotePathEncoded()).to.equal(
        hre.ethers.solidityPacked(
          ['address', 'uint24', 'address', 'uint24', 'address'],
          [
            await mintToken.getAddress(),
            3000,
            await mintToken2.getAddress(),
            3000,
            await mintStableToken.getAddress(),
          ],
        ),
      );

      expect(await dynamicERC20.quoteToBasePathEncoded()).to.equal(
        hre.ethers.solidityPacked(
          ['address', 'uint24', 'address', 'uint24', 'address'],
          [
            await mintStableToken.getAddress(),
            500,
            await mintToken2.getAddress(),
            10000,
            await mintToken.getAddress(),
          ],
        ),
      );

      expect(await dynamicERC20.getBaseToQuoteFees()).to.deep.equal([2, 2]);
      expect(await dynamicERC20.getQuoteToBaseFees()).to.deep.equal([1, 3]);
    });

    it('correct owner is set', async () => {
      const { dynamicERC20, owner } = await loadFixture(deployDynamicERC20);

      expect(await dynamicERC20.owner()).to.equal(owner);
    });
  });
});
