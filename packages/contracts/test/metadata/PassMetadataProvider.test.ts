import { expect } from 'chai';
import { loadWithPurchasedFlatRateSubscription } from '../manager/helpers';

describe('PassMetadataProvider', () => {
  describe('Deployment', () => {
    it('should set the correct registry', async () => {
      const { passMetadataProvider, contractRegistry } =
        await loadWithPurchasedFlatRateSubscription();

      expect(await passMetadataProvider.registry()).to.equal(contractRegistry);
    });
  });
});
