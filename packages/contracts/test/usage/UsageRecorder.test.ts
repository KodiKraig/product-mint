import { loadFixture } from '@nomicfoundation/hardhat-toolbox/network-helpers';
import { expect } from 'chai';
import hre from 'hardhat';
import calculateInterfaceId from '../../utils/calculate-interface-id';

describe('UsageRecorder', () => {
  async function deployUsageRecorder() {
    const [owner, otherAccount, account3] = await hre.ethers.getSigners();

    const ContractRegistry = await hre.ethers.getContractFactory(
      'ContractRegistry',
    );
    const contractRegistry = await ContractRegistry.deploy();

    const PermissionFactory = await hre.ethers.getContractFactory(
      'PermissionFactory',
    );
    const permissionFactory = await PermissionFactory.deploy();

    const PermissionRegistry = await hre.ethers.getContractFactory(
      'PermissionRegistry',
    );
    const permissionRegistry = await PermissionRegistry.deploy(
      contractRegistry,
      permissionFactory,
    );

    const PurchaseManager = await hre.ethers.getContractFactory(
      'PurchaseManager',
    );
    const purchaseManager = await PurchaseManager.deploy(
      contractRegistry,
      permissionRegistry,
    );

    const OrganizationAttributeProvider = await hre.ethers.getContractFactory(
      'OrganizationAttributeProvider',
    );
    const organizationAttributeProvider =
      await OrganizationAttributeProvider.deploy(contractRegistry);

    const OrganizationMetadataProvider = await hre.ethers.getContractFactory(
      'OrganizationMetadataProvider',
    );
    const organizationMetadataProvider =
      await OrganizationMetadataProvider.deploy(
        contractRegistry,
        organizationAttributeProvider,
      );

    const OrganizationNFT = await hre.ethers.getContractFactory(
      'OrganizationNFT',
    );
    const organizationNFT = await OrganizationNFT.deploy(
      organizationMetadataProvider,
    );

    const OrganizationAdmin = await hre.ethers.getContractFactory(
      'OrganizationAdmin',
    );
    const organizationAdmin = await OrganizationAdmin.deploy(contractRegistry);

    await organizationNFT.setMintOpen(true);

    const UsageRecorder = await hre.ethers.getContractFactory('UsageRecorder');
    const usageRecorder = await UsageRecorder.deploy(contractRegistry);

    await contractRegistry.setOrganizationNFT(organizationNFT);
    await contractRegistry.setUsageRecorder(usageRecorder);
    await contractRegistry.setPurchaseManager(purchaseManager);
    await contractRegistry.setOrgAdmin(organizationAdmin);

    return {
      organizationNFT,
      usageRecorder,
      purchaseManager,
      contractRegistry,
      organizationAdmin,
      owner,
      otherAccount,
      account3,
    };
  }

  describe('Deployment', () => {
    it('should set the correct organization contract', async () => {
      const { usageRecorder, contractRegistry } = await loadFixture(
        deployUsageRecorder,
      );

      expect(await usageRecorder.registry()).to.equal(contractRegistry);
    });
  });

  describe('ERC165', () => {
    it('should return true for the correct interface', async () => {
      const { usageRecorder } = await loadFixture(deployUsageRecorder);

      const interfaceId = calculateInterfaceId([
        'usageMeters(uint256)',
        'passUsages(uint256,uint256)',
        'totalMeterCount()',
        'createMeter(uint256,uint8)',
        'setMeterActive(uint256,bool)',
        'incrementMeter(uint256,uint256)',
        'increaseMeter(uint256,uint256,uint256)',
        'adjustMeter(uint256,uint256,uint256)',
        'processMeterPayment(uint256,uint256)',
        'getOrganizationMeters(uint256)',
        'isActiveOrgMeter(uint256)',
        'incrementMeterBatch(uint256,uint256[])',
        'increaseMeterBatch(uint256,uint256[],uint256[])',
      ]);

      expect(await usageRecorder.supportsInterface(interfaceId)).to.be.true;
    });

    it('should support the ERC165 interface', async () => {
      const { usageRecorder } = await loadFixture(deployUsageRecorder);

      const interfaceId = calculateInterfaceId(['supportsInterface(bytes4)']);

      expect(await usageRecorder.supportsInterface(interfaceId)).to.be.true;
    });
  });

  describe('Usage Meters', () => {
    it('only the meter processor can process a meter payment', async () => {
      const { usageRecorder, organizationNFT, owner, otherAccount } =
        await loadFixture(deployUsageRecorder);

      await organizationNFT.connect(owner).mint(owner.address);

      await usageRecorder.connect(owner).createMeter(1, 0);

      await expect(
        usageRecorder.connect(otherAccount).processMeterPayment(1, 0),
      ).to.be.revertedWith('Caller not authorized');
    });

    describe('Create new meters', () => {
      it('should create multiple meters for an organization', async () => {
        const { usageRecorder, organizationNFT, owner } = await loadFixture(
          deployUsageRecorder,
        );

        await organizationNFT.connect(owner).mint(owner.address);

        await expect(usageRecorder.connect(owner).createMeter(1, 0))
          .to.emit(usageRecorder, 'MeterCreated')
          .withArgs(1, 1);
        await expect(usageRecorder.connect(owner).createMeter(1, 1))
          .to.emit(usageRecorder, 'MeterCreated')
          .withArgs(1, 2);

        expect(await usageRecorder.usageMeters(1)).to.deep.equal([1, 0n, true]);
        expect(await usageRecorder.usageMeters(2)).to.deep.equal([1, 1n, true]);

        expect(await usageRecorder.getOrganizationMeters(1)).to.deep.equal([
          1n,
          2n,
        ]);
      });

      it('cannot create a new meter if the organization does not exist', async () => {
        const { usageRecorder, organizationNFT, owner } = await loadFixture(
          deployUsageRecorder,
        );

        await expect(
          usageRecorder.connect(owner).createMeter(1, 0),
        ).to.be.revertedWithCustomError(
          organizationNFT,
          'ERC721NonexistentToken',
        );
      });

      it('cannot create a new meter if the organization is not the owner', async () => {
        const { usageRecorder, organizationNFT, owner, otherAccount } =
          await loadFixture(deployUsageRecorder);

        await organizationNFT.connect(otherAccount).mint(otherAccount.address);

        await expect(
          usageRecorder.connect(owner).createMeter(1, 0),
        ).to.be.revertedWith('Not an admin of the organization');
      });
    });

    describe('Meter Active', () => {
      it('can toggle meter active as an owner', async () => {
        const { usageRecorder, organizationNFT, owner } = await loadFixture(
          deployUsageRecorder,
        );

        await organizationNFT.connect(owner).mint(owner.address);

        await usageRecorder.connect(owner).createMeter(1, 0);

        expect(await usageRecorder.usageMeters(1)).to.deep.equal([1, 0n, true]);

        await expect(usageRecorder.connect(owner).setMeterActive(1, false))
          .to.emit(usageRecorder, 'MeterActiveSet')
          .withArgs(1, 1, false);

        expect(await usageRecorder.usageMeters(1)).to.deep.equal([
          1,
          0n,
          false,
        ]);

        await expect(usageRecorder.connect(owner).setMeterActive(1, true))
          .to.emit(usageRecorder, 'MeterActiveSet')
          .withArgs(1, 1, true);

        expect(await usageRecorder.usageMeters(1)).to.deep.equal([1, 0n, true]);
      });

      it('can toggle meter active as an admin', async () => {
        const {
          usageRecorder,
          organizationAdmin,
          organizationNFT,
          owner,
          otherAccount,
        } = await loadFixture(deployUsageRecorder);

        await organizationNFT.connect(owner).mint(owner.address);

        await usageRecorder.connect(owner).createMeter(1, 0);

        await organizationAdmin.addAdmin(1, otherAccount.address);

        await expect(
          usageRecorder.connect(otherAccount).setMeterActive(1, false),
        )
          .to.emit(usageRecorder, 'MeterActiveSet')
          .withArgs(1, 1, false);

        expect(await usageRecorder.usageMeters(1)).to.deep.equal([
          1,
          0n,
          false,
        ]);
      });

      it('cannot set a meter to active if the meter does not exist', async () => {
        const { usageRecorder, owner } = await loadFixture(deployUsageRecorder);

        await expect(
          usageRecorder.connect(owner).setMeterActive(1, true),
        ).to.be.revertedWith('Meter does not exist for the organization');
      });

      it('cannot set the meter to active if the organization is not the owner or an admin', async () => {
        const { usageRecorder, organizationNFT, owner, otherAccount } =
          await loadFixture(deployUsageRecorder);

        await organizationNFT.connect(owner).mint(owner.address);

        await usageRecorder.connect(owner).createMeter(1, 0);

        await expect(
          usageRecorder.connect(otherAccount).setMeterActive(1, false),
        ).to.be.revertedWith('Not an admin of the organization');

        expect(await usageRecorder.usageMeters(1)).to.deep.equal([1, 0n, true]);
      });
    });

    describe('Increment Count Meter', () => {
      it('can increment an active meter as the owner', async () => {
        const { usageRecorder, organizationNFT, owner } = await loadFixture(
          deployUsageRecorder,
        );

        await organizationNFT.connect(owner).mint(owner.address);

        await usageRecorder.connect(owner).createMeter(1, 1);

        await expect(usageRecorder.connect(owner).incrementMeter(1, 1))
          .to.emit(usageRecorder, 'MeterUsageSet')
          .withArgs(1, 1, 1, 1n);

        expect(await usageRecorder.passUsages(1, 1)).to.equal(1n);

        await expect(usageRecorder.connect(owner).incrementMeter(1, 1))
          .to.emit(usageRecorder, 'MeterUsageSet')
          .withArgs(1, 1, 1, 2n);

        expect(await usageRecorder.passUsages(1, 1)).to.equal(2n);
      });

      it('can increment a meter as an admin', async () => {
        const {
          usageRecorder,
          organizationAdmin,
          organizationNFT,
          owner,
          otherAccount,
        } = await loadFixture(deployUsageRecorder);

        await organizationNFT.connect(owner).mint(owner.address);

        await usageRecorder.connect(owner).createMeter(1, 1);

        await organizationAdmin.addAdmin(1, otherAccount.address);

        await usageRecorder.connect(otherAccount).incrementMeter(1, 1);

        expect(await usageRecorder.passUsages(1, 1)).to.equal(1n);
      });

      it('cannot increment a meter if the meter is not active', async () => {
        const { usageRecorder, organizationNFT, owner } = await loadFixture(
          deployUsageRecorder,
        );

        await organizationNFT.connect(owner).mint(owner.address);

        await usageRecorder.connect(owner).createMeter(1, 1);

        await usageRecorder.connect(owner).setMeterActive(1, false);

        await expect(
          usageRecorder.connect(owner).incrementMeter(1, 1),
        ).to.be.revertedWith('Meter is not active');
      });

      it('cannot increment a meter if the meter is not the correct type', async () => {
        const { usageRecorder, organizationNFT, owner } = await loadFixture(
          deployUsageRecorder,
        );

        await organizationNFT.connect(owner).mint(owner.address);

        await usageRecorder.connect(owner).createMeter(1, 0);

        await expect(
          usageRecorder.connect(owner).incrementMeter(1, 1),
        ).to.be.revertedWith('Meter is not a count meter');
      });

      it('cannot increment a meter if the caller is not the owner or an admin', async () => {
        const { usageRecorder, organizationNFT, owner, otherAccount } =
          await loadFixture(deployUsageRecorder);

        await organizationNFT.connect(owner).mint(owner.address);

        await usageRecorder.connect(owner).createMeter(1, 0);

        await expect(
          usageRecorder.connect(otherAccount).incrementMeter(1, 1),
        ).to.be.revertedWith('Not an admin of the organization');
      });
    });

    describe('Increment Count Meter Batch', () => {
      it('can increment an active meter as the owner', async () => {
        const { usageRecorder, organizationNFT, owner } = await loadFixture(
          deployUsageRecorder,
        );

        await organizationNFT.connect(owner).mint(owner.address);

        await usageRecorder.connect(owner).createMeter(1, 1);

        await expect(
          usageRecorder.connect(owner).incrementMeterBatch(1, [1, 2, 3]),
        )
          .to.emit(usageRecorder, 'MeterUsageSet')
          .withArgs(1, 1, 1, 1n)
          .to.emit(usageRecorder, 'MeterUsageSet')
          .withArgs(1, 1, 2, 1n)
          .to.emit(usageRecorder, 'MeterUsageSet')
          .withArgs(1, 1, 3, 1n);

        expect(await usageRecorder.passUsages(1, 1)).to.equal(1n);
        expect(await usageRecorder.passUsages(1, 2)).to.equal(1n);
        expect(await usageRecorder.passUsages(1, 3)).to.equal(1n);
      });

      it('can increment a meter as an admin', async () => {
        const {
          usageRecorder,
          organizationAdmin,
          organizationNFT,
          owner,
          otherAccount,
        } = await loadFixture(deployUsageRecorder);

        await organizationNFT.connect(owner).mint(owner.address);

        await usageRecorder.connect(owner).createMeter(1, 1);

        await organizationAdmin.addAdmin(1, otherAccount.address);

        await usageRecorder
          .connect(otherAccount)
          .incrementMeterBatch(1, [1, 2, 3]);

        expect(await usageRecorder.passUsages(1, 1)).to.equal(1n);
        expect(await usageRecorder.passUsages(1, 2)).to.equal(1n);
        expect(await usageRecorder.passUsages(1, 3)).to.equal(1n);
      });

      it('cannot increment a meter if the meter is not active', async () => {
        const { usageRecorder, organizationNFT, owner } = await loadFixture(
          deployUsageRecorder,
        );

        await organizationNFT.connect(owner).mint(owner.address);

        await usageRecorder.connect(owner).createMeter(1, 1);

        await usageRecorder.connect(owner).setMeterActive(1, false);

        await expect(
          usageRecorder.connect(owner).incrementMeterBatch(1, [1, 2, 3]),
        ).to.be.revertedWith('Meter is not active');
      });

      it('cannot increment a meter if the meter is not the correct type', async () => {
        const { usageRecorder, organizationNFT, owner } = await loadFixture(
          deployUsageRecorder,
        );

        await organizationNFT.connect(owner).mint(owner.address);

        await usageRecorder.connect(owner).createMeter(1, 0);

        await expect(
          usageRecorder.connect(owner).incrementMeterBatch(1, [1, 2, 3]),
        ).to.be.revertedWith('Meter is not a count meter');
      });

      it('cannot increment a meter if the caller is not the owner or an admin', async () => {
        const { usageRecorder, organizationNFT, owner, otherAccount } =
          await loadFixture(deployUsageRecorder);

        await organizationNFT.connect(owner).mint(owner.address);

        await usageRecorder.connect(owner).createMeter(1, 0);

        await expect(
          usageRecorder.connect(otherAccount).incrementMeterBatch(1, [1, 2, 3]),
        ).to.be.revertedWith('Not an admin of the organization');
      });
    });

    describe('Increase Sum Meter', () => {
      it('can increase a sum meter as the owner', async () => {
        const { usageRecorder, organizationNFT, owner } = await loadFixture(
          deployUsageRecorder,
        );

        await organizationNFT.connect(owner).mint(owner.address);

        await usageRecorder.connect(owner).createMeter(1, 0);

        await expect(usageRecorder.connect(owner).increaseMeter(1, 1, 100))
          .to.emit(usageRecorder, 'MeterUsageSet')
          .withArgs(1, 1, 1, 100n);

        expect(await usageRecorder.passUsages(1, 1)).to.equal(100n);

        await expect(usageRecorder.connect(owner).increaseMeter(1, 1, 150))
          .to.emit(usageRecorder, 'MeterUsageSet')
          .withArgs(1, 1, 1, 250n);

        expect(await usageRecorder.passUsages(1, 1)).to.equal(250n);
      });

      it('can increase a sum meter as an admin', async () => {
        const {
          usageRecorder,
          organizationAdmin,
          organizationNFT,
          owner,
          otherAccount,
        } = await loadFixture(deployUsageRecorder);

        await organizationNFT.connect(owner).mint(owner.address);

        await usageRecorder.connect(owner).createMeter(1, 0);

        await organizationAdmin.addAdmin(1, otherAccount.address);

        await expect(
          usageRecorder.connect(otherAccount).increaseMeter(1, 1, 100),
        )
          .to.emit(usageRecorder, 'MeterUsageSet')
          .withArgs(1, 1, 1, 100n);

        expect(await usageRecorder.passUsages(1, 1)).to.equal(100n);
      });

      it('cannot increase a sum meter if the meter is not a sum meter', async () => {
        const { usageRecorder, organizationNFT, owner } = await loadFixture(
          deployUsageRecorder,
        );

        await organizationNFT.connect(owner).mint(owner.address);

        await usageRecorder.connect(owner).createMeter(1, 1);

        await expect(
          usageRecorder.connect(owner).increaseMeter(1, 1, 100),
        ).to.be.revertedWith('Meter is not a sum meter');
      });

      it('cannot increase a sum meter if the caller is not the owner or an admin', async () => {
        const { usageRecorder, organizationNFT, owner, otherAccount } =
          await loadFixture(deployUsageRecorder);

        await organizationNFT.connect(owner).mint(owner.address);

        await usageRecorder.connect(owner).createMeter(1, 0);

        await expect(
          usageRecorder.connect(otherAccount).increaseMeter(1, 1, 100),
        ).to.be.revertedWith('Not an admin of the organization');
      });

      it('cannot increase a sum meter if the meter is not active', async () => {
        const { usageRecorder, organizationNFT, owner } = await loadFixture(
          deployUsageRecorder,
        );

        await organizationNFT.connect(owner).mint(owner.address);

        await usageRecorder.connect(owner).createMeter(1, 0);

        await usageRecorder.connect(owner).setMeterActive(1, false);

        await expect(
          usageRecorder.connect(owner).increaseMeter(1, 1, 100),
        ).to.be.revertedWith('Meter is not active');
      });
    });

    describe('Increase Sum Meter Batch', () => {
      it('can increase a sum meter as the owner', async () => {
        const { usageRecorder, organizationNFT, owner } = await loadFixture(
          deployUsageRecorder,
        );

        await organizationNFT.connect(owner).mint(owner.address);

        await usageRecorder.connect(owner).createMeter(1, 0);

        await expect(
          usageRecorder
            .connect(owner)
            .increaseMeterBatch(1, [1, 2, 3], [100, 200, 300]),
        )
          .to.emit(usageRecorder, 'MeterUsageSet')
          .withArgs(1, 1, 1, 100n)
          .to.emit(usageRecorder, 'MeterUsageSet')
          .withArgs(1, 1, 2, 200n)
          .to.emit(usageRecorder, 'MeterUsageSet')
          .withArgs(1, 1, 3, 300n);

        expect(await usageRecorder.passUsages(1, 1)).to.equal(100n);
        expect(await usageRecorder.passUsages(1, 2)).to.equal(200n);
        expect(await usageRecorder.passUsages(1, 3)).to.equal(300n);
      });

      it('can increase a sum meter as an admin', async () => {
        const {
          usageRecorder,
          organizationAdmin,
          organizationNFT,
          owner,
          otherAccount,
        } = await loadFixture(deployUsageRecorder);

        await organizationNFT.connect(owner).mint(owner.address);

        await usageRecorder.connect(owner).createMeter(1, 0);

        await organizationAdmin.addAdmin(1, otherAccount.address);

        await expect(
          usageRecorder
            .connect(otherAccount)
            .increaseMeterBatch(1, [1, 2, 3], [100, 200, 300]),
        )
          .to.emit(usageRecorder, 'MeterUsageSet')
          .withArgs(1, 1, 1, 100n)
          .to.emit(usageRecorder, 'MeterUsageSet')
          .withArgs(1, 1, 2, 200n)
          .to.emit(usageRecorder, 'MeterUsageSet')
          .withArgs(1, 1, 3, 300n);

        expect(await usageRecorder.passUsages(1, 1)).to.equal(100n);
        expect(await usageRecorder.passUsages(1, 2)).to.equal(200n);
        expect(await usageRecorder.passUsages(1, 3)).to.equal(300n);
      });

      it('cannot increase a sum meter if the meter is not a sum meter', async () => {
        const { usageRecorder, organizationNFT, owner } = await loadFixture(
          deployUsageRecorder,
        );

        await organizationNFT.connect(owner).mint(owner.address);

        await usageRecorder.connect(owner).createMeter(1, 1);

        await expect(
          usageRecorder
            .connect(owner)
            .increaseMeterBatch(1, [1, 2, 3], [100, 200, 300]),
        ).to.be.revertedWith('Meter is not a sum meter');
      });

      it('cannot increase a sum meter if the caller is not the owner or an admin', async () => {
        const { usageRecorder, organizationNFT, owner, otherAccount } =
          await loadFixture(deployUsageRecorder);

        await organizationNFT.connect(owner).mint(owner.address);

        await usageRecorder.connect(owner).createMeter(1, 0);

        await expect(
          usageRecorder
            .connect(otherAccount)
            .increaseMeterBatch(1, [1, 2, 3], [100, 200, 300]),
        ).to.be.revertedWith('Not an admin of the organization');
      });

      it('cannot increase a sum meter if the meter is not active', async () => {
        const { usageRecorder, organizationNFT, owner } = await loadFixture(
          deployUsageRecorder,
        );

        await organizationNFT.connect(owner).mint(owner.address);

        await usageRecorder.connect(owner).createMeter(1, 0);

        await usageRecorder.connect(owner).setMeterActive(1, false);

        await expect(
          usageRecorder
            .connect(owner)
            .increaseMeterBatch(1, [1, 2, 3], [100, 200, 300]),
        ).to.be.revertedWith('Meter is not active');
      });

      it('revert if token IDs are not provided', async () => {
        const { usageRecorder, organizationNFT, owner } = await loadFixture(
          deployUsageRecorder,
        );

        await organizationNFT.connect(owner).mint(owner.address);

        await usageRecorder.connect(owner).createMeter(1, 0);

        await expect(
          usageRecorder
            .connect(owner)
            .increaseMeterBatch(1, [], [100, 200, 300]),
        ).to.be.revertedWith('No token IDs provided');
      });

      it('revert if token IDs and values are not the same length', async () => {
        const { usageRecorder, organizationNFT, owner } = await loadFixture(
          deployUsageRecorder,
        );

        await organizationNFT.connect(owner).mint(owner.address);

        await usageRecorder.connect(owner).createMeter(1, 0);

        await expect(
          usageRecorder
            .connect(owner)
            .increaseMeterBatch(1, [1, 2, 3], [100, 200]),
        ).to.be.revertedWith('Token IDs and values must be the same length');
      });
    });

    describe('Adjust Meter', () => {
      it('can adjust a SUM meter as the owner', async () => {
        const { usageRecorder, organizationNFT, owner } = await loadFixture(
          deployUsageRecorder,
        );

        await organizationNFT.connect(owner).mint(owner.address);

        await usageRecorder.connect(owner).createMeter(1, 0);

        await usageRecorder.connect(owner).increaseMeter(1, 1, 100);

        expect(await usageRecorder.passUsages(1, 1)).to.equal(100n);

        await expect(usageRecorder.connect(owner).adjustMeter(1, 1, 50))
          .to.emit(usageRecorder, 'MeterUsageSet')
          .withArgs(1, 1, 1, 50n);

        expect(await usageRecorder.passUsages(1, 1)).to.equal(50n);
      });

      it('can adjust a COUNT meter as the owner', async () => {
        const { usageRecorder, organizationNFT, owner } = await loadFixture(
          deployUsageRecorder,
        );

        await organizationNFT.connect(owner).mint(owner.address);

        await usageRecorder.connect(owner).createMeter(1, 1);

        await usageRecorder.connect(owner).incrementMeter(1, 1);

        expect(await usageRecorder.passUsages(1, 1)).to.equal(1n);

        await expect(usageRecorder.connect(owner).adjustMeter(1, 1, 50))
          .to.emit(usageRecorder, 'MeterUsageSet')
          .withArgs(1, 1, 1, 50n);

        expect(await usageRecorder.passUsages(1, 1)).to.equal(50n);
      });

      it('can adjust a SUM meter as an admin', async () => {
        const {
          usageRecorder,
          organizationAdmin,
          organizationNFT,
          owner,
          otherAccount,
        } = await loadFixture(deployUsageRecorder);

        await organizationNFT.connect(owner).mint(owner.address);

        await usageRecorder.connect(owner).createMeter(1, 0);

        await organizationAdmin.addAdmin(1, otherAccount.address);

        await expect(usageRecorder.connect(otherAccount).adjustMeter(1, 1, 50))
          .to.emit(usageRecorder, 'MeterUsageSet')
          .withArgs(1, 1, 1, 50n);

        expect(await usageRecorder.passUsages(1, 1)).to.equal(50n);
      });

      it('can adjust a COUNT meter as an admin', async () => {
        const {
          usageRecorder,
          organizationAdmin,
          organizationNFT,
          owner,
          otherAccount,
        } = await loadFixture(deployUsageRecorder);

        await organizationNFT.connect(owner).mint(owner.address);

        await usageRecorder.connect(owner).createMeter(1, 1);

        await organizationAdmin.addAdmin(1, otherAccount.address);

        await expect(usageRecorder.connect(otherAccount).adjustMeter(1, 1, 50))
          .to.emit(usageRecorder, 'MeterUsageSet')
          .withArgs(1, 1, 1, 50n);

        expect(await usageRecorder.passUsages(1, 1)).to.equal(50n);
      });

      it('cannot adjust a meter if the meter is not active', async () => {
        const { usageRecorder, organizationNFT, owner } = await loadFixture(
          deployUsageRecorder,
        );

        await organizationNFT.connect(owner).mint(owner.address);

        await usageRecorder.connect(owner).createMeter(1, 0);

        await usageRecorder.connect(owner).setMeterActive(1, false);

        await expect(
          usageRecorder.connect(owner).adjustMeter(1, 1, 50),
        ).to.be.revertedWith('Meter is not active');
      });

      it('cannot adjust a meter if the caller is not the owner or an admin', async () => {
        const { usageRecorder, organizationNFT, owner, otherAccount } =
          await loadFixture(deployUsageRecorder);

        await organizationNFT.connect(owner).mint(owner.address);

        await usageRecorder.connect(owner).createMeter(1, 0);

        await expect(
          usageRecorder.connect(otherAccount).adjustMeter(1, 1, 50),
        ).to.be.revertedWith('Not an admin of the organization');
      });
    });

    describe('Get Organization Meters', () => {
      it('can get all meters for an organization', async () => {
        const { usageRecorder, organizationNFT, owner, otherAccount } =
          await loadFixture(deployUsageRecorder);

        await organizationNFT.connect(owner).mint(owner.address);

        await usageRecorder.connect(owner).createMeter(1, 0);

        await usageRecorder.connect(owner).createMeter(1, 1);

        await usageRecorder.connect(owner).createMeter(1, 0);

        await organizationNFT.connect(otherAccount).mint(otherAccount.address);

        await usageRecorder.connect(otherAccount).createMeter(2, 0);

        await usageRecorder.connect(otherAccount).createMeter(2, 1);

        expect(await usageRecorder.getOrganizationMeters(1)).to.deep.equal([
          1n,
          2n,
          3n,
        ]);
        expect(await usageRecorder.getOrganizationMeters(2)).to.deep.equal([
          4n,
          5n,
        ]);
      });

      it('returns an empty array if the org does not exist', async () => {
        const { usageRecorder } = await loadFixture(deployUsageRecorder);

        expect(await usageRecorder.getOrganizationMeters(1)).to.deep.equal([]);
      });

      it('returns an empty array if the org has no meters', async () => {
        const { usageRecorder, organizationNFT, owner } = await loadFixture(
          deployUsageRecorder,
        );

        await organizationNFT.connect(owner).mint(owner.address);

        expect(await usageRecorder.getOrganizationMeters(1)).to.deep.equal([]);
      });
    });

    describe('Is Active Org Meter', () => {
      it('returns true if the meter is active for the org', async () => {
        const { usageRecorder, organizationNFT, owner } = await loadFixture(
          deployUsageRecorder,
        );

        await organizationNFT.connect(owner).mint(owner.address);

        await usageRecorder.connect(owner).createMeter(1, 0);

        expect(await usageRecorder.isActiveOrgMeter(1)).to.be.true;
      });

      it('returns false if the meter is not active for the org', async () => {
        const { usageRecorder, organizationNFT, owner } = await loadFixture(
          deployUsageRecorder,
        );

        await organizationNFT.connect(owner).mint(owner.address);

        await usageRecorder.connect(owner).createMeter(1, 0);

        expect(await usageRecorder.isActiveOrgMeter(2)).to.be.false;
      });

      it('returns false if the meter is not active', async () => {
        const { usageRecorder, organizationNFT, owner } = await loadFixture(
          deployUsageRecorder,
        );

        await organizationNFT.connect(owner).mint(owner.address);

        await usageRecorder.connect(owner).createMeter(1, 0);

        await usageRecorder.connect(owner).setMeterActive(1, false);

        expect(await usageRecorder.isActiveOrgMeter(1)).to.be.false;
      });

      it('returns false if the meter does not exist for the org', async () => {
        const { usageRecorder, organizationNFT, owner } = await loadFixture(
          deployUsageRecorder,
        );

        await organizationNFT.connect(owner).mint(owner.address);

        await usageRecorder.connect(owner).createMeter(1, 0);

        expect(await usageRecorder.isActiveOrgMeter(2)).to.be.false;
      });

      it('returns false if the meter does not exist', async () => {
        const { usageRecorder } = await loadFixture(deployUsageRecorder);

        expect(await usageRecorder.isActiveOrgMeter(1)).to.be.false;
      });
    });
  });
});
