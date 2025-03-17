import { expect } from 'chai';
import hre from 'hardhat';
import { loadWithPurchasedFlatRateSubscription } from '../manager/helpers';
import {
  assertMetadata,
  DEFAULT_PASS_METADATA,
  EXPECTED_DEFAULT_PASS_METADATA,
} from './helpers';

describe('Pass Metadata Provider', () => {
  async function loadWithDefaultMetadata() {
    const results = await loadWithPurchasedFlatRateSubscription();

    const { passMetadataProvider } = results;

    await passMetadataProvider.setDefaultMetadata(DEFAULT_PASS_METADATA);

    return results;
  }

  describe('Deployment', () => {
    it('should set the correct registry', async () => {
      const { passMetadataProvider, contractRegistry } =
        await loadWithPurchasedFlatRateSubscription();

      expect(await passMetadataProvider.registry()).to.equal(contractRegistry);
    });

    it('should set the correct owner', async () => {
      const { passMetadataProvider, owner } =
        await loadWithPurchasedFlatRateSubscription();

      expect(await passMetadataProvider.owner()).to.equal(owner);
    });

    it('should set the correct attribute provider', async () => {
      const { passMetadataProvider, passAttributeProvider } =
        await loadWithPurchasedFlatRateSubscription();

      expect(await passMetadataProvider.attributeProvider()).to.equal(
        passAttributeProvider,
      );
    });
  });

  describe('Update Attribute Provider', () => {
    it('can update the attribute provider', async () => {
      const { passMetadataProvider, contractRegistry } =
        await loadWithPurchasedFlatRateSubscription();

      const NewAttributeProvider = await hre.ethers.getContractFactory(
        'PassAttributeProvider',
      );
      const newAttributeProvider = await NewAttributeProvider.deploy(
        contractRegistry,
      );

      await expect(
        passMetadataProvider.setAttributeProvider(newAttributeProvider),
      )
        .to.emit(passMetadataProvider, 'AttributeProviderUpdated')
        .withArgs(await newAttributeProvider.getAddress());

      expect(await passMetadataProvider.attributeProvider()).to.equal(
        newAttributeProvider,
      );
    });

    it('only the owner can update the attribute provider', async () => {
      const { passMetadataProvider, otherAccount } =
        await loadWithPurchasedFlatRateSubscription();

      await expect(
        passMetadataProvider
          .connect(otherAccount)
          .setAttributeProvider(otherAccount),
      ).to.be.revertedWithCustomError(
        passMetadataProvider,
        'OwnableUnauthorizedAccount',
      );
    });

    it('must implement IAttributeProvider', async () => {
      const { passMetadataProvider, owner, paymentEscrow } =
        await loadWithPurchasedFlatRateSubscription();

      await expect(
        passMetadataProvider.connect(owner).setAttributeProvider(paymentEscrow),
      ).to.be.revertedWith(
        'Attribute provider must implement IAttributeProvider',
      );
    });
  });

  describe('Implements IERC165', () => {
    it('should return true for IERC165', async () => {
      const { passMetadataProvider } = await loadWithDefaultMetadata();

      expect(await passMetadataProvider.supportsInterface('0x01ffc9a7')).to.be
        .true;
    });
  });

  describe('Get Token Metadata', () => {
    it('should return the correct metadata for an org with no custom metadata', async () => {
      const { passMetadataProvider } = await loadWithDefaultMetadata();

      assertMetadata(await passMetadataProvider.getTokenMetadata(1), {
        ...EXPECTED_DEFAULT_PASS_METADATA,
        attributes: [
          {
            trait_type: 'Organization',
            value: 1,
          },
          {
            trait_type: 'Product 1',
            value: 'Product 1',
          },
          {
            trait_type: 'Subscription 1',
            value: 'Active',
          },
        ],
      });
    });

    it('should return the correct metadata for discounts that have decimals', async () => {
      const { passMetadataProvider, discountRegistry } =
        await loadWithDefaultMetadata();

      await discountRegistry.createDiscount({
        orgId: 1,
        name: 'OG',
        discount: 1202,
        maxMints: 2000,
        isActive: true,
        isRestricted: false,
      });

      await discountRegistry.createDiscount({
        orgId: 1,
        name: 'TESTER',
        discount: 2133,
        maxMints: 2000,
        isActive: true,
        isRestricted: false,
      });

      await discountRegistry.mintDiscountsToPassByOrg(1, [1], [1, 2]);

      assertMetadata(await passMetadataProvider.getTokenMetadata(1), {
        ...EXPECTED_DEFAULT_PASS_METADATA,
        attributes: [
          {
            trait_type: 'Organization',
            value: 1,
          },
          {
            trait_type: 'Product 1',
            value: 'Product 1',
          },
          {
            trait_type: 'Subscription 1',
            value: 'Active',
          },
          {
            trait_type: 'Discount 1',
            value: 'OG',
          },
          {
            trait_type: 'Discount 2',
            value: 'TESTER',
          },
          {
            trait_type: 'Total Discount',
            value: '33.35%',
          },
        ],
      });
    });

    it('should return the correct metadata for discounts that do NOT have decimals', async () => {
      const { passMetadataProvider, discountRegistry } =
        await loadWithDefaultMetadata();

      await discountRegistry.createDiscount({
        orgId: 1,
        name: 'OG',
        discount: 1000,
        maxMints: 2000,
        isActive: true,
        isRestricted: false,
      });

      await discountRegistry.createDiscount({
        orgId: 1,
        name: 'TESTER',
        discount: 3000,
        maxMints: 2000,
        isActive: true,
        isRestricted: false,
      });

      await discountRegistry.mintDiscountsToPassByOrg(1, [1], [1, 2]);

      assertMetadata(await passMetadataProvider.getTokenMetadata(1), {
        ...EXPECTED_DEFAULT_PASS_METADATA,
        attributes: [
          {
            trait_type: 'Organization',
            value: 1,
          },
          {
            trait_type: 'Product 1',
            value: 'Product 1',
          },
          {
            trait_type: 'Subscription 1',
            value: 'Active',
          },
          {
            trait_type: 'Discount 1',
            value: 'OG',
          },
          {
            trait_type: 'Discount 2',
            value: 'TESTER',
          },
          {
            trait_type: 'Total Discount',
            value: '40%',
          },
        ],
      });
    });
  });
});
