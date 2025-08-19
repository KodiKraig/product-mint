import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';

const CoreEscrow_Payment = buildModule('CoreEscrow_Payment', (m) => {
  const contractRegistryAddress = m.getParameter('contractRegistry');

  const paymentEscrow = m.contract('PaymentEscrow', [contractRegistryAddress]);

  return {
    paymentEscrow,
  };
});

export default CoreEscrow_Payment;
