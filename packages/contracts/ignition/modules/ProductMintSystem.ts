// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';

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
  const passMetadataProvider = m.contract('PassMetadataProvider', [
    contractRegistry,
    passAttributeProvider,
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

  // Escrow
  const subscriptionEscrow = m.contract('SubscriptionEscrow', [
    contractRegistry,
  ]);

  const paymentEscrow = m.contract('PaymentEscrow', [contractRegistry]);

  // Purchase manager
  const purchaseManager = m.contract('PurchaseManager', [contractRegistry]);

  // Usage recorder
  const usageRecorder = m.contract('UsageRecorder', [contractRegistry]);

  // ERC20 Testing Token
  const mintToken = m.contract('MintToken');

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
  };
});

export default ProductMintSystemModule;
