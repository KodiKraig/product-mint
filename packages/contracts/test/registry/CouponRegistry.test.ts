import {
  loadFixture,
  time,
} from '@nomicfoundation/hardhat-toolbox/network-helpers';
import { expect } from 'chai';
import hre from 'hardhat';
import { ICouponRegistry } from '../../typechain-types';
import calculateInterfaceId from '../../utils/calculate-interface-id';

type CreateCouponParams = {
  orgId: number;
  code?: string;
  discount?: number;
  expiration?: number;
  maxTotalRedemptions?: number;
  isInitialPurchaseOnly?: boolean;
  isActive?: boolean;
  isRestricted?: boolean;
  isOneTimeUse?: boolean;
};

describe('CouponRegistry', () => {
  async function deployCouponRegistry() {
    const [owner, otherAccount, otherAccount2] = await hre.ethers.getSigners();

    const ContractRegistry = await hre.ethers.getContractFactory(
      'ContractRegistry',
    );
    const contractRegistry = await ContractRegistry.deploy();

    const OrganizationAttributeProvider = await hre.ethers.getContractFactory(
      'OrganizationAttributeProvider',
    );
    const organizationAttributeProvider =
      await OrganizationAttributeProvider.deploy(contractRegistry);

    const OrganizationMetadataProvider = await hre.ethers.getContractFactory(
      'OrganizationMetadataProvider',
    );
    const organizationMetadataProvider =
      await OrganizationMetadataProvider.deploy(
        contractRegistry,
        organizationAttributeProvider,
      );

    const OrganizationNFT = await hre.ethers.getContractFactory(
      'OrganizationNFT',
    );
    const organizationNFT = await OrganizationNFT.deploy(
      organizationMetadataProvider,
    );

    const OrganizationAdmin = await hre.ethers.getContractFactory(
      'OrganizationAdmin',
    );
    const orgAdmin = await OrganizationAdmin.deploy(contractRegistry);

    await organizationNFT.setMintOpen(true);

    const CouponRegistry = await hre.ethers.getContractFactory(
      'CouponRegistry',
    );
    const couponRegistry = await CouponRegistry.deploy(contractRegistry);

    await contractRegistry.setCouponRegistry(couponRegistry);
    await contractRegistry.setOrganizationNFT(organizationNFT);
    await contractRegistry.setOrgAdmin(orgAdmin);

    return {
      couponRegistry,
      contractRegistry,
      orgAdmin,
      organizationNFT,
      owner,
      otherAccount,
      otherAccount2,
    };
  }

  describe('Deployment', () => {
    it('should the contract registry', async () => {
      const { couponRegistry, contractRegistry } = await loadFixture(
        deployCouponRegistry,
      );

      expect(await couponRegistry.registry()).to.equal(contractRegistry);
    });
  });

  describe('Implements interface', () => {
    it('should return true for supportsInterface', async () => {
      const { couponRegistry } = await loadFixture(deployCouponRegistry);

      expect(await couponRegistry.supportsInterface('0x01ffc9a7')).to.equal(
        true,
      );
    });

    it('implements restricted access', async () => {
      const { couponRegistry } = await loadFixture(deployCouponRegistry);

      const interfaceId = calculateInterfaceId([
        'getRestrictedAccess(uint256,address)',
        'hasRestrictedAccess(uint256,address,uint256)',
      ]);

      expect(await couponRegistry.supportsInterface(interfaceId)).to.equal(
        true,
      );
    });
  });

  async function createDefaultCoupon(
    couponRegistry: ICouponRegistry,
    signer: any,
    params: CreateCouponParams,
  ) {
    const defaultParams: ICouponRegistry.CreateCouponParamsStruct = {
      orgId: params.orgId,
      code: params.code ?? 'TEST',
      discount: params.discount ?? 1000,
      expiration: params.expiration ?? (await time.latest()) + 1000,
      maxTotalRedemptions: params.maxTotalRedemptions ?? 0,
      isInitialPurchaseOnly: params.isInitialPurchaseOnly ?? false,
      isActive: params.isActive ?? true,
      isRestricted: params.isRestricted ?? false,
      isOneTimeUse: params.isOneTimeUse ?? false,
    };

    await couponRegistry.connect(signer).createCoupon(defaultParams);
  }

  async function assertCoupon(
    couponRegistry: ICouponRegistry,
    couponId: number,
    params: ICouponRegistry.CouponStruct,
  ) {
    expect(await couponRegistry.getCoupon(couponId)).to.deep.equal([
      params.orgId,
      params.code,
      params.discount,
      params.expiration,
      params.totalRedemptions,
      params.maxTotalRedemptions,
      params.isInitialPurchaseOnly,
      params.isActive,
      params.isRestricted,
      params.isOneTimeUse,
    ]);

    expect(
      await couponRegistry.orgCouponCodes(params.orgId, params.code),
    ).to.equal(couponId);
  }

  describe('Is Redeemable?', () => {
    it('should be true if coupon is redeemable and not restricted', async () => {
      const { couponRegistry, organizationNFT, owner } = await loadFixture(
        deployCouponRegistry,
      );

      await organizationNFT.connect(owner).mint(owner);

      await createDefaultCoupon(couponRegistry, owner, {
        orgId: 1,
        discount: 1000,
        expiration: (await time.latest()) + 1000,
      });

      expect(
        await couponRegistry.isCodeRedeemable(1, owner, 'TEST', false),
      ).to.equal(1);
    });

    it('should be true if coupon is restricted and granted access', async () => {
      const { couponRegistry, organizationNFT, owner, otherAccount } =
        await loadFixture(deployCouponRegistry);

      await organizationNFT.connect(owner).mint(owner);

      await createDefaultCoupon(couponRegistry, owner, {
        orgId: 1,
        discount: 1000,
        expiration: (await time.latest()) + 1000,
        isRestricted: true,
      });

      await couponRegistry.setRestrictedAccess(1, [otherAccount], [true]);

      expect(
        await couponRegistry.isCodeRedeemable(1, otherAccount, 'TEST', false),
      ).to.equal(1);
    });

    it('should revert if coupon does not exist', async () => {
      const { couponRegistry, owner } = await loadFixture(deployCouponRegistry);

      await expect(couponRegistry.isCodeRedeemable(1, owner, 'TEST', false))
        .to.be.revertedWithCustomError(couponRegistry, 'CouponCodeNotFound')
        .withArgs('TEST');
    });

    it('should revert if coupon is not active', async () => {
      const { organizationNFT, couponRegistry, owner } = await loadFixture(
        deployCouponRegistry,
      );

      await organizationNFT.connect(owner).mint(owner);

      await createDefaultCoupon(couponRegistry, owner, {
        orgId: 1,
        discount: 1000,
        expiration: (await time.latest()) + 1000,
        isActive: false,
      });

      await expect(couponRegistry.isCodeRedeemable(1, owner, 'TEST', false))
        .to.be.revertedWithCustomError(couponRegistry, 'CouponNotActive')
        .withArgs(1);
    });

    it('should revert if coupon is expired', async () => {
      const { couponRegistry, organizationNFT, owner } = await loadFixture(
        deployCouponRegistry,
      );

      await organizationNFT.connect(owner).mint(owner);

      await createDefaultCoupon(couponRegistry, owner, {
        orgId: 1,
        discount: 1000,
        expiration: (await time.latest()) + 1000,
      });

      await time.increase(1000);

      await expect(couponRegistry.isCodeRedeemable(1, owner, 'TEST', false))
        .to.be.revertedWithCustomError(couponRegistry, 'CouponExpired')
        .withArgs(1);
    });

    it('should revert if new customer only and not initial purchase', async () => {
      const { couponRegistry, organizationNFT, owner } = await loadFixture(
        deployCouponRegistry,
      );

      await organizationNFT.connect(owner).mint(owner);

      await createDefaultCoupon(couponRegistry, owner, {
        orgId: 1,
        discount: 1000,
        expiration: (await time.latest()) + 1000,
        isInitialPurchaseOnly: true,
      });

      await expect(couponRegistry.isCodeRedeemable(1, owner, 'TEST', false))
        .to.be.revertedWithCustomError(
          couponRegistry,
          'CouponInitialPurchaseOnly',
        )
        .withArgs(1);
    });

    it('should revert if coupon is restricted and not granted access', async () => {
      const { couponRegistry, organizationNFT, owner } = await loadFixture(
        deployCouponRegistry,
      );

      await organizationNFT.connect(owner).mint(owner);

      await createDefaultCoupon(couponRegistry, owner, {
        orgId: 1,
        discount: 1000,
        expiration: (await time.latest()) + 1000,
        isRestricted: true,
      });

      await expect(couponRegistry.isCodeRedeemable(1, owner, 'TEST', false))
        .to.be.revertedWithCustomError(couponRegistry, 'CouponRestricted')
        .withArgs(1, owner);
    });
  });

  describe('Redeem Coupon', () => {
    it('cannot redeem coupon if not purchase manager', async () => {
      const { couponRegistry, owner } = await loadFixture(deployCouponRegistry);

      await expect(
        couponRegistry.connect(owner).redeemCoupon(1, owner, false, 1000),
      ).to.be.revertedWith('Caller not authorized');
    });
  });

  describe('Discounted Amount', () => {
    it('should amount if coupon does not exist', async () => {
      const { couponRegistry } = await loadFixture(deployCouponRegistry);

      expect(await couponRegistry.discountedAmount(1, 1000)).to.equal(1000);
    });

    it('should return correct discounted amount for 10%', async () => {
      const { couponRegistry, organizationNFT, owner } = await loadFixture(
        deployCouponRegistry,
      );

      await organizationNFT.connect(owner).mint(owner);

      await createDefaultCoupon(couponRegistry, owner, {
        orgId: 1,
        discount: 1000,
        expiration: (await time.latest()) + 1000,
      });

      expect(await couponRegistry.discountedAmount(1, 1000)).to.equal(900);
    });

    it('should return correct discounted amount for 0.01%', async () => {
      const { couponRegistry, organizationNFT, owner } = await loadFixture(
        deployCouponRegistry,
      );

      await organizationNFT.connect(owner).mint(owner);

      await createDefaultCoupon(couponRegistry, owner, {
        orgId: 1,
        discount: 10,
        expiration: (await time.latest()) + 1000,
      });

      expect(await couponRegistry.discountedAmount(1, 1000)).to.equal(999);
    });
  });

  describe('Redeemed Coupons', () => {
    it('should return empty array if no redeemed coupons', async () => {
      const { couponRegistry, owner } = await loadFixture(deployCouponRegistry);

      expect(await couponRegistry.getRedeemedCoupons(1, owner)).to.deep.equal(
        [],
      );
    });
  });

  describe('Creation', () => {
    it('should create multiple coupons successfully for separate organizations with different codes', async () => {
      const { couponRegistry, organizationNFT, owner, otherAccount } =
        await loadFixture(deployCouponRegistry);

      await organizationNFT.connect(owner).mint(owner);
      await organizationNFT.connect(otherAccount).mint(otherAccount);

      const currentTimestamp = await time.latest();

      // CREATE COUPON 1
      await expect(
        couponRegistry.createCoupon({
          orgId: 1,
          code: 'TEST',
          discount: 1000,
          expiration: currentTimestamp + 1000,
          maxTotalRedemptions: 0,
          isInitialPurchaseOnly: false,
          isActive: true,
          isRestricted: false,
          isOneTimeUse: false,
        }),
      )
        .to.emit(couponRegistry, 'CouponCreated')
        .withArgs(1, 1);

      await assertCoupon(couponRegistry, 1, {
        orgId: 1,
        code: 'TEST',
        discount: 1000,
        expiration: currentTimestamp + 1000,
        totalRedemptions: 0,
        maxTotalRedemptions: 0,
        isInitialPurchaseOnly: false,
        isActive: true,
        isRestricted: false,
        isOneTimeUse: false,
      });

      expect(await couponRegistry.getOrgCouponIds(1)).to.deep.equal([1]);
      expect(await couponRegistry.getOrgCouponIds(2)).to.deep.equal([]);

      // CREATE COUPON 2
      await expect(
        couponRegistry.connect(otherAccount).createCoupon({
          orgId: 2,
          code: 'TEST2',
          discount: 1000,
          expiration: currentTimestamp + 1000,
          maxTotalRedemptions: 0,
          isInitialPurchaseOnly: false,
          isActive: true,
          isRestricted: false,
          isOneTimeUse: false,
        }),
      )
        .to.emit(couponRegistry, 'CouponCreated')
        .withArgs(2, 2);

      await assertCoupon(couponRegistry, 2, {
        orgId: 2,
        code: 'TEST2',
        discount: 1000,
        expiration: currentTimestamp + 1000,
        totalRedemptions: 0,
        maxTotalRedemptions: 0,
        isInitialPurchaseOnly: false,
        isActive: true,
        isRestricted: false,
        isOneTimeUse: false,
      });

      expect(await couponRegistry.getOrgCouponIds(1)).to.deep.equal([1]);
      expect(await couponRegistry.getOrgCouponIds(2)).to.deep.equal([2]);
    });

    it('should create multiple coupons successfully for separate organizations with the same codes', async () => {
      const { couponRegistry, organizationNFT, owner, otherAccount } =
        await loadFixture(deployCouponRegistry);

      await organizationNFT.connect(owner).mint(owner);
      await organizationNFT.connect(otherAccount).mint(otherAccount);

      const currentTimestamp = await time.latest();

      // CREATE COUPON 1
      await expect(
        couponRegistry.createCoupon({
          orgId: 1,
          code: 'TEST',
          discount: 10000,
          expiration: currentTimestamp + 1000,
          maxTotalRedemptions: 0,
          isInitialPurchaseOnly: false,
          isActive: true,
          isRestricted: false,
          isOneTimeUse: false,
        }),
      )
        .to.emit(couponRegistry, 'CouponCreated')
        .withArgs(1, 1);

      await assertCoupon(couponRegistry, 1, {
        orgId: 1,
        code: 'TEST',
        discount: 10000,
        expiration: currentTimestamp + 1000,
        totalRedemptions: 0,
        maxTotalRedemptions: 0,
        isInitialPurchaseOnly: false,
        isActive: true,
        isRestricted: false,
        isOneTimeUse: false,
      });

      expect(await couponRegistry.getOrgCouponIds(1)).to.deep.equal([1]);
      expect(await couponRegistry.getOrgCouponIds(2)).to.deep.equal([]);

      // CREATE COUPON 2
      await expect(
        couponRegistry.connect(otherAccount).createCoupon({
          orgId: 2,
          code: 'TEST',
          discount: 1,
          expiration: currentTimestamp + 1000,
          maxTotalRedemptions: 0,
          isInitialPurchaseOnly: false,
          isActive: true,
          isRestricted: false,
          isOneTimeUse: false,
        }),
      )
        .to.emit(couponRegistry, 'CouponCreated')
        .withArgs(2, 2);

      await assertCoupon(couponRegistry, 2, {
        orgId: 2,
        code: 'TEST',
        discount: 1,
        expiration: currentTimestamp + 1000,
        totalRedemptions: 0,
        maxTotalRedemptions: 0,
        isInitialPurchaseOnly: false,
        isActive: true,
        isRestricted: false,
        isOneTimeUse: false,
      });

      expect(await couponRegistry.getOrgCouponIds(1)).to.deep.equal([1]);
      expect(await couponRegistry.getOrgCouponIds(2)).to.deep.equal([2]);
    });

    it('should create multiple coupons successfully for the same organization with different codes', async () => {
      const { couponRegistry, organizationNFT, owner } = await loadFixture(
        deployCouponRegistry,
      );

      await organizationNFT.connect(owner).mint(owner);

      const currentTimestamp = await time.latest();

      // CREATE COUPON 1
      await expect(
        couponRegistry.createCoupon({
          orgId: 1,
          code: 'TEST',
          discount: 1000,
          expiration: currentTimestamp + 1000,
          maxTotalRedemptions: 0,
          isInitialPurchaseOnly: false,
          isActive: true,
          isRestricted: false,
          isOneTimeUse: true,
        }),
      )
        .to.emit(couponRegistry, 'CouponCreated')
        .withArgs(1, 1);

      await assertCoupon(couponRegistry, 1, {
        orgId: 1,
        code: 'TEST',
        discount: 1000,
        expiration: currentTimestamp + 1000,
        totalRedemptions: 0,
        maxTotalRedemptions: 0,
        isInitialPurchaseOnly: false,
        isActive: true,
        isRestricted: false,
        isOneTimeUse: true,
      });

      expect(await couponRegistry.getOrgCouponIds(1)).to.deep.equal([1]);

      // CREATE COUPON 2
      await expect(
        couponRegistry.connect(owner).createCoupon({
          orgId: 1,
          code: 'TEST2',
          discount: 1000,
          expiration: currentTimestamp + 1000,
          maxTotalRedemptions: 0,
          isInitialPurchaseOnly: false,
          isActive: true,
          isRestricted: true,
          isOneTimeUse: false,
        }),
      )
        .to.emit(couponRegistry, 'CouponCreated')
        .withArgs(1, 2);

      await assertCoupon(couponRegistry, 2, {
        orgId: 1,
        code: 'TEST2',
        discount: 1000,
        expiration: currentTimestamp + 1000,
        totalRedemptions: 0,
        maxTotalRedemptions: 0,
        isInitialPurchaseOnly: false,
        isActive: true,
        isRestricted: true,
        isOneTimeUse: false,
      });

      expect(await couponRegistry.getOrgCouponIds(1)).to.deep.equal([1, 2]);

      expect(await couponRegistry.getOrgCoupons(1)).to.deep.equal([
        [
          1,
          'TEST',
          1000,
          currentTimestamp + 1000,
          0,
          0,
          false,
          true,
          false,
          true,
        ],
        [
          1,
          'TEST2',
          1000,
          currentTimestamp + 1000,
          0,
          0,
          false,
          true,
          true,
          false,
        ],
      ]);
    });

    it('revert if code does not meet requirements', async () => {
      const { couponRegistry, organizationNFT, owner } = await loadFixture(
        deployCouponRegistry,
      );

      await organizationNFT.connect(owner).mint(owner);

      // MIN LENGTH
      await expect(
        couponRegistry.createCoupon({
          orgId: 1,
          code: '',
          discount: 1000,
          expiration: 0,
          maxTotalRedemptions: 0,
          isInitialPurchaseOnly: false,
          isActive: true,
          isRestricted: false,
          isOneTimeUse: false,
        }),
      ).to.be.revertedWith('Invalid code length');

      // MAX LENGTH
      await expect(
        couponRegistry.createCoupon({
          orgId: 1,
          code: 'a'.repeat(33),
          discount: 1000,
          expiration: 0,
          maxTotalRedemptions: 0,
          isInitialPurchaseOnly: false,
          isActive: true,
          isRestricted: false,
          isOneTimeUse: false,
        }),
      ).to.be.revertedWith('Invalid code length');
    });

    it('revert if coupon code already exists', async () => {
      const { couponRegistry, organizationNFT, owner } = await loadFixture(
        deployCouponRegistry,
      );

      await organizationNFT.connect(owner).mint(owner);

      const currentTimestamp = await time.latest();

      await couponRegistry.createCoupon({
        orgId: 1,
        code: 'TEST',
        discount: 1000,
        expiration: currentTimestamp + 1000,
        maxTotalRedemptions: 0,
        isInitialPurchaseOnly: false,
        isActive: true,
        isRestricted: false,
        isOneTimeUse: false,
      });

      await expect(
        couponRegistry.createCoupon({
          orgId: 1,
          code: 'TEST',
          discount: 1000,
          expiration: currentTimestamp + 1000,
          maxTotalRedemptions: 0,
          isInitialPurchaseOnly: false,
          isActive: true,
          isRestricted: false,
          isOneTimeUse: false,
        }),
      ).to.be.revertedWith('Coupon code already exists');
    });

    it('revert if not the org admin', async () => {
      const { couponRegistry, organizationNFT, owner, otherAccount } =
        await loadFixture(deployCouponRegistry);

      await organizationNFT.connect(owner).mint(owner);

      const currentTimestamp = await time.latest();

      await expect(
        couponRegistry.connect(otherAccount).createCoupon({
          orgId: 1,
          code: 'TEST',
          discount: 1000,
          expiration: currentTimestamp + 1000,
          maxTotalRedemptions: 0,
          isInitialPurchaseOnly: false,
          isActive: true,
          isRestricted: false,
          isOneTimeUse: false,
        }),
      ).to.be.revertedWith('Not an admin of the organization');
    });

    it('revert if discount is not in range', async () => {
      const { couponRegistry, organizationNFT, owner } = await loadFixture(
        deployCouponRegistry,
      );

      await organizationNFT.connect(owner).mint(owner);

      const currentTimestamp = await time.latest();

      async function assertInvalidDiscount(discount: number) {
        await expect(
          couponRegistry.createCoupon({
            orgId: 1,
            code: 'TEST',
            discount,
            expiration: currentTimestamp + 1000,
            maxTotalRedemptions: 0,
            isInitialPurchaseOnly: false,
            isActive: true,
            isRestricted: false,
            isOneTimeUse: false,
          }),
        ).to.be.revertedWith('Invalid discount');
      }

      await assertInvalidDiscount(0);
      await assertInvalidDiscount(10001);
    });

    it('revert if expiration is not in the future', async () => {
      const { couponRegistry, organizationNFT, owner } = await loadFixture(
        deployCouponRegistry,
      );

      await organizationNFT.connect(owner).mint(owner);

      const currentTimestamp = await time.latest();

      async function assertInvalidExpiration(expiration: number) {
        await expect(
          couponRegistry.createCoupon({
            orgId: 1,
            code: 'TEST',
            discount: 1000,
            expiration: currentTimestamp,
            maxTotalRedemptions: 0,
            isInitialPurchaseOnly: false,
            isActive: true,
            isRestricted: false,
            isOneTimeUse: false,
          }),
        ).to.be.revertedWith('Invalid expiration');
      }

      await assertInvalidExpiration(currentTimestamp);
      await assertInvalidExpiration(currentTimestamp - 1);
      await assertInvalidExpiration(currentTimestamp - 1000);
    });
  });

  describe('Management', () => {
    describe('Discount', () => {
      it('should update coupon discount successfully', async () => {
        const { couponRegistry, organizationNFT, owner } = await loadFixture(
          deployCouponRegistry,
        );

        await organizationNFT.connect(owner).mint(owner);

        const currentTimestamp = await time.latest();

        await createDefaultCoupon(couponRegistry, owner, {
          orgId: 1,
          discount: 1000,
          expiration: currentTimestamp + 1000,
        });

        await expect(couponRegistry.setCouponDiscount(1, 2000))
          .to.emit(couponRegistry, 'CouponUpdated')
          .withArgs(1, 1);

        await assertCoupon(couponRegistry, 1, {
          orgId: 1,
          code: 'TEST',
          discount: 2000,
          expiration: currentTimestamp + 1000,
          totalRedemptions: 0,
          maxTotalRedemptions: 0,
          isInitialPurchaseOnly: false,
          isActive: true,
          isRestricted: false,
          isOneTimeUse: false,
        });
      });

      it('revert if not the org admin', async () => {
        const { couponRegistry, organizationNFT, owner, otherAccount } =
          await loadFixture(deployCouponRegistry);

        await organizationNFT.connect(owner).mint(owner);

        const currentTimestamp = await time.latest();

        await createDefaultCoupon(couponRegistry, owner, {
          orgId: 1,
          discount: 1000,
          expiration: currentTimestamp + 1000,
        });

        await expect(
          couponRegistry.connect(otherAccount).setCouponDiscount(1, 2000),
        ).to.be.revertedWith('Not an admin of the organization');
      });
    });

    describe('Expiration', () => {
      it('should update coupon expiration successfully with a future expiration', async () => {
        const { couponRegistry, organizationNFT, owner } = await loadFixture(
          deployCouponRegistry,
        );

        await organizationNFT.connect(owner).mint(owner);

        const currentTimestamp = await time.latest();

        await createDefaultCoupon(couponRegistry, owner, {
          orgId: 1,
          discount: 1000,
          expiration: currentTimestamp + 1000,
        });

        await expect(
          couponRegistry.setCouponExpiration(1, currentTimestamp + 2000),
        )
          .to.emit(couponRegistry, 'CouponUpdated')
          .withArgs(1, 1);

        await assertCoupon(couponRegistry, 1, {
          orgId: 1,
          code: 'TEST',
          discount: 1000,
          expiration: currentTimestamp + 2000,
          totalRedemptions: 0,
          maxTotalRedemptions: 0,
          isInitialPurchaseOnly: false,
          isActive: true,
          isRestricted: false,
          isOneTimeUse: false,
        });
      });

      it('should update coupon expiration successfully with a zero expiration', async () => {
        const { couponRegistry, organizationNFT, owner } = await loadFixture(
          deployCouponRegistry,
        );

        await organizationNFT.connect(owner).mint(owner);

        const currentTimestamp = await time.latest();

        await createDefaultCoupon(couponRegistry, owner, {
          orgId: 1,
          discount: 1000,
          expiration: currentTimestamp + 1000,
        });

        await couponRegistry.setCouponExpiration(1, 0);

        await assertCoupon(couponRegistry, 1, {
          orgId: 1,
          code: 'TEST',
          expiration: 0,
          discount: 1000,
          totalRedemptions: 0,
          maxTotalRedemptions: 0,
          isInitialPurchaseOnly: false,
          isActive: true,
          isRestricted: false,
          isOneTimeUse: false,
        });

        await couponRegistry.isCodeRedeemable(1, owner, 'TEST', false);

        await couponRegistry.setCouponExpiration(
          1,
          (await time.latest()) + 1000,
        );

        await couponRegistry.isCodeRedeemable(1, owner, 'TEST', false);
      });

      it('revert if not the org admin', async () => {
        const { couponRegistry, organizationNFT, owner, otherAccount } =
          await loadFixture(deployCouponRegistry);

        await organizationNFT.connect(owner).mint(owner);

        const currentTimestamp = await time.latest();

        await createDefaultCoupon(couponRegistry, owner, {
          orgId: 1,
          discount: 1000,
          expiration: currentTimestamp + 1000,
        });

        await expect(
          couponRegistry
            .connect(otherAccount)
            .setCouponExpiration(1, currentTimestamp + 2000),
        ).to.be.revertedWith('Not an admin of the organization');
      });
    });

    describe('Max Redemptions', () => {
      it('should update coupon max redemptions successfully', async () => {
        const { couponRegistry, organizationNFT, owner } = await loadFixture(
          deployCouponRegistry,
        );

        const currentTimestamp = await time.latest();

        await organizationNFT.connect(owner).mint(owner);

        await createDefaultCoupon(couponRegistry, owner, {
          orgId: 1,
          discount: 1000,
          expiration: currentTimestamp + 1000,
        });

        await expect(couponRegistry.setCouponMaxRedemptions(1, 69))
          .to.emit(couponRegistry, 'CouponUpdated')
          .withArgs(1, 1);

        await assertCoupon(couponRegistry, 1, {
          orgId: 1,
          code: 'TEST',
          discount: 1000,
          expiration: currentTimestamp + 1000,
          totalRedemptions: 0,
          maxTotalRedemptions: 69,
          isInitialPurchaseOnly: false,
          isActive: true,
          isRestricted: false,
          isOneTimeUse: false,
        });
      });

      it('can set max redemptions to 0 for unlimited redemptions', async () => {
        const { couponRegistry, organizationNFT, owner } = await loadFixture(
          deployCouponRegistry,
        );

        await organizationNFT.connect(owner).mint(owner);

        const currentTimestamp = await time.latest();

        await createDefaultCoupon(couponRegistry, owner, {
          orgId: 1,
          discount: 1000,
          expiration: (await time.latest()) + 1000,
        });

        await expect(couponRegistry.setCouponMaxRedemptions(1, 5))
          .to.emit(couponRegistry, 'CouponUpdated')
          .withArgs(1, 1);

        await assertCoupon(couponRegistry, 1, {
          orgId: 1,
          code: 'TEST',
          discount: 1000,
          expiration: currentTimestamp + 1000,
          totalRedemptions: 0,
          maxTotalRedemptions: 5,
          isInitialPurchaseOnly: false,
          isActive: true,
          isRestricted: false,
          isOneTimeUse: false,
        });

        await couponRegistry.setCouponMaxRedemptions(1, 0);

        await assertCoupon(couponRegistry, 1, {
          orgId: 1,
          code: 'TEST',
          discount: 1000,
          expiration: currentTimestamp + 1000,
          totalRedemptions: 0,
          maxTotalRedemptions: 0,
          isInitialPurchaseOnly: false,
          isActive: true,
          isRestricted: false,
          isOneTimeUse: false,
        });
      });

      it('revert if not the org admin', async () => {
        const { couponRegistry, organizationNFT, owner, otherAccount } =
          await loadFixture(deployCouponRegistry);

        await organizationNFT.connect(owner).mint(owner);

        await createDefaultCoupon(couponRegistry, owner, {
          orgId: 1,
          discount: 1000,
          expiration: (await time.latest()) + 1000,
        });

        await expect(
          couponRegistry.connect(otherAccount).setCouponMaxRedemptions(1, 69),
        ).to.be.revertedWith('Not an admin of the organization');
      });
    });

    describe('New Customers Only', () => {
      it('should update coupon new customers only successfully', async () => {
        const { couponRegistry, organizationNFT, owner } = await loadFixture(
          deployCouponRegistry,
        );

        await organizationNFT.connect(owner).mint(owner);

        const currentTimestamp = await time.latest();

        await createDefaultCoupon(couponRegistry, owner, {
          orgId: 1,
          discount: 1000,
          expiration: currentTimestamp + 1000,
        });

        await expect(couponRegistry.setCouponNewCustomers(1, true))
          .to.emit(couponRegistry, 'CouponUpdated')
          .withArgs(1, 1);

        await assertCoupon(couponRegistry, 1, {
          orgId: 1,
          code: 'TEST',
          discount: 1000,
          expiration: currentTimestamp + 1000,
          totalRedemptions: 0,
          maxTotalRedemptions: 0,
          isInitialPurchaseOnly: true,
          isActive: true,
          isRestricted: false,
          isOneTimeUse: false,
        });
      });

      it('revert if not the org admin', async () => {
        const { couponRegistry, organizationNFT, owner, otherAccount } =
          await loadFixture(deployCouponRegistry);

        await organizationNFT.connect(owner).mint(owner);

        await createDefaultCoupon(couponRegistry, owner, {
          orgId: 1,
          discount: 1000,
          expiration: (await time.latest()) + 1000,
        });

        await expect(
          couponRegistry.connect(otherAccount).setCouponNewCustomers(1, true),
        ).to.be.revertedWith('Not an admin of the organization');
      });
    });

    describe('Active', () => {
      it('should update coupon active successfully', async () => {
        const { couponRegistry, organizationNFT, owner } = await loadFixture(
          deployCouponRegistry,
        );

        await organizationNFT.connect(owner).mint(owner);

        const currentTimestamp = await time.latest();

        await createDefaultCoupon(couponRegistry, owner, {
          orgId: 1,
          discount: 1000,
          expiration: currentTimestamp + 1000,
        });

        await expect(couponRegistry.setCouponActive(1, false))
          .to.emit(couponRegistry, 'CouponStatusUpdated')
          .withArgs(1, 1, false)
          .and.to.emit(couponRegistry, 'CouponUpdated')
          .withArgs(1, 1);

        await assertCoupon(couponRegistry, 1, {
          orgId: 1,
          code: 'TEST',
          discount: 1000,
          expiration: currentTimestamp + 1000,
          totalRedemptions: 0,
          maxTotalRedemptions: 0,
          isInitialPurchaseOnly: false,
          isActive: false,
          isRestricted: false,
          isOneTimeUse: false,
        });
      });

      it('revert if not the org admin', async () => {
        const { couponRegistry, organizationNFT, owner, otherAccount } =
          await loadFixture(deployCouponRegistry);

        await organizationNFT.connect(owner).mint(owner);

        await createDefaultCoupon(couponRegistry, owner, {
          orgId: 1,
          discount: 1000,
          expiration: (await time.latest()) + 1000,
        });

        await expect(
          couponRegistry.connect(otherAccount).setCouponActive(1, false),
        ).to.be.revertedWith('Not an admin of the organization');
      });
    });

    describe('Restricted', () => {
      it('should update coupon restricted successfully', async () => {
        const { couponRegistry, organizationNFT, owner } = await loadFixture(
          deployCouponRegistry,
        );

        await organizationNFT.connect(owner).mint(owner);

        const currentTimestamp = await time.latest();

        await createDefaultCoupon(couponRegistry, owner, {
          orgId: 1,
          discount: 1000,
          expiration: currentTimestamp + 1000,
        });

        await expect(couponRegistry.setCouponRestricted(1, true))
          .to.emit(couponRegistry, 'CouponUpdated')
          .withArgs(1, 1);

        await assertCoupon(couponRegistry, 1, {
          orgId: 1,
          code: 'TEST',
          discount: 1000,
          expiration: currentTimestamp + 1000,
          totalRedemptions: 0,
          maxTotalRedemptions: 0,
          isInitialPurchaseOnly: false,
          isActive: true,
          isRestricted: true,
          isOneTimeUse: false,
        });
      });

      it('revert if not the org admin', async () => {
        const { couponRegistry, organizationNFT, owner, otherAccount } =
          await loadFixture(deployCouponRegistry);

        await organizationNFT.connect(owner).mint(owner);

        await createDefaultCoupon(couponRegistry, owner, {
          orgId: 1,
          discount: 1000,
          expiration: (await time.latest()) + 1000,
        });

        await expect(
          couponRegistry.connect(otherAccount).setCouponRestricted(1, true),
        ).to.be.revertedWith('Not an admin of the organization');
      });
    });
  });

  describe('Restricted Access', () => {
    it('should update coupon restricted access successfully', async () => {
      const { couponRegistry, organizationNFT, owner, otherAccount } =
        await loadFixture(deployCouponRegistry);

      await organizationNFT.connect(owner).mint(owner);

      await createDefaultCoupon(couponRegistry, owner, {
        orgId: 1,
        discount: 1000,
        expiration: (await time.latest()) + 1000,
      });

      // Initial checks
      expect(await couponRegistry.hasRestrictedAccess(1, owner, 1)).to.equal(
        false,
      );
      expect(
        await couponRegistry.hasRestrictedAccess(1, otherAccount, 1),
      ).to.equal(false);

      // SET ACCESS
      await couponRegistry.setRestrictedAccess(
        1,
        [owner, otherAccount],
        [true, true],
      );

      // Checks
      expect(await couponRegistry.hasRestrictedAccess(1, owner, 1)).to.equal(
        true,
      );
      expect(
        await couponRegistry.hasRestrictedAccess(1, otherAccount, 1),
      ).to.equal(true);

      expect(await couponRegistry.getRestrictedAccess(1, owner)).to.deep.equal([
        1,
      ]);
      expect(
        await couponRegistry.getRestrictedAccess(1, otherAccount),
      ).to.deep.equal([1]);

      // SET ACCESS AGAIN
      await couponRegistry.setRestrictedAccess(
        1,
        [owner, otherAccount],
        [false, true],
      );

      // Checks
      expect(await couponRegistry.hasRestrictedAccess(1, owner, 1)).to.equal(
        false,
      );
      expect(
        await couponRegistry.hasRestrictedAccess(1, otherAccount, 1),
      ).to.equal(true);

      expect(await couponRegistry.getRestrictedAccess(1, owner)).to.deep.equal(
        [],
      );
      expect(
        await couponRegistry.getRestrictedAccess(1, otherAccount),
      ).to.deep.equal([1]);
    });

    it('revert if not the org admin', async () => {
      const { couponRegistry, organizationNFT, owner, otherAccount } =
        await loadFixture(deployCouponRegistry);

      await organizationNFT.connect(owner).mint(owner);

      await createDefaultCoupon(couponRegistry, owner, {
        orgId: 1,
        discount: 1000,
        expiration: (await time.latest()) + 1000,
      });

      await expect(
        couponRegistry
          .connect(otherAccount)
          .setRestrictedAccess(1, [owner], [true]),
      ).to.be.revertedWith('Not an admin of the organization');
    });

    it('revert if not pass owners provided', async () => {
      const { couponRegistry, organizationNFT, owner, otherAccount } =
        await loadFixture(deployCouponRegistry);

      await organizationNFT.connect(owner).mint(owner);

      await createDefaultCoupon(couponRegistry, owner, {
        orgId: 1,
        discount: 1000,
        expiration: (await time.latest()) + 1000,
      });

      await expect(
        couponRegistry.setRestrictedAccess(1, [], [true]),
      ).to.be.revertedWithCustomError(
        couponRegistry,
        'InvalidRestrictedAccessInput',
      );
    });

    it('revert if pass owners and restricted length mismatch', async () => {
      const { couponRegistry, organizationNFT, owner, otherAccount } =
        await loadFixture(deployCouponRegistry);

      await organizationNFT.connect(owner).mint(owner);

      await createDefaultCoupon(couponRegistry, owner, {
        orgId: 1,
        discount: 1000,
        expiration: (await time.latest()) + 1000,
      });

      await expect(
        couponRegistry.setRestrictedAccess(1, [owner, otherAccount], [true]),
      ).to.be.revertedWithCustomError(
        couponRegistry,
        'InvalidRestrictedAccessInput',
      );
    });
  });

  describe('Pass Coupon Code', () => {
    async function loadWithCoupon() {
      const results = await loadFixture(deployCouponRegistry);

      const { couponRegistry, organizationNFT, owner } = results;

      const currentTime = await time.latest();

      await organizationNFT.mint(owner);

      await couponRegistry.createCoupon({
        orgId: 1,
        code: 'COUPON1',
        discount: 1000,
        expiration: currentTime + 1000,
        maxTotalRedemptions: 10,
        isInitialPurchaseOnly: true,
        isActive: true,
        isRestricted: false,
        isOneTimeUse: true,
      });

      return results;
    }

    it('should set a coupon as a pass owner and remove it successfully', async () => {
      const { couponRegistry, otherAccount2 } = await loadWithCoupon();

      await expect(
        couponRegistry
          .connect(otherAccount2)
          .setPassCouponCode(1, otherAccount2, 'COUPON1'),
      )
        .to.emit(couponRegistry, 'PassCouponCodeSet')
        .withArgs(1, otherAccount2, 'COUPON1');

      expect(await couponRegistry.passOwnerCodes(1, otherAccount2)).to.equal(
        'COUPON1',
      );

      await expect(
        couponRegistry
          .connect(otherAccount2)
          .removePassCouponCode(1, otherAccount2),
      )
        .to.emit(couponRegistry, 'PassCouponCodeSet')
        .withArgs(1, otherAccount2, '');

      expect(await couponRegistry.passOwnerCodes(1, otherAccount2)).to.equal(
        '',
      );
    });

    it('should set a coupon for an org as an owner and remove it successfully', async () => {
      const { couponRegistry, owner } = await loadWithCoupon();

      await expect(couponRegistry.setPassCouponCode(1, owner, 'COUPON1'))
        .to.emit(couponRegistry, 'PassCouponCodeSet')
        .withArgs(1, owner, 'COUPON1');

      expect(await couponRegistry.passOwnerCodes(1, owner)).to.equal('COUPON1');

      await expect(couponRegistry.removePassCouponCode(1, owner))
        .to.emit(couponRegistry, 'PassCouponCodeSet')
        .withArgs(1, owner, '');
    });

    it('should set a coupon for an org as an admin and remove it successfully', async () => {
      const { couponRegistry, orgAdmin, owner, otherAccount, otherAccount2 } =
        await loadWithCoupon();

      await orgAdmin.connect(owner).addAdmin(1, otherAccount2);

      await expect(
        couponRegistry
          .connect(otherAccount2)
          .setPassCouponCode(1, otherAccount, 'COUPON1'),
      )
        .to.emit(couponRegistry, 'PassCouponCodeSet')
        .withArgs(1, otherAccount, 'COUPON1');

      await expect(
        couponRegistry
          .connect(otherAccount2)
          .removePassCouponCode(1, otherAccount),
      )
        .to.emit(couponRegistry, 'PassCouponCodeSet')
        .withArgs(1, otherAccount, '');

      expect(await couponRegistry.orgCouponExists(1, 'COUPON1')).to.equal(true);
    });

    it('org admin can batch set multiple coupon codes for multiple pass owners', async () => {
      const { couponRegistry, orgAdmin, owner, otherAccount, otherAccount2 } =
        await loadWithCoupon();

      await orgAdmin.connect(owner).addAdmin(1, otherAccount2);

      await expect(
        couponRegistry
          .connect(otherAccount2)
          .setPassCouponCodeBatch(
            1,
            [owner, otherAccount],
            ['COUPON1', 'COUPON1'],
          ),
      )
        .to.emit(couponRegistry, 'PassCouponCodeSet')
        .withArgs(1, owner, 'COUPON1')
        .and.to.emit(couponRegistry, 'PassCouponCodeSet')
        .withArgs(1, otherAccount, 'COUPON1');
    });

    it('revert when trying to batch set coupon codes as not an org admin', async () => {
      const { couponRegistry, owner, otherAccount } = await loadWithCoupon();

      await expect(
        couponRegistry
          .connect(otherAccount)
          .setPassCouponCodeBatch(
            1,
            [owner, otherAccount],
            ['COUPON1', 'COUPON1'],
          ),
      ).to.be.revertedWith('Not an admin of the organization');
    });

    it('revert if pass owners and coupon codes length mismatch', async () => {
      const { couponRegistry, owner, otherAccount } = await loadWithCoupon();

      await expect(
        couponRegistry
          .connect(owner)
          .setPassCouponCodeBatch(1, [owner, otherAccount], ['COUPON1']),
      ).to.be.revertedWith('Invalid input length');
    });

    it('revert if no pass owners provided', async () => {
      const { couponRegistry } = await loadWithCoupon();

      await expect(
        couponRegistry.setPassCouponCodeBatch(1, [], []),
      ).to.be.revertedWith('Invalid input length');
    });

    it('revert when setting a coupon for an org that does not exist', async () => {
      const { couponRegistry, organizationNFT, owner } = await loadFixture(
        deployCouponRegistry,
      );

      expect(await couponRegistry.orgCouponExists(1, 'COUPON1')).to.equal(
        false,
      );

      await expect(couponRegistry.setPassCouponCode(1, owner, 'COUPON1'))
        .to.be.revertedWithCustomError(
          organizationNFT,
          'ERC721NonexistentToken',
        )
        .withArgs(1);
    });

    it('revert when setting a coupon that does not exist', async () => {
      const { couponRegistry, organizationNFT, owner } = await loadFixture(
        deployCouponRegistry,
      );

      await organizationNFT.mint(owner);

      await expect(
        couponRegistry.setPassCouponCode(1, owner, 'COUPON1'),
      ).to.be.revertedWith('Coupon code does not exist');
    });

    it('revert if setting a coupon code for a different owner that is not authorized', async () => {
      const {
        couponRegistry,
        organizationNFT,
        owner,
        otherAccount,
        otherAccount2,
      } = await loadFixture(deployCouponRegistry);

      await organizationNFT.mint(owner);

      await expect(
        couponRegistry
          .connect(otherAccount)
          .setPassCouponCode(1, otherAccount2, 'COUPON1'),
      ).to.be.revertedWith('Not authorized to update coupon code');
    });

    it('revert if removing a coupon code for a different owner that is not authorized', async () => {
      const { couponRegistry, owner, otherAccount, otherAccount2 } =
        await loadWithCoupon();

      await couponRegistry.setPassCouponCode(1, owner, 'COUPON1');

      await expect(
        couponRegistry
          .connect(otherAccount)
          .removePassCouponCode(1, otherAccount2),
      ).to.be.revertedWith('Not authorized to update coupon code');
    });

    it('revert if attempting to remove a coupon code that is not set', async () => {
      const { couponRegistry, owner } = await loadWithCoupon();

      await expect(
        couponRegistry.removePassCouponCode(1, owner),
      ).to.be.revertedWith('Coupon code is not set');
    });
  });
});
