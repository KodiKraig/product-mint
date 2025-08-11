import type { Chain } from "@/config/chains";
import Image from "next/image";

export const chainImageMap: Record<Chain, string> = {
  "base-mainnet": "BaseChainLogo.svg",
  "base-sepolia": "BaseChainLogo.svg",
  "ethereum-sepolia": "ethereum-logo.png",
  "ethereum-mainnet": "ethereum-logo.png",
};

export const ChainImage = ({
  chain,
  size = 75,
}: {
  chain: Chain;
  size?: number;
}) => {
  return (
    <Image
      src={`/assets/chains/${chainImageMap[chain]}`}
      alt={chain}
      width={size}
      height={size}
      style={{
        objectFit: "contain",
      }}
    />
  );
};
