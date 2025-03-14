import { expect } from 'chai';
import { loadWithDefaultProduct } from '../manager/helpers';
import { DiscountRegistry } from '../../typechain-types';

interface CreateDiscountParams {
  orgId?: number;
  name?: string;
  discount?: number;
  maxMints?: number;
  isActive?: boolean;
  isRestricted?: boolean;
}

interface ExpectedDiscount {
  orgId?: number;
  name?: string;
  discount?: number;
  maxMints?: number;
  totalMints?: number;
  isActive?: boolean;
  isRestricted?: boolean;
}

const DEFAULT_DISCOUNT_PARAMS = {
  orgId: 1,
  name: 'TEST',
  discount: 1000,
  maxMints: 2000,
  isActive: true,
  isRestricted: true,
};

export async function createDiscount(
  discountRegistry: DiscountRegistry,
  params: CreateDiscountParams,
) {
  const _params = {
    orgId: params.orgId ?? DEFAULT_DISCOUNT_PARAMS.orgId,
    name: params.name ?? DEFAULT_DISCOUNT_PARAMS.name,
    discount: params.discount ?? DEFAULT_DISCOUNT_PARAMS.discount,
    maxMints: params.maxMints ?? DEFAULT_DISCOUNT_PARAMS.maxMints,
    isActive: params.isActive ?? DEFAULT_DISCOUNT_PARAMS.isActive,
    isRestricted: params.isRestricted ?? DEFAULT_DISCOUNT_PARAMS.isRestricted,
  };

  return discountRegistry.createDiscount({
    ..._params,
  });
}

export async function assertDiscount(
  discountRegistry: DiscountRegistry,
  discountId: number,
  expected: ExpectedDiscount,
) {
  const discount = await discountRegistry.getDiscount(discountId);

  const _expected = {
    ...DEFAULT_DISCOUNT_PARAMS,
    totalMints: 0,
    ...expected,
  };

  expect(discount).to.deep.equal([
    _expected.orgId,
    _expected.name,
    _expected.discount,
    _expected.totalMints,
    _expected.maxMints,
    _expected.isActive,
    _expected.isRestricted,
  ]);
}

async function loadWithDefaultDiscount() {
  const results = await loadWithDefaultProduct();

  await createDiscount(results.discountRegistry, {});

  return results;
}

