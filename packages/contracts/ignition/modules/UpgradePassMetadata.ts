import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';

const CONTRACT_REGISTRY_ADDRESS = '0xcF6AA18E24B2904F4Bb007c78d2D0FAbF5961F41';
const PASS_ATTRIBUTE_PROVIDER_ADDRESS =
  '0x13228DFe3e958844c54e1A7Ece9587c585917756';

const PASS_NFT_ADDRESS = '0x1d02ecC16193C5e2e33BE52fc95947edBf0B7870';

const UpgradePassMetadataModule = buildModule(
  'UpgradePassMetadataModule',
  (m) => {
    const passMetadataProvider = m.contract('PassMetadataProviderV2', [
      CONTRACT_REGISTRY_ADDRESS,
      PASS_ATTRIBUTE_PROVIDER_ADDRESS,
    ]);
    m.call(passMetadataProvider, 'setDefaultMetadata', [
      {
        name: 'Product Pass',
        description:
          'A ProductMint Product Pass is used for tokenizing products and creating permissionless subscriptions. Organizations can sell product passes to their customers to grant them access to their products.',
        externalUrl: 'https://productmint.io',
        image: 'https://productmint.io/image.png',
        backgroundColor: '',
        animationUrl: '',
      },
    ]);

    const passContract = m.contractAt('ProductPassNFT', PASS_NFT_ADDRESS);

    m.call(passContract, 'setMetadataProvider', [passMetadataProvider]);

    return {
      passMetadataProvider,
      passContract,
    };
  },
);

export default UpgradePassMetadataModule;
