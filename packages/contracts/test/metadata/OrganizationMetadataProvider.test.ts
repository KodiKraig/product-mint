import { expect } from 'chai';
import { loadWithPurchasedFlatRateSubscription } from '../manager/helpers';

describe('OrganizationMetadataProvider', () => {
  describe('Deployment', () => {
    it('should set the correct registry', async () => {
      const { organizationMetadataProvider, contractRegistry } =
        await loadWithPurchasedFlatRateSubscription();

      expect(await organizationMetadataProvider.registry()).to.equal(
        contractRegistry,
      );
    });
  });
});
