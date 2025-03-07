import { loadFixture } from '@nomicfoundation/hardhat-toolbox/network-helpers';
import { expect } from 'chai';
import hre, { ethers } from 'hardhat';
import calculateInterfaceId from '../../utils/calculate-interface-id';

describe('PaymentEscrow', () => {
  async function deployPaymentEscrow() {
    const [owner, otherAccount] = await hre.ethers.getSigners();

    const ContractRegistry =
      await hre.ethers.getContractFactory('ContractRegistry');
    const contractRegistry = await ContractRegistry.deploy();

    const OrganizationMetadataProvider = await hre.ethers.getContractFactory(
      'OrganizationMetadataProvider',
    );
    const organizationMetadataProvider =
      await OrganizationMetadataProvider.deploy(contractRegistry);

    const OrganizationNFT =
      await hre.ethers.getContractFactory('OrganizationNFT');
    const organizationNFT = await OrganizationNFT.deploy(
      organizationMetadataProvider,
    );

    await organizationNFT.connect(owner).setMintOpen(true);

    const FeeReducer = await hre.ethers.getContractFactory('FeeReducer');
    const feeReducer = await FeeReducer.deploy();

    const PaymentEscrow = await hre.ethers.getContractFactory('PaymentEscrow');
    const paymentEscrow = await PaymentEscrow.deploy(contractRegistry);

    const MintToken = await hre.ethers.getContractFactory('MintToken');
    const mintToken = await MintToken.deploy();

    const mintToken2 = await MintToken.deploy();

    await contractRegistry.setOrganizationNFT(organizationNFT);
    await contractRegistry.setPaymentEscrow(paymentEscrow);

    return {
      contractRegistry,
      paymentEscrow,
      feeReducer,
      mintToken,
      mintToken2,
      owner,
      otherAccount,
      organizationNFT,
    };
  }

  it('should not allow non-registry callers to call transferDirect', async () => {
    const { paymentEscrow, otherAccount } =
      await loadFixture(deployPaymentEscrow);

    await expect(
      paymentEscrow
        .connect(otherAccount)
        .transferDirect(1, otherAccount.address, ethers.ZeroAddress, 100),
    ).to.be.revertedWith('Caller not authorized');
  });

  describe('Deployment', () => {
    it('should set the correct roles', async () => {
      const { paymentEscrow, owner } = await loadFixture(deployPaymentEscrow);

      expect(
        await paymentEscrow.hasRole(
          await paymentEscrow.DEFAULT_ADMIN_ROLE(),
          owner,
        ),
      ).to.be.true;
      expect(
        await paymentEscrow.hasRole(
          await paymentEscrow.FEE_SETTER_ROLE(),
          owner,
        ),
      ).to.be.true;
      expect(
        await paymentEscrow.hasRole(
          await paymentEscrow.FEE_EXEMPT_ROLE(),
          owner,
        ),
      ).to.be.true;
      expect(
        await paymentEscrow.hasRole(
          await paymentEscrow.FEE_ENABLED_ROLE(),
          owner,
        ),
      ).to.be.true;
      expect(
        await paymentEscrow.hasRole(
          await paymentEscrow.FEE_WITHDRAW_ROLE(),
          owner,
        ),
      ).to.be.true;
      expect(
        await paymentEscrow.hasRole(
          await paymentEscrow.WHITELIST_ROLE(),
          owner,
        ),
      ).to.be.true;
    });

    it('should set the contract registry', async () => {
      const { paymentEscrow, contractRegistry } =
        await loadFixture(deployPaymentEscrow);

      expect(await paymentEscrow.registry()).to.equal(contractRegistry);
    });
  });

  describe('Supports ERC165', () => {
    it('should support the ERC165 interface', async () => {
      const { paymentEscrow } = await loadFixture(deployPaymentEscrow);

      const interfaceId = calculateInterfaceId(['supportsInterface(bytes4)']);

      expect(await paymentEscrow.supportsInterface(interfaceId)).to.be.true;
    });
  });

  describe('Withdraw Org Balance', () => {
    it('only org owner can withdraw', async () => {
      const { paymentEscrow, owner, otherAccount, organizationNFT } =
        await loadFixture(deployPaymentEscrow);

      await organizationNFT.connect(owner).mint(owner);

      await expect(
        paymentEscrow
          .connect(otherAccount)
          .withdrawOrgBalance(1, ethers.ZeroAddress, 100),
      ).to.be.revertedWith('Not the owner of the OrganizationNFT');
    });

    it('cannot if insufficient balance', async () => {
      const { paymentEscrow, mintToken, owner, organizationNFT } =
        await loadFixture(deployPaymentEscrow);

      await organizationNFT.connect(owner).mint(owner.address);

      await expect(
        paymentEscrow
          .connect(owner)
          .withdrawOrgBalance(1, ethers.ZeroAddress, 100),
      ).to.be.revertedWith('Insufficient balance');

      await expect(
        paymentEscrow
          .connect(owner)
          .withdrawOrgBalance(1, await mintToken.getAddress(), 100),
      ).to.be.revertedWith('Insufficient balance');
    });
  });

  describe('Token Whitelisting', () => {
    it('can whitelist a token', async () => {
      const { paymentEscrow, mintToken } =
        await loadFixture(deployPaymentEscrow);

      expect(
        await paymentEscrow.whitelistedTokens(await mintToken.getAddress()),
      ).to.be.false;

      await expect(
        paymentEscrow.setWhitelistedToken(await mintToken.getAddress(), true),
      )
        .to.emit(paymentEscrow, 'WhitelistedTokenSet')
        .withArgs(await mintToken.getAddress(), true);

      expect(
        await paymentEscrow.whitelistedTokens(await mintToken.getAddress()),
      ).to.be.true;
    });

    it('can remove a whitelisted token', async () => {
      const { paymentEscrow, mintToken } =
        await loadFixture(deployPaymentEscrow);

      await expect(
        paymentEscrow.setWhitelistedToken(await mintToken.getAddress(), true),
      )
        .to.emit(paymentEscrow, 'WhitelistedTokenSet')
        .withArgs(await mintToken.getAddress(), true);

      expect(
        await paymentEscrow.whitelistedTokens(await mintToken.getAddress()),
      ).to.be.true;

      await expect(
        paymentEscrow.setWhitelistedToken(await mintToken.getAddress(), false),
      )
        .to.emit(paymentEscrow, 'WhitelistedTokenSet')
        .withArgs(await mintToken.getAddress(), false);

      expect(
        await paymentEscrow.whitelistedTokens(await mintToken.getAddress()),
      ).to.be.false;
    });

    it('only the whitelist role can whitelist a token', async () => {
      const { paymentEscrow, mintToken, otherAccount } =
        await loadFixture(deployPaymentEscrow);

      await expect(
        paymentEscrow
          .connect(otherAccount)
          .setWhitelistedToken(await mintToken.getAddress(), true),
      )
        .to.be.revertedWithCustomError(
          paymentEscrow,
          'AccessControlUnauthorizedAccount',
        )
        .withArgs(otherAccount, await paymentEscrow.WHITELIST_ROLE());
    });
  });

  describe('Fee Management', () => {
    it('can toggle fee enabled', async () => {
      const { paymentEscrow } = await loadFixture(deployPaymentEscrow);

      expect(await paymentEscrow.isFeeEnabled()).to.equal(false);

      await expect(paymentEscrow.setFeeEnabled(true))
        .to.emit(paymentEscrow, 'FeeEnabled')
        .withArgs(true);

      expect(await paymentEscrow.isFeeEnabled()).to.equal(true);

      await expect(paymentEscrow.setFeeEnabled(false))
        .to.emit(paymentEscrow, 'FeeEnabled')
        .withArgs(false);

      expect(await paymentEscrow.isFeeEnabled()).to.equal(false);
    });

    it('can add/remove orgs from fee exemptions', async () => {
      const { paymentEscrow, organizationNFT, owner, otherAccount } =
        await loadFixture(deployPaymentEscrow);

      await organizationNFT.mint(owner);
      await organizationNFT.mint(otherAccount);

      expect(await paymentEscrow.feeExempt(1)).to.equal(false);
      expect(await paymentEscrow.feeExempt(2)).to.equal(false);

      await expect(paymentEscrow.setFeeExempt(1, true))
        .to.emit(paymentEscrow, 'FeeExemptSet')
        .withArgs(1, true);
      expect(await paymentEscrow.feeExempt(1)).to.equal(true);
      expect(await paymentEscrow.feeExempt(2)).to.equal(false);

      await expect(paymentEscrow.setFeeExempt(1, false))
        .to.emit(paymentEscrow, 'FeeExemptSet')
        .withArgs(1, false);
      expect(await paymentEscrow.feeExempt(1)).to.equal(false);
      expect(await paymentEscrow.feeExempt(2)).to.equal(false);

      await expect(paymentEscrow.setFeeExempt(2, true))
        .to.emit(paymentEscrow, 'FeeExemptSet')
        .withArgs(2, true);
      expect(await paymentEscrow.feeExempt(1)).to.equal(false);
      expect(await paymentEscrow.feeExempt(2)).to.equal(true);

      await expect(paymentEscrow.setFeeExempt(2, false))
        .to.emit(paymentEscrow, 'FeeExemptSet')
        .withArgs(2, false);
      expect(await paymentEscrow.feeExempt(1)).to.equal(false);
      expect(await paymentEscrow.feeExempt(2)).to.equal(false);
    });

    it('cannot set fee exemptions for non-existent orgs', async () => {
      const { paymentEscrow, organizationNFT } =
        await loadFixture(deployPaymentEscrow);

      await expect(paymentEscrow.setFeeExempt(1, true))
        .to.be.revertedWithCustomError(
          organizationNFT,
          'ERC721NonexistentToken',
        )
        .withArgs(1);
    });

    it('default values are set for fees', async () => {
      const { paymentEscrow } = await loadFixture(deployPaymentEscrow);

      expect(await paymentEscrow.fees(ethers.ZeroAddress)).to.equal(0);
      expect(await paymentEscrow.exoticFee()).to.equal(0);
      expect(await paymentEscrow.isFeeEnabled()).to.equal(false);
    });

    it('only the correct roles can manage fees', async () => {
      const { paymentEscrow, otherAccount } =
        await loadFixture(deployPaymentEscrow);

      await expect(paymentEscrow.connect(otherAccount).setFeeEnabled(true))
        .to.be.revertedWithCustomError(
          paymentEscrow,
          'AccessControlUnauthorizedAccount',
        )
        .withArgs(otherAccount, await paymentEscrow.FEE_ENABLED_ROLE());

      await expect(
        paymentEscrow.connect(otherAccount).setFee(ethers.ZeroAddress, 100),
      )
        .to.be.revertedWithCustomError(
          paymentEscrow,
          'AccessControlUnauthorizedAccount',
        )
        .withArgs(otherAccount, await paymentEscrow.FEE_SETTER_ROLE());

      await expect(paymentEscrow.connect(otherAccount).setExoticFee(100))
        .to.be.revertedWithCustomError(
          paymentEscrow,
          'AccessControlUnauthorizedAccount',
        )
        .withArgs(otherAccount, await paymentEscrow.FEE_SETTER_ROLE());

      await expect(paymentEscrow.connect(otherAccount).setFeeExempt(1, true))
        .to.be.revertedWithCustomError(
          paymentEscrow,
          'AccessControlUnauthorizedAccount',
        )
        .withArgs(otherAccount, await paymentEscrow.FEE_EXEMPT_ROLE());
    });

    it('cannot set a fee greater than the denominator', async () => {
      const { paymentEscrow } = await loadFixture(deployPaymentEscrow);

      await expect(
        paymentEscrow.setFee(ethers.ZeroAddress, 10001),
      ).to.be.revertedWith('Invalid fee');

      await expect(paymentEscrow.setExoticFee(10001)).to.be.revertedWith(
        'Invalid fee',
      );
    });

    it('can set max fee', async () => {
      const { paymentEscrow } = await loadFixture(deployPaymentEscrow);

      await expect(paymentEscrow.setFee(ethers.ZeroAddress, 10000))
        .to.emit(paymentEscrow, 'FeeSet')
        .withArgs(ethers.ZeroAddress, 10000);

      expect(await paymentEscrow.fees(ethers.ZeroAddress)).to.equal(10000);

      await expect(paymentEscrow.setExoticFee(10000))
        .to.emit(paymentEscrow, 'ExoticFeeSet')
        .withArgs(10000);

      expect(await paymentEscrow.exoticFee()).to.equal(10000);
    });

    it('can set zero fee', async () => {
      const { paymentEscrow } = await loadFixture(deployPaymentEscrow);

      await expect(paymentEscrow.setFee(ethers.ZeroAddress, 0))
        .to.emit(paymentEscrow, 'FeeSet')
        .withArgs(ethers.ZeroAddress, 0);

      expect(await paymentEscrow.fees(ethers.ZeroAddress)).to.equal(0);

      await expect(paymentEscrow.setExoticFee(0))
        .to.emit(paymentEscrow, 'ExoticFeeSet')
        .withArgs(0);

      expect(await paymentEscrow.exoticFee()).to.equal(0);
    });

    describe('Calculate Fee', () => {
      it('should return 0 when fees are not set for the token or the exotic fee', async () => {
        const { paymentEscrow, mintToken } =
          await loadFixture(deployPaymentEscrow);

        expect(
          await paymentEscrow.calculateFee(1, ethers.ZeroAddress, 100),
        ).to.equal(0);
        expect(
          await paymentEscrow.calculateFee(
            1,
            await mintToken.getAddress(),
            100,
          ),
        ).to.equal(0);
      });

      it('should return 0 for the native token even if exotic fee is set', async () => {
        const { paymentEscrow } = await loadFixture(deployPaymentEscrow);

        await paymentEscrow.setExoticFee(100);

        expect(
          await paymentEscrow.calculateFee(1, ethers.ZeroAddress, 100),
        ).to.equal(0);
      });

      it('should return the correct fee amount for a native token with a specific fee', async () => {
        const { paymentEscrow } = await loadFixture(deployPaymentEscrow);

        await paymentEscrow.setFee(ethers.ZeroAddress, 2500);

        expect(
          await paymentEscrow.calculateFee(
            1,
            ethers.ZeroAddress,
            ethers.parseUnits('12', 18),
          ),
        ).to.equal(ethers.parseUnits('3', 18));

        await paymentEscrow.setFee(ethers.ZeroAddress, 250);

        expect(
          await paymentEscrow.calculateFee(
            1,
            ethers.ZeroAddress,
            ethers.parseUnits('12', 18),
          ),
        ).to.equal(ethers.parseUnits('0.3', 18));

        await paymentEscrow.setFee(ethers.ZeroAddress, 1000);

        expect(
          await paymentEscrow.calculateFee(
            1,
            ethers.ZeroAddress,
            ethers.parseUnits('15', 18),
          ),
        ).to.equal(ethers.parseUnits('1.5', 18));
      });

      it('should return the correct fee amount for an ERC20 token with a specific fee', async () => {
        const { paymentEscrow, mintToken } =
          await loadFixture(deployPaymentEscrow);

        await paymentEscrow.setFee(await mintToken.getAddress(), 250);

        expect(
          await paymentEscrow.calculateFee(
            1,
            await mintToken.getAddress(),
            ethers.parseUnits('12', 6),
          ),
        ).to.equal(300000);

        expect(
          await paymentEscrow.calculateFee(
            1,
            await mintToken.getAddress(),
            ethers.parseUnits('100', 6),
          ),
        ).to.equal(ethers.parseUnits('2.5', 6));
      });

      it('should return the correct fee for an exotic ERC20token', async () => {
        const { paymentEscrow, mintToken, mintToken2 } =
          await loadFixture(deployPaymentEscrow);

        await paymentEscrow.setFee(await mintToken.getAddress(), 250);
        await paymentEscrow.setExoticFee(1000);

        expect(
          await paymentEscrow.calculateFee(
            1,
            await mintToken2.getAddress(),
            ethers.parseUnits('10', 6),
          ),
        ).to.equal(ethers.parseUnits('1', 6));
      });

      it('should return a reduced fee for org 1', async () => {
        const { paymentEscrow, mintToken, feeReducer } =
          await loadFixture(deployPaymentEscrow);

        await paymentEscrow.setFeeReducer(feeReducer);

        await paymentEscrow.setFee(await mintToken.getAddress(), 1000);

        expect(
          await paymentEscrow.calculateFee(
            1,
            await mintToken.getAddress(),
            ethers.parseUnits('10', 6),
          ),
        ).to.equal(ethers.parseUnits('0.5', 6));
      });

      it('should return the original if not org 1', async () => {
        const { paymentEscrow, mintToken, feeReducer } =
          await loadFixture(deployPaymentEscrow);

        await paymentEscrow.setFeeReducer(feeReducer);

        await paymentEscrow.setFee(await mintToken.getAddress(), 1000);

        expect(
          await paymentEscrow.calculateFee(
            2,
            await mintToken.getAddress(),
            ethers.parseUnits('10', 6),
          ),
        ).to.equal(ethers.parseUnits('1', 6));
      });
    });

    describe('Withdraw Fee', () => {
      it('only the fee withdraw role can withdraw fees', async () => {
        const { paymentEscrow, otherAccount } =
          await loadFixture(deployPaymentEscrow);

        await expect(
          paymentEscrow.connect(otherAccount).withdrawFee(ethers.ZeroAddress),
        )
          .to.be.revertedWithCustomError(
            paymentEscrow,
            'AccessControlUnauthorizedAccount',
          )
          .withArgs(otherAccount, await paymentEscrow.FEE_WITHDRAW_ROLE());
      });

      it('should revert if the fee balance is 0', async () => {
        const { paymentEscrow, mintToken, mintToken2 } =
          await loadFixture(deployPaymentEscrow);

        await expect(
          paymentEscrow.withdrawFee(ethers.ZeroAddress),
        ).to.be.revertedWith('Insufficient balance');

        await expect(
          paymentEscrow.withdrawFee(await mintToken.getAddress()),
        ).to.be.revertedWith('Insufficient balance');

        await expect(
          paymentEscrow.withdrawFee(await mintToken2.getAddress()),
        ).to.be.revertedWith('Insufficient balance');
      });
    });
  });

  describe('Fee Reducer', () => {
    it('should set the fee reducer', async () => {
      const { paymentEscrow, feeReducer, owner } =
        await loadFixture(deployPaymentEscrow);

      await expect(paymentEscrow.connect(owner).setFeeReducer(feeReducer))
        .to.emit(paymentEscrow, 'FeeReducerSet')
        .withArgs(feeReducer);
    });

    it('cannot set a contract that does not implement the IFeeReducer interface', async () => {
      const { paymentEscrow, owner } = await loadFixture(deployPaymentEscrow);

      await expect(
        paymentEscrow.connect(owner).setFeeReducer(paymentEscrow),
      ).to.be.revertedWith('Invalid fee reducer');
    });

    it('only the admin role can set the fee reducer', async () => {
      const { paymentEscrow, feeReducer, otherAccount } =
        await loadFixture(deployPaymentEscrow);

      await expect(
        paymentEscrow.connect(otherAccount).setFeeReducer(feeReducer),
      )
        .to.be.revertedWithCustomError(
          paymentEscrow,
          'AccessControlUnauthorizedAccount',
        )
        .withArgs(otherAccount, await paymentEscrow.DEFAULT_ADMIN_ROLE());
    });

    it('fee reducer implements IERC165', async () => {
      const { feeReducer } = await loadFixture(deployPaymentEscrow);

      expect(
        await feeReducer.supportsInterface(
          calculateInterfaceId(['supportsInterface(bytes4)']),
        ),
      ).to.be.true;
    });
  });
});
