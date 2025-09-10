import { loadFixture } from '@nomicfoundation/hardhat-toolbox/network-helpers';
import hre from 'hardhat';
import { expect } from 'chai';
import { parseUnits, ZeroAddress } from 'ethers';

describe('MockUniswapV4Router', () => {
  async function loadMockUniswapV4Router() {
    const [owner, otherAccount] = await hre.ethers.getSigners();

    const MockUniswapV4Router = await hre.ethers.getContractFactory(
      'MockUniswapV4Router',
    );
    const mockUniswapV4Router = await MockUniswapV4Router.deploy();

    return {
      mockUniswapV4Router,
      owner,
      otherAccount,
    };
  }

  describe('Deployment', () => {
    it('should set the correct roles', async () => {
      const { mockUniswapV4Router, owner } = await loadFixture(
        loadMockUniswapV4Router,
      );

      expect(
        await mockUniswapV4Router.hasRole(
          await mockUniswapV4Router.DEFAULT_ADMIN_ROLE(),
          owner,
        ),
      ).to.be.true;
      expect(
        await mockUniswapV4Router.hasRole(
          await mockUniswapV4Router.PRICE_SETTER_ROLE(),
          owner,
        ),
      ).to.be.true;
    });
  });

  describe('Pricing checks', () => {
    it('should revert if the path is empty', async () => {
      const { mockUniswapV4Router } = await loadFixture(
        loadMockUniswapV4Router,
      );

      await expect(
        mockUniswapV4Router.quoteExactInput({
          exactCurrency: await mockUniswapV4Router.getAddress(),
          path: [],
          exactAmount: parseUnits('100', 18),
        }),
      ).to.be.revertedWith('Path must have at least 1 token');
    });

    it('should revert if the amount in is zero', async () => {
      const { mockUniswapV4Router } = await loadFixture(
        loadMockUniswapV4Router,
      );

      await expect(
        mockUniswapV4Router.quoteExactInput({
          exactCurrency: await mockUniswapV4Router.getAddress(),
          path: [
            {
              intermediateCurrency: await mockUniswapV4Router.getAddress(),
              fee: 0,
              tickSpacing: 0,
              hooks: ZeroAddress,
              hookData: '0x',
            },
          ],
          exactAmount: 0,
        }),
      ).to.be.revertedWith('Amount in must be greater than 0');
    });
  });

  describe('Price Setting', () => {
    it('should set the price for a token', async () => {
      const { mockUniswapV4Router, owner } = await loadFixture(
        loadMockUniswapV4Router,
      );

      expect(
        await mockUniswapV4Router.prices(
          await mockUniswapV4Router.getAddress(),
        ),
      ).to.equal(0);

      await expect(
        mockUniswapV4Router
          .connect(owner)
          .setPrice(await mockUniswapV4Router.getAddress(), 100),
      )
        .to.emit(mockUniswapV4Router, 'MockUniswapV4TokenPriceSet')
        .withArgs(await mockUniswapV4Router.getAddress(), 100);

      expect(
        await mockUniswapV4Router.prices(
          await mockUniswapV4Router.getAddress(),
        ),
      ).to.equal(100);
    });

    it('should revert if the caller does not have the PRICE_SETTER_ROLE', async () => {
      const { mockUniswapV4Router, otherAccount } = await loadFixture(
        loadMockUniswapV4Router,
      );

      await expect(
        mockUniswapV4Router
          .connect(otherAccount)
          .setPrice(await mockUniswapV4Router.getAddress(), 100),
      ).to.be.revertedWithCustomError(
        mockUniswapV4Router,
        'AccessControlUnauthorizedAccount',
      );
    });

    it('should revert if the token is the zero address', async () => {
      const { mockUniswapV4Router, owner } = await loadFixture(
        loadMockUniswapV4Router,
      );

      await expect(
        mockUniswapV4Router.connect(owner).setPrice(ZeroAddress, 100),
      ).to.be.revertedWith('Token address cannot be zero');
    });
  });

  describe('ERC165', () => {
    it('should return true for the IERC165 interface', async () => {
      const { mockUniswapV4Router } = await loadFixture(
        loadMockUniswapV4Router,
      );

      expect(await mockUniswapV4Router.supportsInterface('0x01ffc9a7')).to.be
        .true;
    });
  });
});
