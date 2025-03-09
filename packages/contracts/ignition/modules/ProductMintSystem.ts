// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';

const ProductMintSystemModule = buildModule('ProductMintSystemModule', (m) => {
  // Registry
  const contractRegistry = m.contract('ContractRegistry');

  const orgAdmin = m.contract('OrganizationAdmin', [contractRegistry]);
  m.call(contractRegistry, 'setOrgAdmin', [orgAdmin]);

  const productRegistry = m.contract('ProductRegistry', [contractRegistry]);
  m.call(contractRegistry, 'setProductRegistry', [productRegistry]);
  m.call(contractRegistry, 'setProductTransferOracle', [productRegistry]);

  const pricingRegistry = m.contract('PricingRegistry', [contractRegistry]);
  m.call(contractRegistry, 'setPricingRegistry', [pricingRegistry]);

  const purchaseRegistry = m.contract('PurchaseRegistry', [contractRegistry]);
  m.call(contractRegistry, 'setPurchaseRegistry', [purchaseRegistry]);

  const couponRegistry = m.contract('CouponRegistry', [contractRegistry]);
  m.call(contractRegistry, 'setCouponRegistry', [couponRegistry]);

  // Calculator
  const pricingCalculator = m.contract('PricingCalculator', [contractRegistry]);
  m.call(contractRegistry, 'setPricingCalculator', [pricingCalculator]);

  // Product Pass NFT
  const passMetadataProvider = m.contract('PassMetadataProvider', [
    contractRegistry,
  ]);
  m.call(passMetadataProvider, 'setDefaultMetadata', [
    {
      name: 'Product Pass',
      description:
        'A ProductMint Product Pass is used for tokenizing products and creating permissionless subscriptions. Organizations can sell product passes to their customers to grant them access to their products.',
      externalUrl: 'https://productmint.io',
      image: 'https://productmint.io/image.png',
      backgroundColor: '',
      animationUrl: '',
    },
  ]);

  const productPassNFT = m.contract('ProductPassNFT', [
    contractRegistry,
    passMetadataProvider,
  ]);
  m.call(contractRegistry, 'setProductPassNFT', [productPassNFT]);

  // Organization NFT
  const organizationMetadataProvider = m.contract(
    'OrganizationMetadataProvider',
    [contractRegistry],
  );
  m.call(organizationMetadataProvider, 'setDefaultMetadata', [
    {
      name: 'Organization',
      description:
        'A ProductMint Organization is required to sell products and subscriptions. Create products and pricing models within the organization to start selling product passes for your products.',
      externalUrl: 'https://productmint.io',
      image: 'https://productmint.io/image.png',
      backgroundColor: '',
      animationUrl: '',
    },
  ]);

  const organizationNFT = m.contract('OrganizationNFT', [
    organizationMetadataProvider,
  ]);
  m.call(contractRegistry, 'setOrganizationNFT', [organizationNFT]);

  // Escrow
  const subscriptionEscrow = m.contract('SubscriptionEscrow', [
    contractRegistry,
  ]);
  m.call(contractRegistry, 'setSubscriptionEscrow', [subscriptionEscrow]);
  m.call(contractRegistry, 'setSubscriptionTransferOracle', [
    subscriptionEscrow,
  ]);

  const paymentEscrow = m.contract('PaymentEscrow', [contractRegistry]);
  m.call(contractRegistry, 'setPaymentEscrow', [paymentEscrow]);

  // Purchase manager
  const purchaseManager = m.contract('PurchaseManager', [contractRegistry]);
  m.call(contractRegistry, 'setPurchaseManager', [purchaseManager]);

  // Usage recorder
  const usageRecorder = m.contract('UsageRecorder', [contractRegistry]);
  m.call(contractRegistry, 'setUsageRecorder', [usageRecorder]);

  return {
    contractRegistry,
    pricingCalculator,
    productRegistry,
    pricingRegistry,
    purchaseRegistry,
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
  };
});

export default ProductMintSystemModule;
