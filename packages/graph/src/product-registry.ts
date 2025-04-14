import {
  ProductCreated as ProductCreatedEvent,
  ProductPricingLinkUpdate as ProductPricingLinkUpdateEvent,
  ProductStatusChanged as ProductStatusChangedEvent,
  ProductUpdated as ProductUpdatedEvent,
} from "../generated/ProductRegistry/ProductRegistry"
import {
  ProductCreated,
  ProductPricingLinkUpdate,
  ProductStatusChanged,
  ProductUpdated,
} from "../generated/schema"

export function handleProductCreated(event: ProductCreatedEvent): void {
  let entity = new ProductCreated(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.organizationId = event.params.organizationId
  entity.productId = event.params.productId

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleProductPricingLinkUpdate(
  event: ProductPricingLinkUpdateEvent,
): void {
  let entity = new ProductPricingLinkUpdate(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.organizationId = event.params.organizationId
  entity.productId = event.params.productId
  entity.pricingId = event.params.pricingId
  entity.isLinked = event.params.isLinked

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleProductStatusChanged(
  event: ProductStatusChangedEvent,
): void {
  let entity = new ProductStatusChanged(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.organizationId = event.params.organizationId
  entity.productId = event.params.productId
  entity.isActive = event.params.isActive

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleProductUpdated(event: ProductUpdatedEvent): void {
  let entity = new ProductUpdated(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.organizationId = event.params.organizationId
  entity.productId = event.params.productId

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}
