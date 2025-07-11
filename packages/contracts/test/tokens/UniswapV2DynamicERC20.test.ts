import { loadFixture } from '@nomicfoundation/hardhat-toolbox/network-helpers';
import { expect } from 'chai';
import hre from 'hardhat';
import { parseUnits, ZeroAddress } from 'ethers';
import calculateInterfaceId from '../../utils/calculate-interface-id';

describe('UniswapV2DynamicERC20', () => {
  async function deployDynamicERC20() {
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

    await mockUniswapV2Router.connect(owner).setPrice(mintToken, 20);
    await mockUniswapV2Router.connect(owner).setPrice(mintStableToken, 1);

    const UniswapV2DynamicERC20 = await hre.ethers.getContractFactory(
      'UniswapV2DynamicERC20',
    );
    const dynamicERC20 = await UniswapV2DynamicERC20.deploy(
      'Dynamic WETH vs USDC',
      'WETHusdc',
      await mintToken.getAddress(),
      await mintStableToken.getAddress(),
      await uniswapV2DynamicPriceRouter.getAddress(),
      [await mintToken.getAddress(), await mintStableToken.getAddress()],
      [await mintStableToken.getAddress(), await mintToken.getAddress()],
    );

    return {
      UniswapV2DynamicERC20,
      dynamicERC20,
      owner,
      otherAccount,
      mintToken,
      mintStableToken,
      uniswapV2DynamicPriceRouter,
      mockUniswapV2Router,
    };
  }
  describe('Deployment', () => {
    it('initial state is correct', async () => {
      const {
        dynamicERC20,
        mintToken,
        mintStableToken,
        uniswapV2DynamicPriceRouter,
      } = await loadFixture(deployDynamicERC20);

      expect(await dynamicERC20.name()).to.equal('Dynamic WETH vs USDC');
      expect(await dynamicERC20.symbol()).to.equal('WETHusdc');

      expect(await dynamicERC20.baseToken()).to.equal(
        await mintToken.getAddress(),
      );
      expect(await dynamicERC20.quoteToken()).to.equal(
        await mintStableToken.getAddress(),
      );

      const baseToQuotePath = await dynamicERC20.getBaseToQuotePath();
      expect(baseToQuotePath).to.deep.equal([
        await mintToken.getAddress(),
        await mintStableToken.getAddress(),
      ]);

      const quoteToBasePath = await dynamicERC20.getQuoteToBasePath();
      expect(quoteToBasePath).to.deep.equal([
        await mintStableToken.getAddress(),
        await mintToken.getAddress(),
      ]);

      expect(await dynamicERC20.dynamicPriceRouter()).to.equal(
        await uniswapV2DynamicPriceRouter.getAddress(),
      );
    });

    it('should set the correct owner', async () => {
      const { dynamicERC20, owner } = await loadFixture(deployDynamicERC20);
      expect(await dynamicERC20.owner()).to.equal(owner);
    });

    it('revert if base token is zero address', async () => {
      const {
        UniswapV2DynamicERC20,
        mintToken,
        mintStableToken,
        uniswapV2DynamicPriceRouter,
      } = await loadFixture(deployDynamicERC20);

      await expect(
        UniswapV2DynamicERC20.deploy(
          'Dynamic WETH vs USDC',
          'WETHusdc',
          ZeroAddress,
          await mintStableToken.getAddress(),
          await uniswapV2DynamicPriceRouter.getAddress(),
          [await mintToken.getAddress(), await mintStableToken.getAddress()],
          [await mintStableToken.getAddress(), await mintToken.getAddress()],
        ),
      ).to.be.revertedWith('Base token cannot be zero address');
    });

    it('revert if quote token is zero address', async () => {
      const {
        UniswapV2DynamicERC20,
        mintToken,
        mintStableToken,
        uniswapV2DynamicPriceRouter,
      } = await loadFixture(deployDynamicERC20);

      await expect(
        UniswapV2DynamicERC20.deploy(
          'Dynamic WETH vs USDC',
          'WETHusdc',
          await mintToken.getAddress(),
          ZeroAddress,
          await uniswapV2DynamicPriceRouter.getAddress(),
          [await mintToken.getAddress(), await mintStableToken.getAddress()],
          [await mintStableToken.getAddress(), await mintToken.getAddress()],
        ),
      ).to.be.revertedWith('Quote token cannot be zero address');
    });

    it('revert if the router is does not implement dynamic price router interface', async () => {
      const { UniswapV2DynamicERC20, mintToken, mintStableToken } =
        await loadFixture(deployDynamicERC20);

      await expect(
        UniswapV2DynamicERC20.deploy(
          'Dynamic WETH vs USDC',
          'WETHusdc',
          await mintToken.getAddress(),
          await mintStableToken.getAddress(),
          await mintToken.getAddress(),
          [await mintToken.getAddress(), await mintStableToken.getAddress()],
          [await mintStableToken.getAddress(), await mintToken.getAddress()],
        ),
      ).to.be.revertedWith('Does not implement IUniswapV2DynamicPriceRouter');
    });

    it('revert if the base token is the same as the quote token', async () => {
      const {
        UniswapV2DynamicERC20,
        mintToken,
        mintStableToken,
        uniswapV2DynamicPriceRouter,
      } = await loadFixture(deployDynamicERC20);

      await expect(
        UniswapV2DynamicERC20.deploy(
          'Dynamic WETH vs USDC',
          'WETHusdc',
          await mintToken.getAddress(),
          await mintToken.getAddress(),
          await uniswapV2DynamicPriceRouter.getAddress(),
          [await mintToken.getAddress(), await mintStableToken.getAddress()],
          [await mintStableToken.getAddress(), await mintToken.getAddress()],
        ),
      ).to.be.revertedWith('Base and quote token cannot be the same');
    });
  });

  describe('Router pricing', () => {
    it('should return the router name', async () => {
      const { dynamicERC20 } = await loadFixture(deployDynamicERC20);
      expect(await dynamicERC20.routerName()).to.equal('uniswap-v2');
    });

    it('should return the router address', async () => {
      const { dynamicERC20 } = await loadFixture(deployDynamicERC20);
      expect(await dynamicERC20.dynamicPriceRouter()).to.equal(
        await dynamicERC20.dynamicPriceRouter(),
      );
    });

    it('should return the base token price', async () => {
      const { dynamicERC20 } = await loadFixture(deployDynamicERC20);
      expect(await dynamicERC20.getBaseTokenPrice()).to.equal(
        parseUnits('20.06018', 6),
      );
    });

    it('should return the correct base token amount', async () => {
      const { dynamicERC20 } = await loadFixture(deployDynamicERC20);

      const [baseToken, baseTokenAmount] =
        await dynamicERC20.getBaseTokenAmount(parseUnits('100', 6));

      expect(baseToken).to.equal(await dynamicERC20.baseToken());
      expect(baseTokenAmount).to.equal(parseUnits('100.3009', 18));
    });

    it('should return the correct base token amount when the amount is zero', async () => {
      const { dynamicERC20 } = await loadFixture(deployDynamicERC20);

      const [baseToken, baseTokenAmount] =
        await dynamicERC20.getBaseTokenAmount(parseUnits('0', 6));

      expect(baseToken).to.equal(await dynamicERC20.baseToken());
      expect(baseTokenAmount).to.equal(0);
    });

    it('should return the correct quote token amount', async () => {
      const { dynamicERC20 } = await loadFixture(deployDynamicERC20);

      const [quoteToken, quoteTokenAmount] =
        await dynamicERC20.getQuoteTokenAmount(parseUnits('20', 18));

      expect(quoteToken).to.equal(await dynamicERC20.quoteToken());
      expect(quoteTokenAmount).to.equal(parseUnits('401.2036', 6));
    });

    it('should return the correct quote token amount when the amount is zero', async () => {
      const { dynamicERC20 } = await loadFixture(deployDynamicERC20);

      const [quoteToken, quoteTokenAmount] =
        await dynamicERC20.getQuoteTokenAmount(parseUnits('0', 18));

      expect(quoteToken).to.equal(await dynamicERC20.quoteToken());
      expect(quoteTokenAmount).to.equal(0);
    });
  });

  describe('Dynamic ERC20 static call functions', () => {
    it('should return the base token price', async () => {
      const { dynamicERC20 } = await loadFixture(deployDynamicERC20);
      expect(await dynamicERC20.getBaseTokenPrice.staticCall()).to.equal(
        parseUnits('20.06018', 6),
      );
    });

    it('should return the base token amount view', async () => {
      const { dynamicERC20 } = await loadFixture(deployDynamicERC20);

      const [baseToken, baseTokenAmount] =
        await dynamicERC20.getBaseTokenAmount.staticCall(parseUnits('100', 6));

      expect(baseToken).to.equal(await dynamicERC20.baseToken());
      expect(baseTokenAmount).to.equal(parseUnits('100.3009', 18));
    });

    it('should return the quote token amount view', async () => {
      const { dynamicERC20 } = await loadFixture(deployDynamicERC20);

      const [quoteToken, quoteTokenAmount] =
        await dynamicERC20.getQuoteTokenAmount.staticCall(parseUnits('20', 18));

      expect(quoteToken).to.equal(await dynamicERC20.quoteToken());
      expect(quoteTokenAmount).to.equal(parseUnits('401.2036', 6));
    });
  });

  describe('Set Dynamic Price Router', () => {
    it('should set a new dynamic price router', async () => {
      const { dynamicERC20 } = await loadFixture(deployDynamicERC20);

      const MockUniswapV2Router = await hre.ethers.getContractFactory(
        'MockUniswapV2Router',
      );
      const mockUniswapV2Router = await MockUniswapV2Router.deploy();

      const UniswapV2DynamicPriceRouter = await hre.ethers.getContractFactory(
        'UniswapV2DynamicPriceRouter',
      );
      const newRouter = await UniswapV2DynamicPriceRouter.deploy(
        mockUniswapV2Router,
      );

      await expect(
        dynamicERC20.setDynamicPriceRouter(await newRouter.getAddress()),
      )
        .to.emit(dynamicERC20, 'DynamicPriceRouterSet')
        .withArgs(
          await dynamicERC20.getAddress(),
          await newRouter.getAddress(),
        );
    });

    it('revert if the caller is not the owner', async () => {
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

    it('revert if the router does not implement the dynamic price router interface', async () => {
      const { dynamicERC20, mintToken } = await loadFixture(deployDynamicERC20);

      await expect(
        dynamicERC20.setDynamicPriceRouter(await mintToken.getAddress()),
      ).to.be.revertedWith('Does not implement IUniswapV2DynamicPriceRouter');
    });
  });

  describe('Supports Interface', () => {
    it('should return true for IERC20 interface', async () => {
      const { dynamicERC20 } = await loadFixture(deployDynamicERC20);

      const interfaceId = calculateInterfaceId([
        'totalSupply()',
        'balanceOf(address)',
        'transfer(address,uint256)',
        'allowance(address,address)',
        'transferFrom(address,address,uint256)',
        'approve(address,uint256)',
      ]);

      expect(await dynamicERC20.supportsInterface(interfaceId)).to.be.true;
    });

    it('should return true for IERC20Metadata interface', async () => {
      const { dynamicERC20 } = await loadFixture(deployDynamicERC20);

      const interfaceId = calculateInterfaceId([
        'name()',
        'symbol()',
        'decimals()',
      ]);

      expect(await dynamicERC20.supportsInterface(interfaceId)).to.be.true;
    });

    it('should return true for IDynamicERC20 interface', async () => {
      const { dynamicERC20 } = await loadFixture(deployDynamicERC20);

      const interfaceId = calculateInterfaceId([
        'routerName()',
        'dynamicPriceRouter()',
        'baseToken()',
        'quoteToken()',
        'getBaseToQuotePath()',
        'getQuoteToBasePath()',
        'getBaseTokenPrice()',
        'balanceOfQuote(address)',
        'allowanceQuote(address,address)',
        'getBaseTokenAmount(uint256)',
        'getQuoteTokenAmount(uint256)',
      ]);

      expect(await dynamicERC20.supportsInterface(interfaceId)).to.be.true;
    });

    it('should return true for IERC165 interface', async () => {
      const { dynamicERC20 } = await loadFixture(deployDynamicERC20);
      expect(await dynamicERC20.supportsInterface('0x01ffc9a7')).to.be.true;
    });

    it('should return false for an unknown interface', async () => {
      const { dynamicERC20 } = await loadFixture(deployDynamicERC20);
      expect(await dynamicERC20.supportsInterface('0xffffffff')).to.be.false;
    });
  });

  describe('State changing functions', () => {
    it('revert if the caller tries to transfer', async () => {
      const { dynamicERC20, otherAccount } = await loadFixture(
        deployDynamicERC20,
      );

      await expect(
        dynamicERC20.connect(otherAccount).transfer(otherAccount, 100),
      ).to.be.revertedWithCustomError(dynamicERC20, 'TransferNotAllowed');
    });

    it('revert if the caller tries to transferFrom', async () => {
      const { dynamicERC20, otherAccount } = await loadFixture(
        deployDynamicERC20,
      );

      await expect(
        dynamicERC20
          .connect(otherAccount)
          .transferFrom(otherAccount, otherAccount, 100),
      ).to.be.revertedWithCustomError(dynamicERC20, 'TransferNotAllowed');
    });

    it('revert if the caller tries to approve', async () => {
      const { dynamicERC20, otherAccount } = await loadFixture(
        deployDynamicERC20,
      );

      await expect(
        dynamicERC20.connect(otherAccount).approve(otherAccount, 100),
      ).to.be.revertedWithCustomError(dynamicERC20, 'ApproveNotAllowed');
    });
  });

  describe('ERC20 view functions', () => {
    it('should return the total supply of the base token when it is zero', async () => {
      const { dynamicERC20 } = await loadFixture(deployDynamicERC20);

      expect(await dynamicERC20.totalSupply()).to.equal(0);
    });

    it('should return the total supply of the base token when it is not zero', async () => {
      const { dynamicERC20, mintToken, otherAccount } = await loadFixture(
        deployDynamicERC20,
      );

      await mintToken.connect(otherAccount).mint(otherAccount, 100);

      expect(await dynamicERC20.totalSupply()).to.equal(100);
    });

    it('should return the decimals of the quote token', async () => {
      const { dynamicERC20 } = await loadFixture(deployDynamicERC20);

      expect(await dynamicERC20.decimals()).to.equal(6);
    });

    it('should return the allowance of the base token when it is zero', async () => {
      const { dynamicERC20, otherAccount } = await loadFixture(
        deployDynamicERC20,
      );

      expect(await dynamicERC20.allowance(otherAccount, otherAccount)).to.equal(
        0,
      );

      expect(
        await dynamicERC20.allowanceQuote(otherAccount, otherAccount),
      ).to.equal(0);
    });

    it('should return the allowance of the base token when it is not zero', async () => {
      const { dynamicERC20, mintToken, otherAccount } = await loadFixture(
        deployDynamicERC20,
      );

      await mintToken
        .connect(otherAccount)
        .approve(otherAccount, parseUnits('1000', 18));

      expect(await dynamicERC20.allowance(otherAccount, otherAccount)).to.equal(
        parseUnits('1000', 18),
      );

      expect(
        await dynamicERC20.allowanceQuote(otherAccount, otherAccount),
      ).to.equal(parseUnits('20060.18', 6));
    });

    it('should return the balance of the base token when it is zero', async () => {
      const { dynamicERC20, otherAccount } = await loadFixture(
        deployDynamicERC20,
      );

      expect(await dynamicERC20.balanceOf(otherAccount)).to.equal(0);

      expect(await dynamicERC20.balanceOfQuote(otherAccount)).to.equal(0);
    });

    it('should return the balance of the base token when it is not zero', async () => {
      const { dynamicERC20, mintToken, otherAccount } = await loadFixture(
        deployDynamicERC20,
      );

      await mintToken.mint(otherAccount, parseUnits('1000', 18));

      expect(await dynamicERC20.balanceOf(otherAccount)).to.equal(
        parseUnits('1000', 18),
      );

      expect(await dynamicERC20.balanceOfQuote(otherAccount)).to.equal(
        parseUnits('20060.18', 6),
      );
    });
  });

  describe('Base to quote path', () => {
    it('should set the base to quote path', async () => {
      const { dynamicERC20, mintToken, mintStableToken } = await loadFixture(
        deployDynamicERC20,
      );

      const MintToken = await hre.ethers.getContractFactory('MintToken');
      const mintToken2 = await MintToken.deploy();

      const expectedPath = [
        await mintToken.getAddress(),
        await mintToken2.getAddress(),
        await mintStableToken.getAddress(),
      ];

      await expect(dynamicERC20.setBaseToQuotePath(expectedPath))
        .to.emit(dynamicERC20, 'UniswapV2BaseToQuotePathSet')
        .withArgs(
          await dynamicERC20.getAddress(),
          await mintToken.getAddress(),
          await mintStableToken.getAddress(),
          expectedPath,
        );

      const baseToQuotePath = await dynamicERC20.getBaseToQuotePath();
      expect(baseToQuotePath).to.deep.equal(expectedPath);
    });

    it('revert if no tokens are provided', async () => {
      const { dynamicERC20 } = await loadFixture(deployDynamicERC20);

      await expect(dynamicERC20.setBaseToQuotePath([])).to.be.revertedWith(
        'Path must have at least 2 tokens',
      );
    });

    it('revert if 1 token is provided', async () => {
      const { dynamicERC20, mintToken } = await loadFixture(deployDynamicERC20);

      await expect(
        dynamicERC20.setBaseToQuotePath([await mintToken.getAddress()]),
      ).to.be.revertedWith('Path must have at least 2 tokens');
    });

    it('revert if the base token is not the first token in the path', async () => {
      const { dynamicERC20, mintStableToken } = await loadFixture(
        deployDynamicERC20,
      );

      await expect(
        dynamicERC20.setBaseToQuotePath([
          await mintStableToken.getAddress(),
          await mintStableToken.getAddress(),
        ]),
      ).to.be.revertedWith('Base token must be first in path');
    });

    it('revert if the quote token is not the last token in the path', async () => {
      const { dynamicERC20, mintToken } = await loadFixture(deployDynamicERC20);

      await expect(
        dynamicERC20.setBaseToQuotePath([
          await mintToken.getAddress(),
          await mintToken.getAddress(),
        ]),
      ).to.be.revertedWith('Quote token must be last in path');
    });

    it('only the owner can set the base to quote path', async () => {
      const { dynamicERC20, otherAccount } = await loadFixture(
        deployDynamicERC20,
      );

      await expect(
        dynamicERC20.connect(otherAccount).setBaseToQuotePath([]),
      ).to.be.revertedWithCustomError(
        dynamicERC20,
        'OwnableUnauthorizedAccount',
      );
    });

    it('revert if the path is invalid', async () => {
      const { dynamicERC20, mintToken, mintStableToken, mockUniswapV2Router } =
        await loadFixture(deployDynamicERC20);

      await mockUniswapV2Router.setPrice(await mintToken.getAddress(), 0);
      await mockUniswapV2Router.setPrice(await mintStableToken.getAddress(), 0);

      const path = [
        await mintToken.getAddress(),
        await mintStableToken.getAddress(),
      ];

      await expect(dynamicERC20.setBaseToQuotePath(path))
        .to.be.revertedWithCustomError(dynamicERC20, 'InvalidPath')
        .withArgs(path);
    });
  });

  describe('Quote to base path', () => {
    it('should set the quote to base path', async () => {
      const { dynamicERC20, mintToken, mintStableToken } = await loadFixture(
        deployDynamicERC20,
      );

      const MintToken = await hre.ethers.getContractFactory('MintToken');
      const mintToken2 = await MintToken.deploy();

      const expectedPath = [
        await mintStableToken.getAddress(),
        await mintToken2.getAddress(),
        await mintToken.getAddress(),
      ];

      await expect(dynamicERC20.setQuoteToBasePath(expectedPath))
        .to.emit(dynamicERC20, 'UniswapV2QuoteToBasePathSet')
        .withArgs(
          await dynamicERC20.getAddress(),
          await mintToken.getAddress(),
          await mintStableToken.getAddress(),
          expectedPath,
        );

      const quoteToBasePath = await dynamicERC20.getQuoteToBasePath();
      expect(quoteToBasePath).to.deep.equal(expectedPath);
    });

    it('revert if no tokens are provided', async () => {
      const { dynamicERC20 } = await loadFixture(deployDynamicERC20);

      await expect(dynamicERC20.setQuoteToBasePath([])).to.be.revertedWith(
        'Path must have at least 2 tokens',
      );
    });

    it('revert if 1 token is provided', async () => {
      const { dynamicERC20, mintToken } = await loadFixture(deployDynamicERC20);

      await expect(
        dynamicERC20.setQuoteToBasePath([await mintToken.getAddress()]),
      ).to.be.revertedWith('Path must have at least 2 tokens');
    });

    it('revert if the quote token is not the first token in the path', async () => {
      const { dynamicERC20, mintToken } = await loadFixture(deployDynamicERC20);

      await expect(
        dynamicERC20.setQuoteToBasePath([
          await mintToken.getAddress(),
          await mintToken.getAddress(),
        ]),
      ).to.be.revertedWith('Quote token must be first in path');
    });

    it('revert if the base token is not the last token in the path', async () => {
      const { dynamicERC20, mintStableToken } = await loadFixture(
        deployDynamicERC20,
      );

      await expect(
        dynamicERC20.setQuoteToBasePath([
          await mintStableToken.getAddress(),
          await mintStableToken.getAddress(),
        ]),
      ).to.be.revertedWith('Base token must be last in path');
    });

    it('only the owner can set the quote to base path', async () => {
      const { dynamicERC20, otherAccount } = await loadFixture(
        deployDynamicERC20,
      );

      await expect(
        dynamicERC20.connect(otherAccount).setQuoteToBasePath([]),
      ).to.be.revertedWithCustomError(
        dynamicERC20,
        'OwnableUnauthorizedAccount',
      );
    });

    it('revert if the path is invalid', async () => {
      const { dynamicERC20, mintToken, mintStableToken, mockUniswapV2Router } =
        await loadFixture(deployDynamicERC20);

      await mockUniswapV2Router.setPrice(await mintToken.getAddress(), 0);
      await mockUniswapV2Router.setPrice(await mintStableToken.getAddress(), 0);

      const path = [
        await mintStableToken.getAddress(),
        await mintToken.getAddress(),
      ];

      await expect(dynamicERC20.setQuoteToBasePath(path))
        .to.be.revertedWithCustomError(dynamicERC20, 'InvalidPath')
        .withArgs(path);
    });
  });
});
