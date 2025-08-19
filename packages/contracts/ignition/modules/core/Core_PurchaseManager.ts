import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';
import { ethers } from 'ethers';

const Core_PurchaseManager = buildModule('Core_PurchaseManager', (m) => {
  const contractRegistryAddress = m.getParameter('contractRegistry');
  const permissionRegistryAddress = m.getParameter('permissionRegistry');
  const dynamicPriceRegistryAddress = m.getParameter('dynamicPriceRegistry');

  const purchaseManager = m.contract('PurchaseManager', [
    contractRegistryAddress,
    permissionRegistryAddress,
    ethers.ZeroAddress,
    dynamicPriceRegistryAddress,
  ]);

  return {
    purchaseManager,
  };
});

export default Core_PurchaseManager;
