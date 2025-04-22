import { RenewalProcessed as RenewalProcessedEvent } from '../generated/RenewalProcessor/RenewalProcessor';
import { RenewalProcessed } from '../generated/schema';

export function handleRenewalProcessed(event: RenewalProcessedEvent): void {
  let entity = new RenewalProcessed(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  );
  entity.orgId = event.params.orgId;
  entity.productPassId = event.params.productPassId;
  entity.productId = event.params.productId;
  entity.status = event.params.status;

  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;
  entity.from = event.transaction.from;

  entity.save();
}
