// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';
import { ethers } from 'hardhat';

const ProductMintSystemModule = buildModule('ProductMintSystemModule', (m) => {
  // Registry
  const contractRegistry = m.contract('ContractRegistry');

  const orgAdmin = m.contract('OrganizationAdmin', [contractRegistry]);

  const productRegistry = m.contract('ProductRegistry', [contractRegistry]);

  const pricingRegistry = m.contract('PricingRegistry', [contractRegistry]);

  const purchaseRegistry = m.contract('PurchaseRegistry', [contractRegistry]);

  const couponRegistry = m.contract('CouponRegistry', [contractRegistry]);

  const discountRegistry = m.contract('DiscountRegistry', [contractRegistry]);

  // Calculator
  const pricingCalculator = m.contract('PricingCalculator', [contractRegistry]);

  // Product Pass NFT
  const passAttributeProvider = m.contract('PassAttributeProvider', [
    contractRegistry,
  ]);
  const passMetadataProvider = m.contract('PassMetadataProviderV2', [
    contractRegistry,
    passAttributeProvider,
  ]);
  m.call(passMetadataProvider, 'setDefaultMetadata', [
    {
      name: 'Product Pass',
      description:
        'A Product Pass NFT unlocks exclusive access to products and subscriptions offered by its issuing organization on ProductMint.',
      externalUrl: 'https://productmint.io',
      image: 'https://productmint.io/assets/ProductMint_ProductPass.png',
      backgroundColor: '',
      animationUrl: '',
    },
  ]);

  const productPassNFT = m.contract('ProductPassNFT', [
    contractRegistry,
    passMetadataProvider,
  ]);

  // Organization NFT
  const organizationAttributeProvider = m.contract(
    'OrganizationAttributeProvider',
    [contractRegistry],
  );
  const organizationMetadataProvider = m.contract(
    'OrganizationMetadataProvider',
    [contractRegistry, organizationAttributeProvider],
  );
  m.call(organizationMetadataProvider, 'setDefaultMetadata', [
    {
      name: 'Organization',
      description:
        'A Organization NFT enables its owner to create and manage products with crypto subscription offerings within the ProductMint ecosystem.',
      externalUrl: 'https://productmint.io',
      image: 'https://productmint.io/assets/ProductMint_Org.png',
      backgroundColor: '',
      animationUrl: '',
    },
  ]);

  const organizationNFT = m.contract('OrganizationNFT', [
    organizationMetadataProvider,
  ]);

  // Escrow
  const subscriptionEscrow = m.contract('SubscriptionEscrow', [
    contractRegistry,
  ]);

  const paymentEscrow = m.contract('PaymentEscrow', [contractRegistry]);

  // Permission
  const permissionFactory = m.contract('PermissionFactory');
  const permissionRegistry = m.contract('PermissionRegistry', [
    contractRegistry,
    permissionFactory,
  ]);

  // Dynamic price registry
  const dynamicPriceRegistry = m.contract('DynamicPriceRegistry', [
    contractRegistry,
  ]);

  // Purchase manager
  const purchaseManager = m.contract('PurchaseManager', [
    contractRegistry,
    permissionRegistry,
    ethers.ZeroAddress,
    dynamicPriceRegistry,
  ]);

  // Usage recorder
  const usageRecorder = m.contract('UsageRecorder', [contractRegistry]);

  // ERC20 Testing Token
  const mintToken = m.contract('MintToken');

  // Renewal processor
  const renewalProcessor = m.contract('RenewalProcessor', [contractRegistry]);

  // Batch set all the contracts in the registry
  m.call(contractRegistry, 'batchSetContracts', [
    {
      purchaseManager,
      orgAdmin,
      productPassNFT,
      organizationNFT,
      productRegistry,
      pricingRegistry,
      purchaseRegistry,
      couponRegistry,
      discountRegistry,
      pricingCalculator,
      productTransferOracle: productRegistry,
      subscriptionTransferOracle: subscriptionEscrow,
      subscriptionEscrow,
      paymentEscrow,
      usageRecorder,
    },
  ]);

  return {
    contractRegistry,
    pricingCalculator,
    productRegistry,
    pricingRegistry,
    purchaseRegistry,
    discountRegistry,
    couponRegistry,
    productPassNFT,
    organizationNFT,
    passMetadataProvider,
    organizationMetadataProvider,
    purchaseManager,
    subscriptionEscrow,
    paymentEscrow,
    usageRecorder,
    orgAdmin,
    mintToken,
    renewalProcessor,
    permissionFactory,
    permissionRegistry,
    dynamicPriceRegistry,
  };
});

export default ProductMintSystemModule;
