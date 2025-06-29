import { loadFixture } from '@nomicfoundation/hardhat-toolbox/network-helpers';
import hre, { ethers } from 'hardhat';
import { expect } from 'chai';
import { ZeroAddress } from 'ethers';

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
        .to.emit(mockUniswapV2Router, 'MockTokenPriceSet')
        .withArgs(await mintToken.getAddress(), ethers.parseUnits('1', 18));

      expect(
        await mockUniswapV2Router.prices(await mintToken.getAddress()),
      ).to.equal(ethers.parseUnits('1', 18));
    });

    it('revert if the token is the zero address', async () => {
      const { mockUniswapV2Router, owner } = await loadFixture(
        deployMockUniswapV2Router,
      );

      await expect(
        mockUniswapV2Router
          .connect(owner)
          .setPrice(ZeroAddress, ethers.parseUnits('1', 18)),
      ).to.be.revertedWith('Invalid token address');
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
    });
  });
});
