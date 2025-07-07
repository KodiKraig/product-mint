import { loadFixture } from '@nomicfoundation/hardhat-toolbox/network-helpers';
import hre from 'hardhat';
import { expect } from 'chai';
import { parseUnits, ZeroAddress } from 'ethers';
import calculateInterfaceId from '../../utils/calculate-interface-id';

describe('UniswapV3DynamicPriceRouter', () => {
  async function loadUniswapV3DynamicPriceRouter() {
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

    const MintStableToken = await hre.ethers.getContractFactory(
      'MintStableToken',
    );
    const mintStableToken = await MintStableToken.deploy();

    // Set prices

    await mockUniswapV3Router.connect(owner).setPrice(mintToken, 1000);

    await mockUniswapV3Router.connect(owner).setPrice(mintStableToken, 1);

    const baseToQuotePath = hre.ethers.solidityPacked(
      ['address', 'uint24', 'address'],
      [await mintToken.getAddress(), 10000, await mintStableToken.getAddress()],
    );

    const quoteToBasePath = hre.ethers.solidityPacked(
      ['address', 'uint24', 'address'],
      [await mintStableToken.getAddress(), 10000, await mintToken.getAddress()],
    );
    return {
      mockUniswapV3Router,
      uniswapV3DynamicPriceRouter,
      mintToken,
      mintStableToken,
      owner,
      otherAccount,
      baseToQuotePath,
      quoteToBasePath,
    };
  }

  describe('Deployment', () => {
    it('owner should be the deployer', async () => {
      const { uniswapV3DynamicPriceRouter, owner } = await loadFixture(
        loadUniswapV3DynamicPriceRouter,
      );
      expect(await uniswapV3DynamicPriceRouter.owner()).to.equal(owner);
    });

    it('should set the Uniswap V3 router', async () => {
      const { uniswapV3DynamicPriceRouter, mockUniswapV3Router } =
        await loadFixture(loadUniswapV3DynamicPriceRouter);
      expect(await uniswapV3DynamicPriceRouter.uniswapV3Router()).to.equal(
        mockUniswapV3Router,
      );
    });

    it('should return the correct name', async () => {
      const { uniswapV3DynamicPriceRouter } = await loadFixture(
        loadUniswapV3DynamicPriceRouter,
      );
      expect(await uniswapV3DynamicPriceRouter.ROUTER_NAME()).to.equal(
        'uniswap-v3',
      );
    });

    it('should return the correct fee constants', async () => {
      const { uniswapV3DynamicPriceRouter } = await loadFixture(
        loadUniswapV3DynamicPriceRouter,
      );
      expect(await uniswapV3DynamicPriceRouter.FEE_DENOMINATOR()).to.equal(
        1000000,
      );
      expect(await uniswapV3DynamicPriceRouter.SCALER_DENOMINATOR()).to.equal(
        1000000,
      );
    });
  });

  describe('Get Price', () => {
    it('should return the correct price with and without fees', async () => {
      const { uniswapV3DynamicPriceRouter, baseToQuotePath } =
        await loadFixture(loadUniswapV3DynamicPriceRouter);

      // With fees
      const result = await uniswapV3DynamicPriceRouter.getPrice.staticCall(
        parseUnits('100', 18),
        baseToQuotePath,
      );

      expect(result).to.equal(parseUnits('100000', 6));

      // Without fees
      let resultWithoutFees =
        await uniswapV3DynamicPriceRouter.getPriceFeesRemoved.staticCall(
          parseUnits('100', 18),
          baseToQuotePath,
          [0],
        );
      expect(resultWithoutFees).to.equal(parseUnits('100010', 6));

      resultWithoutFees =
        await uniswapV3DynamicPriceRouter.getPriceFeesRemoved.staticCall(
          parseUnits('100', 18),
          baseToQuotePath,
          [1],
        );
      expect(resultWithoutFees).to.equal(parseUnits('100050', 6));

      resultWithoutFees =
        await uniswapV3DynamicPriceRouter.getPriceFeesRemoved.staticCall(
          parseUnits('100', 18),
          baseToQuotePath,
          [2],
        );
      expect(resultWithoutFees).to.equal(parseUnits('100300.9', 6));

      resultWithoutFees =
        await uniswapV3DynamicPriceRouter.getPriceFeesRemoved.staticCall(
          parseUnits('100', 18),
          baseToQuotePath,
          [3],
        );
      expect(resultWithoutFees).to.equal(parseUnits('101010.1', 6));
    });

    it('should return the correct price with multiple fees', async () => {
      const { uniswapV3DynamicPriceRouter, baseToQuotePath } =
        await loadFixture(loadUniswapV3DynamicPriceRouter);

      const result =
        await uniswapV3DynamicPriceRouter.getPriceFeesRemoved.staticCall(
          parseUnits('100', 18),
          baseToQuotePath,
          [0, 1, 2],
        );

      expect(result).to.equal(parseUnits('100361.1', 6));
    });

    it('revert if the path is empty', async () => {
      const { uniswapV3DynamicPriceRouter } = await loadFixture(
        loadUniswapV3DynamicPriceRouter,
      );

      const path = hre.ethers.solidityPacked([], []);

      await expect(
        uniswapV3DynamicPriceRouter.getPrice.staticCall(
          parseUnits('100', 18),
          path,
        ),
      ).to.be.revertedWith('Path cannot be empty');
    });

    it('revert if the amount in is zero', async () => {
      const { uniswapV3DynamicPriceRouter, baseToQuotePath } =
        await loadFixture(loadUniswapV3DynamicPriceRouter);

      await expect(
        uniswapV3DynamicPriceRouter.getPrice.staticCall(0, baseToQuotePath),
      ).to.be.revertedWith('Amount in must be greater than zero');
    });

    it('revert if the amount out is zero', async () => {
      const {
        uniswapV3DynamicPriceRouter,
        baseToQuotePath,
        mockUniswapV3Router,
        mintToken,
      } = await loadFixture(loadUniswapV3DynamicPriceRouter);

      await mockUniswapV3Router.setPrice(mintToken, 0);

      await expect(
        uniswapV3DynamicPriceRouter.getPriceFeesRemoved.staticCall(
          parseUnits('100', 18),
          baseToQuotePath,
          [0],
        ),
      ).to.be.revertedWith('Invalid amount out from Uniswap');
    });

    it('revert if no fees are provided', async () => {
      const { uniswapV3DynamicPriceRouter, baseToQuotePath } =
        await loadFixture(loadUniswapV3DynamicPriceRouter);

      await expect(
        uniswapV3DynamicPriceRouter.getPriceFeesRemoved.staticCall(
          parseUnits('100', 18),
          baseToQuotePath,
          [],
        ),
      ).to.be.revertedWith('Fees cannot be empty');
    });
  });

  describe('Fees', () => {
    it('should return the correct Uniswap V3 fee for a given fee option', async () => {
      const { uniswapV3DynamicPriceRouter } = await loadFixture(
        loadUniswapV3DynamicPriceRouter,
      );

      expect(await uniswapV3DynamicPriceRouter.getFee(0)).to.equal(100);
      expect(await uniswapV3DynamicPriceRouter.getFee(1)).to.equal(500);
      expect(await uniswapV3DynamicPriceRouter.getFee(2)).to.equal(3000);
      expect(await uniswapV3DynamicPriceRouter.getFee(3)).to.equal(10000);
    });

    it('revert if the fee option is invalid', async () => {
      const { uniswapV3DynamicPriceRouter } = await loadFixture(
        loadUniswapV3DynamicPriceRouter,
      );

      await expect(uniswapV3DynamicPriceRouter.getFee(4)).to.be.reverted;
    });
  });

  describe('Supports Interface', () => {
    it('should support the IUniswapV3DynamicPriceRouter interface', async () => {
      const { uniswapV3DynamicPriceRouter } = await loadFixture(
        loadUniswapV3DynamicPriceRouter,
      );

      const interfaceId = calculateInterfaceId([
        'getPrice(uint256,bytes)',
        'getPriceFeesRemoved(uint256,bytes,uint8[])',
        'getFee(uint8)',
      ]);

      expect(await uniswapV3DynamicPriceRouter.supportsInterface(interfaceId))
        .to.be.true;
    });

    it('should support the IDynamicPriceRouter interface', async () => {
      const { uniswapV3DynamicPriceRouter } = await loadFixture(
        loadUniswapV3DynamicPriceRouter,
      );

      const interfaceId = calculateInterfaceId(['ROUTER_NAME()']);

      expect(await uniswapV3DynamicPriceRouter.supportsInterface(interfaceId))
        .to.be.true;
    });

    it('should support the ERC165 interface', async () => {
      const { uniswapV3DynamicPriceRouter } = await loadFixture(
        loadUniswapV3DynamicPriceRouter,
      );

      const interfaceId = calculateInterfaceId(['supportsInterface(bytes4)']);

      expect(await uniswapV3DynamicPriceRouter.supportsInterface(interfaceId))
        .to.be.true;
    });

    it('should not support other interfaces', async () => {
      const { uniswapV3DynamicPriceRouter } = await loadFixture(
        loadUniswapV3DynamicPriceRouter,
      );

      const interfaceId = calculateInterfaceId(['notSupported()']);

      expect(await uniswapV3DynamicPriceRouter.supportsInterface(interfaceId))
        .to.be.false;
    });
  });

  describe('Update Uniswap V3 Router', () => {
    it('should update the Uniswap V3 router', async () => {
      const { uniswapV3DynamicPriceRouter, mockUniswapV3Router } =
        await loadFixture(loadUniswapV3DynamicPriceRouter);

      const MockUniswapV3Router = await hre.ethers.getContractFactory(
        'MockUniswapV3Router',
      );
      const newMockUniswapV3Router = await MockUniswapV3Router.deploy();

      await expect(
        uniswapV3DynamicPriceRouter.setUniswapV3Router(newMockUniswapV3Router),
      )
        .to.emit(uniswapV3DynamicPriceRouter, 'UniswapV3RouterSet')
        .withArgs(newMockUniswapV3Router);

      expect(await uniswapV3DynamicPriceRouter.uniswapV3Router()).to.equal(
        newMockUniswapV3Router,
      );
    });

    it('revert if the Uniswap V3 router is the zero address', async () => {
      const { uniswapV3DynamicPriceRouter } = await loadFixture(
        loadUniswapV3DynamicPriceRouter,
      );

      await expect(
        uniswapV3DynamicPriceRouter.setUniswapV3Router(ZeroAddress),
      ).to.be.revertedWith('Uniswap router cannot be zero address');
    });
  });
});
