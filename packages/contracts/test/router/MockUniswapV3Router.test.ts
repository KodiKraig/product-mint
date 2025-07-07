import { loadFixture } from '@nomicfoundation/hardhat-toolbox/network-helpers';
import { expect } from 'chai';
import hre from 'hardhat';
import { parseUnits } from 'ethers';

describe('MockUniswapV3Router', () => {
  async function deployMockRouter() {
    const [owner] = await hre.ethers.getSigners();

    const MockUniswapV3Router = await hre.ethers.getContractFactory(
      'MockUniswapV3Router',
    );
    const mockRouter = await MockUniswapV3Router.deploy();

    const MintToken = await hre.ethers.getContractFactory('MintToken');
    const token1 = await MintToken.deploy();
    const token2 = await MintToken.deploy();
    const token3 = await MintToken.deploy();

    await mockRouter.connect(owner).setPrice(await token1.getAddress(), 20);
    await mockRouter.connect(owner).setPrice(await token2.getAddress(), 10);
    await mockRouter.connect(owner).setPrice(await token3.getAddress(), 5);

    return {
      mockRouter,
      owner,
      token1,
      token2,
      token3,
    };
  }

  describe('Path parsing', () => {
    it('should correctly parse 2-token path', async () => {
      const { mockRouter, token1, token3 } = await loadFixture(
        deployMockRouter,
      );

      // Create a 2-token path: token1 + fee + token3
      const path = hre.ethers.solidityPacked(
        ['address', 'uint24', 'address'],
        [await token1.getAddress(), 3000, await token3.getAddress()],
      );

      const amountIn = parseUnits('100', 18);
      const tx = await mockRouter.quoteExactInput(path, amountIn);

      // Should return amount based on token1's price (20) with decimal adjustment
      expect(tx[0]).to.equal(parseUnits('2000', 18));
    });

    it('should correctly parse 3-token path', async () => {
      const { mockRouter, token1, token2, token3 } = await loadFixture(
        deployMockRouter,
      );

      // Create a 3-token path: token1 + fee + token2 + fee + token3
      const path = hre.ethers.solidityPacked(
        ['address', 'uint24', 'address', 'uint24', 'address'],
        [
          await token1.getAddress(),
          3000,
          await token2.getAddress(),
          500,
          await token3.getAddress(),
        ],
      );

      const amountIn = parseUnits('100', 18);
      const tx = await mockRouter.quoteExactInput(path, amountIn);

      // Should return amount based on token1's price (20) with decimal adjustment
      // The router should extract token1 as first token and token3 as last token
      expect(tx[0]).to.equal(parseUnits('2000', 18));
    });

    it('should handle different fee values in path', async () => {
      const { mockRouter, token1, token2, token3 } = await loadFixture(
        deployMockRouter,
      );

      // Create a path with different fees: token1 + 1000 fee + token2 + 10000 fee + token3
      const path = hre.ethers.solidityPacked(
        ['address', 'uint24', 'address', 'uint24', 'address'],
        [
          await token1.getAddress(),
          1000,
          await token2.getAddress(),
          10000,
          await token3.getAddress(),
        ],
      );

      const amountIn = parseUnits('100', 18);
      const tx = await mockRouter.quoteExactInput(path, amountIn);

      // Should still work correctly regardless of fee values
      expect(tx[0]).to.equal(parseUnits('2000', 18));
    });
  });
});
