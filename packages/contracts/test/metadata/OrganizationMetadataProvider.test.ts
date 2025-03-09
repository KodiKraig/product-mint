import { expect } from 'chai';
import { loadWithPurchasedFlatRateSubscription } from '../manager/helpers';
import {
  assertMetadata,
  DEFAULT_ORGANIZATION_METADATA,
  EXPECTED_DEFAULT_ORGANIZATION_METADATA,
} from './helpers';

const DEFAULT_ATTRIBUTES = {
  attributes: [
    { trait_type: 'Whitelist Only', value: 'False' },
    { trait_type: 'Max Mints', value: 'No Limit' },
    { trait_type: 'Products Sold', value: '1' },
    { trait_type: 'Product Pass Mints', value: '1' },
  ],
};

describe('Organization Metadata Provider', () => {
  async function loadWithDefaultMetadata() {
    const results = await loadWithPurchasedFlatRateSubscription();

    const { organizationMetadataProvider } = results;

    await expect(
      organizationMetadataProvider.setDefaultMetadata(
        DEFAULT_ORGANIZATION_METADATA,
      ),
    ).to.emit(organizationMetadataProvider, 'DefaultMetadataUpdated');

    return results;
  }

  describe('Deployment', () => {
    it('should set the correct registry', async () => {
      const { organizationMetadataProvider, contractRegistry } =
        await loadWithPurchasedFlatRateSubscription();

      expect(await organizationMetadataProvider.registry()).to.equal(
        contractRegistry,
      );
    });

    it('should set the correct owner', async () => {
      const { organizationMetadataProvider, owner } =
        await loadWithPurchasedFlatRateSubscription();

      expect(await organizationMetadataProvider.owner()).to.equal(owner);
    });
  });

  describe('Get Token Metadata', () => {
    it('should return the correct metadata for an org with no custom metadata', async () => {
      const { organizationMetadataProvider } = await loadWithDefaultMetadata();

      assertMetadata(await organizationMetadataProvider.getTokenMetadata(1), {
        ...EXPECTED_DEFAULT_ORGANIZATION_METADATA,
        ...DEFAULT_ATTRIBUTES,
      });
    });
  });

  describe('Implements IERC165', () => {
    it('should return true for IERC165', async () => {
      const { organizationMetadataProvider } = await loadWithDefaultMetadata();

      expect(await organizationMetadataProvider.supportsInterface('0x01ffc9a7'))
        .to.be.true;
    });
  });

  describe('Set Default Metadata', () => {
    it('only owner can set default metadata', async () => {
      const { organizationMetadataProvider, otherAccount2 } =
        await loadWithPurchasedFlatRateSubscription();

      await expect(
        organizationMetadataProvider
          .connect(otherAccount2)
          .setDefaultMetadata(DEFAULT_ORGANIZATION_METADATA),
      ).to.be.revertedWithCustomError(
        organizationMetadataProvider,
        'OwnableUnauthorizedAccount',
      );
    });

    it('should set all the correct default metadata', async () => {
      const { organizationMetadataProvider } = await loadWithDefaultMetadata();

      await organizationMetadataProvider.setDefaultMetadata({
        name: 'Updated Name',
        description: 'Updated Description',
        externalUrl: 'https://updated.com',
        image: 'https://updated.com/image.png',
        backgroundColor: '000002',
        animationUrl: 'https://updated.com/animation.mp4',
      });

      const updatedMetadata = {
        name: 'Updated Name',
        description: 'Updated Description',
        external_url: 'https://updated.com',
        image: 'https://updated.com/image.png',
        background_color: '000002',
        animation_url: 'https://updated.com/animation.mp4',
      };

      expect(
        await organizationMetadataProvider.getDefaultMetadata(),
      ).to.deep.equal([
        'Updated Name',
        'Updated Description',
        'https://updated.com',
        'https://updated.com/image.png',
        '000002',
        'https://updated.com/animation.mp4',
      ]);

      assertMetadata(await organizationMetadataProvider.getTokenMetadata(1), {
        ...updatedMetadata,
        ...DEFAULT_ATTRIBUTES,
      });
    });
  });

  describe('Update Default Metadata By Field', () => {
    it('only owner can update default metadata fields', async () => {
      const { organizationMetadataProvider, otherAccount2 } =
        await loadWithPurchasedFlatRateSubscription();

      await expect(
        organizationMetadataProvider
          .connect(otherAccount2)
          .setDefaultMetadataField(0, ''),
      ).to.be.revertedWithCustomError(
        organizationMetadataProvider,
        'OwnableUnauthorizedAccount',
      );
    });

    describe('Name', () => {
      it('can update name', async () => {
        const { organizationMetadataProvider } =
          await loadWithDefaultMetadata();

        const updatedName = 'n'.repeat(64);

        await expect(
          organizationMetadataProvider.setDefaultMetadataField(0, updatedName),
        ).to.emit(organizationMetadataProvider, 'DefaultMetadataUpdated');

        expect(
          await organizationMetadataProvider.getDefaultMetadata(),
        ).to.deep.equal([
          updatedName,
          DEFAULT_ORGANIZATION_METADATA.description,
          DEFAULT_ORGANIZATION_METADATA.externalUrl,
          DEFAULT_ORGANIZATION_METADATA.image,
          DEFAULT_ORGANIZATION_METADATA.backgroundColor,
          DEFAULT_ORGANIZATION_METADATA.animationUrl,
        ]);
      });

      it('revert if name is empty', async () => {
        const { organizationMetadataProvider } =
          await loadWithDefaultMetadata();

        await expect(
          organizationMetadataProvider.setDefaultMetadataField(0, ''),
        ).to.be.revertedWith('Name is required');
      });

      it('revert if name is too long', async () => {
        const { organizationMetadataProvider } =
          await loadWithDefaultMetadata();

        await expect(
          organizationMetadataProvider.setDefaultMetadataField(
            0,
            'a'.repeat(65),
          ),
        ).to.be.revertedWith('Name must be less than 64 characters');
      });
    });

    describe('Description', () => {
      it('can update description to max length', async () => {
        const { organizationMetadataProvider } =
          await loadWithDefaultMetadata();

        const updatedDescription = 'd'.repeat(512);

        await organizationMetadataProvider.setDefaultMetadataField(
          1,
          updatedDescription,
        );

        expect(
          await organizationMetadataProvider.getDefaultMetadata(),
        ).to.deep.equal([
          DEFAULT_ORGANIZATION_METADATA.name,
          updatedDescription,
          DEFAULT_ORGANIZATION_METADATA.externalUrl,
          DEFAULT_ORGANIZATION_METADATA.image,
          DEFAULT_ORGANIZATION_METADATA.backgroundColor,
          DEFAULT_ORGANIZATION_METADATA.animationUrl,
        ]);
      });

      it('revert if description is empty', async () => {
        const { organizationMetadataProvider } =
          await loadWithDefaultMetadata();

        await expect(
          organizationMetadataProvider.setDefaultMetadataField(1, ''),
        ).to.be.revertedWith('Description is required');
      });

      it('revert if description is too long', async () => {
        const { organizationMetadataProvider } =
          await loadWithDefaultMetadata();

        await expect(
          organizationMetadataProvider.setDefaultMetadataField(
            1,
            'a'.repeat(513),
          ),
        ).to.be.revertedWith('Description must be less than 512 characters');
      });
    });

    describe('External URL', () => {
      it('can update external url to max length', async () => {
        const { organizationMetadataProvider } =
          await loadWithDefaultMetadata();

        const updatedExternalUrl = 'e'.repeat(128);

        await organizationMetadataProvider.setDefaultMetadataField(
          2,
          updatedExternalUrl,
        );

        expect(
          await organizationMetadataProvider.getDefaultMetadata(),
        ).to.deep.equal([
          DEFAULT_ORGANIZATION_METADATA.name,
          DEFAULT_ORGANIZATION_METADATA.description,
          updatedExternalUrl,
          DEFAULT_ORGANIZATION_METADATA.image,
          DEFAULT_ORGANIZATION_METADATA.backgroundColor,
          DEFAULT_ORGANIZATION_METADATA.animationUrl,
        ]);
      });

      it('can clear external url', async () => {
        const { organizationMetadataProvider } =
          await loadWithDefaultMetadata();

        await organizationMetadataProvider.setDefaultMetadataField(2, '');

        expect(
          await organizationMetadataProvider.getDefaultMetadata(),
        ).to.deep.equal([
          DEFAULT_ORGANIZATION_METADATA.name,
          DEFAULT_ORGANIZATION_METADATA.description,
          '',
          DEFAULT_ORGANIZATION_METADATA.image,
          DEFAULT_ORGANIZATION_METADATA.backgroundColor,
          DEFAULT_ORGANIZATION_METADATA.animationUrl,
        ]);
      });

      it('revert if external url is too long', async () => {
        const { organizationMetadataProvider } =
          await loadWithDefaultMetadata();

        await expect(
          organizationMetadataProvider.setDefaultMetadataField(
            2,
            'a'.repeat(129),
          ),
        ).to.be.revertedWith('External URL must be less than 128 characters');
      });
    });

    describe('Image', () => {
      it('can update image to max length', async () => {
        const { organizationMetadataProvider } =
          await loadWithDefaultMetadata();

        const updatedImage = 'i'.repeat(128);

        await organizationMetadataProvider.setDefaultMetadataField(
          3,
          updatedImage,
        );

        expect(
          await organizationMetadataProvider.getDefaultMetadata(),
        ).to.deep.equal([
          DEFAULT_ORGANIZATION_METADATA.name,
          DEFAULT_ORGANIZATION_METADATA.description,
          DEFAULT_ORGANIZATION_METADATA.externalUrl,
          updatedImage,
          DEFAULT_ORGANIZATION_METADATA.backgroundColor,
          DEFAULT_ORGANIZATION_METADATA.animationUrl,
        ]);
      });

      it('can clear image', async () => {
        const { organizationMetadataProvider } =
          await loadWithDefaultMetadata();

        await organizationMetadataProvider.setDefaultMetadataField(3, '');

        expect(
          await organizationMetadataProvider.getDefaultMetadata(),
        ).to.deep.equal([
          DEFAULT_ORGANIZATION_METADATA.name,
          DEFAULT_ORGANIZATION_METADATA.description,
          DEFAULT_ORGANIZATION_METADATA.externalUrl,
          '',
          DEFAULT_ORGANIZATION_METADATA.backgroundColor,
          DEFAULT_ORGANIZATION_METADATA.animationUrl,
        ]);
      });

      it('revert if image is too long', async () => {
        const { organizationMetadataProvider } =
          await loadWithDefaultMetadata();

        await expect(
          organizationMetadataProvider.setDefaultMetadataField(
            3,
            'a'.repeat(129),
          ),
        ).to.be.revertedWith('Image must be less than 128 characters');
      });
    });

    describe('Background Color', () => {
      it('can update background color to max length', async () => {
        const { organizationMetadataProvider } =
          await loadWithDefaultMetadata();

        const updatedBackgroundColor = '000002';

        await organizationMetadataProvider.setDefaultMetadataField(
          4,
          updatedBackgroundColor,
        );

        expect(
          await organizationMetadataProvider.getDefaultMetadata(),
        ).to.deep.equal([
          DEFAULT_ORGANIZATION_METADATA.name,
          DEFAULT_ORGANIZATION_METADATA.description,
          DEFAULT_ORGANIZATION_METADATA.externalUrl,
          DEFAULT_ORGANIZATION_METADATA.image,
          updatedBackgroundColor,
          DEFAULT_ORGANIZATION_METADATA.animationUrl,
        ]);
      });

      it('can clear background color', async () => {
        const { organizationMetadataProvider } =
          await loadWithDefaultMetadata();

        await organizationMetadataProvider.setDefaultMetadataField(4, '');

        expect(
          await organizationMetadataProvider.getDefaultMetadata(),
        ).to.deep.equal([
          DEFAULT_ORGANIZATION_METADATA.name,
          DEFAULT_ORGANIZATION_METADATA.description,
          DEFAULT_ORGANIZATION_METADATA.externalUrl,
          DEFAULT_ORGANIZATION_METADATA.image,
          '',
          DEFAULT_ORGANIZATION_METADATA.animationUrl,
        ]);
      });

      it('revert if background color is not 6 characters', async () => {
        const { organizationMetadataProvider } =
          await loadWithDefaultMetadata();

        await expect(
          organizationMetadataProvider.setDefaultMetadataField(4, '00000'),
        ).to.be.revertedWith(
          'Background color must be 6 characters or empty to remove',
        );
      });
    });

    describe('Animation URL', () => {
      it('can update animation url to max length', async () => {
        const { organizationMetadataProvider } =
          await loadWithDefaultMetadata();

        const updatedAnimationUrl = 'a'.repeat(128);

        await organizationMetadataProvider.setDefaultMetadataField(
          5,
          updatedAnimationUrl,
        );

        expect(
          await organizationMetadataProvider.getDefaultMetadata(),
        ).to.deep.equal([
          DEFAULT_ORGANIZATION_METADATA.name,
          DEFAULT_ORGANIZATION_METADATA.description,
          DEFAULT_ORGANIZATION_METADATA.externalUrl,
          DEFAULT_ORGANIZATION_METADATA.image,
          DEFAULT_ORGANIZATION_METADATA.backgroundColor,
          updatedAnimationUrl,
        ]);
      });

      it('can clear animation url', async () => {
        const { organizationMetadataProvider } =
          await loadWithDefaultMetadata();

        await organizationMetadataProvider.setDefaultMetadataField(5, '');

        expect(
          await organizationMetadataProvider.getDefaultMetadata(),
        ).to.deep.equal([
          DEFAULT_ORGANIZATION_METADATA.name,
          DEFAULT_ORGANIZATION_METADATA.description,
          DEFAULT_ORGANIZATION_METADATA.externalUrl,
          DEFAULT_ORGANIZATION_METADATA.image,
          DEFAULT_ORGANIZATION_METADATA.backgroundColor,
          '',
        ]);
      });

      it('revert if animation url is too long', async () => {
        const { organizationMetadataProvider } =
          await loadWithDefaultMetadata();

        await expect(
          organizationMetadataProvider.setDefaultMetadataField(
            5,
            'a'.repeat(129),
          ),
        ).to.be.revertedWith('Animation URL must be less than 128 characters');
      });
    });
  });

  describe('Set Custom Metadata', () => {
    it('can set custom metadata for org', async () => {
      const { organizationMetadataProvider, organizationNFT, otherAccount2 } =
        await loadWithDefaultMetadata();

      await organizationNFT.connect(otherAccount2).mint(otherAccount2);

      const updatedMetadata = {
        name: 'HYSTEAKS',
        description: 'The Most Advanced HYCHAIN Guardian Node Platform',
        externalUrl: 'https://www.hysteaks.com',
        image: 'https://www.hysteaks.com/image.png',
        backgroundColor: '000002',
        animationUrl: 'https://www.hysteaks.com/animation.mp4',
      };

      // Update the first org
      await expect(
        organizationMetadataProvider.setCustomMetadata(1, updatedMetadata),
      )
        .to.emit(organizationMetadataProvider, 'CustomMetadataUpdated')
        .withArgs(1);

      assertMetadata(await organizationMetadataProvider.getTokenMetadata(1), {
        name: updatedMetadata.name,
        description: updatedMetadata.description,
        external_url: updatedMetadata.externalUrl,
        image: updatedMetadata.image,
        background_color: updatedMetadata.backgroundColor,
        animation_url: updatedMetadata.animationUrl,
        ...DEFAULT_ATTRIBUTES,
      });

      const defaultMetadata =
        await organizationMetadataProvider.getCustomMetadata(1);

      expect(defaultMetadata).to.deep.equal([
        updatedMetadata.name,
        updatedMetadata.description,
        updatedMetadata.externalUrl,
        updatedMetadata.image,
        updatedMetadata.backgroundColor,
        updatedMetadata.animationUrl,
      ]);

      // Confirm the second org is unchanged and using the default metadata
      assertMetadata(await organizationMetadataProvider.getTokenMetadata(2), {
        ...EXPECTED_DEFAULT_ORGANIZATION_METADATA,
        attributes: [
          { trait_type: 'Whitelist Only', value: 'False' },
          { trait_type: 'Max Mints', value: 'No Limit' },
          { trait_type: 'Products Sold', value: '0' },
          { trait_type: 'Product Pass Mints', value: '0' },
        ],
      });
    });

    it('only org admin can set custom metadata', async () => {
      const { organizationMetadataProvider, otherAccount2 } =
        await loadWithPurchasedFlatRateSubscription();

      await expect(
        organizationMetadataProvider
          .connect(otherAccount2)
          .setCustomMetadata(1, DEFAULT_ORGANIZATION_METADATA),
      ).to.be.revertedWith('Not an admin of the organization');
    });
  });

  describe('Set Custom Metadata By Field', () => {
    it('only org admin can set custom metadata fields', async () => {
      const { organizationMetadataProvider, otherAccount2 } =
        await loadWithPurchasedFlatRateSubscription();

      await expect(
        organizationMetadataProvider
          .connect(otherAccount2)
          .setCustomMetadataField(1, 0, ''),
      ).to.be.revertedWith('Not an admin of the organization');
    });

    it('can update name', async () => {
      const { organizationMetadataProvider } = await loadWithDefaultMetadata();

      await expect(
        organizationMetadataProvider.setCustomMetadataField(
          1,
          0,
          'Updated Name',
        ),
      )
        .to.emit(organizationMetadataProvider, 'CustomMetadataUpdated')
        .withArgs(1);

      assertMetadata(await organizationMetadataProvider.getTokenMetadata(1), {
        ...EXPECTED_DEFAULT_ORGANIZATION_METADATA,
        ...DEFAULT_ATTRIBUTES,
        name: 'Updated Name',
      });
    });

    it('can update description', async () => {
      const { organizationMetadataProvider } = await loadWithDefaultMetadata();

      await expect(
        organizationMetadataProvider.setCustomMetadataField(
          1,
          1,
          'Updated Description',
        ),
      )
        .to.emit(organizationMetadataProvider, 'CustomMetadataUpdated')
        .withArgs(1);

      assertMetadata(await organizationMetadataProvider.getTokenMetadata(1), {
        ...EXPECTED_DEFAULT_ORGANIZATION_METADATA,
        ...DEFAULT_ATTRIBUTES,
        description: 'Updated Description',
      });
    });

    it('can update external url', async () => {
      const { organizationMetadataProvider } = await loadWithDefaultMetadata();

      await expect(
        organizationMetadataProvider.setCustomMetadataField(
          1,
          2,
          'Updated External URL',
        ),
      )
        .to.emit(organizationMetadataProvider, 'CustomMetadataUpdated')
        .withArgs(1);

      assertMetadata(await organizationMetadataProvider.getTokenMetadata(1), {
        ...EXPECTED_DEFAULT_ORGANIZATION_METADATA,
        ...DEFAULT_ATTRIBUTES,
        external_url: 'Updated External URL',
      });
    });

    it('can update image', async () => {
      const { organizationMetadataProvider } = await loadWithDefaultMetadata();

      await expect(
        organizationMetadataProvider.setCustomMetadataField(
          1,
          3,
          'Updated Image',
        ),
      )
        .to.emit(organizationMetadataProvider, 'CustomMetadataUpdated')
        .withArgs(1);

      assertMetadata(await organizationMetadataProvider.getTokenMetadata(1), {
        ...EXPECTED_DEFAULT_ORGANIZATION_METADATA,
        ...DEFAULT_ATTRIBUTES,
        image: 'Updated Image',
      });
    });

    it('can update background color', async () => {
      const { organizationMetadataProvider } = await loadWithDefaultMetadata();

      await expect(
        organizationMetadataProvider.setCustomMetadataField(1, 4, '999999'),
      )
        .to.emit(organizationMetadataProvider, 'CustomMetadataUpdated')
        .withArgs(1);

      assertMetadata(await organizationMetadataProvider.getTokenMetadata(1), {
        ...EXPECTED_DEFAULT_ORGANIZATION_METADATA,
        ...DEFAULT_ATTRIBUTES,
        background_color: '999999',
      });
    });

    it('can update animation url', async () => {
      const { organizationMetadataProvider } = await loadWithDefaultMetadata();

      await expect(
        organizationMetadataProvider.setCustomMetadataField(
          1,
          5,
          'https://www.hysteaks.com/animation.mp4',
        ),
      )
        .to.emit(organizationMetadataProvider, 'CustomMetadataUpdated')
        .withArgs(1);

      assertMetadata(await organizationMetadataProvider.getTokenMetadata(1), {
        ...EXPECTED_DEFAULT_ORGANIZATION_METADATA,
        ...DEFAULT_ATTRIBUTES,
        animation_url: 'https://www.hysteaks.com/animation.mp4',
      });
    });
  });
});