describe('DiscountRegistry', () => {
  describe('Deployment', () => {
    it('should set the correct contract registry', async () => {
      const { discountRegistry, contractRegistry } =
        await loadWithDefaultProduct();

      expect(await discountRegistry.registry()).to.equal(contractRegistry);
    });
  });

  it('should support the IERC165 interface', async () => {
    const { discountRegistry } = await loadWithDefaultDiscount();

    expect(await discountRegistry.supportsInterface('0x01ffc9a7')).to.be.true;
  });

  describe('Create Discount', () => {
    it('should create multiple discounts with valid params in different organizations', async () => {
      const { discountRegistry, organizationNFT, otherAccount } =
        await loadWithDefaultDiscount();

      // Owner discounts
      await assertDiscount(discountRegistry, 1, {});

      await expect(createDiscount(discountRegistry, { name: 'TEST2' }))
        .to.emit(discountRegistry, 'DiscountCreated')
        .withArgs(1, 2, 'TEST2', 1000);

      await assertDiscount(discountRegistry, 2, { name: 'TEST2' });

      await expect(createDiscount(discountRegistry, { name: 'TEST3' }))
        .to.emit(discountRegistry, 'DiscountCreated')
        .withArgs(1, 3, 'TEST3', 1000);

      await assertDiscount(discountRegistry, 3, { name: 'TEST3' });

      expect(await discountRegistry.totalDiscounts()).to.equal(3);

      expect(await discountRegistry.getOrgDiscountIds(1)).to.deep.equal([
        1, 2, 3,
      ]);

      // Other account discounts
      await organizationNFT.connect(otherAccount).mint(otherAccount);

      await expect(
        await discountRegistry.connect(otherAccount).createDiscount({
          orgId: 2,
          name: 'TEST4',
          discount: 1000,
          maxMints: 2000,
          isActive: true,
          isRestricted: true,
        }),
      )
        .to.emit(discountRegistry, 'DiscountCreated')
        .withArgs(2, 4, 'TEST4', 1000);

      await assertDiscount(discountRegistry, 4, {
        orgId: 2,
        name: 'TEST4',
      });

      expect(await discountRegistry.getOrgDiscountIds(2)).to.deep.equal([4]);

      // Batch assertions
      const discounts = await discountRegistry.getDiscountBatch([1, 2, 3, 4]);

      expect(discounts).to.deep.equal([
        [1, 'TEST', 1000, 0, 2000, true, true],
        [1, 'TEST2', 1000, 0, 2000, true, true],
        [1, 'TEST3', 1000, 0, 2000, true, true],
        [2, 'TEST4', 1000, 0, 2000, true, true],
      ]);

      const names = await discountRegistry.getDiscountNames([1, 2, 3, 4]);

      expect(names).to.deep.equal(['TEST', 'TEST2', 'TEST3', 'TEST4']);
    });
  });

  describe('Update Discount', () => {
    describe('Name', () => {
      it('only org admin can update the name', async () => {
        const { discountRegistry, otherAccount } =
          await loadWithDefaultDiscount();

        await expect(
          discountRegistry.connect(otherAccount).setDiscountName(1, 'NEW_NAME'),
        ).to.be.revertedWith('Not an admin of the organization');
      });

      it('should update the name of a discount', async () => {
        const { discountRegistry } = await loadWithDefaultDiscount();

        await expect(discountRegistry.setDiscountName(1, 'NEW_NAME'))
          .to.emit(discountRegistry, 'DiscountUpdated')
          .withArgs(1, 1);

        await assertDiscount(discountRegistry, 1, { name: 'NEW_NAME' });
      });

      it('name cannot be empty', async () => {
        const { discountRegistry } = await loadWithDefaultDiscount();

        await expect(
          discountRegistry.setDiscountName(1, ''),
        ).to.be.revertedWith('Name cannot be empty');
      });

      it('name cannot be longer than 32 characters', async () => {
        const { discountRegistry } = await loadWithDefaultDiscount();

        await expect(
          discountRegistry.setDiscountName(1, 'A'.repeat(33)),
        ).to.be.revertedWith('Name cannot be longer than 32 characters');
      });

      it('discounts can have the same name within the same organization', async () => {
        const { discountRegistry } = await loadWithDefaultDiscount();

        await expect(createDiscount(discountRegistry, { name: 'TEST' }))
          .to.emit(discountRegistry, 'DiscountCreated')
          .withArgs(1, 2, 'TEST', 1000);

        await assertDiscount(discountRegistry, 2, { name: 'TEST' });
      });
    });

    describe('Discount', () => {
      it('only org admin can update the discount', async () => {
        const { discountRegistry, otherAccount } =
          await loadWithDefaultDiscount();

        await expect(
          discountRegistry.connect(otherAccount).setDiscount(1, 2000),
        ).to.be.revertedWith('Not an admin of the organization');
      });

      it('discount cannot be zero', async () => {
        const { discountRegistry } = await loadWithDefaultDiscount();

        await expect(discountRegistry.setDiscount(1, 0)).to.be.revertedWith(
          'Invalid discount',
        );
      });

      it('discount cannot be greater than 10000', async () => {
        const { discountRegistry } = await loadWithDefaultDiscount();

        await expect(discountRegistry.setDiscount(1, 10001)).to.be.revertedWith(
          'Invalid discount',
        );
      });

      it('can set max discount', async () => {
        const { discountRegistry } = await loadWithDefaultDiscount();

        await expect(discountRegistry.setDiscount(1, 10000))
          .to.emit(discountRegistry, 'DiscountUpdated')
          .withArgs(1, 1);

        await assertDiscount(discountRegistry, 1, { discount: 10000 });
      });
    });

    describe('Max Mints', () => {
      it('only org admin can update the max mints', async () => {
        const { discountRegistry, otherAccount } =
          await loadWithDefaultDiscount();

        await expect(
          discountRegistry.connect(otherAccount).setDiscountMaxMints(1, 2000),
        ).to.be.revertedWith('Not an admin of the organization');
      });

      it('can set max mints to zero', async () => {
        const { discountRegistry } = await loadWithDefaultDiscount();

        await expect(discountRegistry.setDiscountMaxMints(1, 0))
          .to.emit(discountRegistry, 'DiscountUpdated')
          .withArgs(1, 1);

        await assertDiscount(discountRegistry, 1, { maxMints: 0 });
      });
    });

    describe('Active', () => {
      it('only org admin can update the active', async () => {
        const { discountRegistry, otherAccount } =
          await loadWithDefaultDiscount();

        await expect(
          discountRegistry.connect(otherAccount).setDiscountActive(1, true),
        ).to.be.revertedWith('Not an admin of the organization');
      });

      it('can set active to true and false', async () => {
        const { discountRegistry } = await loadWithDefaultDiscount();

        await expect(discountRegistry.setDiscountActive(1, true))
          .to.emit(discountRegistry, 'DiscountUpdated')
          .withArgs(1, 1);

        await assertDiscount(discountRegistry, 1, { isActive: true });

        await expect(discountRegistry.setDiscountActive(1, false))
          .to.emit(discountRegistry, 'DiscountUpdated')
          .withArgs(1, 1);

        await assertDiscount(discountRegistry, 1, { isActive: false });
      });
    });

    describe('Restricted', () => {
      it('only org admin can update the restricted', async () => {
        const { discountRegistry, otherAccount } =
          await loadWithDefaultDiscount();

        await expect(
          discountRegistry.connect(otherAccount).setDiscountRestricted(1, true),
        ).to.be.revertedWith('Not an admin of the organization');
      });

      it('can set restricted to true and false', async () => {
        const { discountRegistry } = await loadWithDefaultDiscount();

        await expect(discountRegistry.setDiscountRestricted(1, true))
          .to.emit(discountRegistry, 'DiscountUpdated')
          .withArgs(1, 1);

        await assertDiscount(discountRegistry, 1, { isRestricted: true });

        await expect(discountRegistry.setDiscountRestricted(1, false))
          .to.emit(discountRegistry, 'DiscountUpdated')
          .withArgs(1, 1);

        await assertDiscount(discountRegistry, 1, { isRestricted: false });
      });
    });
  });

  describe('Restricted Access', () => {
    it('only org admin can update the restricted access', async () => {
      const { discountRegistry, otherAccount } =
        await loadWithDefaultDiscount();

      await expect(
        discountRegistry.connect(otherAccount).setRestrictedAccess(1, [], []),
      ).to.be.revertedWith('Not an admin of the organization');
    });

    it('cannot set restricted access with invalid params', async () => {
      const { discountRegistry, owner } = await loadWithDefaultDiscount();

      await expect(
        discountRegistry.setRestrictedAccess(1, [], [true]),
      ).to.be.revertedWithCustomError(
        discountRegistry,
        'InvalidRestrictedAccessInput',
      );

      await expect(
        discountRegistry.setRestrictedAccess(1, [owner], []),
      ).to.be.revertedWithCustomError(
        discountRegistry,
        'InvalidRestrictedAccessInput',
      );
    });

    it('can set and remove restricted access', async () => {
      const { discountRegistry, owner, otherAccount, otherAccount2 } =
        await loadWithDefaultDiscount();

      await expect(
        discountRegistry.setRestrictedAccess(
          1,
          [owner, otherAccount, otherAccount2],
          [true, true, true],
        ),
      )
        .to.emit(discountRegistry, 'RestrictedAccessUpdated')
        .withArgs(1, 1, owner, true)
        .and.to.emit(discountRegistry, 'RestrictedAccessUpdated')
        .withArgs(1, 1, otherAccount, true)
        .and.to.emit(discountRegistry, 'RestrictedAccessUpdated')
        .withArgs(1, 1, otherAccount2, true);

      await expect(
        discountRegistry.setRestrictedAccess(
          1,
          [owner, otherAccount],
          [false, false],
        ),
      )
        .to.emit(discountRegistry, 'RestrictedAccessUpdated')
        .withArgs(1, 1, owner, false)
        .and.to.emit(discountRegistry, 'RestrictedAccessUpdated')
        .withArgs(1, 1, otherAccount, false);
    });
  });
});
