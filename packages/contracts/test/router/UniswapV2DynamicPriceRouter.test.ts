import { loadFixture } from '@nomicfoundation/hardhat-toolbox/network-helpers';
import hre from 'hardhat';
import { expect } from 'chai';
import { parseUnits, ZeroAddress } from 'ethers';
import calculateInterfaceId from '../../utils/calculate-interface-id';

describe('UniswapV2DynamicPriceRouter', () => {
  async function loadUniswapV2DynamicPriceRouter() {
    const [owner, otherAccount] = await hre.ethers.getSigners();

    // Router

    const MockUniswapV2Router = await hre.ethers.getContractFactory(
      'MockUniswapV2Router',
    );
    const mockUniswapV2Router = await MockUniswapV2Router.deploy();

    const UniswapV2DynamicPriceRouter = await hre.ethers.getContractFactory(
      'UniswapV2DynamicPriceRouter',
    );
    const uniswapV2DynamicPriceRouter =
      await UniswapV2DynamicPriceRouter.deploy(mockUniswapV2Router);

    // Tokens

    const MintToken = await hre.ethers.getContractFactory('MintToken');
    const mintToken = await MintToken.deploy();

    const MintStableToken = await hre.ethers.getContractFactory(
      'MintStableToken',
    );
    const mintStableToken = await MintStableToken.deploy();

    // Set prices

    await mockUniswapV2Router.connect(owner).setPrice(mintToken, 1000);

    await mockUniswapV2Router.connect(owner).setPrice(mintStableToken, 1);

    return {
      mockUniswapV2Router,
      uniswapV2DynamicPriceRouter,
      mintToken,
      mintStableToken,
      owner,
      otherAccount,
    };
  }

  describe('Deployment', () => {
    it('owner should be the deployer', async () => {
      const { uniswapV2DynamicPriceRouter, owner } = await loadFixture(
        loadUniswapV2DynamicPriceRouter,
      );
      expect(await uniswapV2DynamicPriceRouter.owner()).to.equal(owner);
    });

    it('should set the Uniswap V2 router', async () => {
      const { uniswapV2DynamicPriceRouter, mockUniswapV2Router } =
        await loadFixture(loadUniswapV2DynamicPriceRouter);
      expect(await uniswapV2DynamicPriceRouter.uniswapV2Router()).to.equal(
        mockUniswapV2Router,
      );
    });

    it('should return the correct name', async () => {
      const { uniswapV2DynamicPriceRouter } = await loadFixture(
        loadUniswapV2DynamicPriceRouter,
      );
      expect(await uniswapV2DynamicPriceRouter.routerName()).to.equal(
        'uniswap-v2',
      );
    });
  });

  describe('Update Uniswap V2 Router', () => {
    it('should update the Uniswap V2 router', async () => {
      const { uniswapV2DynamicPriceRouter, mockUniswapV2Router } =
        await loadFixture(loadUniswapV2DynamicPriceRouter);

      const MockUniswapV2Router = await hre.ethers.getContractFactory(
        'MockUniswapV2Router',
      );
      const newMockUniswapV2Router = await MockUniswapV2Router.deploy();

      await expect(
        uniswapV2DynamicPriceRouter.updateUniswapRouter(newMockUniswapV2Router),
      )
        .to.emit(uniswapV2DynamicPriceRouter, 'UniswapRouterUpdated')
        .withArgs(await newMockUniswapV2Router.getAddress());

      expect(await uniswapV2DynamicPriceRouter.uniswapV2Router()).to.equal(
        newMockUniswapV2Router,
      );
    });

    it('revert if the new Uniswap V2 router is the zero address', async () => {
      const { uniswapV2DynamicPriceRouter } = await loadFixture(
        loadUniswapV2DynamicPriceRouter,
      );

      await expect(
        uniswapV2DynamicPriceRouter.updateUniswapRouter(ZeroAddress),
      ).to.be.revertedWith('Uniswap router cannot be zero address');
    });
  });

  describe('Supports Interface', () => {
    it('should return true for the IDynamicPriceRouter interface', async () => {
      const { uniswapV2DynamicPriceRouter } = await loadFixture(
        loadUniswapV2DynamicPriceRouter,
      );

      const interfaceId = calculateInterfaceId([
        'routerName()',
        'getBaseTokenPrice(address,address)',
        'getBaseTokenAmount(address,address,uint256)',
        'getQuoteTokenAmount(address,address,uint256)',
      ]);

      expect(await uniswapV2DynamicPriceRouter.supportsInterface(interfaceId))
        .to.be.true;
    });

    it('should return true for the IERC165 interface', async () => {
      const { uniswapV2DynamicPriceRouter } = await loadFixture(
        loadUniswapV2DynamicPriceRouter,
      );

      expect(await uniswapV2DynamicPriceRouter.supportsInterface('0x01ffc9a7'))
        .to.be.true;
    });

    it('should return false for an unknown interface', async () => {
      const { uniswapV2DynamicPriceRouter } = await loadFixture(
        loadUniswapV2DynamicPriceRouter,
      );

      expect(await uniswapV2DynamicPriceRouter.supportsInterface('0xffffffff'))
        .to.be.false;
    });
  });

  describe('Get Base Token Price', () => {
    it('should return the correct price', async () => {
      const { uniswapV2DynamicPriceRouter, mintToken, mintStableToken } =
        await loadFixture(loadUniswapV2DynamicPriceRouter);

      expect(
        await uniswapV2DynamicPriceRouter.getBaseTokenPrice(
          mintToken,
          mintStableToken,
        ),
      ).to.equal(parseUnits('1000', 6));
    });

    it('revert if the base token is the same as the quote token', async () => {
      const { uniswapV2DynamicPriceRouter, mintToken } = await loadFixture(
        loadUniswapV2DynamicPriceRouter,
      );

      await expect(
        uniswapV2DynamicPriceRouter.getBaseTokenPrice(mintToken, mintToken),
      ).to.be.revertedWith('Base and quote tokens must differ');
    });

    it('revert if the base token is the zero address', async () => {
      const { uniswapV2DynamicPriceRouter, mintStableToken } =
        await loadFixture(loadUniswapV2DynamicPriceRouter);

      await expect(
        uniswapV2DynamicPriceRouter.getBaseTokenPrice(
          ZeroAddress,
          mintStableToken,
        ),
      ).to.be.revertedWith('Invalid token address');
    });

    it('revert if the quote token is the zero address', async () => {
      const { uniswapV2DynamicPriceRouter, mintToken } = await loadFixture(
        loadUniswapV2DynamicPriceRouter,
      );

      await expect(
        uniswapV2DynamicPriceRouter.getBaseTokenPrice(mintToken, ZeroAddress),
      ).to.be.revertedWith('Invalid token address');
    });

    it('revert if uniswap returns an invalid amount', async () => {
      const {
        uniswapV2DynamicPriceRouter,
        mockUniswapV2Router,
        mintToken,
        mintStableToken,
      } = await loadFixture(loadUniswapV2DynamicPriceRouter);

      await mockUniswapV2Router.setPrice(mintToken, 0);

      await expect(
        uniswapV2DynamicPriceRouter.getBaseTokenPrice(
          mintToken,
          mintStableToken,
        ),
      ).to.be.revertedWith('Invalid amount out from Uniswap');
    });
  });

  describe('Get Base Token Amount', () => {
    it('should return the correct amount', async () => {
      const { uniswapV2DynamicPriceRouter, mintToken, mintStableToken } =
        await loadFixture(loadUniswapV2DynamicPriceRouter);

      expect(
        await uniswapV2DynamicPriceRouter.getBaseTokenAmount(
          mintToken,
          mintStableToken,
          parseUnits('2000', 6),
        ),
      ).to.equal(parseUnits('2000', 18));
    });

    it('revert if the base token is the same as the quote token', async () => {
      const { uniswapV2DynamicPriceRouter, mintToken } = await loadFixture(
        loadUniswapV2DynamicPriceRouter,
      );

      await expect(
        uniswapV2DynamicPriceRouter.getBaseTokenAmount(
          mintToken,
          mintToken,
          parseUnits('1', 18),
        ),
      ).to.be.revertedWith('Base and quote tokens must differ');
    });

    it('revert if the base token is the zero address', async () => {
      const { uniswapV2DynamicPriceRouter, mintStableToken } =
        await loadFixture(loadUniswapV2DynamicPriceRouter);

      await expect(
        uniswapV2DynamicPriceRouter.getBaseTokenAmount(
          ZeroAddress,
          mintStableToken,
          parseUnits('1', 18),
        ),
      ).to.be.revertedWith('Invalid token address');
    });

    it('revert if the quote token is the zero address', async () => {
      const { uniswapV2DynamicPriceRouter, mintToken } = await loadFixture(
        loadUniswapV2DynamicPriceRouter,
      );

      await expect(
        uniswapV2DynamicPriceRouter.getBaseTokenAmount(
          mintToken,
          ZeroAddress,
          parseUnits('1', 18),
        ),
      ).to.be.revertedWith('Invalid token address');
    });

    it('revert if uniswap returns an invalid amount', async () => {
      const {
        uniswapV2DynamicPriceRouter,
        mockUniswapV2Router,
        mintToken,
        mintStableToken,
      } = await loadFixture(loadUniswapV2DynamicPriceRouter);

      await mockUniswapV2Router.setPrice(mintStableToken, 0);

      await expect(
        uniswapV2DynamicPriceRouter.getBaseTokenAmount(
          mintToken,
          mintStableToken,
          parseUnits('1', 18),
        ),
      ).to.be.revertedWith('Invalid amount out from Uniswap');
    });

    it('revert if the quote token amount is zero', async () => {
      const { uniswapV2DynamicPriceRouter, mintToken, mintStableToken } =
        await loadFixture(loadUniswapV2DynamicPriceRouter);

      await expect(
        uniswapV2DynamicPriceRouter.getBaseTokenAmount(
          mintToken,
          mintStableToken,
          parseUnits('0', 18),
        ),
      ).to.be.revertedWith('Amount in must be greater than 0');
    });
  });

  describe('Get Quote Token Amount', () => {
    it('should return the correct amount', async () => {
      const { uniswapV2DynamicPriceRouter, mintToken, mintStableToken } =
        await loadFixture(loadUniswapV2DynamicPriceRouter);

      expect(
        await uniswapV2DynamicPriceRouter.getQuoteTokenAmount(
          mintToken,
          mintStableToken,
          parseUnits('2', 18),
        ),
      ).to.equal(parseUnits('2000', 6));
    });

    it('revert if the base token is the same as the quote token', async () => {
      const { uniswapV2DynamicPriceRouter, mintToken } = await loadFixture(
        loadUniswapV2DynamicPriceRouter,
      );

      await expect(
        uniswapV2DynamicPriceRouter.getQuoteTokenAmount(
          mintToken,
          mintToken,
          parseUnits('1', 18),
        ),
      ).to.be.revertedWith('Base and quote tokens must differ');
    });

    it('revert if the base token is the zero address', async () => {
      const { uniswapV2DynamicPriceRouter, mintStableToken } =
        await loadFixture(loadUniswapV2DynamicPriceRouter);

      await expect(
        uniswapV2DynamicPriceRouter.getQuoteTokenAmount(
          ZeroAddress,
          mintStableToken,
          parseUnits('1', 18),
        ),
      ).to.be.revertedWith('Invalid token address');
    });

    it('revert if the quote token is the zero address', async () => {
      const { uniswapV2DynamicPriceRouter, mintToken } = await loadFixture(
        loadUniswapV2DynamicPriceRouter,
      );

      await expect(
        uniswapV2DynamicPriceRouter.getQuoteTokenAmount(
          mintToken,
          ZeroAddress,
          parseUnits('1', 18),
        ),
      ).to.be.revertedWith('Invalid token address');
    });

    it('revert if uniswap returns an invalid amount', async () => {
      const {
        uniswapV2DynamicPriceRouter,
        mockUniswapV2Router,
        mintToken,
        mintStableToken,
      } = await loadFixture(loadUniswapV2DynamicPriceRouter);

      await mockUniswapV2Router.setPrice(mintToken, 0);

      await expect(
        uniswapV2DynamicPriceRouter.getQuoteTokenAmount(
          mintToken,
          mintStableToken,
          parseUnits('1', 18),
        ),
      ).to.be.revertedWith('Invalid amount out from Uniswap');
    });

    it('revert if the base token amount is zero', async () => {
      const { uniswapV2DynamicPriceRouter, mintToken, mintStableToken } =
        await loadFixture(loadUniswapV2DynamicPriceRouter);

      await expect(
        uniswapV2DynamicPriceRouter.getQuoteTokenAmount(
          mintToken,
          mintStableToken,
          parseUnits('0', 18),
        ),
      ).to.be.revertedWith('Amount in must be greater than 0');
    });
  });
});
