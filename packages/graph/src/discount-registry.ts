import {
  DiscountCreated as DiscountCreatedEvent,
  DiscountMinted as DiscountMintedEvent,
  DiscountUpdated as DiscountUpdatedEvent,
  RestrictedAccessUpdated as RestrictedAccessUpdatedEvent,
} from "../generated/DiscountRegistry/DiscountRegistry"
import {
  DiscountCreated,
  DiscountMinted,
  DiscountUpdated,
  RestrictedAccessUpdated,
} from "../generated/schema"

export function handleDiscountCreated(event: DiscountCreatedEvent): void {
  let entity = new DiscountCreated(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.orgId = event.params.orgId
  entity.discountId = event.params.discountId
  entity.name = event.params.name
  entity.discount = event.params.discount

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleDiscountMinted(event: DiscountMintedEvent): void {
  let entity = new DiscountMinted(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.orgId = event.params.orgId
  entity.passId = event.params.passId
  entity.discountId = event.params.discountId
  entity.minter = event.params.minter

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleDiscountUpdated(event: DiscountUpdatedEvent): void {
  let entity = new DiscountUpdated(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.orgId = event.params.orgId
  entity.discountId = event.params.discountId

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleRestrictedAccessUpdated(
  event: RestrictedAccessUpdatedEvent,
): void {
  let entity = new RestrictedAccessUpdated(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.orgId = event.params.orgId
  entity.accessId = event.params.accessId
  entity.passOwner = event.params.passOwner
  entity.restricted = event.params.restricted

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}
