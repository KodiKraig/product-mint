// TODO: Remove all permission migration as all migrations are completed

// import { expect } from 'chai';
// import { ethers } from 'hardhat';
// import { hashPermissionId } from '../permission/helpers';
// import MigrateManagerPermissions from '../../ignition/modules/MigrateManagerPermissions';
// import { loadWithPurchasedFlatRateSubscription } from '../manager/helpers';
// import hre from 'hardhat';
// import { PurchaseManager } from '../../typechain-types';

// describe('MigrateManagerPermissions', () => {
//   it('should migrate permissions and maintain functionality', async () => {
//     // First deploy the old system and make a purchase
//     const {
//       purchaseManager: oldPurchaseManager,
//       contractRegistry,
//       permissionRegistry: oldPermissionRegistry,
//       otherAccount,
//       productPassNFT,
//     } = await loadWithPurchasedFlatRateSubscription();

//     // Verify initial state
//     expect(await oldPurchaseManager.passSupply()).to.equal(1);
//     expect(await contractRegistry.purchaseManager()).to.equal(
//       await oldPurchaseManager.getAddress(),
//     );
//     expect(
//       await oldPermissionRegistry.getOwnerPermissions(1, otherAccount),
//     ).to.deep.equal([
//       hashPermissionId('pass.wallet.spend'),
//       hashPermissionId('pass.purchase.additional'),
//       hashPermissionId('pass.subscription.renewal'),
//       hashPermissionId('pass.subscription.pricing'),
//       hashPermissionId('pass.subscription.quantity'),
//     ]);

//     // Deploy new system through the migration module
//     const { purchaseManager: newPurchaseManager } = await hre.ignition.deploy(
//       MigrateManagerPermissions,
//       {
//         parameters: {
//           MigrateManagerPermissions: {
//             contractRegistryAddress: await contractRegistry.getAddress(),
//             oldPurchaseManagerAddress: await oldPurchaseManager.getAddress(),
//           },
//         },
//       },
//     );

//     // Verify migration state
//     expect(await newPurchaseManager.passSupply()).to.equal(1);
//     expect(await contractRegistry.purchaseManager()).to.equal(
//       await newPurchaseManager.getAddress(),
//     );

//     // Get the new permission registry from the new purchase manager
//     const newPermissionRegistry = await ethers.getContractAt(
//       'PermissionRegistry',
//       await newPurchaseManager.permissionRegistry(),
//     );

//     // Confirm granting initial owner permissions works correctly
//     expect(
//       await newPermissionRegistry.getOwnerPermissions(1, otherAccount),
//     ).to.deep.equal([]);

//     // Verify functionality still works by attempting to purchase a new product pass
//     await (newPurchaseManager as unknown as PurchaseManager)
//       .connect(otherAccount)
//       .purchaseProducts({
//         to: otherAccount,
//         organizationId: 1,
//         productIds: [1],
//         pricingIds: [1],
//         quantities: [0],
//         discountIds: [],
//         couponCode: '',
//         airdrop: false,
//         pause: false,
//       });

//     // Verify the purchase was successful with the migration
//     expect(await oldPurchaseManager.passSupply()).to.equal(1);
//     expect(await newPurchaseManager.passSupply()).to.equal(2);
//     expect(await productPassNFT.ownerOf(2)).to.equal(otherAccount);
//     expect(
//       await newPermissionRegistry.getOwnerPermissions(1, otherAccount),
//     ).to.deep.equal([
//       hashPermissionId('pass.wallet.spend'),
//       hashPermissionId('pass.purchase.additional'),
//       hashPermissionId('pass.subscription.renewal'),
//       hashPermissionId('pass.subscription.pricing'),
//       hashPermissionId('pass.subscription.quantity'),
//     ]);
//   });
// });
