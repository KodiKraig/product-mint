import { loadFixture } from '@nomicfoundation/hardhat-toolbox/network-helpers';
import hre, { ethers } from 'hardhat';
import { SubscriptionEscrow } from '../../typechain-types';
import { expect } from 'chai';

export async function deployPurchaseManager() {
  const [owner, otherAccount, otherAccount2] = await hre.ethers.getSigners();

  // Registry

  const ContractRegistry = await hre.ethers.getContractFactory(
    'ContractRegistry',
  );
  const contractRegistry = await ContractRegistry.deploy();

  const ProductRegistry = await hre.ethers.getContractFactory(
    'ProductRegistry',
  );
  const productRegistry = await ProductRegistry.deploy(contractRegistry);
  await contractRegistry.setProductRegistry(productRegistry);
  await contractRegistry.setProductTransferOracle(productRegistry);

  const PricingRegistry = await hre.ethers.getContractFactory(
    'PricingRegistry',
  );
  const pricingRegistry = await PricingRegistry.deploy(contractRegistry);
  await contractRegistry.setPricingRegistry(pricingRegistry);

  const PurchaseRegistry = await hre.ethers.getContractFactory(
    'PurchaseRegistry',
  );
  const purchaseRegistry = await PurchaseRegistry.deploy(contractRegistry);
  await contractRegistry.setPurchaseRegistry(purchaseRegistry);

  const CouponRegistry = await hre.ethers.getContractFactory('CouponRegistry');
  const couponRegistry = await CouponRegistry.deploy(contractRegistry);
  await contractRegistry.setCouponRegistry(couponRegistry);

  const DiscountRegistry = await hre.ethers.getContractFactory(
    'DiscountRegistry',
  );
  const discountRegistry = await DiscountRegistry.deploy(contractRegistry);
  await contractRegistry.setDiscountRegistry(discountRegistry);

  // Admin

  const OrganizationAdmin = await hre.ethers.getContractFactory(
    'OrganizationAdmin',
  );
  const organizationAdmin = await OrganizationAdmin.deploy(contractRegistry);
  await contractRegistry.setOrgAdmin(organizationAdmin);

  // Calculator

  const PricingCalculator = await hre.ethers.getContractFactory(
    'PricingCalculator',
  );
  const pricingCalculator = await PricingCalculator.deploy(contractRegistry);
  await contractRegistry.setPricingCalculator(pricingCalculator);

  // NFTs

  const PassMetadataProvider = await hre.ethers.getContractFactory(
    'PassMetadataProvider',
  );
  const passMetadataProvider = await PassMetadataProvider.deploy(
    contractRegistry,
  );

  const ProductPassNFT = await hre.ethers.getContractFactory('ProductPassNFT');
  const productPassNFT = await ProductPassNFT.deploy(
    contractRegistry,
    passMetadataProvider,
  );
  await contractRegistry.setProductPassNFT(productPassNFT);

  const OrganizationMetadataProvider = await hre.ethers.getContractFactory(
    'OrganizationMetadataProvider',
  );
  const organizationMetadataProvider =
    await OrganizationMetadataProvider.deploy(contractRegistry);

  const OrganizationNFT = await hre.ethers.getContractFactory(
    'OrganizationNFT',
  );
  const organizationNFT = await OrganizationNFT.deploy(
    organizationMetadataProvider,
  );
  await contractRegistry.setOrganizationNFT(organizationNFT);

  await organizationNFT.setMintOpen(true);

  // ERC20

  const MintToken = await hre.ethers.getContractFactory('MintToken');
  const mintToken = await MintToken.deploy();

  // Usage recorder

  const UsageRecorder = await hre.ethers.getContractFactory('UsageRecorder');
  const usageRecorder = await UsageRecorder.deploy(contractRegistry);
  await contractRegistry.setUsageRecorder(usageRecorder);

  // Escrow

  const SubscriptionEscrow = await hre.ethers.getContractFactory(
    'SubscriptionEscrow',
  );
  const subscriptionEscrow = await SubscriptionEscrow.deploy(contractRegistry);
  await contractRegistry.setSubscriptionEscrow(subscriptionEscrow);
  await contractRegistry.setSubscriptionTransferOracle(subscriptionEscrow);

  const PaymentEscrow = await hre.ethers.getContractFactory('PaymentEscrow');
  const paymentEscrow = await PaymentEscrow.deploy(contractRegistry);
  await contractRegistry.setPaymentEscrow(paymentEscrow);

  // Manager

  const PurchaseManager = await hre.ethers.getContractFactory(
    'PurchaseManager',
  );
  const purchaseManager = await PurchaseManager.deploy(contractRegistry);
  await contractRegistry.setPurchaseManager(purchaseManager);

  return {
    contractRegistry,
    productRegistry,
    pricingRegistry,
    purchaseRegistry,
    discountRegistry,
    couponRegistry,
    productPassNFT,
    organizationNFT,
    organizationMetadataProvider,
    passMetadataProvider,
    usageRecorder,
    subscriptionEscrow,
    pricingCalculator,
    paymentEscrow,
    purchaseManager,
    mintToken,
    owner,
    otherAccount,
    otherAccount2,
  };
}

