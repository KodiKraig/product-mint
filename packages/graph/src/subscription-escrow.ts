import {
  OwnerChangePricingSet as OwnerChangePricingSetEvent,
  SubscriptionCycleUpdated as SubscriptionCycleUpdatedEvent,
  SubscriptionPausableSet as SubscriptionPausableSetEvent,
  SubscriptionPricingChanged as SubscriptionPricingChangedEvent,
  UnitQuantitySet as UnitQuantitySetEvent,
} from "../generated/SubscriptionEscrow/SubscriptionEscrow"
import {
  OwnerChangePricingSet,
  SubscriptionCycleUpdated,
  SubscriptionPausableSet,
  SubscriptionPricingChanged,
  UnitQuantitySet,
} from "../generated/schema"

export function handleOwnerChangePricingSet(
  event: OwnerChangePricingSetEvent,
): void {
  let entity = new OwnerChangePricingSet(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.organizationId = event.params.organizationId
  entity.canChange = event.params.canChange

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleSubscriptionCycleUpdated(
  event: SubscriptionCycleUpdatedEvent,
): void {
  let entity = new SubscriptionCycleUpdated(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.organizationId = event.params.organizationId
  entity.productPassId = event.params.productPassId
  entity.productId = event.params.productId
  entity.status = event.params.status
  entity.startDate = event.params.startDate
  entity.endDate = event.params.endDate

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleSubscriptionPausableSet(
  event: SubscriptionPausableSetEvent,
): void {
  let entity = new SubscriptionPausableSet(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.organizationId = event.params.organizationId
  entity.pausable = event.params.pausable

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleSubscriptionPricingChanged(
  event: SubscriptionPricingChangedEvent,
): void {
  let entity = new SubscriptionPricingChanged(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.organizationId = event.params.organizationId
  entity.productPassId = event.params.productPassId
  entity.productId = event.params.productId
  entity.newPricingId = event.params.newPricingId

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleUnitQuantitySet(event: UnitQuantitySetEvent): void {
  let entity = new UnitQuantitySet(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.productPassId = event.params.productPassId
  entity.productId = event.params.productId
  entity.quantity = event.params.quantity
  entity.maxQuantity = event.params.maxQuantity

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}
