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
  async function deployWithNewTokens() {
    const result = await loadFixture(deployDynamicERC20);

    const MintToken = await hre.ethers.getContractFactory('MintToken');
    const mintToken3 = await MintToken.deploy();

    const MintStableToken = await hre.ethers.getContractFactory(
      'MintStableToken',
    );
    const mintStableToken2 = await MintStableToken.deploy();

    return { ...result, mintToken3, mintStableToken2 };
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

  describe('IDynamicERC20', () => {
    it('should return the correct base token price', async () => {
      const { dynamicERC20 } = await loadFixture(deployDynamicERC20);
      expect(await dynamicERC20.getBaseTokenPrice.staticCall()).to.equal(
        parseUnits('1000.11', 6),
      );
    });

    it('balance of quote is zero when the account has no balance', async () => {
      const { dynamicERC20, otherAccount } = await loadFixture(
        deployDynamicERC20,
      );
      expect(
        await dynamicERC20.balanceOfQuote.staticCall(otherAccount),
      ).to.equal(0);
    });

    it('balance of quote is correct when the account has a balance', async () => {
      const { dynamicERC20, mintToken, otherAccount } = await loadFixture(
        deployDynamicERC20,
      );
      await mintToken.mint(otherAccount, parseUnits('1000', 18));
      expect(
        await dynamicERC20.balanceOfQuote.staticCall(otherAccount),
      ).to.equal(parseUnits('1000110', 6));
    });

    it('allowance quote is zero when the account has no allowance', async () => {
      const { dynamicERC20, otherAccount } = await loadFixture(
        deployDynamicERC20,
      );
      expect(
        await dynamicERC20.allowanceQuote.staticCall(
          otherAccount,
          otherAccount,
        ),
      ).to.equal(0);
    });

    it('allowance quote is correct when the account has an allowance', async () => {
      const { dynamicERC20, mintToken, owner, otherAccount } =
        await loadFixture(deployDynamicERC20);
      await mintToken.approve(otherAccount, parseUnits('1000', 18));
      expect(
        await dynamicERC20.allowanceQuote.staticCall(owner, otherAccount),
      ).to.equal(parseUnits('1000110', 6));
    });

    describe('getBaseTokenAmount', () => {
      it('should return the correct base token amount for a non-zero amount', async () => {
        const { dynamicERC20, mintToken } = await loadFixture(
          deployDynamicERC20,
        );
        expect(
          await dynamicERC20.getBaseTokenAmount.staticCall(
            parseUnits('1000', 6),
          ),
        ).to.deep.equal([
          await mintToken.getAddress(),
          parseUnits('1000.11', 18),
        ]);
      });

      it('should return the correct base token amount for a zero amount', async () => {
        const { dynamicERC20, mintToken } = await loadFixture(
          deployDynamicERC20,
        );
        expect(
          await dynamicERC20.getBaseTokenAmount.staticCall(0),
        ).to.deep.equal([await mintToken.getAddress(), 0]);
      });
    });

    describe('getQuoteTokenAmount', () => {
      it('should return the correct quote token amount for a non-zero amount', async () => {
        const { dynamicERC20, mintStableToken } = await loadFixture(
          deployDynamicERC20,
        );
        expect(
          await dynamicERC20.getQuoteTokenAmount.staticCall(
            parseUnits('1000', 18),
          ),
        ).to.deep.equal([
          await mintStableToken.getAddress(),
          parseUnits('1000110', 6),
        ]);
      });

      it('should return the correct quote token amount for a zero amount', async () => {
        const { dynamicERC20, mintStableToken } = await loadFixture(
          deployDynamicERC20,
        );
        expect(
          await dynamicERC20.getQuoteTokenAmount.staticCall(0),
        ).to.deep.equal([await mintStableToken.getAddress(), 0]);
      });
    });
  });

  describe('Set dynamic price router', () => {
    it('should set the dynamic price router', async () => {
      const { dynamicERC20, mockUniswapV4Router } = await loadFixture(
        deployDynamicERC20,
      );

      const UniswapV4DynamicPriceRouter = await hre.ethers.getContractFactory(
        'UniswapV4DynamicPriceRouter',
      );
      const newRouter = await UniswapV4DynamicPriceRouter.deploy(
        mockUniswapV4Router,
      );

      await dynamicERC20.setDynamicPriceRouter(newRouter);

      expect(await dynamicERC20.dynamicPriceRouter()).to.equal(newRouter);
    });

    it('should revert if the caller is not the owner', async () => {
      const { dynamicERC20, otherAccount } = await loadFixture(
        deployDynamicERC20,
      );

      await expect(
        dynamicERC20.connect(otherAccount).setDynamicPriceRouter(otherAccount),
      ).to.be.revertedWithCustomError(
        dynamicERC20,
        'OwnableUnauthorizedAccount',
      );
    });

    it('should revert if the router does not implement IUniswapV4DynamicPriceRouter', async () => {
      const { dynamicERC20, mintToken } = await loadFixture(deployDynamicERC20);

      await expect(
        dynamicERC20.setDynamicPriceRouter(await mintToken.getAddress()),
      ).to.be.revertedWith('Does not implement IUniswapV4DynamicPriceRouter');
    });
  });

  describe('Set base to quote path', () => {
    it('should set the base to quote path', async () => {
      const { dynamicERC20, mintToken, mintStableToken, mintToken3 } =
        await loadFixture(deployWithNewTokens);

      await expect(
        dynamicERC20.setBaseToQuotePath(
          [
            await mintToken.getAddress(),
            await mintToken3.getAddress(),
            await mintStableToken.getAddress(),
          ],
          [
            { fee: 100, tickSpacing: 1 },
            { fee: 10, tickSpacing: 1 },
          ],
        ),
      )
        .to.emit(dynamicERC20, 'UniswapV4BaseToQuotePathSet')
        .withArgs(
          await dynamicERC20.getAddress(),
          await mintToken.getAddress(),
          await mintStableToken.getAddress(),
          [
            await mintToken.getAddress(),
            await mintToken3.getAddress(),
            await mintStableToken.getAddress(),
          ],
          [
            [await mintToken3.getAddress(), 100n, 1n, ZeroAddress, '0x'],
            [await mintStableToken.getAddress(), 10n, 1n, ZeroAddress, '0x'],
          ],
        );

      expect(await dynamicERC20.getBaseToQuotePath()).to.deep.equal([
        await mintToken.getAddress(),
        await mintToken3.getAddress(),
        await mintStableToken.getAddress(),
      ]);

      expect(await dynamicERC20.getBaseToQuotePathKeys()).to.deep.equal([
        [await mintToken3.getAddress(), 100n, 1n, ZeroAddress, '0x'],
        [await mintStableToken.getAddress(), 10n, 1n, ZeroAddress, '0x'],
      ]);
    });

    it('should revert if the caller is not the owner', async () => {
      const { dynamicERC20, otherAccount } = await loadFixture(
        deployDynamicERC20,
      );

      await expect(
        dynamicERC20.connect(otherAccount).setBaseToQuotePath([], []),
      ).to.be.revertedWithCustomError(
        dynamicERC20,
        'OwnableUnauthorizedAccount',
      );
    });

    it('should revert if the path does not have at least 2 tokens', async () => {
      const { dynamicERC20 } = await loadFixture(deployDynamicERC20);

      await expect(dynamicERC20.setBaseToQuotePath([], [])).to.be.revertedWith(
        'Path must have at least 2 tokens',
      );
    });

    it('should revert if the base token is not the first token in the path', async () => {
      const { dynamicERC20, mintToken, mintStableToken } = await loadFixture(
        deployDynamicERC20,
      );

      await expect(
        dynamicERC20.setBaseToQuotePath(
          [await mintStableToken.getAddress(), await mintToken.getAddress()],
          [],
        ),
      ).to.be.revertedWith('Base token must be first in path');
    });

    it('should revert if the quote token is not the last token in the path', async () => {
      const { dynamicERC20, mintToken } = await loadFixture(deployDynamicERC20);

      await expect(
        dynamicERC20.setBaseToQuotePath(
          [await mintToken.getAddress(), await mintToken.getAddress()],
          [],
        ),
      ).to.be.revertedWith('Quote token must be last in path');
    });

    it('should revert if the fees are not provided for all hops', async () => {
      const { dynamicERC20, mintToken, mintStableToken } = await loadFixture(
        deployDynamicERC20,
      );

      await expect(
        dynamicERC20.setBaseToQuotePath(
          [await mintToken.getAddress(), await mintStableToken.getAddress()],
          [],
        ),
      ).to.be.revertedWith('Fees must be provided for all hops');
    });

    it('revert if test query to price router fails', async () => {
      const { dynamicERC20, mintToken, mintStableToken, mockUniswapV4Router } =
        await loadFixture(deployDynamicERC20);

      await mockUniswapV4Router.setPrice(await mintToken.getAddress(), 0);

      await expect(
        dynamicERC20.setBaseToQuotePath(
          [await mintToken.getAddress(), await mintStableToken.getAddress()],
          [{ fee: 100, tickSpacing: 1 }],
        ),
      )
        .to.be.revertedWithCustomError(dynamicERC20, 'InvalidPath')
        .withArgs(
          [await mintToken.getAddress(), await mintStableToken.getAddress()],
          [[100n, 1n]],
        );
    });

    it('should allow single hop path', async () => {
      const { dynamicERC20, mintToken, mintStableToken } = await loadFixture(
        deployDynamicERC20,
      );

      await expect(
        dynamicERC20.setBaseToQuotePath(
          [await mintToken.getAddress(), await mintStableToken.getAddress()],
          [{ fee: 100, tickSpacing: 1 }],
        ),
      ).to.be.not.reverted;

      expect(await dynamicERC20.getBaseToQuotePath()).to.deep.equal([
        await mintToken.getAddress(),
        await mintStableToken.getAddress(),
      ]);

      expect(await dynamicERC20.getBaseToQuotePathKeys()).to.deep.equal([
        [await mintStableToken.getAddress(), 100n, 1n, ZeroAddress, '0x'],
      ]);
    });
  });

  describe('Set quote to base path', () => {
    it('should set the quote to base path', async () => {
      const { dynamicERC20, mintToken, mintStableToken, mintToken3 } =
        await loadFixture(deployWithNewTokens);

      await expect(
        dynamicERC20.setQuoteToBasePath(
          [
            await mintStableToken.getAddress(),
            await mintToken3.getAddress(),
            await mintToken.getAddress(),
          ],
          [
            { fee: 100, tickSpacing: 1 },
            { fee: 10, tickSpacing: 1 },
          ],
        ),
      )
        .to.emit(dynamicERC20, 'UniswapV4QuoteToBasePathSet')
        .withArgs(
          await dynamicERC20.getAddress(),
          await mintToken.getAddress(),
          await mintStableToken.getAddress(),
          [
            await mintStableToken.getAddress(),
            await mintToken3.getAddress(),
            await mintToken.getAddress(),
          ],
          [
            [await mintToken3.getAddress(), 100n, 1n, ZeroAddress, '0x'],
            [await mintToken.getAddress(), 10n, 1n, ZeroAddress, '0x'],
          ],
        );

      expect(await dynamicERC20.getQuoteToBasePath()).to.deep.equal([
        await mintStableToken.getAddress(),
        await mintToken3.getAddress(),
        await mintToken.getAddress(),
      ]);

      expect(await dynamicERC20.getQuoteToBasePathKeys()).to.deep.equal([
        [await mintToken3.getAddress(), 100n, 1n, ZeroAddress, '0x'],
        [await mintToken.getAddress(), 10n, 1n, ZeroAddress, '0x'],
      ]);
    });

    it('should revert if the caller is not the owner', async () => {
      const { dynamicERC20, otherAccount } = await loadFixture(
        deployDynamicERC20,
      );

      await expect(
        dynamicERC20.connect(otherAccount).setQuoteToBasePath([], []),
      ).to.be.revertedWithCustomError(
        dynamicERC20,
        'OwnableUnauthorizedAccount',
      );
    });

    it('should revert if the path does not have at least 2 tokens', async () => {
      const { dynamicERC20 } = await loadFixture(deployDynamicERC20);

      await expect(dynamicERC20.setQuoteToBasePath([], [])).to.be.revertedWith(
        'Path must have at least 2 tokens',
      );
    });

    it('should revert if the quote token is not the first token in the path', async () => {
      const { dynamicERC20, mintToken } = await loadFixture(deployDynamicERC20);

      await expect(
        dynamicERC20.setQuoteToBasePath(
          [await mintToken.getAddress(), await mintToken.getAddress()],
          [],
        ),
      ).to.be.revertedWith('Quote token must be first in path');
    });

    it('should revert if the base token is not the last token in the path', async () => {
      const { dynamicERC20, mintStableToken } = await loadFixture(
        deployDynamicERC20,
      );

      await expect(
        dynamicERC20.setQuoteToBasePath(
          [
            await mintStableToken.getAddress(),
            await mintStableToken.getAddress(),
          ],
          [],
        ),
      ).to.be.revertedWith('Base token must be last in path');
    });

    it('should revert if the fees are not provided for all hops', async () => {
      const { dynamicERC20, mintToken, mintStableToken } = await loadFixture(
        deployDynamicERC20,
      );

      await expect(
        dynamicERC20.setQuoteToBasePath(
          [await mintStableToken.getAddress(), await mintToken.getAddress()],
          [],
        ),
      ).to.be.revertedWith('Fees must be provided for all hops');
    });

    it('revert if test query to price router fails', async () => {
      const { dynamicERC20, mintToken, mintStableToken, mockUniswapV4Router } =
        await loadFixture(deployDynamicERC20);

      await mockUniswapV4Router.setPrice(await mintStableToken.getAddress(), 0);

      await expect(
        dynamicERC20.setQuoteToBasePath(
          [await mintStableToken.getAddress(), await mintToken.getAddress()],
          [{ fee: 100, tickSpacing: 1 }],
        ),
      )
        .to.be.revertedWithCustomError(dynamicERC20, 'InvalidPath')
        .withArgs(
          [await mintStableToken.getAddress(), await mintToken.getAddress()],
          [[100n, 1n]],
        );
    });
  });
});