export async function loadWithDefaultProduct() {
  const results = await loadFixture(deployPurchaseManager);

  const { productRegistry, organizationNFT, owner, paymentEscrow, mintToken } =
    results;

  await paymentEscrow.setWhitelistedToken(await mintToken.getAddress(), true);

  await organizationNFT.connect(owner).mint(owner);

  await productRegistry.createProduct({
    orgId: 1,
    name: 'Product 1',
    description: 'P1 Description',
    imageUrl: 'https://example.com/product1',
    externalUrl: 'https://example.com/product1-image',
    isTransferable: false,
  });

  return results;
}

export async function loadWithPurchasedFlatRateSubscription() {
  const contracts = await loadWithDefaultProduct();

  const {
    purchaseManager,
    pricingRegistry,
    productRegistry,
    paymentEscrow,
    mintToken,
    otherAccount,
  } = contracts;

  await mintToken
    .connect(otherAccount)
    .mint(otherAccount, ethers.parseUnits('100', 6));
  await mintToken
    .connect(otherAccount)
    .approve(paymentEscrow, ethers.parseUnits('100', 6));

  await pricingRegistry.createFlatRateSubscriptionPricing({
    organizationId: 1,
    chargeFrequency: 1,
    flatPrice: ethers.parseUnits('10', 6),
    token: await mintToken.getAddress(),
    isRestricted: false,
  });

  await productRegistry.linkPricing(1, [1]);

  const tx = await purchaseManager.connect(otherAccount).purchaseProducts({
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

  const { timestamp: purchaseTimeStamp } = await parseTimestamp(tx);

  return { ...contracts, purchaseTimeStamp };
}

export async function parseTimestamp(contractResponse: any) {
  const receipt = await contractResponse.wait();
  const block = await ethers.provider.getBlock(receipt!.blockNumber);
  const timestamp = block!.timestamp;
  return {
    receipt,
    block,
    timestamp,
  };
}

export interface ExpectedSubscription {
  orgId: number;
  pricingId: number;
  startDate: number;
  endDate: number;
  timeRemaining: number;
  isCancelled: boolean;
  isPaused: boolean;
  status: number;
}

export async function assertSubscription(
  subscriptionEscrow: SubscriptionEscrow,
  get: {
    productPassId: number;
    productId: number;
  },
  expected: ExpectedSubscription,
) {
  const subscription = await subscriptionEscrow.getSubscription(
    get.productPassId,
    get.productId,
  );

  expect(subscription).to.deep.equal([
    [
      expected.orgId,
      expected.pricingId,
      expected.startDate,
      expected.endDate,
      expected.timeRemaining,
      expected.isCancelled,
      expected.isPaused,
    ],
    expected.status,
  ]);
}

export async function assertSubscriptionBatch(
  subscriptionEscrow: SubscriptionEscrow,
  get: {
    productPassId: number;
    productIds: number[];
  },
  expected: ExpectedSubscription[],
) {
  const [subs, statuses] = await subscriptionEscrow.getSubscriptionBatch(
    get.productPassId,
    get.productIds,
  );

  for (let i = 0; i < subs.length; i++) {
    expect(subs[i]).to.deep.equal([
      expected[i].orgId,
      expected[i].pricingId,
      expected[i].startDate,
      expected[i].endDate,
      expected[i].timeRemaining,
      expected[i].isCancelled,
      expected[i].isPaused,
    ]);

    expect(statuses[i]).to.equal(expected[i].status);
  }
}
