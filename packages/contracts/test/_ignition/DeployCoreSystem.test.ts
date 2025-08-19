import { loadFixture } from '@nomicfoundation/hardhat-toolbox/network-helpers';
import hre from 'hardhat';
import { expect } from 'chai';

import CoreEscrow_Subscription from '../../ignition/modules/core/escrow/CoreEscrow_Subscription';
import CoreEscrow_Payment from '../../ignition/modules/core/escrow/CoreEscrow_Payment';

import CoreRegistry_ContractRegistry from '../../ignition/modules/core/registry/CoreRegistry_ContractRegistry';
import CoreRegistry_Coupon from '../../ignition/modules/core/registry/CoreRegistry_Coupon';
import CoreRegistry_Discount from '../../ignition/modules/core/registry/CoreRegistry_Discount';
import CoreRegistry_DynamicPrice from '../../ignition/modules/core/registry/CoreRegistry_DynamicPrice';
import CoreRegistry_OrganizationAdmin from '../../ignition/modules/core/registry/CoreRegistry_OrganizationAdmin';
import CoreRegistry_Pricing from '../../ignition/modules/core/registry/CoreRegistry_Pricing';
import CoreRegistry_Product from '../../ignition/modules/core/registry/CoreRegistry_Product';
import CoreRegistry_Purchase from '../../ignition/modules/core/registry/CoreRegistry_Purchase';
import CoreRegistry_SetAllContracts from '../../ignition/modules/core/registry/CoreRegistry_SetAllContracts';

import CoreToken_MintCoin from '../../ignition/modules/core/token/CoreToken_MintCoin';
import CoreToken_OrgNFT from '../../ignition/modules/core/token/CoreToken_OrgNFT';
import CoreToken_PassNFT from '../../ignition/modules/core/token/CoreToken_PassNFT';

import Core_Permission from '../../ignition/modules/core/Core_Permission';
import Core_PricingCalculator from '../../ignition/modules/core/Core_PricingCalculator';
import Core_PurchaseManager from '../../ignition/modules/core/Core_PurchaseManager';
import Core_RenewalProcessor from '../../ignition/modules/core/Core_RenewalProcessor';
import Core_UsageRecorder from '../../ignition/modules/core/Core_UsageRecorder';

