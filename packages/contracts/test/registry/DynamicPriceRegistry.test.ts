import { loadFixture } from '@nomicfoundation/hardhat-toolbox/network-helpers';
import { expect } from 'chai';
import hre from 'hardhat';
import calculateInterfaceId from '../../utils/calculate-interface-id';

describe('DynamicPriceRegistry', () => {
  async function deployDynamicPriceRegistry() {
    const [owner, otherAccount] = await hre.ethers.getSigners();

    // Contract registry

    const ContractRegistry = await hre.ethers.getContractFactory(
      'ContractRegistry',
    );
    const contractRegistry = await ContractRegistry.deploy();

    // Payment escrow

    const PaymentEscrow = await hre.ethers.getContractFactory('PaymentEscrow');
    const paymentEscrow = await PaymentEscrow.deploy(contractRegistry);

    await contractRegistry.setPaymentEscrow(paymentEscrow);

    // Registry

    const DynamicPriceRegistry = await hre.ethers.getContractFactory(
      'DynamicPriceRegistry',
    );
    const dynamicPriceRegistry = await DynamicPriceRegistry.deploy(
      contractRegistry,
    );

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

    const dynamicERC20_2 = await UniswapV2DynamicERC20.deploy(
      'Dynamic WETH vs USDC',
      'WETHusdc',
      await mintToken.getAddress(),
      await mintStableToken.getAddress(),
      await uniswapV2DynamicPriceRouter.getAddress(),
      [await mintToken.getAddress(), await mintStableToken.getAddress()],
      [await mintStableToken.getAddress(), await mintToken.getAddress()],
    );

    return {
      dynamicPriceRegistry,
      mintToken,
      mintStableToken,
      dynamicERC20,
      dynamicERC20_2,
      uniswapV2DynamicPriceRouter,
      mockUniswapV2Router,
      paymentEscrow,
      contractRegistry,
      owner,
      otherAccount,
    };
  }

  describe('Deployment', () => {
    it('should deploy with no tokens registered', async () => {
      const { dynamicPriceRegistry } = await loadFixture(
        deployDynamicPriceRegistry,
      );

      expect(await dynamicPriceRegistry.getTokenCount()).to.equal(0);
      expect(await dynamicPriceRegistry.getTokens()).to.deep.equal([]);
    });

    it('should have the correct roles', async () => {
      const { dynamicPriceRegistry, owner } = await loadFixture(
        deployDynamicPriceRegistry,
      );

      expect(
        await dynamicPriceRegistry.hasRole(
          await dynamicPriceRegistry.DEFAULT_ADMIN_ROLE(),
          owner,
        ),
      ).to.be.true;
      expect(
        await dynamicPriceRegistry.hasRole(
          await dynamicPriceRegistry.REGISTER_TOKEN_ROLE(),
          owner,
        ),
      ).to.be.true;
      expect(
        await dynamicPriceRegistry.hasRole(
          await dynamicPriceRegistry.UNREGISTER_TOKEN_ROLE(),
          owner,
        ),
      ).to.be.true;
    });

    it('should set the contract registry', async () => {
      const { dynamicPriceRegistry, contractRegistry } = await loadFixture(
        deployDynamicPriceRegistry,
      );

      expect(await dynamicPriceRegistry.registry()).to.equal(contractRegistry);
    });
  });

  describe('Supports Interface', () => {
    it('should return true for IDynamicPriceRegistry interface', async () => {
      const { dynamicPriceRegistry } = await loadFixture(
        deployDynamicPriceRegistry,
      );

      const interfaceId = calculateInterfaceId([
        'REGISTER_TOKEN_ROLE()',
        'UNREGISTER_TOKEN_ROLE()',
        'getTokenCount()',
        'getTokens()',
        'isTokenRegistered(address)',
        'isTokenRegisteredBatch(address[])',
        'registerToken(address)',
        'unregisterToken(address)',
      ]);

      expect(await dynamicPriceRegistry.supportsInterface(interfaceId)).to.be
        .true;
    });

    it('should return true for IERC165 interface', async () => {
      const { dynamicPriceRegistry } = await loadFixture(
        deployDynamicPriceRegistry,
      );

      expect(await dynamicPriceRegistry.supportsInterface('0x01ffc9a7')).to.be
        .true;
    });

    it('should return false for other interfaces', async () => {
      const { dynamicPriceRegistry } = await loadFixture(
        deployDynamicPriceRegistry,
      );

      expect(await dynamicPriceRegistry.supportsInterface('0xffffffff')).to.be
        .false;
    });
  });

  describe('Register Token', () => {
    it('should register multiple dynamic tokens and remove them successfully', async () => {
      const {
        dynamicPriceRegistry,
        dynamicERC20,
        dynamicERC20_2,
        owner,
        paymentEscrow,
      } = await loadFixture(deployDynamicPriceRegistry);

      // Whitelist tokens
      await paymentEscrow.setWhitelistedToken(
        await dynamicERC20.baseToken(),
        true,
      );
      await paymentEscrow.setWhitelistedToken(
        await dynamicERC20.getAddress(),
        true,
      );
      await paymentEscrow.setWhitelistedToken(
        await dynamicERC20_2.getAddress(),
        true,
      );

      // Register first token
      await expect(
        dynamicPriceRegistry
          .connect(owner)
          .registerToken(await dynamicERC20.getAddress()),
      )
        .to.emit(dynamicPriceRegistry, 'DynamicTokenRegistrationUpdated')
        .withArgs(await dynamicERC20.getAddress(), true);

      // Check if the first token is registered
      expect(
        await dynamicPriceRegistry.isTokenRegistered(
          await dynamicERC20.getAddress(),
        ),
      ).to.be.true;

      expect(
        await dynamicPriceRegistry.isTokenRegisteredBatch([
          await dynamicERC20.getAddress(),
        ]),
      ).to.be.true;

      expect(await dynamicPriceRegistry.getTokenCount()).to.equal(1);
      expect(await dynamicPriceRegistry.getTokens()).to.deep.equal([
        await dynamicERC20.getAddress(),
      ]);

      // Register second token
      await expect(
        dynamicPriceRegistry
          .connect(owner)
          .registerToken(await dynamicERC20_2.getAddress()),
      )
        .to.emit(dynamicPriceRegistry, 'DynamicTokenRegistrationUpdated')
        .withArgs(await dynamicERC20_2.getAddress(), true);

      // Check if the second token is registered
      expect(
        await dynamicPriceRegistry.isTokenRegistered(
          await dynamicERC20_2.getAddress(),
        ),
      ).to.be.true;

      expect(
        await dynamicPriceRegistry.isTokenRegisteredBatch([
          await dynamicERC20.getAddress(),
          await dynamicERC20_2.getAddress(),
        ]),
      ).to.be.true;

      expect(await dynamicPriceRegistry.getTokenCount()).to.equal(2);
      expect(await dynamicPriceRegistry.getTokens()).to.deep.equal([
        await dynamicERC20.getAddress(),
        await dynamicERC20_2.getAddress(),
      ]);

      // Unregister second token
      await expect(
        dynamicPriceRegistry
          .connect(owner)
          .unregisterToken(await dynamicERC20_2.getAddress()),
      )
        .to.emit(dynamicPriceRegistry, 'DynamicTokenRegistrationUpdated')
        .withArgs(await dynamicERC20_2.getAddress(), false);

      // Check if the second token is unregistered
      expect(
        await dynamicPriceRegistry.isTokenRegistered(
          await dynamicERC20_2.getAddress(),
        ),
      ).to.be.false;

      expect(
        await dynamicPriceRegistry.isTokenRegisteredBatch([
          await dynamicERC20.getAddress(),
          await dynamicERC20_2.getAddress(),
        ]),
      ).to.be.false;

      expect(await dynamicPriceRegistry.getTokenCount()).to.equal(1);
      expect(await dynamicPriceRegistry.getTokens()).to.deep.equal([
        await dynamicERC20.getAddress(),
      ]);

      // Unregister first token
      await expect(
        dynamicPriceRegistry
          .connect(owner)
          .unregisterToken(await dynamicERC20.getAddress()),
      )
        .to.emit(dynamicPriceRegistry, 'DynamicTokenRegistrationUpdated')
        .withArgs(await dynamicERC20.getAddress(), false);

      // Check if the first token is unregistered
      expect(
        await dynamicPriceRegistry.isTokenRegistered(
          await dynamicERC20.getAddress(),
        ),
      ).to.be.false;

      expect(
        await dynamicPriceRegistry.isTokenRegisteredBatch([
          await dynamicERC20.getAddress(),
          await dynamicERC20_2.getAddress(),
        ]),
      ).to.be.false;

      expect(await dynamicPriceRegistry.getTokenCount()).to.equal(0);
      expect(await dynamicPriceRegistry.getTokens()).to.deep.equal([]);
    });

    it('revert if the token is already registered', async () => {
      const { dynamicPriceRegistry, dynamicERC20, owner, paymentEscrow } =
        await loadFixture(deployDynamicPriceRegistry);

      // Whitelist tokens
      await paymentEscrow.setWhitelistedToken(
        await dynamicERC20.baseToken(),
        true,
      );
      await paymentEscrow.setWhitelistedToken(
        await dynamicERC20.getAddress(),
        true,
      );

      await dynamicPriceRegistry
        .connect(owner)
        .registerToken(await dynamicERC20.getAddress());

      await expect(
        dynamicPriceRegistry
          .connect(owner)
          .registerToken(await dynamicERC20.getAddress()),
      ).to.be.revertedWith('Token already registered');
    });

    it('revert if the token does not support the IDynamicERC20 interface', async () => {
      const { dynamicPriceRegistry, mintToken, owner } = await loadFixture(
        deployDynamicPriceRegistry,
      );

      await expect(
        dynamicPriceRegistry
          .connect(owner)
          .registerToken(await mintToken.getAddress()),
      ).to.be.revertedWith('Token does not support IDynamicERC20');
    });

    it('revert if the caller does not have the REGISTER_TOKEN_ROLE', async () => {
      const { dynamicPriceRegistry, dynamicERC20, otherAccount } =
        await loadFixture(deployDynamicPriceRegistry);

      await expect(
        dynamicPriceRegistry
          .connect(otherAccount)
          .registerToken(await dynamicERC20.getAddress()),
      )
        .to.be.revertedWithCustomError(
          dynamicPriceRegistry,
          'AccessControlUnauthorizedAccount',
        )
        .withArgs(
          otherAccount,
          await dynamicPriceRegistry.REGISTER_TOKEN_ROLE(),
        );
    });

    it('revert if the dynamic token is not whitelisted', async () => {
      const { dynamicPriceRegistry, dynamicERC20, owner } = await loadFixture(
        deployDynamicPriceRegistry,
      );

      await expect(
        dynamicPriceRegistry
          .connect(owner)
          .registerToken(await dynamicERC20.getAddress()),
      ).to.be.revertedWith('Dynamic token is not whitelisted');
    });

    it('revert if the base token is not whitelisted', async () => {
      const { dynamicPriceRegistry, dynamicERC20, owner, paymentEscrow } =
        await loadFixture(deployDynamicPriceRegistry);

      await paymentEscrow.setWhitelistedToken(
        await dynamicERC20.getAddress(),
        true,
      );

      await expect(
        dynamicPriceRegistry
          .connect(owner)
          .registerToken(await dynamicERC20.getAddress()),
      ).to.be.revertedWith('Base token is not whitelisted');
    });
  });

  describe('Unregister Token', () => {
    it('revert if the token is not registered', async () => {
      const { dynamicPriceRegistry, dynamicERC20, owner } = await loadFixture(
        deployDynamicPriceRegistry,
      );

      await expect(
        dynamicPriceRegistry
          .connect(owner)
          .unregisterToken(await dynamicERC20.getAddress()),
      ).to.be.revertedWith('Token not registered');
    });

    it('revert if the caller does not have the UNREGISTER_TOKEN_ROLE', async () => {
      const { dynamicPriceRegistry, dynamicERC20, otherAccount } =
        await loadFixture(deployDynamicPriceRegistry);

      await expect(
        dynamicPriceRegistry
          .connect(otherAccount)
          .unregisterToken(await dynamicERC20.getAddress()),
      )
        .to.be.revertedWithCustomError(
          dynamicPriceRegistry,
          'AccessControlUnauthorizedAccount',
        )
        .withArgs(
          otherAccount,
          await dynamicPriceRegistry.UNREGISTER_TOKEN_ROLE(),
        );
    });
  });

  it('revert for is token registered batch if no tokens are provided', async () => {
    const { dynamicPriceRegistry } = await loadFixture(
      deployDynamicPriceRegistry,
    );

    await expect(
      dynamicPriceRegistry.isTokenRegisteredBatch([]),
    ).to.be.revertedWith('No tokens provided');
  });
});
