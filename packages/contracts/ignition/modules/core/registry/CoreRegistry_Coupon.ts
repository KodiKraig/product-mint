import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';

const CoreRegistry_Coupon = buildModule('CoreRegistry_Coupon', (m) => {
  const contractRegistryAddress = m.getParameter('contractRegistry');

  const couponRegistry = m.contract('CouponRegistry', [
    contractRegistryAddress,
  ]);

  return {
    couponRegistry,
  };
});

export default CoreRegistry_Coupon;
