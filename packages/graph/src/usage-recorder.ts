import {
  MeterActiveSet as MeterActiveSetEvent,
  MeterCreated as MeterCreatedEvent,
  MeterPaymentProcessed as MeterPaymentProcessedEvent,
  MeterUsageSet as MeterUsageSetEvent,
} from "../generated/UsageRecorder/UsageRecorder"
import {
  MeterActiveSet,
  MeterCreated,
  MeterPaymentProcessed,
  MeterUsageSet,
} from "../generated/schema"

export function handleMeterActiveSet(event: MeterActiveSetEvent): void {
  let entity = new MeterActiveSet(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.organizationId = event.params.organizationId
  entity.meterId = event.params.meterId
  entity.isActive = event.params.isActive

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleMeterCreated(event: MeterCreatedEvent): void {
  let entity = new MeterCreated(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.organizationId = event.params.organizationId
  entity.meterId = event.params.meterId

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleMeterPaymentProcessed(
  event: MeterPaymentProcessedEvent,
): void {
  let entity = new MeterPaymentProcessed(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.organizationId = event.params.organizationId
  entity.meterId = event.params.meterId
  entity.tokenId = event.params.tokenId
  entity.usage = event.params.usage

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleMeterUsageSet(event: MeterUsageSetEvent): void {
  let entity = new MeterUsageSet(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.organizationId = event.params.organizationId
  entity.meterId = event.params.meterId
  entity.tokenId = event.params.tokenId
  entity.usage = event.params.usage

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}
