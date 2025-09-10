import { loadFixture } from '@nomicfoundation/hardhat-toolbox/network-helpers';
import hre from 'hardhat';
import { expect } from 'chai';
import { parseUnits, ZeroAddress } from 'ethers';
import calculateInterfaceId from '../../utils/calculate-interface-id';

const buildPath = (currency: string, fee: number) => ({
  intermediateCurrency: currency,
  fee: fee,
  tickSpacing: 0,
  hooks: ZeroAddress,
  hookData: '0x',
});

describe('UniswapV4DynamicPriceRouter', () => {
  async function loadUniswapV4DynamicPriceRouter() {
    const [owner, otherAccount] = await hre.ethers.getSigners();

    // Router

    const MockUniswapV4Router = await hre.ethers.getContractFactory(
      'MockUniswapV4Router',
    );
    const v4Quoter = await MockUniswapV4Router.deploy();

    const UniswapV4DynamicPriceRouter = await hre.ethers.getContractFactory(
      'UniswapV4DynamicPriceRouter',
    );
    const uniswapV4DynamicPriceRouter =
      await UniswapV4DynamicPriceRouter.deploy(v4Quoter);

    // Tokens

    const MintToken = await hre.ethers.getContractFactory('MintToken');
    const mintToken = await MintToken.deploy();
    const mintToken2 = await MintToken.deploy();

    const MintStableToken = await hre.ethers.getContractFactory(
      'MintStableToken',
    );
    const mintStableToken = await MintStableToken.deploy();

    // Set prices

    await v4Quoter.setPrice(await mintToken.getAddress(), 1000);
    await v4Quoter.setPrice(await mintToken2.getAddress(), 100);
    await v4Quoter.setPrice(await mintStableToken.getAddress(), 1);

    return {
      v4Quoter,
      uniswapV4DynamicPriceRouter,
      mintToken,
      mintToken2,
      mintStableToken,
      owner,
      otherAccount,
    };
  }

  describe('Deployment', () => {
    it('initial state is correct', async () => {
      const { uniswapV4DynamicPriceRouter, v4Quoter, owner } =
        await loadFixture(loadUniswapV4DynamicPriceRouter);

      expect(await uniswapV4DynamicPriceRouter.v4Quoter()).to.equal(
        await v4Quoter.getAddress(),
      );

      expect(await uniswapV4DynamicPriceRouter.owner()).to.equal(owner);

      expect(await uniswapV4DynamicPriceRouter.ROUTER_NAME()).to.equal(
        'uniswap-v4',
      );

      expect(await uniswapV4DynamicPriceRouter.FEE_DENOMINATOR()).to.equal(
        1000000,
      );

      expect(await uniswapV4DynamicPriceRouter.SCALER_DENOMINATOR()).to.equal(
        1000000,
      );
    });
  });

  describe('Pricing - Success', () => {
    it('should return the correct price with fees included from token to stable token', async () => {
      const { uniswapV4DynamicPriceRouter, mintToken, mintStableToken, owner } =
        await loadFixture(loadUniswapV4DynamicPriceRouter);

      const result = await uniswapV4DynamicPriceRouter.getPrice.staticCall(
        {
          exactCurrency: await mintToken.getAddress(),
          path: [buildPath(await mintStableToken.getAddress(), 100)],
          exactAmount: parseUnits('100', 18),
        },
        { from: owner },
      );

      expect(result).to.equal(parseUnits('100000', 6));
    });

    it('should return the correct price with fees removed from token to stable token', async () => {
      const { uniswapV4DynamicPriceRouter, mintToken, mintStableToken, owner } =
        await loadFixture(loadUniswapV4DynamicPriceRouter);

      const result =
        await uniswapV4DynamicPriceRouter.getPriceFeesRemoved.staticCall(
          {
            exactCurrency: await mintToken.getAddress(),
            path: [buildPath(await mintStableToken.getAddress(), 100)],
            exactAmount: parseUnits('100', 18),
          },
          { from: owner },
        );

      expect(result).to.equal(parseUnits('100010', 6));
    });

    it('should return the correct price with fees included from token to token to stable token', async () => {
      const {
        uniswapV4DynamicPriceRouter,
        mintToken,
        mintToken2,
        mintStableToken,
        owner,
      } = await loadFixture(loadUniswapV4DynamicPriceRouter);

      const result = await uniswapV4DynamicPriceRouter.getPrice.staticCall(
        {
          exactCurrency: await mintToken.getAddress(),
          path: [
            buildPath(await mintToken2.getAddress(), 100),
            buildPath(await mintStableToken.getAddress(), 100),
          ],
          exactAmount: parseUnits('100', 18),
        },
        { from: owner },
      );

      expect(result).to.equal(parseUnits('100000', 6));
    });

    it('should return the correct price with fees removed from token to token to stable token', async () => {
      const {
        uniswapV4DynamicPriceRouter,
        mintToken,
        mintToken2,
        mintStableToken,
        owner,
      } = await loadFixture(loadUniswapV4DynamicPriceRouter);

      const result =
        await uniswapV4DynamicPriceRouter.getPriceFeesRemoved.staticCall(
          {
            exactCurrency: await mintToken.getAddress(),
            path: [
              buildPath(await mintToken2.getAddress(), 200),
              buildPath(await mintStableToken.getAddress(), 100),
            ],
            exactAmount: parseUnits('100', 18),
          },
          { from: owner },
        );

      expect(result).to.equal(parseUnits('100030', 6));
    });
  });

  describe('Pricing - Failure', () => {
    it('should revert if no path is provided', async () => {
      const { uniswapV4DynamicPriceRouter, mintToken } = await loadFixture(
        loadUniswapV4DynamicPriceRouter,
      );

      await expect(
        uniswapV4DynamicPriceRouter.getPriceFeesRemoved({
          exactCurrency: await mintToken.getAddress(),
          path: [],
          exactAmount: parseUnits('100', 18),
        }),
      ).to.be.revertedWith('Path cannot be empty');
    });

    it('should revert if the amount in is zero', async () => {
      const { uniswapV4DynamicPriceRouter, mintToken } = await loadFixture(
        loadUniswapV4DynamicPriceRouter,
      );

      await expect(
        uniswapV4DynamicPriceRouter.getPriceFeesRemoved({
          exactCurrency: await mintToken.getAddress(),
          path: [buildPath(await mintToken.getAddress(), 100)],
          exactAmount: 0,
        }),
      ).to.be.revertedWith('Amount in must be greater than zero');
    });

    it('should revert if the amount out is zero', async () => {
      const { uniswapV4DynamicPriceRouter, mintToken, v4Quoter } =
        await loadFixture(loadUniswapV4DynamicPriceRouter);

      await v4Quoter.setPrice(await mintToken.getAddress(), 0);

      await expect(
        uniswapV4DynamicPriceRouter.getPriceFeesRemoved({
          exactCurrency: await mintToken.getAddress(),
          path: [buildPath(await mintToken.getAddress(), 100)],
          exactAmount: parseUnits('100', 18),
        }),
      ).to.be.revertedWith('Invalid amount out from Uniswap');
    });
  });

  describe('Update V4 Quoter', () => {
    it('should update the V4 Quoter', async () => {
      const { uniswapV4DynamicPriceRouter, v4Quoter, owner } =
        await loadFixture(loadUniswapV4DynamicPriceRouter);

      const MockUniswapV4Router = await hre.ethers.getContractFactory(
        'MockUniswapV4Router',
      );
      const newMockUniswapV4Router = await MockUniswapV4Router.deploy();

      await expect(
        uniswapV4DynamicPriceRouter.setV4Quoter(newMockUniswapV4Router),
      )
        .to.emit(uniswapV4DynamicPriceRouter, 'V4QuoterSet')
        .withArgs(await newMockUniswapV4Router.getAddress());

      expect(await uniswapV4DynamicPriceRouter.v4Quoter()).to.equal(
        await newMockUniswapV4Router.getAddress(),
      );
    });

    it('should revert if the new V4 Quoter is the zero address', async () => {
      const { uniswapV4DynamicPriceRouter } = await loadFixture(
        loadUniswapV4DynamicPriceRouter,
      );

      await expect(
        uniswapV4DynamicPriceRouter.setV4Quoter(ZeroAddress),
      ).to.be.revertedWith('V4 quoter cannot be zero address');
    });

    it('should revert if the caller is not the owner', async () => {
      const { uniswapV4DynamicPriceRouter, otherAccount } = await loadFixture(
        loadUniswapV4DynamicPriceRouter,
      );

      await expect(
        uniswapV4DynamicPriceRouter
          .connect(otherAccount)
          .setV4Quoter(ZeroAddress),
      ).to.be.revertedWithCustomError(
        uniswapV4DynamicPriceRouter,
        'OwnableUnauthorizedAccount',
      );
    });
  });

  describe('ERC165', () => {
    it('should return true for the IERC165 interface', async () => {
      const { uniswapV4DynamicPriceRouter } = await loadFixture(
        loadUniswapV4DynamicPriceRouter,
      );

      expect(await uniswapV4DynamicPriceRouter.supportsInterface('0x01ffc9a7'))
        .to.be.true;
    });

    it('should return true for the IDynamicPriceRouter interface', async () => {
      const { uniswapV4DynamicPriceRouter } = await loadFixture(
        loadUniswapV4DynamicPriceRouter,
      );

      const interfaceId = calculateInterfaceId(['ROUTER_NAME()']);

      expect(await uniswapV4DynamicPriceRouter.supportsInterface(interfaceId))
        .to.be.true;
    });

    it('should return false for an unknown interface', async () => {
      const { uniswapV4DynamicPriceRouter } = await loadFixture(
        loadUniswapV4DynamicPriceRouter,
      );

      expect(await uniswapV4DynamicPriceRouter.supportsInterface('0xffffffff'))
        .to.be.false;
    });
  });
});
