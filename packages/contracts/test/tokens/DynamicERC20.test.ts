import { loadFixture } from '@nomicfoundation/hardhat-toolbox/network-helpers';
import { expect } from 'chai';
import hre from 'hardhat';
import { parseUnits, ZeroAddress } from 'ethers';
import calculateInterfaceId from '../../utils/calculate-interface-id';

describe('DynamicERC20', () => {
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

    const DynamicERC20 = await hre.ethers.getContractFactory('DynamicERC20');
    const dynamicERC20 = await DynamicERC20.deploy(
      'DynamicERC20',
      'DYN',
      await mintToken.getAddress(),
      await mintStableToken.getAddress(),
      await uniswapV2DynamicPriceRouter.getAddress(),
    );

    // Set prices

    await mockUniswapV2Router.connect(owner).setPrice(mintToken, 20);

    await mockUniswapV2Router.connect(owner).setPrice(mintStableToken, 1);

    return {
      DynamicERC20,
      dynamicERC20,
      owner,
      otherAccount,
      mintToken,
      mintStableToken,
      uniswapV2DynamicPriceRouter,
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

      expect(await dynamicERC20.name()).to.equal('DynamicERC20');
      expect(await dynamicERC20.symbol()).to.equal('DYN');
      expect(await dynamicERC20.baseToken()).to.equal(
        await mintToken.getAddress(),
      );
      expect(await dynamicERC20.quoteToken()).to.equal(
        await mintStableToken.getAddress(),
      );
      expect(await dynamicERC20.dynamicPriceRouter()).to.equal(
        await uniswapV2DynamicPriceRouter.getAddress(),
      );
    });

    it('should set the correct owner', async () => {
      const { dynamicERC20, owner } = await loadFixture(deployDynamicERC20);
      expect(await dynamicERC20.owner()).to.equal(owner);
    });

    it('revert if base token is zero address', async () => {
      const { DynamicERC20, mintStableToken, uniswapV2DynamicPriceRouter } =
        await loadFixture(deployDynamicERC20);

      await expect(
        DynamicERC20.deploy(
          'DynamicERC20',
          'DYN',
          ZeroAddress,
          await mintStableToken.getAddress(),
          await uniswapV2DynamicPriceRouter.getAddress(),
        ),
      ).to.be.revertedWith('Tokens cannot be zero address');
    });

    it('revert if quote token is zero address', async () => {
      const { DynamicERC20, mintToken, uniswapV2DynamicPriceRouter } =
        await loadFixture(deployDynamicERC20);

      await expect(
        DynamicERC20.deploy(
          'DynamicERC20',
          'DYN',
          await mintToken.getAddress(),
          ZeroAddress,
          await uniswapV2DynamicPriceRouter.getAddress(),
        ),
      ).to.be.revertedWith('Tokens cannot be zero address');
    });

    it('revert if the router is does not implement dynamic price router interface', async () => {
      const { DynamicERC20, mintToken, mintStableToken } = await loadFixture(
        deployDynamicERC20,
      );

      await expect(
        DynamicERC20.deploy(
          'DynamicERC20',
          'DYN',
          await mintToken.getAddress(),
          await mintStableToken.getAddress(),
          await mintStableToken.getAddress(),
        ),
      ).to.be.revertedWith('Invalid dynamic price router');
    });

    it('revert if the base token is the same as the quote token', async () => {
      const { DynamicERC20, mintToken, uniswapV2DynamicPriceRouter } =
        await loadFixture(deployDynamicERC20);

      await expect(
        DynamicERC20.deploy(
          'DynamicERC20',
          'DYN',
          await mintToken.getAddress(),
          await mintToken.getAddress(),
          await uniswapV2DynamicPriceRouter.getAddress(),
        ),
      ).to.be.revertedWith('Base and quote token cannot be the same');
    });
  });

  describe('Router pricing', () => {
    it('should return the router name', async () => {
      const { dynamicERC20 } = await loadFixture(deployDynamicERC20);
      expect(await dynamicERC20.routerName()).to.equal('UniswapV2');
    });

    it('should return the router address', async () => {
      const { dynamicERC20 } = await loadFixture(deployDynamicERC20);
      expect(await dynamicERC20.routerAddress()).to.equal(
        await dynamicERC20.dynamicPriceRouter(),
      );
    });

    it('should return the base token price', async () => {
      const { dynamicERC20 } = await loadFixture(deployDynamicERC20);
      expect(await dynamicERC20.getBaseTokenPrice()).to.equal(
        parseUnits('20', 6),
      );
    });

    it('should return the correct base token amount', async () => {
      const { dynamicERC20 } = await loadFixture(deployDynamicERC20);

      const [baseToken, baseTokenAmount] =
        await dynamicERC20.getBaseTokenAmount(parseUnits('100', 6));

      expect(baseToken).to.equal(await dynamicERC20.baseToken());
      expect(baseTokenAmount).to.equal(parseUnits('100', 18));
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
      expect(quoteTokenAmount).to.equal(parseUnits('400', 6));
    });

    it('should return the correct quote token amount when the amount is zero', async () => {
      const { dynamicERC20 } = await loadFixture(deployDynamicERC20);

      const [quoteToken, quoteTokenAmount] =
        await dynamicERC20.getQuoteTokenAmount(parseUnits('0', 18));

      expect(quoteToken).to.equal(await dynamicERC20.quoteToken());
      expect(quoteTokenAmount).to.equal(0);
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
        .to.emit(dynamicERC20, 'DynamicPriceRouterUpdated')
        .withArgs(await newRouter.getAddress());
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
      ).to.be.revertedWith('Invalid dynamic price router');
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

    it('should return true for IDynamicERC20 interface', async () => {
      const { dynamicERC20 } = await loadFixture(deployDynamicERC20);

      const interfaceId = calculateInterfaceId([
        'routerName()',
        'routerAddress()',
        'baseToken()',
        'quoteToken()',
        'getBaseTokenPrice()',
        'getBaseTokenAmount(uint256)',
        'getQuoteTokenAmount(uint256)',
      ]);

      expect(await dynamicERC20.supportsInterface(interfaceId)).to.be.true;
    });

    it('should return true for IERC165 interface', async () => {
      const { dynamicERC20 } = await loadFixture(deployDynamicERC20);
      expect(await dynamicERC20.supportsInterface('0x01ffc9a7')).to.be.true;
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
    });

    it('should return the allowance of the base token when it is not zero', async () => {
      const { dynamicERC20, mintToken, otherAccount } = await loadFixture(
        deployDynamicERC20,
      );

      await mintToken
        .connect(otherAccount)
        .approve(otherAccount, parseUnits('1000', 18));

      expect(await dynamicERC20.allowance(otherAccount, otherAccount)).to.equal(
        parseUnits('20000', 6),
      );
    });

    it('should return the balance of the base token when it is zero', async () => {
      const { dynamicERC20, otherAccount } = await loadFixture(
        deployDynamicERC20,
      );

      expect(await dynamicERC20.balanceOf(otherAccount)).to.equal(0);
    });

    it('should return the balance of the base token when it is not zero', async () => {
      const { dynamicERC20, mintToken, otherAccount } = await loadFixture(
        deployDynamicERC20,
      );

      await mintToken.mint(otherAccount, parseUnits('1000', 18));

      expect(await dynamicERC20.balanceOf(otherAccount)).to.equal(
        parseUnits('20000', 6),
      );
    });
  });
});
