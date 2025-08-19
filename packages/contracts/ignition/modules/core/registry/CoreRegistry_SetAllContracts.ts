import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';

const CoreRegistry_SetAllContracts = buildModule(
  'CoreRegistry_SetAllContracts',
  (m) => {
    const contractRegistryAddress = m.getParameter('contractRegistry');
    const contractRegistry = m.contractAt(
      'ContractRegistry',
      contractRegistryAddress,
    );

    const pricingCalculator = m.getParameter('pricingCalculator');
    const productRegistry = m.getParameter('productRegistry');
    const pricingRegistry = m.getParameter('pricingRegistry');
    const purchaseRegistry = m.getParameter('purchaseRegistry');
    const discountRegistry = m.getParameter('discountRegistry');
    const couponRegistry = m.getParameter('couponRegistry');
    const purchaseManager = m.getParameter('purchaseManager');
    const orgAdmin = m.getParameter('orgAdmin');
    const productPassNFT = m.getParameter('productPassNFT');
    const organizationNFT = m.getParameter('organizationNFT');
    const usageRecorder = m.getParameter('usageRecorder');
    const paymentEscrow = m.getParameter('paymentEscrow');
    const subscriptionEscrow = m.getParameter('subscriptionEscrow');

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
    };
  },
);

export default CoreRegistry_SetAllContracts;
