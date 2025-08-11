const BASE_URL = "https://docs.productmint.io";

const metadata = {
  name: "ProductMint Documentation",
  description:
    "Transform your business with the future of crypto subscriptions. ProductMint empowers creators, developers, and entrepreneurs to build sustainable revenue streams through blockchain-powered recurring payments. Create products, set up automatic billing cycles, and sell them as NFTs—all without intermediaries, KYC, or traditional payment processors.",
  url: {
    base: BASE_URL,
    assets: `${BASE_URL}/assets`,
  },
  twitter: {
    site: "@ProductMintIO",
    creator: "@ProductMintIO",
    url: "https://x.com/ProductMintIO",
  },
  github: {
    url: "https://github.com/KodiKraig/product-mint",
  },
  discord: {
    url: "https://discord.gg/s7xfp2FjNM",
  },
  contact: {
    email: "productmintio@gmail.com",
  },
  documentation: {
    url: "https://deepwiki.com/KodiKraig/product-mint",
  },
  openGraph: {
    image: {
      url: `${BASE_URL}/assets/OgImage.png`,
      alt: "ProductMint",
      width: 1266,
      height: 716,
    },
  },
};

Object.freeze(metadata);

export default metadata;
