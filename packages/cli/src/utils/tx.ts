import {
  ContractTransactionReceipt,
  ContractTransactionResponse,
} from 'ethers';

export async function waitTx(
  tx: Promise<ContractTransactionResponse>,
): Promise<ContractTransactionReceipt> {
  const _tx = await tx;

  const txHash = _tx.hash;

  console.log(`Waiting for transaction ${txHash} to be confirmed...`);

  const receipt = await _tx.wait();

  if (!receipt) {
    throw new Error('No receipt found!');
  }

  if (receipt.status === 0) {
    throw new Error('Transaction reverted!');
  } else {
    console.log('Transaction confirmed!');
    console.log(`Transaction hash: ${txHash}`);
    console.log(`Block number: ${receipt.blockNumber}`);
    console.log(`Block hash: ${receipt.blockHash}`);
  }

  return receipt;
}
