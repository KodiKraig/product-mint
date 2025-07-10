import hre, { ethers } from 'hardhat';
import { expect } from 'chai';
import DeployMockUniswapV2DynamicToken from '../../../../ignition/modules/tokens/mock/DeployMockUniswapV2DynamicToken';
import { loadWithPurchasedFlatRateSubscription } from '../../../manager/helpers';

describe('DeployMockUniswapV2DynamicToken', () => {
  it('should deploy the dynamic token', async () => {
    const { mintToken } = await loadWithPurchasedFlatRateSubscription();

    const { dynamicToken, mintStableToken, dynamicUniswapV2Router } =
      await hre.ignition.deploy(DeployMockUniswapV2DynamicToken, {
        parameters: {
          DeployMockUniswapV2DynamicToken: {
            mintToken: await mintToken.getAddress(),
          },
        },
      });

    expect(await dynamicToken.getAddress()).to.not.be.undefined;
    expect(await dynamicToken.name()).to.equal(
      'Mock Uniswap V2 Dynamic Token MINT/USDC',
    );
    expect(await dynamicToken.symbol()).to.equal('dMINT-USDC');
    expect(await dynamicToken.baseToken()).to.equal(
      await mintToken.getAddress(),
    );
    expect(await dynamicToken.quoteToken()).to.equal(
      await mintStableToken.getAddress(),
    );
    expect(await dynamicToken.dynamicPriceRouter()).to.equal(
      await dynamicUniswapV2Router.getAddress(),
    );
    expect(await dynamicToken.getBaseToQuotePath()).to.deep.equal([
      await mintToken.getAddress(),
      await mintStableToken.getAddress(),
    ]);
    expect(await dynamicToken.getQuoteToBasePath()).to.deep.equal([
      await mintStableToken.getAddress(),
      await mintToken.getAddress(),
    ]);
    expect(await dynamicToken.getBaseTokenPrice()).to.equal(
      ethers.parseUnits('100.3009', 6),
    );
  });
});
