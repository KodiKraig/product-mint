import { expect } from 'chai';
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
            trait_type: 'Organization ID',
            value: 1,
          },
          {
            trait_type: 'Product 1',
            value: 'Product 1',
          },
        ],
      });
    });
  });
});
