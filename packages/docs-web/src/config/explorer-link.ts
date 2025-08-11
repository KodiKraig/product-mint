import type { Chain } from "@/config/chains";

export function getExplorerLink({
  value,
  chain,
  type,
}: {
  value: string;
  chain: Chain;
  type: "tx" | "token" | "address";
}) {
  if (chain === "base-mainnet") {
    return `https://basescan.org/${type}/${value}`;
  } else if (chain === "base-sepolia") {
    return `https://sepolia.basescan.org/${type}/${value}`;
  } else if (chain === "ethereum-sepolia") {
    return `https://sepolia.etherscan.io/${type}/${value}`;
  }

  throw new Error(`Unsupported chain`);
}
