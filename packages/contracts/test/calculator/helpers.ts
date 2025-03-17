import { PricingCalculator, IPricingCalculator } from '../../typechain-types';
import { expect } from 'chai';

export const assertCheckoutTotalCost = async (
  pricingCalculator: PricingCalculator,
  params: IPricingCalculator.CheckoutTotalCostParamsStruct,
  expected: IPricingCalculator.CheckoutTotalCostStruct,
) => {
  const checkout = await pricingCalculator.getCheckoutTotalCost(params);

  expect(checkout).to.deep.equal([
    expected.pricingIds,
    expected.token,
    expected.costs,
    expected.couponCost,
    expected.couponDiscount,
    expected.couponSavings,
    expected.permanentCost,
    expected.permanentDiscount,
    expected.permanentSavings,
    expected.subTotalCost,
    expected.checkoutTotalCost,
  ]);
};
