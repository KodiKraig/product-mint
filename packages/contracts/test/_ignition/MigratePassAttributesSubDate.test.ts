import hre from 'hardhat';
import { expect } from 'chai';
import { loadWithPurchasedFlatRateSubscription } from '../manager/helpers';
import MigratePassAttributesSubDate from '../../ignition/modules/MigratePassAttributesSubDate';
import { assertMetadata, EMPTY_METADATA } from '../metadata/helpers';

describe('MigratePassAttributesSubDate', () => {
  it('should successfully migrate the pass attributes', async () => {
    const {
      passMetadataProvider,
      passAttributeProvider,
      contractRegistry,
      subscriptionEscrow,
    } = await loadWithPurchasedFlatRateSubscription();

    expect(await passMetadataProvider.attributeProvider()).to.equal(
      await passAttributeProvider.getAddress(),
    );

    const { attributeProvider: newAttributeProvider } =
      await hre.ignition.deploy(MigratePassAttributesSubDate, {
        parameters: {
          MigratePassAttributesSubDate: {
            contractRegistry: await contractRegistry.getAddress(),
            passMetadataProvider: await passMetadataProvider.getAddress(),
          },
        },
      });

    expect(await passMetadataProvider.attributeProvider()).to.equal(
      await newAttributeProvider.getAddress(),
    );

    // Verify the attributes are correct
    const [sub1] = await subscriptionEscrow.getSubscription(1, 1);

    assertMetadata(await passMetadataProvider.getTokenMetadata(1), {
      ...EMPTY_METADATA,
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
          display_type: 'date',
          trait_type: 'Subscription 1 Start',
          value: Number(sub1.startDate),
        },
        {
          display_type: 'date',
          trait_type: 'Subscription 1 End',
          value: Number(sub1.endDate),
        },
      ],
    });
  });
});
