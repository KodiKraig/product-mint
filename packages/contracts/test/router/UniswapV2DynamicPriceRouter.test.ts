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
      expect(await uniswapV2DynamicPriceRouter.ROUTER_NAME()).to.equal(
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
        uniswapV2DynamicPriceRouter.setUniswapV2Router(newMockUniswapV2Router),
      )
        .to.emit(uniswapV2DynamicPriceRouter, 'UniswapV2RouterSet')
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
        uniswapV2DynamicPriceRouter.setUniswapV2Router(ZeroAddress),
      ).to.be.revertedWith('Uniswap router cannot be zero address');
    });

    it('revert if the caller is not the owner', async () => {
      const { uniswapV2DynamicPriceRouter, otherAccount } = await loadFixture(
        loadUniswapV2DynamicPriceRouter,
      );

      await expect(
        uniswapV2DynamicPriceRouter
          .connect(otherAccount)
          .setUniswapV2Router(ZeroAddress),
      ).to.be.revertedWithCustomError(
        uniswapV2DynamicPriceRouter,
        'OwnableUnauthorizedAccount',
      );
    });
  });

  describe('Supports Interface', () => {
    it('should return true for the IDynamicPriceRouter interface', async () => {
      const { uniswapV2DynamicPriceRouter } = await loadFixture(
        loadUniswapV2DynamicPriceRouter,
      );

      const interfaceId = calculateInterfaceId(['ROUTER_NAME()']);

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

    it('should return true for the IUniswapV2DynamicPriceRouter interface', async () => {
      const { uniswapV2DynamicPriceRouter } = await loadFixture(
        loadUniswapV2DynamicPriceRouter,
      );

      const interfaceId = calculateInterfaceId([
        'getPrice(uint256,address[])',
        'getPriceWithoutFees(uint256,address[])',
      ]);

      expect(await uniswapV2DynamicPriceRouter.supportsInterface(interfaceId))
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

  describe('Get Price', () => {
    it('revert if no path is provided', async () => {
      const { uniswapV2DynamicPriceRouter } = await loadFixture(
        loadUniswapV2DynamicPriceRouter,
      );

      await expect(
        uniswapV2DynamicPriceRouter.getPrice(1000, []),
      ).to.be.revertedWith('Path must have at least 2 tokens');
    });

    it('revert if the path is too short', async () => {
      const { uniswapV2DynamicPriceRouter, mintToken } = await loadFixture(
        loadUniswapV2DynamicPriceRouter,
      );

      await expect(
        uniswapV2DynamicPriceRouter.getPrice(1000, [
          await mintToken.getAddress(),
        ]),
      ).to.be.revertedWith('Path must have at least 2 tokens');
    });

    it('revert if the amount in is zero', async () => {
      const { uniswapV2DynamicPriceRouter, mintToken, mintStableToken } =
        await loadFixture(loadUniswapV2DynamicPriceRouter);

      await expect(
        uniswapV2DynamicPriceRouter.getPrice(0, [
          await mintToken.getAddress(),
          await mintStableToken.getAddress(),
        ]),
      ).to.be.revertedWith('Amount in must be greater than zero');
    });

    it('revert if the amount out is zero', async () => {
      const {
        uniswapV2DynamicPriceRouter,
        mockUniswapV2Router,
        mintToken,
        mintStableToken,
      } = await loadFixture(loadUniswapV2DynamicPriceRouter);

      const mintTokenAddress = await mintToken.getAddress();
      const mintStableTokenAddress = await mintStableToken.getAddress();

      await mockUniswapV2Router.setPrice(mintTokenAddress, 0);
      await mockUniswapV2Router.setPrice(mintStableTokenAddress, 0);

      await expect(
        uniswapV2DynamicPriceRouter.getPrice(1000, [
          mintTokenAddress,
          mintStableTokenAddress,
        ]),
      ).to.be.revertedWith('Invalid amount out from Uniswap');
    });
  });

  describe('Get Price Without Fees', () => {
    it('single hop with stable token', async () => {
      const { uniswapV2DynamicPriceRouter, mintToken, mintStableToken } =
        await loadFixture(loadUniswapV2DynamicPriceRouter);

      const price = await uniswapV2DynamicPriceRouter.getPriceWithoutFees(
        parseUnits('100', 6),
        [await mintStableToken.getAddress(), await mintToken.getAddress()],
      );

      expect(price).to.equal(parseUnits('100.3009', 18));
    });

    it('two hops with stable token', async () => {
      const { uniswapV2DynamicPriceRouter, mintToken, mintStableToken } =
        await loadFixture(loadUniswapV2DynamicPriceRouter);

      const MintToken = await hre.ethers.getContractFactory('MintToken');
      const mintToken2 = await MintToken.deploy();

      const price = await uniswapV2DynamicPriceRouter.getPriceWithoutFees(
        parseUnits('100', 6),
        [
          await mintStableToken.getAddress(),
          await mintToken2.getAddress(),
          await mintToken.getAddress(),
        ],
      );

      expect(price).to.equal(parseUnits('100.6036', 18));
    });

    it('three hops with stable token', async () => {
      const { uniswapV2DynamicPriceRouter, mintToken, mintStableToken } =
        await loadFixture(loadUniswapV2DynamicPriceRouter);

      const MintToken = await hre.ethers.getContractFactory('MintToken');
      const mintToken2 = await MintToken.deploy();
      const mintToken3 = await MintToken.deploy();

      const price = await uniswapV2DynamicPriceRouter.getPriceWithoutFees(
        parseUnits('100', 6),
        [
          await mintStableToken.getAddress(),
          await mintToken2.getAddress(),
          await mintToken3.getAddress(),
          await mintToken.getAddress(),
        ],
      );

      expect(price).to.equal(parseUnits('100.9081', 18));
    });

    it('four hops with stable token', async () => {
      const { uniswapV2DynamicPriceRouter, mintToken, mintStableToken } =
        await loadFixture(loadUniswapV2DynamicPriceRouter);

      const MintToken = await hre.ethers.getContractFactory('MintToken');
      const mintToken2 = await MintToken.deploy();
      const mintToken3 = await MintToken.deploy();
      const mintToken4 = await MintToken.deploy();

      const price = await uniswapV2DynamicPriceRouter.getPriceWithoutFees(
        parseUnits('100', 6),
        [
          await mintStableToken.getAddress(),
          await mintToken2.getAddress(),
          await mintToken3.getAddress(),
          await mintToken4.getAddress(),
          await mintToken.getAddress(),
        ],
      );

      expect(price).to.equal(parseUnits('101.2145', 18));
    });

    it('single hop with token', async () => {
      const { uniswapV2DynamicPriceRouter, mintToken, mintStableToken } =
        await loadFixture(loadUniswapV2DynamicPriceRouter);

      const price = await uniswapV2DynamicPriceRouter.getPriceWithoutFees(
        parseUnits('100', 18),
        [await mintToken.getAddress(), await mintStableToken.getAddress()],
      );

      expect(price).to.equal(parseUnits('100300.9', 6));
    });

    it('two hops with token', async () => {
      const { uniswapV2DynamicPriceRouter, mintToken, mintStableToken } =
        await loadFixture(loadUniswapV2DynamicPriceRouter);

      const MintToken = await hre.ethers.getContractFactory('MintToken');
      const mintToken2 = await MintToken.deploy();

      const price = await uniswapV2DynamicPriceRouter.getPriceWithoutFees(
        parseUnits('100', 18),
        [
          await mintToken.getAddress(),
          await mintToken2.getAddress(),
          await mintStableToken.getAddress(),
        ],
      );

      expect(price).to.equal(parseUnits('100603.6', 6));
    });

    it('three hops with token', async () => {
      const { uniswapV2DynamicPriceRouter, mintToken, mintStableToken } =
        await loadFixture(loadUniswapV2DynamicPriceRouter);

      const MintToken = await hre.ethers.getContractFactory('MintToken');
      const mintToken2 = await MintToken.deploy();
      const mintToken3 = await MintToken.deploy();

      const price = await uniswapV2DynamicPriceRouter.getPriceWithoutFees(
        parseUnits('100', 18),
        [
          await mintToken.getAddress(),
          await mintToken2.getAddress(),
          await mintToken3.getAddress(),
          await mintStableToken.getAddress(),
        ],
      );

      expect(price).to.equal(parseUnits('100908.1', 6));
    });

    it('four hops with token', async () => {
      const { uniswapV2DynamicPriceRouter, mintToken, mintStableToken } =
        await loadFixture(loadUniswapV2DynamicPriceRouter);

      const MintToken = await hre.ethers.getContractFactory('MintToken');
      const mintToken2 = await MintToken.deploy();
      const mintToken3 = await MintToken.deploy();
      const mintToken4 = await MintToken.deploy();

      const price = await uniswapV2DynamicPriceRouter.getPriceWithoutFees(
        parseUnits('100', 18),
        [
          await mintToken.getAddress(),
          await mintToken2.getAddress(),
          await mintToken3.getAddress(),
          await mintToken4.getAddress(),
          await mintStableToken.getAddress(),
        ],
      );

      expect(price).to.equal(parseUnits('101214.5', 6));
    });

    it('revert if no path is provided', async () => {
      const { uniswapV2DynamicPriceRouter } = await loadFixture(
        loadUniswapV2DynamicPriceRouter,
      );

      await expect(
        uniswapV2DynamicPriceRouter.getPriceWithoutFees(1000, []),
      ).to.be.revertedWith('Path must have at least 2 tokens');
    });
  });
});
