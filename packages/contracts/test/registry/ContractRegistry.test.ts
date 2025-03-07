import { loadFixture } from '@nomicfoundation/hardhat-toolbox/network-helpers';
import { expect } from 'chai';
import hre from 'hardhat';
import calculateInterfaceId from '../../utils/calculate-interface-id';
import { ContractRegistry } from '../../typechain-types';

describe('ContractRegistry', () => {
  async function deployContractRegistry() {
    const [owner, otherAccount] = await hre.ethers.getSigners();

    const ContractRegistry =
      await hre.ethers.getContractFactory('ContractRegistry');
    const contractRegistry = await ContractRegistry.deploy();

    const OrganizationMetadataProvider = await hre.ethers.getContractFactory(
      'OrganizationMetadataProvider',
    );
    const organizationMetadataProvider =
      await OrganizationMetadataProvider.deploy(contractRegistry);

    const OrganizationNFT =
      await hre.ethers.getContractFactory('OrganizationNFT');
    const organizationNFT = await OrganizationNFT.deploy(
      organizationMetadataProvider,
    );

    const PassMetadataProvider = await hre.ethers.getContractFactory(
      'PassMetadataProvider',
    );
    const passMetadataProvider =
      await PassMetadataProvider.deploy(contractRegistry);

    const ProductPassNFT =
      await hre.ethers.getContractFactory('ProductPassNFT');
    const productPassNFT = await ProductPassNFT.deploy(
      contractRegistry,
      passMetadataProvider,
    );

    return {
      contractRegistry,
      owner,
      otherAccount,
      organizationNFT,
      productPassNFT,
    };
  }

  describe('Deployment', () => {
    it('should set the owner', async () => {
      const { contractRegistry, owner } = await loadFixture(
        deployContractRegistry,
      );

      expect(await contractRegistry.owner()).to.equal(owner);
    });
  });

  describe('Supports Interface', () => {
    it('should support the IContractRegistry interface', async () => {
      const { contractRegistry } = await loadFixture(deployContractRegistry);

      const interfaceId = calculateInterfaceId([
        'productPassNFT()',
        'organizationNFT()',
        'productRegistry()',
        'pricingRegistry()',
        'orgAdmin()',
        'couponRegistry()',
        'purchaseRegistry()',
        'productTransferOracle()',
        'subscriptionTransferOracle()',
        'pricingCalculator()',
        'subscriptionEscrow()',
        'purchaseManager()',
        'paymentEscrow()',
        'usageRecorder()',
      ]);

      expect(await contractRegistry.supportsInterface(interfaceId)).to.be.true;
    });
  });

  describe('Only Owner', () => {
    async function assertOnlyOwner(
      setContractFn: (
        registry: ContractRegistry,
        otherAccount: any,
      ) => Promise<any>,
    ) {
      const { contractRegistry, otherAccount } = await loadFixture(
        deployContractRegistry,
      );

      await expect(setContractFn(contractRegistry, otherAccount))
        .to.be.revertedWithCustomError(
          contractRegistry,
          'OwnableUnauthorizedAccount',
        )
        .withArgs(otherAccount.address);
    }

    it('only the owner can set contracts', async () => {
      // Manager

      await assertOnlyOwner((registry, account) =>
        registry.connect(account).setPurchaseManager(registry),
      );

      // Admin

      await assertOnlyOwner((registry, account) =>
        registry.connect(account).setOrgAdmin(registry),
      );

      // NFTs

      await assertOnlyOwner((registry, account) =>
        registry.connect(account).setProductPassNFT(registry),
      );

      await assertOnlyOwner((registry, account) =>
        registry.connect(account).setOrganizationNFT(registry),
      );

      // Registry

      await assertOnlyOwner((registry, account) =>
        registry.connect(account).setProductRegistry(registry),
      );

      await assertOnlyOwner((registry, account) =>
        registry.connect(account).setPricingRegistry(registry),
      );

      await assertOnlyOwner((registry, account) =>
        registry.connect(account).setPurchaseRegistry(registry),
      );

      await assertOnlyOwner((registry, account) =>
        registry.connect(account).setCouponRegistry(registry),
      );

      // Calculator

      await assertOnlyOwner((registry, account) =>
        registry.connect(account).setPricingCalculator(registry),
      );

      // Oracles

      await assertOnlyOwner((registry, account) =>
        registry.connect(account).setProductTransferOracle(registry),
      );

      await assertOnlyOwner((registry, account) =>
        registry.connect(account).setSubscriptionTransferOracle(registry),
      );

      // Escrow

      await assertOnlyOwner((registry, account) =>
        registry.connect(account).setSubscriptionEscrow(registry),
      );

      await assertOnlyOwner((registry, account) =>
        registry.connect(account).setPaymentEscrow(registry),
      );

      // Usage recorder

      await assertOnlyOwner((registry, account) =>
        registry.connect(account).setUsageRecorder(registry),
      );
    });
  });

  describe('Assert Interface Checks', () => {
    it('should revert if the contract does not implement the interface', async () => {
      const { contractRegistry, organizationNFT, productPassNFT } =
        await loadFixture(deployContractRegistry);

      // Manager

      await expect(
        contractRegistry.setPurchaseManager(contractRegistry),
      ).to.be.revertedWith('Must implement IPurchaseManager');

      // Admin

      await expect(
        contractRegistry.setOrgAdmin(contractRegistry),
      ).to.be.revertedWith('Must implement IOrganizationAdmin');

      // NFTs

      await expect(
        contractRegistry.setProductPassNFT(contractRegistry),
      ).to.be.revertedWith('Must implement IERC721');
      await expect(
        contractRegistry.setProductPassNFT(organizationNFT),
      ).to.be.revertedWith('Must implement IProductPassNFT');

      await expect(
        contractRegistry.setOrganizationNFT(contractRegistry),
      ).to.be.revertedWith('Must implement IERC721');
      await expect(
        contractRegistry.setOrganizationNFT(productPassNFT),
      ).to.be.revertedWith('Must implement IOrganizationNFT');

      // Registry

      await expect(
        contractRegistry.setProductRegistry(contractRegistry),
      ).to.be.revertedWith('Must implement IProductRegistry');

      await expect(
        contractRegistry.setPricingRegistry(contractRegistry),
      ).to.be.revertedWith('Must implement IPricingRegistry');

      await expect(
        contractRegistry.setPurchaseRegistry(contractRegistry),
      ).to.be.revertedWith('Must implement IPurchaseRegistry');

      await expect(
        contractRegistry.setCouponRegistry(contractRegistry),
      ).to.be.revertedWith('Must implement ICouponRegistry');

      // Calculator

      await expect(
        contractRegistry.setPricingCalculator(contractRegistry),
      ).to.be.revertedWith('Must implement IPricingCalculator');

      // Oracles

      await expect(
        contractRegistry.setProductTransferOracle(contractRegistry),
      ).to.be.revertedWith('Must implement IProductTransferOracle');

      await expect(
        contractRegistry.setSubscriptionTransferOracle(contractRegistry),
      ).to.be.revertedWith('Must implement ISubscriptionTransferOracle');

      // Escrow

      await expect(
        contractRegistry.setSubscriptionEscrow(contractRegistry),
      ).to.be.revertedWith('Must implement ISubscriptionEscrow');

      await expect(
        contractRegistry.setPaymentEscrow(contractRegistry),
      ).to.be.revertedWith('Must implement IPaymentEscrow');

      // Usage recorder

      await expect(
        contractRegistry.setUsageRecorder(contractRegistry),
      ).to.be.revertedWith('Must implement IUsageRecorder');
    });
  });

  describe('Supports ERC165', () => {
    it('should support the ERC165 interface', async () => {
      const { contractRegistry } = await loadFixture(deployContractRegistry);

      const interfaceId = calculateInterfaceId(['supportsInterface(bytes4)']);

      expect(await contractRegistry.supportsInterface(interfaceId)).to.be.true;
    });
  });
});
