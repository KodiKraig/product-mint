import { expect } from 'chai';
import { loadWithPurchasedFlatRateSubscription } from '../manager/helpers';
import calculateInterfaceId from '../../utils/calculate-interface-id';

describe('PassAttributeProvider', () => {
  it('Supports the IERC165 interface', async () => {
    const { passAttributeProvider } =
      await loadWithPurchasedFlatRateSubscription();

    expect(
      await passAttributeProvider.supportsInterface('0x01ffc9a7'),
    ).to.equal(true);
  });

  it('Supports the IAttributeProvider interface', async () => {
    const { passAttributeProvider } =
      await loadWithPurchasedFlatRateSubscription();

    const interfaceId = calculateInterfaceId(['attributesForToken(uint256)']);

    expect(await passAttributeProvider.supportsInterface(interfaceId)).to.equal(
      true,
    );
  });
});
