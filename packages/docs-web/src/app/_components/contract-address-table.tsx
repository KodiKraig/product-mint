import type { Chain } from "@/config/chains";
import { Table } from "nextra/components";
import { ExplorerLink } from "@/app/_components/external-link";

export const ContractAddressTableRow = ({
  chain,
  contract,
  address,
}: {
  chain: Chain;
  contract: string;
  address: string;
}) => {
  return (
    <Table.Tr>
      <Table.Td>{contract}</Table.Td>
      <Table.Td className="font-mono">
        <ExplorerLink value={address} chain={chain} type="address" />
      </Table.Td>
    </Table.Tr>
  );
};

export const ContractAddressTable = ({
  chain,
  contracts,
}: {
  chain: Chain;
  contracts: { contract: string; address: string }[];
}) => {
  return (
    <Table className="py-2">
      <thead>
        <Table.Tr>
          <Table.Th>Contract</Table.Th>
          <Table.Th>Address</Table.Th>
        </Table.Tr>
      </thead>
      <tbody>
        {contracts.map((contract) => (
          <ContractAddressTableRow
            key={contract.contract}
            chain={chain}
            contract={contract.contract}
            address={contract.address}
          />
        ))}
      </tbody>
    </Table>
  );
};
