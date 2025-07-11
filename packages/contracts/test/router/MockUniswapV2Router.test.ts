import { loadFixture } from '@nomicfoundation/hardhat-toolbox/network-helpers';
import hre, { ethers } from 'hardhat';
import { expect } from 'chai';
import { ZeroAddress } from 'ethers';
import calculateInterfaceId from '../../utils/calculate-interface-id';

describe('MockUniswapV2Router', () => {
  async function deployMockUniswapV2Router() {
    const [owner, otherAccount] = await hre.ethers.getSigners();

    const MockUniswapV2Router = await hre.ethers.getContractFactory(
      'MockUniswapV2Router',
    );
    const mockUniswapV2Router = await MockUniswapV2Router.deploy();

    return {
      mockUniswapV2Router,
      owner,
      otherAccount,
    };
  }

  describe('Deployment', () => {
    it('should set the correct roles', async () => {
      const { mockUniswapV2Router, owner } = await loadFixture(
        deployMockUniswapV2Router,
      );

      expect(
        await mockUniswapV2Router.hasRole(
          await mockUniswapV2Router.DEFAULT_ADMIN_ROLE(),
          owner,
        ),
      ).to.be.true;

      expect(
        await mockUniswapV2Router.hasRole(
          await mockUniswapV2Router.PRICE_SETTER_ROLE(),
          owner,
        ),
      ).to.be.true;
    });
  });

  describe('Supports Interface', () => {
    it('should return true for the ICustomUniswapV2Router interface', async () => {
      const { mockUniswapV2Router } = await loadFixture(
        deployMockUniswapV2Router,
      );

      const interfaceId = calculateInterfaceId([
        'getAmountsOut(uint256,address[])',
      ]);

      expect(await mockUniswapV2Router.supportsInterface(interfaceId)).to.be
        .true;
    });

    it('should return true for the IERC165 interface', async () => {
      const { mockUniswapV2Router } = await loadFixture(
        deployMockUniswapV2Router,
      );
      expect(await mockUniswapV2Router.supportsInterface('0x01ffc9a7')).to.be
        .true;
    });

    it('should return false for an unknown interface', async () => {
      const { mockUniswapV2Router } = await loadFixture(
        deployMockUniswapV2Router,
      );

      expect(await mockUniswapV2Router.supportsInterface('0xffffffff')).to.be
        .false;
    });
  });

  describe('Get Amounts Out', () => {
    it('revert if the path is too short', async () => {
      const { mockUniswapV2Router } = await loadFixture(
        deployMockUniswapV2Router,
      );

      await expect(
        mockUniswapV2Router.getAmountsOut(1, [ZeroAddress]),
      ).to.be.revertedWith('Path must have at least 2 tokens');
    });

    it('revert if the amount in is zero', async () => {
      const { mockUniswapV2Router } = await loadFixture(
        deployMockUniswapV2Router,
      );

      await expect(
        mockUniswapV2Router.getAmountsOut(0, [ZeroAddress, ZeroAddress]),
      ).to.be.revertedWith('Amount in must be greater than 0');
    });
  });

  describe('Set Price', () => {
    it('should set the price for a token', async () => {
      const { mockUniswapV2Router, owner } = await loadFixture(
        deployMockUniswapV2Router,
      );

      const MintToken = await hre.ethers.getContractFactory('MintToken');
      const mintToken = await MintToken.deploy();

      await expect(
        mockUniswapV2Router
          .connect(owner)
          .setPrice(await mintToken.getAddress(), ethers.parseUnits('1', 18)),
      )
        .to.emit(mockUniswapV2Router, 'MockUniswapV2TokenPriceSet')
        .withArgs(await mintToken.getAddress(), ethers.parseUnits('1', 18));

      expect(
        await mockUniswapV2Router.prices(await mintToken.getAddress()),
      ).to.equal(ethers.parseUnits('1', 18));
    });

    it('should set the price for a batch of tokens', async () => {
      const { mockUniswapV2Router, owner } = await loadFixture(
        deployMockUniswapV2Router,
      );

      const MintToken = await hre.ethers.getContractFactory('MintToken');
      const mintToken = await MintToken.deploy();
      const mintToken2 = await MintToken.deploy();

      await expect(
        mockUniswapV2Router
          .connect(owner)
          .setPriceBatch(
            [await mintToken.getAddress(), await mintToken2.getAddress()],
            [ethers.parseUnits('1', 18), ethers.parseUnits('2', 18)],
          ),
      )
        .to.emit(mockUniswapV2Router, 'MockUniswapV2TokenPriceSet')
        .withArgs(await mintToken.getAddress(), ethers.parseUnits('1', 18))
        .and.to.emit(mockUniswapV2Router, 'MockUniswapV2TokenPriceSet')
        .withArgs(await mintToken2.getAddress(), ethers.parseUnits('2', 18));

      expect(
        await mockUniswapV2Router.prices(await mintToken.getAddress()),
      ).to.equal(ethers.parseUnits('1', 18));
      expect(
        await mockUniswapV2Router.prices(await mintToken2.getAddress()),
      ).to.equal(ethers.parseUnits('2', 18));
    });

    it('revert if the token is the zero address', async () => {
      const { mockUniswapV2Router, owner } = await loadFixture(
        deployMockUniswapV2Router,
      );

      await expect(
        mockUniswapV2Router
          .connect(owner)
          .setPrice(ZeroAddress, ethers.parseUnits('1', 18)),
      ).to.be.revertedWith('Token address cannot be zero');
    });

    it('revert if the caller is not the price setter', async () => {
      const { mockUniswapV2Router, otherAccount } = await loadFixture(
        deployMockUniswapV2Router,
      );

      await expect(
        mockUniswapV2Router
          .connect(otherAccount)
          .setPrice(ZeroAddress, ethers.parseUnits('1', 18)),
      ).to.be.revertedWithCustomError(
        mockUniswapV2Router,
        'AccessControlUnauthorizedAccount',
      );

      await expect(
        mockUniswapV2Router
          .connect(otherAccount)
          .setPriceBatch([ZeroAddress], [ethers.parseUnits('1', 18)]),
      ).to.be.revertedWithCustomError(
        mockUniswapV2Router,
        'AccessControlUnauthorizedAccount',
      );
    });

    it('revert if the tokens and prices have different lengths', async () => {
      const { mockUniswapV2Router, owner } = await loadFixture(
        deployMockUniswapV2Router,
      );

      await expect(
        mockUniswapV2Router
          .connect(owner)
          .setPriceBatch([], [ethers.parseUnits('1', 18)]),
      ).to.be.revertedWith('Tokens and prices must have the same length');
    });

    it('revert if the tokens are the zero address', async () => {
      const { mockUniswapV2Router, owner } = await loadFixture(
        deployMockUniswapV2Router,
      );

      await expect(
        mockUniswapV2Router
          .connect(owner)
          .setPriceBatch([ZeroAddress], [ethers.parseUnits('1', 18)]),
      ).to.be.revertedWith('Token address cannot be zero');
    });
  });
});
