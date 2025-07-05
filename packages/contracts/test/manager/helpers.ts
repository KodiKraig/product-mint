import { loadFixture } from '@nomicfoundation/hardhat-toolbox/network-helpers';
import hre, { ethers } from 'hardhat';
import { SubscriptionEscrow } from '../../typechain-types';
import { expect } from 'chai';

export async function deployPurchaseManager() {
  const [owner, otherAccount, otherAccount2, otherAccount3, otherAccount4] =
    await hre.ethers.getSigners();

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

  const PassAttributeProvider = await hre.ethers.getContractFactory(
    'PassAttributeProvider',
  );
  const passAttributeProvider = await PassAttributeProvider.deploy(
    contractRegistry,
  );

  const PassMetadataProvider = await hre.ethers.getContractFactory(
    'PassMetadataProvider',
  );
  const passMetadataProvider = await PassMetadataProvider.deploy(
    contractRegistry,
    passAttributeProvider,
  );

  const ProductPassNFT = await hre.ethers.getContractFactory('ProductPassNFT');
  const productPassNFT = await ProductPassNFT.deploy(
    contractRegistry,
    passMetadataProvider,
  );
  await contractRegistry.setProductPassNFT(productPassNFT);

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
  await contractRegistry.setOrganizationNFT(organizationNFT);

  await organizationNFT.setMintOpen(true);

  // Dynamic price registry

  const DynamicPriceRegistry = await hre.ethers.getContractFactory(
    'DynamicPriceRegistry',
  );
  const dynamicPriceRegistry = await DynamicPriceRegistry.deploy();

  // Dynamic Price Router

  const MockUniswapV2Router = await hre.ethers.getContractFactory(
    'MockUniswapV2Router',
  );
  const mockUniswapV2Router = await MockUniswapV2Router.deploy();

  const UniswapV2DynamicPriceRouter = await hre.ethers.getContractFactory(
    'UniswapV2DynamicPriceRouter',
  );
  const uniswapV2DynamicPriceRouter = await UniswapV2DynamicPriceRouter.deploy(
    mockUniswapV2Router,
  );

  // ERC20

  const MintToken = await hre.ethers.getContractFactory('MintToken');
  const mintToken = await MintToken.deploy();

  const MintStableToken = await hre.ethers.getContractFactory(
    'MintStableToken',
  );
  const mintStableToken = await MintStableToken.deploy();

  const UniswapV2DynamicERC20 = await hre.ethers.getContractFactory(
    'UniswapV2DynamicERC20',
  );
  const dynamicERC20 = await UniswapV2DynamicERC20.deploy(
    'Dynamic WETH vs USDC',
    'WETHusdc',
    await mintToken.getAddress(),
    await mintStableToken.getAddress(),
    [await mintToken.getAddress(), await mintStableToken.getAddress()],
    [await mintStableToken.getAddress(), await mintToken.getAddress()],
    await uniswapV2DynamicPriceRouter.getAddress(),
  );

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

  // Permission

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

  // Manager

  const PurchaseManager = await hre.ethers.getContractFactory(
    'PurchaseManager',
  );
  const purchaseManager = await PurchaseManager.deploy(
    contractRegistry,
    permissionRegistry,
    ethers.ZeroAddress,
    dynamicPriceRegistry,
  );
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
    organizationAttributeProvider,
    passMetadataProvider,
    passAttributeProvider,
    usageRecorder,
    subscriptionEscrow,
    pricingCalculator,
    paymentEscrow,
    purchaseManager,
    permissionRegistry,
    permissionFactory,
    dynamicPriceRegistry,
    mintToken,
    mintStableToken,
    dynamicERC20,
    mockUniswapV2Router,
    uniswapV2DynamicPriceRouter,
    owner,
    otherAccount,
    otherAccount2,
    otherAccount3,
    otherAccount4,
  };
}

export async function loadWithDefaultProduct() {
  const results = await loadFixture(deployPurchaseManager);

  const {
    productRegistry,
    organizationNFT,
    owner,
    paymentEscrow,
    mintToken,
    mockUniswapV2Router,
    mintStableToken,
    dynamicPriceRegistry,
    dynamicERC20,
  } = results;

  await paymentEscrow.setWhitelistedToken(await mintToken.getAddress(), true);
  await paymentEscrow.setWhitelistedToken(
    await dynamicERC20.getAddress(),
    true,
  );
  await paymentEscrow.setWhitelistedToken(
    await mintStableToken.getAddress(),
    true,
  );

  // Set dynamic price
  await mockUniswapV2Router
    .connect(owner)
    .setPrice(await mintToken.getAddress(), 10);
  await mockUniswapV2Router
    .connect(owner)
    .setPrice(await mintStableToken.getAddress(), 1);

  // Register dynamic token in registry
  await dynamicPriceRegistry
    .connect(owner)
    .registerToken(await dynamicERC20.getAddress());

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