describe('DeployCoreSystem', () => {
  async function deployCoreSystem() {
    const [owner] = await hre.ethers.getSigners();

    // Registry
    const { contractRegistry } = await hre.ignition.deploy(
      CoreRegistry_ContractRegistry,
    );
    const contractRegistryAddress = await contractRegistry.getAddress();

    const { orgAdmin } = await hre.ignition.deploy(
      CoreRegistry_OrganizationAdmin,
      {
        parameters: {
          CoreRegistry_OrganizationAdmin: {
            contractRegistry: contractRegistryAddress,
          },
        },
      },
    );

    const { productRegistry } = await hre.ignition.deploy(
      CoreRegistry_Product,
      {
        parameters: {
          CoreRegistry_Product: {
            contractRegistry: contractRegistryAddress,
          },
        },
      },
    );

    const { pricingRegistry } = await hre.ignition.deploy(
      CoreRegistry_Pricing,
      {
        parameters: {
          CoreRegistry_Pricing: {
            contractRegistry: contractRegistryAddress,
          },
        },
      },
    );

    const { purchaseRegistry } = await hre.ignition.deploy(
      CoreRegistry_Purchase,
      {
        parameters: {
          CoreRegistry_Purchase: {
            contractRegistry: contractRegistryAddress,
          },
        },
      },
    );

    const { couponRegistry } = await hre.ignition.deploy(CoreRegistry_Coupon, {
      parameters: {
        CoreRegistry_Coupon: {
          contractRegistry: contractRegistryAddress,
        },
      },
    });

    const { discountRegistry } = await hre.ignition.deploy(
      CoreRegistry_Discount,
      {
        parameters: {
          CoreRegistry_Discount: {
            contractRegistry: contractRegistryAddress,
          },
        },
      },
    );

    // Calculator
    const { pricingCalculator } = await hre.ignition.deploy(
      Core_PricingCalculator,
      {
        parameters: {
          Core_PricingCalculator: {
            contractRegistry: contractRegistryAddress,
          },
        },
      },
    );

    // NFTs
    const passNFT = await hre.ignition.deploy(CoreToken_PassNFT, {
      parameters: {
        CoreToken_PassNFT: {
          contractRegistry: contractRegistryAddress,
        },
      },
    });

    const orgNFT = await hre.ignition.deploy(CoreToken_OrgNFT, {
      parameters: {
        CoreToken_OrgNFT: {
          contractRegistry: contractRegistryAddress,
        },
      },
    });

    // Escrow
    const { subscriptionEscrow } = await hre.ignition.deploy(
      CoreEscrow_Subscription,
      {
        parameters: {
          CoreEscrow_Subscription: {
            contractRegistry: contractRegistryAddress,
          },
        },
      },
    );

    const { paymentEscrow } = await hre.ignition.deploy(CoreEscrow_Payment, {
      parameters: {
        CoreEscrow_Payment: {
          contractRegistry: contractRegistryAddress,
        },
      },
    });

    // Permission
    const permission = await hre.ignition.deploy(Core_Permission, {
      parameters: {
        Core_Permission: {
          contractRegistry: contractRegistryAddress,
        },
      },
    });

    // Dynamic price registry
    const { dynamicPriceRegistry } = await hre.ignition.deploy(
      CoreRegistry_DynamicPrice,
      {
        parameters: {
          CoreRegistry_DynamicPrice: {
            contractRegistry: contractRegistryAddress,
          },
        },
      },
    );

    // Purchase manager
    const { purchaseManager } = await hre.ignition.deploy(
      Core_PurchaseManager,
      {
        parameters: {
          Core_PurchaseManager: {
            contractRegistry: contractRegistryAddress,
            permissionRegistry:
              await permission.permissionRegistry.getAddress(),
            dynamicPriceRegistry: await dynamicPriceRegistry.getAddress(),
          },
        },
      },
    );

    // Usage recorder
    const { usageRecorder } = await hre.ignition.deploy(Core_UsageRecorder, {
      parameters: {
        Core_UsageRecorder: {
          contractRegistry: contractRegistryAddress,
        },
      },
    });

    // ERC20 Testing Token
    const { mintToken } = await hre.ignition.deploy(CoreToken_MintCoin, {
      parameters: {
        CoreToken_MintCoin: {
          contractRegistry: contractRegistryAddress,
        },
      },
    });

    // Renewal processor
    const { renewalProcessor } = await hre.ignition.deploy(
      Core_RenewalProcessor,
      {
        parameters: {
          Core_RenewalProcessor: {
            contractRegistry: contractRegistryAddress,
          },
        },
      },
    );

    // Batch set all the contracts in the registry
    await hre.ignition.deploy(CoreRegistry_SetAllContracts, {
      parameters: {
        CoreRegistry_SetAllContracts: {
          contractRegistry: contractRegistryAddress,
          purchaseManager: await purchaseManager.getAddress(),
          orgAdmin: await orgAdmin.getAddress(),
          productPassNFT: await passNFT.productPassNFT.getAddress(),
          organizationNFT: await orgNFT.organizationNFT.getAddress(),
          productRegistry: await productRegistry.getAddress(),
          pricingRegistry: await pricingRegistry.getAddress(),
          purchaseRegistry: await purchaseRegistry.getAddress(),
          couponRegistry: await couponRegistry.getAddress(),
          discountRegistry: await discountRegistry.getAddress(),
          pricingCalculator: await pricingCalculator.getAddress(),
          subscriptionEscrow: await subscriptionEscrow.getAddress(),
          paymentEscrow: await paymentEscrow.getAddress(),
          usageRecorder: await usageRecorder.getAddress(),
        },
      },
    });

    return {
      owner,
      contractRegistry,
      orgAdmin,
      productRegistry,
      pricingRegistry,
      purchaseRegistry,
      couponRegistry,
      discountRegistry,
      pricingCalculator,
      ...orgNFT,
      ...passNFT,
      subscriptionEscrow,
      paymentEscrow,
      ...permission,
      dynamicPriceRegistry,
      purchaseManager,
      usageRecorder,
      renewalProcessor,
      mintToken,
    };
  }

  it('should deploy the test ERC20 token', async () => {
    const { mintToken } = await loadFixture(deployCoreSystem);

    expect(await mintToken.name()).to.equal('MintToken');
    expect(await mintToken.symbol()).to.equal('MINT');
    expect(await mintToken.getAddress()).to.not.be.undefined;
  });

  it('should set the correct default metadata for the pass NFT', async () => {
    const { passMetadataProvider } = await loadFixture(deployCoreSystem);

    const metadata = await passMetadataProvider.getDefaultMetadata();
    expect(metadata.name).to.equal('Product Pass');
    expect(metadata.description).to.equal(
      'A Product Pass NFT unlocks exclusive access to products and subscriptions offered by its issuing organization on ProductMint.',
    );
    expect(metadata.externalUrl).to.equal('https://productmint.io');
    expect(metadata.image).to.equal(
      'https://productmint.io/assets/ProductMint_ProductPass.png',
    );
    expect(metadata.backgroundColor).to.equal('');
    expect(metadata.animationUrl).to.equal('');
  });

  it('should set the correct default metadata for the organization NFT', async () => {
    const { organizationMetadataProvider } = await loadFixture(
      deployCoreSystem,
    );

    const metadata = await organizationMetadataProvider.getDefaultMetadata();
    expect(metadata.name).to.equal('Organization');
    expect(metadata.description).to.equal(
      'A Organization NFT enables its owner to create and manage products with crypto subscription offerings within the ProductMint ecosystem.',
    );
    expect(metadata.externalUrl).to.equal('https://productmint.io');
    expect(metadata.image).to.equal(
      'https://productmint.io/assets/ProductMint_Org.png',
    );
    expect(metadata.backgroundColor).to.equal('');
    expect(metadata.animationUrl).to.equal('');
  });

  it('should set the correct contracts in the contract registry', async () => {
    const {
      contractRegistry,
      productRegistry,
      pricingRegistry,
      productPassNFT,
      organizationNFT,
      purchaseManager,
      subscriptionEscrow,
      paymentEscrow,
      usageRecorder,
      pricingCalculator,
      couponRegistry,
      purchaseRegistry,
      discountRegistry,
      orgAdmin,
    } = await loadFixture(deployCoreSystem);

    // Admin
    expect(await contractRegistry.orgAdmin()).to.equal(orgAdmin);

    // Registry
    expect(await contractRegistry.productRegistry()).to.equal(productRegistry);
    expect(await contractRegistry.pricingRegistry()).to.equal(pricingRegistry);
    expect(await contractRegistry.purchaseRegistry()).to.equal(
      purchaseRegistry,
    );
    expect(await contractRegistry.couponRegistry()).to.equal(couponRegistry);
    expect(await contractRegistry.discountRegistry()).to.equal(
      discountRegistry,
    );

    // Calculator
    expect(await contractRegistry.pricingCalculator()).to.equal(
      pricingCalculator,
    );

    // NFTs
    expect(await contractRegistry.productPassNFT()).to.equal(productPassNFT);
    expect(await contractRegistry.organizationNFT()).to.equal(organizationNFT);

    // Oracles
    expect(await contractRegistry.productTransferOracle()).to.equal(
      productRegistry,
    );
    expect(await contractRegistry.subscriptionTransferOracle()).to.equal(
      subscriptionEscrow,
    );

    // Escrow
    expect(await contractRegistry.purchaseManager()).to.equal(purchaseManager);
    expect(await contractRegistry.subscriptionEscrow()).to.equal(
      subscriptionEscrow,
    );
    expect(await contractRegistry.paymentEscrow()).to.equal(paymentEscrow);

    // Usage recorder
    expect(await contractRegistry.usageRecorder()).to.equal(usageRecorder);
  });

  it('should set the owner in the contract registry', async () => {
    const { owner, contractRegistry } = await loadFixture(deployCoreSystem);

    expect(await contractRegistry.owner()).to.equal(owner.address);
  });

  it('should set the correct metadata providers for the NFTs', async () => {
    const {
      productPassNFT,
      organizationNFT,
      passMetadataProvider,
      organizationMetadataProvider,
    } = await loadFixture(deployCoreSystem);

    expect(await productPassNFT.metadataProvider()).to.equal(
      passMetadataProvider,
    );
    expect(await organizationNFT.metadataProvider()).to.equal(
      organizationMetadataProvider,
    );
  });

  it('should deploy the renewal processor with the correct registry', async () => {
    const { renewalProcessor, contractRegistry } = await loadFixture(
      deployCoreSystem,
    );

    expect(await renewalProcessor.getAddress()).to.not.be.undefined;
    expect(await renewalProcessor.registry()).to.equal(contractRegistry);
  });

  it('should deploy the permission factory and registry with the correct contracts', async () => {
    const { permissionFactory, permissionRegistry, purchaseManager } =
      await loadFixture(deployCoreSystem);

    expect(await permissionFactory.getAddress()).to.not.be.undefined;
    expect(await permissionRegistry.getAddress()).to.not.be.undefined;

    expect(await purchaseManager.permissionRegistry()).to.equal(
      await permissionRegistry.getAddress(),
    );
    expect(await permissionRegistry.permissionFactory()).to.equal(
      await permissionFactory.getAddress(),
    );
  });

  it('should set the initial pass supply to zero if no old purchase manager is provided', async () => {
    const { purchaseManager } = await loadFixture(deployCoreSystem);

    expect(await purchaseManager.passSupply()).to.equal(0);
  });

  it('should set the dynamic price registry in the purchase manager', async () => {
    const { purchaseManager, dynamicPriceRegistry } = await loadFixture(
      deployCoreSystem,
    );

    expect(await purchaseManager.dynamicPriceRegistry()).to.equal(
      dynamicPriceRegistry,
    );
  });

  it('central contract registry should be set in all contracts', async () => {
    const {
      contractRegistry,
      purchaseManager,
      orgAdmin,
      productRegistry,
      pricingRegistry,
      purchaseRegistry,
      couponRegistry,
      discountRegistry,
      pricingCalculator,
      productPassNFT,
      usageRecorder,
      paymentEscrow,
      subscriptionEscrow,
      passMetadataProvider,
      organizationMetadataProvider,
      passAttributeProvider,
      organizationAttributeProvider,
      dynamicPriceRegistry,
      permissionRegistry,
      renewalProcessor,
    } = await loadFixture(deployCoreSystem);

    expect(await purchaseManager.registry()).to.equal(contractRegistry);
    expect(await orgAdmin.registry()).to.equal(contractRegistry);
    expect(await productRegistry.registry()).to.equal(contractRegistry);
    expect(await pricingRegistry.registry()).to.equal(contractRegistry);
    expect(await purchaseRegistry.registry()).to.equal(contractRegistry);
    expect(await couponRegistry.registry()).to.equal(contractRegistry);
    expect(await discountRegistry.registry()).to.equal(contractRegistry);
    expect(await pricingCalculator.registry()).to.equal(contractRegistry);
    expect(await productPassNFT.registry()).to.equal(contractRegistry);
    expect(await usageRecorder.registry()).to.equal(contractRegistry);
    expect(await paymentEscrow.registry()).to.equal(contractRegistry);
    expect(await subscriptionEscrow.registry()).to.equal(contractRegistry);
    expect(await purchaseManager.registry()).to.equal(contractRegistry);
    expect(await passMetadataProvider.registry()).to.equal(contractRegistry);
    expect(await organizationMetadataProvider.registry()).to.equal(
      contractRegistry,
    );
    expect(await passAttributeProvider.registry()).to.equal(contractRegistry);
    expect(await organizationAttributeProvider.registry()).to.equal(
      contractRegistry,
    );
    expect(await dynamicPriceRegistry.registry()).to.equal(contractRegistry);
    expect(await permissionRegistry.registry()).to.equal(contractRegistry);
    expect(await renewalProcessor.registry()).to.equal(contractRegistry);

    expect(await purchaseManager.permissionRegistry()).to.equal(
      await permissionRegistry.getAddress(),
    );
    expect(await purchaseManager.dynamicPriceRegistry()).to.equal(
      await dynamicPriceRegistry.getAddress(),
    );
  });
});
