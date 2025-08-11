import type { Chain } from "@/config/chains";
import { getExplorerLink } from "@/config/explorer-link";
import { Button } from "nextra/components";

export const ExternalLink = ({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) => {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="font-mono text-sm"
    >
      <Button>{children}</Button>
    </a>
  );
};

export const ExplorerLink = ({
  value,
  chain,
  type = "address",
}: {
  value: string;
  chain: Chain;
  type: "tx" | "token" | "address";
}) => {
  return (
    <ExternalLink href={getExplorerLink({ value, chain, type })}>
      {value}
    </ExternalLink>
  );
};
