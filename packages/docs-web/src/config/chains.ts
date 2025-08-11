export type Chain =
  | "base-mainnet"
  | "base-sepolia"
  | "ethereum-sepolia"
  | "ethereum-mainnet";

export const recommendedChains: Chain[] = ["base-mainnet", "base-sepolia"];

export const chainShortNameMap: Record<Chain, string> = {
  "base-mainnet": "Base",
  "base-sepolia": "Base Sepolia",
  "ethereum-sepolia": "Ethereum Sepolia",
  "ethereum-mainnet": "Ethereum",
};

export const isChainTestnet: Record<Chain, boolean> = {
  "base-mainnet": false,
  "base-sepolia": true,
  "ethereum-sepolia": true,
  "ethereum-mainnet": false,
};

export const chainToLandingPageMap: Record<Chain, string> = {
  "base-mainnet": "https://base.org",
  "base-sepolia": "https://base.org",
  "ethereum-sepolia": "https://ethereum.org",
  "ethereum-mainnet": "https://ethereum.org",
};
