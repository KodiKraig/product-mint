import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';

const CoreEscrow_Subscription = buildModule('CoreEscrow_Subscription', (m) => {
  const contractRegistryAddress = m.getParameter('contractRegistry');

  const subscriptionEscrow = m.contract('SubscriptionEscrow', [
    contractRegistryAddress,
  ]);

  return {
    subscriptionEscrow,
  };
});

export default CoreEscrow_Subscription;
