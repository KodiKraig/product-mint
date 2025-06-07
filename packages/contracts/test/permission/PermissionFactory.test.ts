import { expect } from 'chai';
import { loadFixture } from '@nomicfoundation/hardhat-toolbox/network-helpers';
import hre, { ethers } from 'hardhat';
import { assertPermission, hashPermissionId } from './helpers';

describe('PermissionFactory', () => {
  async function deployPermissionFactory() {
    const [owner, otherAccount] = await ethers.getSigners();

    const PermissionFactory = await hre.ethers.getContractFactory(
      'PermissionFactory',
    );
    const permissionFactory = await PermissionFactory.deploy();

    // Get the deployment block to get the timestamp
    const deploymentBlock = permissionFactory.deploymentTransaction();
    const blockNumber = deploymentBlock?.blockNumber;
    const block = await ethers.provider.getBlock(blockNumber!);
    const deploymentTimestamp = block?.timestamp;

    return { owner, otherAccount, permissionFactory, deploymentTimestamp };
  }

  describe('Deployment', () => {
    it('should deploy the permission factory with core permissions', async () => {
      const { permissionFactory, deploymentTimestamp } = await loadFixture(
        deployPermissionFactory,
      );

      expect(await permissionFactory.getAddress()).to.not.be.undefined;

      const allPermissionIds = await permissionFactory.getAllPermissionIds();
      expect(allPermissionIds.length).to.equal(6);
      expect(allPermissionIds).to.deep.equal([
        hashPermissionId('pass.wallet.spend'),
        hashPermissionId('pass.purchase.mint'),
        hashPermissionId('pass.purchase.additional'),
        hashPermissionId('pass.subscription.renewal'),
        hashPermissionId('pass.subscription.pricing'),
        hashPermissionId('pass.subscription.quantity'),
      ]);

      const allPermissions = await permissionFactory.getAllPermissions();
      expect(allPermissions.length).to.equal(6);

      assertPermission({
        test: allPermissions[0],
        expected: {
          name: 'pass.wallet.spend',
          description:
            'Approve an organization to spend funds from your wallet',
          isActive: true,
          createdAt: deploymentTimestamp!,
        },
      });
      assertPermission({
        test: allPermissions[1],
        expected: {
          name: 'pass.purchase.mint',
          description: 'Mint a new Product Pass NFT',
          isActive: true,
          createdAt: deploymentTimestamp!,
        },
      });
      assertPermission({
        test: allPermissions[2],
        expected: {
          name: 'pass.purchase.additional',
          description: 'Purchase additional products',
          isActive: true,
          createdAt: deploymentTimestamp!,
        },
      });
      assertPermission({
        test: allPermissions[3],
        expected: {
          name: 'pass.subscription.renewal',
          description: 'Automatically renew expired subscriptions',
          isActive: true,
          createdAt: deploymentTimestamp!,
        },
      });
      assertPermission({
        test: allPermissions[4],
        expected: {
          name: 'pass.subscription.pricing',
          description: 'Update or downgrade the pricing for a subscription',
          isActive: true,
          createdAt: deploymentTimestamp!,
        },
      });
      assertPermission({
        test: allPermissions[5],
        expected: {
          name: 'pass.subscription.quantity',
          description: 'Change the quantity for a TIERED subscription',
          isActive: true,
          createdAt: deploymentTimestamp!,
        },
      });
    });
  });
});
