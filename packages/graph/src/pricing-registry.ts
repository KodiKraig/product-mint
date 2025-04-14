import {
  PricingCreated as PricingCreatedEvent,
  PricingStatusChanged as PricingStatusChangedEvent,
  PricingUpdated as PricingUpdatedEvent,
  RestrictedAccessGranted as RestrictedAccessGrantedEvent,
} from "../generated/PricingRegistry/PricingRegistry"
import {
  PricingCreated,
  PricingStatusChanged,
  PricingUpdated,
  RestrictedAccessGranted,
} from "../generated/schema"

export function handlePricingCreated(event: PricingCreatedEvent): void {
  let entity = new PricingCreated(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.organizationId = event.params.organizationId
  entity.pricingId = event.params.pricingId

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handlePricingStatusChanged(
  event: PricingStatusChangedEvent,
): void {
  let entity = new PricingStatusChanged(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.organizationId = event.params.organizationId
  entity.pricingId = event.params.pricingId
  entity.isActive = event.params.isActive

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handlePricingUpdated(event: PricingUpdatedEvent): void {
  let entity = new PricingUpdated(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.organizationId = event.params.organizationId
  entity.pricingId = event.params.pricingId

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleRestrictedAccessGranted(
  event: RestrictedAccessGrantedEvent,
): void {
  let entity = new RestrictedAccessGranted(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.organizationId = event.params.organizationId
  entity.pricingId = event.params.pricingId
  entity.productPassOwner = event.params.productPassOwner
  entity.isRestricted = event.params.isRestricted

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}
