import { expect } from 'chai';
import hre, { ethers } from 'hardhat';
import { loadWithPurchasedFlatRateSubscription } from '../manager/helpers';
import {
  assertMetadata,
  DEFAULT_PASS_METADATA,
  EXPECTED_DEFAULT_PASS_METADATA,
} from './helpers';

describe('Pass Metadata Provider', () => {
  async function loadWithDefaultMetadata() {
    const results = await loadWithPurchasedFlatRateSubscription();

    const { passMetadataProvider, contractRegistry, passAttributeProvider } =
      results;

    await passMetadataProvider.setDefaultMetadata(DEFAULT_PASS_METADATA);

    const PassMetadataProviderV2 = await hre.ethers.getContractFactory(
      'PassMetadataProviderV2',
    );

    const passMetadataProviderV2 = await PassMetadataProviderV2.deploy(
      contractRegistry,
      passAttributeProvider,
    );

    await passMetadataProviderV2.setDefaultMetadata(DEFAULT_PASS_METADATA);

    return {
      ...results,
      passMetadataProviderV2,
    };
  }

  describe('Deployment', () => {
    it('should set the correct registry', async () => {
      const { passMetadataProviderV2, contractRegistry } =
        await loadWithDefaultMetadata();

      expect(await passMetadataProviderV2.registry()).to.equal(
        contractRegistry,
      );
    });

    it('should set the correct owner', async () => {
      const { passMetadataProviderV2, owner } = await loadWithDefaultMetadata();

      expect(await passMetadataProviderV2.owner()).to.equal(owner);
    });

    it('should set the correct attribute provider', async () => {
      const { passMetadataProviderV2, passAttributeProvider } =
        await loadWithDefaultMetadata();

      expect(await passMetadataProviderV2.attributeProvider()).to.equal(
        passAttributeProvider,
      );
    });
  });

  describe('Update Attribute Provider', () => {
    it('can update the attribute provider', async () => {
      const { passMetadataProviderV2, contractRegistry } =
        await loadWithDefaultMetadata();

      const NewAttributeProvider = await hre.ethers.getContractFactory(
        'PassAttributeProvider',
      );
      const newAttributeProvider = await NewAttributeProvider.deploy(
        contractRegistry,
      );

      await expect(
        passMetadataProviderV2.setAttributeProvider(newAttributeProvider),
      )
        .to.emit(passMetadataProviderV2, 'AttributeProviderUpdated')
        .withArgs(await newAttributeProvider.getAddress());

      expect(await passMetadataProviderV2.attributeProvider()).to.equal(
        newAttributeProvider,
      );
    });

    it('only the owner can update the attribute provider', async () => {
      const { passMetadataProviderV2, otherAccount } =
        await loadWithDefaultMetadata();

      await expect(
        passMetadataProviderV2
          .connect(otherAccount)
          .setAttributeProvider(otherAccount),
      ).to.be.revertedWithCustomError(
        passMetadataProviderV2,
        'OwnableUnauthorizedAccount',
      );
    });

    it('must implement IAttributeProvider', async () => {
      const { passMetadataProviderV2, owner, paymentEscrow } =
        await loadWithDefaultMetadata();

      await expect(
        passMetadataProviderV2
          .connect(owner)
          .setAttributeProvider(paymentEscrow),
      ).to.be.revertedWith(
        'Attribute provider must implement IAttributeProvider',
      );
    });
  });

  describe('Implements IERC165', () => {
    it('should return true for IERC165', async () => {
      const { passMetadataProviderV2 } = await loadWithDefaultMetadata();

      expect(await passMetadataProviderV2.supportsInterface('0x01ffc9a7')).to.be
        .true;
    });
  });

  describe('Get Token Metadata', () => {
    it('should return the correct metadata for an org with no custom metadata', async () => {
      const { passMetadataProviderV2, purchaseRegistry } =
        await loadWithDefaultMetadata();

      expect(await purchaseRegistry.passOrganization(1)).to.equal(1);

      assertMetadata(await passMetadataProviderV2.getTokenMetadata(1), {
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

    it('should return the correct metadata for multiple orgs. V2 FIX', async () => {
      const {
        passMetadataProviderV2,
        purchaseRegistry,
        organizationNFT,
        purchaseManager,
        productRegistry,
        pricingRegistry,
        paymentEscrow,
        mintToken,
        owner,
        otherAccount,
        otherAccount2,
        otherAccount3,
        otherAccount4,
      } = await loadWithDefaultMetadata();

      const PASS_METADATA_ORG_2 = {
        name: 'Test Product Pass ORG 2',
        description: 'Test Product Description ORG 2',
        externalUrl: 'https://test-pass.com/org2',
        image: 'https://test-pass.com/org2/image.png',
        backgroundColor: '222222',
        animationUrl: 'https://test-pass.com/org2/animation.mp4',
      };

      const EXPECTED_PASS_METADATA_ORG_2 = {
        name: PASS_METADATA_ORG_2.name,
        description: PASS_METADATA_ORG_2.description,
        external_url: PASS_METADATA_ORG_2.externalUrl,
        image: PASS_METADATA_ORG_2.image,
        background_color: PASS_METADATA_ORG_2.backgroundColor,
        animation_url: PASS_METADATA_ORG_2.animationUrl,
      };

      await mintToken
        .connect(otherAccount2)
        .mint(otherAccount2, ethers.parseUnits('2000', 6));
      await mintToken
        .connect(otherAccount2)
        .approve(paymentEscrow, ethers.parseUnits('2000', 6));

      await mintToken
        .connect(otherAccount3)
        .mint(otherAccount3, ethers.parseUnits('2000', 6));
      await mintToken
        .connect(otherAccount3)
        .approve(paymentEscrow, ethers.parseUnits('2000', 6));

      await mintToken
        .connect(otherAccount4)
        .mint(otherAccount4, ethers.parseUnits('2000', 6));
      await mintToken
        .connect(otherAccount4)
        .approve(paymentEscrow, ethers.parseUnits('2000', 6));

      // org 1 name change

      await passMetadataProviderV2
        .connect(owner)
        .setCustomMetadataField(1, 0, 'NEW 1');

      // org 2

      await organizationNFT.connect(otherAccount).mint(otherAccount);
      await passMetadataProviderV2
        .connect(otherAccount)
        .setCustomMetadata(2, PASS_METADATA_ORG_2);

      // Create products for org 2

      await productRegistry.connect(otherAccount).createProduct({
        orgId: 2,
        name: 'Product 2',
        description: 'Product 2',
        externalUrl: 'https://productmint.io/product2',
        imageUrl: 'https://productmint.io/product2.png',
        isTransferable: false,
      });

      // Create pricing for product 2

      await pricingRegistry
        .connect(otherAccount)
        .createFlatRateSubscriptionPricing({
          organizationId: 2,
          flatPrice: ethers.parseUnits('100', 6),
          token: await mintToken.getAddress(),
          chargeFrequency: 2,
          isRestricted: false,
        });

      await productRegistry.connect(otherAccount).linkPricing(2, [2]);

      // Purchase product 2 for org 2 (Pass 2)

      await purchaseManager.connect(otherAccount2).purchaseProducts({
        to: otherAccount2,
        organizationId: 2,
        productIds: [2],
        pricingIds: [2],
        quantities: [0],
        discountIds: [],
        couponCode: '',
        airdrop: false,
        pause: false,
      });

      // Mint another pass for org 2 (Pass 3)

      await purchaseManager.connect(otherAccount3).purchaseProducts({
        to: otherAccount3,
        organizationId: 2,
        productIds: [2],
        pricingIds: [2],
        quantities: [0],
        discountIds: [],
        couponCode: '',
        airdrop: false,
        pause: false,
      });

      // Mint another pass for org 1 (Pass 4)

      await purchaseManager.connect(otherAccount4).purchaseProducts({
        to: otherAccount4,
        organizationId: 1,
        productIds: [1],
        pricingIds: [1],
        quantities: [0],
        discountIds: [],
        couponCode: '',
        airdrop: false,
        pause: false,
      });

      // ASSERT

      expect(await purchaseRegistry.passOrganization(1)).to.equal(1);
      expect(await purchaseRegistry.passOrganization(2)).to.equal(2);
      expect(await purchaseRegistry.passOrganization(3)).to.equal(2);
      expect(await purchaseRegistry.passOrganization(4)).to.equal(1);

      assertMetadata(await passMetadataProviderV2.getTokenMetadata(1), {
        ...EXPECTED_DEFAULT_PASS_METADATA,
        name: 'NEW 1',
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

      assertMetadata(await passMetadataProviderV2.getTokenMetadata(2), {
        ...EXPECTED_PASS_METADATA_ORG_2,
        attributes: [
          {
            trait_type: 'Organization',
            value: 2,
          },
          {
            trait_type: 'Product 2',
            value: 'Product 2',
          },
          {
            trait_type: 'Subscription 2',
            value: 'Active',
          },
        ],
      });

      assertMetadata(await passMetadataProviderV2.getTokenMetadata(3), {
        ...EXPECTED_PASS_METADATA_ORG_2,
        attributes: [
          {
            trait_type: 'Organization',
            value: 2,
          },
          {
            trait_type: 'Product 2',
            value: 'Product 2',
          },
          {
            trait_type: 'Subscription 2',
            value: 'Active',
          },
        ],
      });

      assertMetadata(await passMetadataProviderV2.getTokenMetadata(4), {
        ...EXPECTED_DEFAULT_PASS_METADATA,
        name: 'NEW 1',
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
      const { passMetadataProviderV2, discountRegistry } =
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

      assertMetadata(await passMetadataProviderV2.getTokenMetadata(1), {
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
      const { passMetadataProviderV2, discountRegistry } =
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

      assertMetadata(await passMetadataProviderV2.getTokenMetadata(1), {
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
