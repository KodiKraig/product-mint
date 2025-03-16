import { expect } from 'chai';
import { loadWithPurchasedFlatRateSubscription } from '../manager/helpers';
import calculateInterfaceId from '../../utils/calculate-interface-id';

describe('OrganizationAttributeProvider', () => {
  it('Supports the IERC165 interface', async () => {
    const { organizationAttributeProvider } =
      await loadWithPurchasedFlatRateSubscription();

    expect(
      await organizationAttributeProvider.supportsInterface('0x01ffc9a7'),
    ).to.equal(true);
  });

  it('Supports the IAttributeProvider interface', async () => {
    const { organizationAttributeProvider } =
      await loadWithPurchasedFlatRateSubscription();

    const interfaceId = calculateInterfaceId(['attributesForToken(uint256)']);

    expect(
      await organizationAttributeProvider.supportsInterface(interfaceId),
    ).to.equal(true);
  });
});
