import { loadFixture } from '@nomicfoundation/hardhat-toolbox/network-helpers';
import { expect } from 'chai';
import hre from 'hardhat';
import { parseUnits, ZeroAddress } from 'ethers';

describe('UniswapV4DynamicERC20', () => {
  async function deployDynamicERC20() {
    const [owner, otherAccount] = await hre.ethers.getSigners();

    // Router

    const MockUniswapV4Router = await hre.ethers.getContractFactory(
      'MockUniswapV4Router',
    );
    const mockUniswapV4Router = await MockUniswapV4Router.deploy();

    const UniswapV4DynamicPriceRouter = await hre.ethers.getContractFactory(
      'UniswapV4DynamicPriceRouter',
    );
    const uniswapV4DynamicPriceRouter =
      await UniswapV4DynamicPriceRouter.deploy(mockUniswapV4Router);

    // Tokens

    const MintToken = await hre.ethers.getContractFactory('MintToken');
    const mintToken = await MintToken.deploy();
    const mintToken2 = await MintToken.deploy();

    const MintStableToken = await hre.ethers.getContractFactory(
      'MintStableToken',
    );
    const mintStableToken = await MintStableToken.deploy();

    await mockUniswapV4Router.connect(owner).setPrice(mintToken, 1000);
    await mockUniswapV4Router.connect(owner).setPrice(mintToken2, 100);
    await mockUniswapV4Router.connect(owner).setPrice(mintStableToken, 1);

    const UniswapV4DynamicERC20 = await hre.ethers.getContractFactory(
      'UniswapV4DynamicERC20',
    );
    const dynamicERC20 = await UniswapV4DynamicERC20.deploy(
      'Dynamic WETH vs USDC',
      'dWETH-USDC',
      await mintToken.getAddress(),
      await mintStableToken.getAddress(),
      await uniswapV4DynamicPriceRouter.getAddress(),
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
      [
        { fee: 100, tickSpacing: 1 },
        { fee: 10, tickSpacing: 1 },
      ],
      [
        { fee: 10, tickSpacing: 1 },
        { fee: 100, tickSpacing: 1 },
      ],
    );

    return {
      dynamicERC20,
      mintToken,
      mintToken2,
      mintStableToken,
      uniswapV4DynamicPriceRouter,
      mockUniswapV4Router,
      owner,
      otherAccount,
    };
  }

  describe('Deployment', () => {
    it('owner is set', async () => {
      const { dynamicERC20, owner } = await loadFixture(deployDynamicERC20);
      expect(await dynamicERC20.owner()).to.equal(owner);
    });

    it('should set the correct name and symbol', async () => {
      const { dynamicERC20 } = await loadFixture(deployDynamicERC20);
      expect(await dynamicERC20.name()).to.equal('Dynamic WETH vs USDC');
      expect(await dynamicERC20.symbol()).to.equal('dWETH-USDC');
    });

    it('should set the correct base and quote token', async () => {
      const { dynamicERC20, mintToken, mintStableToken } = await loadFixture(
        deployDynamicERC20,
      );
      expect(await dynamicERC20.baseToken()).to.equal(
        await mintToken.getAddress(),
      );
      expect(await dynamicERC20.quoteToken()).to.equal(
        await mintStableToken.getAddress(),
      );
    });

    it('should set the correct dynamic price router', async () => {
      const { dynamicERC20, uniswapV4DynamicPriceRouter } = await loadFixture(
        deployDynamicERC20,
      );
      expect(await dynamicERC20.dynamicPriceRouter()).to.equal(
        await uniswapV4DynamicPriceRouter.getAddress(),
      );
    });

    it('should set the correct base to quote path', async () => {
      const { dynamicERC20, mintToken, mintToken2, mintStableToken } =
        await loadFixture(deployDynamicERC20);
      expect(await dynamicERC20.getBaseToQuotePath()).to.deep.equal([
        await mintToken.getAddress(),
        await mintToken2.getAddress(),
        await mintStableToken.getAddress(),
      ]);
    });

    it('should set the correct quote to base path', async () => {
      const { dynamicERC20, mintStableToken, mintToken2, mintToken } =
        await loadFixture(deployDynamicERC20);
      expect(await dynamicERC20.getQuoteToBasePath()).to.deep.equal([
        await mintStableToken.getAddress(),
        await mintToken2.getAddress(),
        await mintToken.getAddress(),
      ]);
    });

    it('should set the correct base to quote path keys', async () => {
      const { dynamicERC20, mintToken2, mintStableToken } = await loadFixture(
        deployDynamicERC20,
      );
      expect(await dynamicERC20.getBaseToQuotePathKeys()).to.deep.equal([
        [await mintToken2.getAddress(), 100n, 1n, ZeroAddress, '0x'],
        [await mintStableToken.getAddress(), 10n, 1n, ZeroAddress, '0x'],
      ]);
    });

    it('should set the correct quote to base path keys', async () => {
      const { dynamicERC20, mintToken2, mintToken } = await loadFixture(
        deployDynamicERC20,
      );
      expect(await dynamicERC20.getQuoteToBasePathKeys()).to.deep.equal([
        [await mintToken2.getAddress(), 10n, 1n, ZeroAddress, '0x'],
        [await mintToken.getAddress(), 100n, 1n, ZeroAddress, '0x'],
      ]);
    });
  });
});
