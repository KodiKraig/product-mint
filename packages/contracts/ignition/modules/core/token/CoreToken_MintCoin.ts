import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';

const CoreToken_MintCoin = buildModule('CoreToken_MintCoin', (m) => {
  const mintToken = m.contract('MintToken');

  return {
    mintToken,
  };
});

export default CoreToken_MintCoin;
