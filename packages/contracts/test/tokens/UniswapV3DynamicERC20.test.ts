import { loadFixture } from '@nomicfoundation/hardhat-toolbox/network-helpers';
import { expect } from 'chai';
import hre from 'hardhat';
import { parseUnits } from 'ethers';

describe('UniswapV3DynamicERC20', () => {
  async function deployDynamicERC20() {
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
    const mintToken2 = await MintToken.deploy();
    const mintToken3 = await MintToken.deploy();

    const MintStableToken = await hre.ethers.getContractFactory(
      'MintStableToken',
    );
    const mintStableToken = await MintStableToken.deploy();

    await mockUniswapV3Router
      .connect(owner)
      .setPrice(await mintToken.getAddress(), 20);
    await mockUniswapV3Router
      .connect(owner)
      .setPrice(await mintStableToken.getAddress(), 5);

    const UniswapV3DynamicERC20 = await hre.ethers.getContractFactory(
      'UniswapV3DynamicERC20',
    );
    const dynamicERC20 = await UniswapV3DynamicERC20.deploy(
      'Dynamic WETH vs USDC',
      'WETHusdc',
      await mintToken.getAddress(),
      await mintStableToken.getAddress(),
      await uniswapV3DynamicPriceRouter.getAddress(),
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
      [2, 2],
      [1, 3],
    );

    return {
      UniswapV3DynamicERC20,
      dynamicERC20,
      owner,
      otherAccount,
      mintToken,
      mintToken2,
      mintToken3,
      mintStableToken,
      uniswapV3DynamicPriceRouter,
      mockUniswapV3Router,
    };
  }

  describe('Deployment', () => {
    it('initial state is correct', async () => {
      const {
        dynamicERC20,
        mintToken,
        mintStableToken,
        uniswapV3DynamicPriceRouter,
        mintToken2,
      } = await loadFixture(deployDynamicERC20);

      expect(await dynamicERC20.name()).to.equal('Dynamic WETH vs USDC');
      expect(await dynamicERC20.symbol()).to.equal('WETHusdc');

      expect(await dynamicERC20.baseToken()).to.equal(
        await mintToken.getAddress(),
      );

      expect(await dynamicERC20.quoteToken()).to.equal(
        await mintStableToken.getAddress(),
      );

      expect(await dynamicERC20.getBaseToQuotePath()).to.deep.equal([
        await mintToken.getAddress(),
        await mintToken2.getAddress(),
        await mintStableToken.getAddress(),
      ]);

      expect(await dynamicERC20.getQuoteToBasePath()).to.deep.equal([
        await mintStableToken.getAddress(),
        await mintToken2.getAddress(),
        await mintToken.getAddress(),
      ]);

      expect(await dynamicERC20.dynamicPriceRouter()).to.equal(
        await uniswapV3DynamicPriceRouter.getAddress(),
      );

      expect(await dynamicERC20.baseToQuotePathEncoded()).to.equal(
        hre.ethers.solidityPacked(
          ['address', 'uint24', 'address', 'uint24', 'address'],
          [
            await mintToken.getAddress(),
            3000,
            await mintToken2.getAddress(),
            3000,
            await mintStableToken.getAddress(),
          ],
        ),
      );

      expect(await dynamicERC20.quoteToBasePathEncoded()).to.equal(
        hre.ethers.solidityPacked(
          ['address', 'uint24', 'address', 'uint24', 'address'],
          [
            await mintStableToken.getAddress(),
            500,
            await mintToken2.getAddress(),
            10000,
            await mintToken.getAddress(),
          ],
        ),
      );

      expect(await dynamicERC20.getBaseToQuoteFees()).to.deep.equal([2, 2]);
      expect(await dynamicERC20.getQuoteToBaseFees()).to.deep.equal([1, 3]);
    });

    it('correct owner is set', async () => {
      const { dynamicERC20, owner } = await loadFixture(deployDynamicERC20);

      expect(await dynamicERC20.owner()).to.equal(owner);
    });
  });

  describe('Dynamic price router', () => {
    it('can update dynamic price router', async () => {
      const { dynamicERC20, mockUniswapV3Router } = await loadFixture(
        deployDynamicERC20,
      );

      const UniswapV3DynamicPriceRouter = await hre.ethers.getContractFactory(
        'UniswapV3DynamicPriceRouter',
      );
      const newRouter = await UniswapV3DynamicPriceRouter.deploy(
        mockUniswapV3Router,
      );

      await expect(dynamicERC20.setDynamicPriceRouter(newRouter))
        .to.emit(dynamicERC20, 'DynamicPriceRouterSet')
        .withArgs(
          await dynamicERC20.getAddress(),
          await newRouter.getAddress(),
        );

      expect(await dynamicERC20.dynamicPriceRouter()).to.equal(
        await newRouter.getAddress(),
      );
    });

    it('revert if not the owner', async () => {
      const { dynamicERC20, otherAccount } = await loadFixture(
        deployDynamicERC20,
      );

      await expect(
        dynamicERC20
          .connect(otherAccount)
          .setDynamicPriceRouter(await dynamicERC20.getAddress()),
      ).to.revertedWithCustomError(dynamicERC20, 'OwnableUnauthorizedAccount');
    });

    it('revert if the router does not implement IUniswapV3DynamicPriceRouter', async () => {
      const { dynamicERC20, mockUniswapV3Router } = await loadFixture(
        deployDynamicERC20,
      );

      await expect(
        dynamicERC20.setDynamicPriceRouter(
          await mockUniswapV3Router.getAddress(),
        ),
      ).to.revertedWith('Does not implement IUniswapV3DynamicPriceRouter');
    });
  });

  describe('Dynamic ERC20', () => {
    it('base token price is correct', async () => {
      const { dynamicERC20 } = await loadFixture(deployDynamicERC20);

      expect(await dynamicERC20.getBaseTokenPrice.staticCall()).to.equal(
        parseUnits('20.120540', 6),
      );
    });

    it('balance of quote is correct', async () => {
      const { dynamicERC20, mintToken, otherAccount } = await loadFixture(
        deployDynamicERC20,
      );

      await mintToken.mint(otherAccount, parseUnits('200', 18));

      expect(
        await dynamicERC20.balanceOfQuote.staticCall(otherAccount),
      ).to.equal(parseUnits('4024.108', 6));
    });

    it('balance of quote is correct when the amount is zero', async () => {
      const { dynamicERC20, otherAccount } = await loadFixture(
        deployDynamicERC20,
      );

      expect(
        await dynamicERC20.balanceOfQuote.staticCall(otherAccount),
      ).to.equal(0);
    });

    it('allowance quote is correct', async () => {
      const { dynamicERC20, mintToken, otherAccount, owner } =
        await loadFixture(deployDynamicERC20);

      await mintToken.approve(otherAccount, parseUnits('200', 18));

      expect(
        await dynamicERC20.allowanceQuote.staticCall(owner, otherAccount),
      ).to.equal(parseUnits('4024.108', 6));
    });

    it('allowance quote is correct when the amount is zero', async () => {
      const { dynamicERC20, otherAccount, owner } = await loadFixture(
        deployDynamicERC20,
      );

      expect(
        await dynamicERC20.allowanceQuote.staticCall(owner, otherAccount),
      ).to.equal(0);
    });

    it('base token amount is correct', async () => {
      const { dynamicERC20, mintToken } = await loadFixture(deployDynamicERC20);

      expect(
        await dynamicERC20.getBaseTokenAmount.staticCall(parseUnits('20', 6)),
      ).to.deep.equal([
        await mintToken.getAddress(),
        parseUnits('101.0606', 18),
      ]);
    });

    it('base token amount is correct when the amount is zero', async () => {
      const { dynamicERC20, mintToken } = await loadFixture(deployDynamicERC20);

      expect(await dynamicERC20.getBaseTokenAmount.staticCall(0)).to.deep.equal(
        [await mintToken.getAddress(), 0],
      );
    });

    it('quote token amount is correct', async () => {
      const { dynamicERC20, mintStableToken } = await loadFixture(
        deployDynamicERC20,
      );

      expect(
        await dynamicERC20.getQuoteTokenAmount.staticCall(parseUnits('20', 18)),
      ).to.deep.equal([
        await mintStableToken.getAddress(),
        parseUnits('402.4108', 6),
      ]);
    });

    it('quote token amount is correct when the amount is zero', async () => {
      const { dynamicERC20, mintStableToken } = await loadFixture(
        deployDynamicERC20,
      );

      expect(
        await dynamicERC20.getQuoteTokenAmount.staticCall(0),
      ).to.deep.equal([await mintStableToken.getAddress(), 0]);
    });
  });

  describe('Base to quote path', () => {
    it('can update base to quote path', async () => {
      const {
        dynamicERC20,
        mintToken,
        mintToken2,
        mintToken3,
        mintStableToken,
      } = await loadFixture(deployDynamicERC20);

      const pathAddresses = [
        await mintToken.getAddress(),
        await mintToken2.getAddress(),
        await mintToken3.getAddress(),
        await mintStableToken.getAddress(),
      ];

      const fees = [0, 1, 2];

      const pathEncoded = hre.ethers.solidityPacked(
        [
          'address',
          'uint24',
          'address',
          'uint24',
          'address',
          'uint24',
          'address',
        ],
        [
          await mintToken.getAddress(),
          100,
          await mintToken2.getAddress(),
          500,
          await mintToken3.getAddress(),
          3000,
          await mintStableToken.getAddress(),
        ],
      );

      await expect(dynamicERC20.setBaseToQuotePath(pathAddresses, fees))
        .to.emit(dynamicERC20, 'UniswapV3BaseToQuotePathSet')
        .withArgs(
          await dynamicERC20.getAddress(),
          await mintToken.getAddress(),
          await mintStableToken.getAddress(),
          pathAddresses,
          pathEncoded,
          fees,
        );

      expect(await dynamicERC20.getBaseToQuotePath()).to.deep.equal(
        pathAddresses,
      );

      expect(await dynamicERC20.getBaseToQuoteFees()).to.deep.equal(fees);

      expect(await dynamicERC20.baseToQuotePathEncoded()).to.equal(pathEncoded);
    });

    it('revert if not the owner', async () => {
      const { dynamicERC20, mintToken, mintStableToken, otherAccount } =
        await loadFixture(deployDynamicERC20);

      await expect(
        dynamicERC20
          .connect(otherAccount)
          .setBaseToQuotePath(
            [await mintToken.getAddress(), await mintStableToken.getAddress()],
            [1],
          ),
      ).to.revertedWithCustomError(dynamicERC20, 'OwnableUnauthorizedAccount');
    });

    it('revert if the base token is not the first in the path', async () => {
      const { dynamicERC20, mintToken, mintStableToken } = await loadFixture(
        deployDynamicERC20,
      );

      await expect(
        dynamicERC20.setBaseToQuotePath(
          [await mintStableToken.getAddress(), await mintToken.getAddress()],
          [1],
        ),
      ).to.revertedWith('Base token must be first in path');
    });

    it('revert if the quote token is not the last in the path', async () => {
      const { dynamicERC20, mintToken } = await loadFixture(deployDynamicERC20);

      await expect(
        dynamicERC20.setBaseToQuotePath(
          [await mintToken.getAddress(), await mintToken.getAddress()],
          [1],
        ),
      ).to.revertedWith('Quote token must be last in path');
    });

    it('revert if the path is less than 2 tokens', async () => {
      const { dynamicERC20, mintToken } = await loadFixture(deployDynamicERC20);

      await expect(
        dynamicERC20.setBaseToQuotePath([await mintToken.getAddress()], [1]),
      ).to.revertedWith('Path must have at least 2 tokens');
    });

    it('revert if there are not enough fees included for the path', async () => {
      const { dynamicERC20, mintToken, mintToken2, mintStableToken } =
        await loadFixture(deployDynamicERC20);

      await expect(
        dynamicERC20.setBaseToQuotePath(
          [
            await mintToken.getAddress(),
            await mintToken2.getAddress(),
            await mintStableToken.getAddress(),
          ],
          [1],
        ),
      ).to.revertedWith('Fees length must match hops');
    });

    it('revert if too many fees included for the path', async () => {
      const { dynamicERC20, mintToken, mintToken2, mintStableToken } =
        await loadFixture(deployDynamicERC20);

      await expect(
        dynamicERC20.setBaseToQuotePath(
          [
            await mintToken.getAddress(),
            await mintToken2.getAddress(),
            await mintStableToken.getAddress(),
          ],
          [1, 2, 3],
        ),
      ).to.revertedWith('Fees length must match hops');
    });

    it('revert if the path is invalid', async () => {
      const {
        dynamicERC20,
        mintToken,
        mintToken2,
        mintStableToken,
        mockUniswapV3Router,
      } = await loadFixture(deployDynamicERC20);

      const path = [
        await mintToken.getAddress(),
        await mintToken2.getAddress(),
        await mintStableToken.getAddress(),
      ];

      await mockUniswapV3Router.setPrice(await mintToken.getAddress(), 0);

      await expect(dynamicERC20.setBaseToQuotePath(path, [1, 2]))
        .to.revertedWithCustomError(dynamicERC20, 'InvalidPath')
        .withArgs(path);
    });
  });

  describe('Quote to base path', () => {
    it('can update quote to base path', async () => {
      const {
        dynamicERC20,
        mintToken,
        mintToken2,
        mintToken3,
        mintStableToken,
      } = await loadFixture(deployDynamicERC20);

      const pathAddresses = [
        await mintStableToken.getAddress(),
        await mintToken3.getAddress(),
        await mintToken2.getAddress(),
        await mintToken.getAddress(),
      ];

      const fees = [2, 1, 0];

      const pathEncoded = hre.ethers.solidityPacked(
        [
          'address',
          'uint24',
          'address',
          'uint24',
          'address',
          'uint24',
          'address',
        ],
        [
          await mintStableToken.getAddress(),
          3000,
          await mintToken3.getAddress(),
          500,
          await mintToken2.getAddress(),
          100,
          await mintToken.getAddress(),
        ],
      );

      // Call
      await expect(dynamicERC20.setQuoteToBasePath(pathAddresses, fees))
        .to.emit(dynamicERC20, 'UniswapV3QuoteToBasePathSet')
        .withArgs(
          await dynamicERC20.getAddress(),
          await mintToken.getAddress(),
          await mintStableToken.getAddress(),
          pathAddresses,
          pathEncoded,
          fees,
        );

      expect(await dynamicERC20.getQuoteToBasePath()).to.deep.equal(
        pathAddresses,
      );

      expect(await dynamicERC20.getQuoteToBaseFees()).to.deep.equal(fees);

      expect(await dynamicERC20.quoteToBasePathEncoded()).to.equal(pathEncoded);
    });

    it('revert if not the owner', async () => {
      const { dynamicERC20, mintToken, mintStableToken, otherAccount } =
        await loadFixture(deployDynamicERC20);

      await expect(
        dynamicERC20
          .connect(otherAccount)
          .setQuoteToBasePath(
            [await mintToken.getAddress(), await mintStableToken.getAddress()],
            [1],
          ),
      ).to.revertedWithCustomError(dynamicERC20, 'OwnableUnauthorizedAccount');
    });

    it('revert if the quote token is not the first in the path', async () => {
      const { dynamicERC20, mintToken, mintStableToken } = await loadFixture(
        deployDynamicERC20,
      );

      await expect(
        dynamicERC20.setQuoteToBasePath(
          [await mintToken.getAddress(), await mintStableToken.getAddress()],
          [1],
        ),
      ).to.revertedWith('Quote token must be first in path');
    });

    it('revert if the base token is not the last in the path', async () => {
      const { dynamicERC20, mintStableToken } = await loadFixture(
        deployDynamicERC20,
      );

      await expect(
        dynamicERC20.setQuoteToBasePath(
          [
            await mintStableToken.getAddress(),
            await mintStableToken.getAddress(),
          ],
          [1],
        ),
      ).to.revertedWith('Base token must be last in path');
    });

    it('revert if the path is less than 2 tokens', async () => {
      const { dynamicERC20, mintToken } = await loadFixture(deployDynamicERC20);

      await expect(
        dynamicERC20.setQuoteToBasePath([await mintToken.getAddress()], [1]),
      ).to.revertedWith('Path must have at least 2 tokens');
    });

    it('revert if there are not enough fees included for the path', async () => {
      const { dynamicERC20, mintToken, mintToken2, mintStableToken } =
        await loadFixture(deployDynamicERC20);

      await expect(
        dynamicERC20.setQuoteToBasePath(
          [
            await mintStableToken.getAddress(),
            await mintToken2.getAddress(),
            await mintToken.getAddress(),
          ],
          [1],
        ),
      ).to.revertedWith('Fees length must match hops');
    });

    it('revert if too many fees included for the path', async () => {
      const { dynamicERC20, mintToken, mintToken2, mintStableToken } =
        await loadFixture(deployDynamicERC20);

      await expect(
        dynamicERC20.setQuoteToBasePath(
          [
            await mintStableToken.getAddress(),
            await mintToken2.getAddress(),
            await mintToken.getAddress(),
          ],
          [1, 2, 3],
        ),
      ).to.revertedWith('Fees length must match hops');
    });
  });
});
