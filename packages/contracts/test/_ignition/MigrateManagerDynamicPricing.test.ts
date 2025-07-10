import hre from 'hardhat';
import { loadWithPurchasedFlatRateSubscription } from '../manager/helpers';
import { expect } from 'chai';
import MigrateManagerDynamicPricing from '../../ignition/modules/MigrateManagerDynamicPricing';
import { PurchaseManager } from '../../typechain-types';
import { hashPermissionId } from '../permission/helpers';

describe('MigrateManagerDynamicPricing', () => {
  it('should successfully migrate the purchase manager', async () => {
    // First deploy the old system and make a purchase
    const {
      purchaseManager: oldPurchaseManager,
      contractRegistry,
      otherAccount,
      productPassNFT,
      permissionRegistry,
    } = await loadWithPurchasedFlatRateSubscription();

    // Verify initial state
    expect(await oldPurchaseManager.passSupply()).to.equal(1);
    expect(await contractRegistry.purchaseManager()).to.equal(
      await oldPurchaseManager.getAddress(),
    );

    // Deploy the new purchase manager with the dynamic pricing registry
    const { purchaseManager: newPurchaseManager, dynamicPriceRegistry } =
      await hre.ignition.deploy(MigrateManagerDynamicPricing, {
        parameters: {
          MigrateManagerDynamicPricing: {
            contractRegistry: await contractRegistry.getAddress(),
            oldPurchaseManager: await oldPurchaseManager.getAddress(),
            permissionRegistry: await oldPurchaseManager.permissionRegistry(),
          },
        },
      });

    // Verify migration state
    expect(await newPurchaseManager.passSupply()).to.equal(1);
    expect(await contractRegistry.purchaseManager()).to.equal(
      await newPurchaseManager.getAddress(),
    );
    expect(await newPurchaseManager.dynamicPriceRegistry()).to.equal(
      await dynamicPriceRegistry.getAddress(),
    );
    expect(await newPurchaseManager.permissionRegistry()).to.equal(
      await permissionRegistry.getAddress(),
    );
    expect(await newPurchaseManager.registry()).to.equal(
      await contractRegistry.getAddress(),
    );

    // Verify functionality still works by attempting to purchase a new product pass
    await (newPurchaseManager as unknown as PurchaseManager)
      .connect(otherAccount)
      .purchaseProducts({
        to: otherAccount,
        organizationId: 1,
        productIds: [1],
        pricingIds: [1],
        quantities: [0],
        discountIds: [],
        couponCode: '',
        airdrop: false,
        pause: false,
      });

    // Verify the purchase was successful with the migration
    expect(await oldPurchaseManager.passSupply()).to.equal(1);
    expect(await newPurchaseManager.passSupply()).to.equal(2);
    expect(await productPassNFT.ownerOf(2)).to.equal(otherAccount);

    // Verify the permissions are the same
    expect(
      await permissionRegistry.getOwnerPermissions(1, otherAccount),
    ).to.deep.equal([
      hashPermissionId('pass.wallet.spend'),
      hashPermissionId('pass.purchase.additional'),
      hashPermissionId('pass.subscription.renewal'),
      hashPermissionId('pass.subscription.pricing'),
      hashPermissionId('pass.subscription.quantity'),
    ]);
  });
});
