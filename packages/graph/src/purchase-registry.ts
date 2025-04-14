import {
  GiftingStatusChanged as GiftingStatusChangedEvent,
  MaxMintsUpdated as MaxMintsUpdatedEvent,
  MintClosedStatusChanged as MintClosedStatusChangedEvent,
  ProductMaxSupplyUpdated as ProductMaxSupplyUpdatedEvent,
  WhitelistPassOwnerUpdated as WhitelistPassOwnerUpdatedEvent,
  WhitelistStatusChanged as WhitelistStatusChangedEvent,
} from "../generated/PurchaseRegistry/PurchaseRegistry"
import {
  GiftingStatusChanged,
  MaxMintsUpdated,
  MintClosedStatusChanged,
  ProductMaxSupplyUpdated,
  WhitelistPassOwnerUpdated,
  WhitelistStatusChanged,
} from "../generated/schema"

export function handleGiftingStatusChanged(
  event: GiftingStatusChangedEvent,
): void {
  let entity = new GiftingStatusChanged(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.organizationId = event.params.organizationId
  entity.isGifting = event.params.isGifting

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleMaxMintsUpdated(event: MaxMintsUpdatedEvent): void {
  let entity = new MaxMintsUpdated(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.organizationId = event.params.organizationId
  entity.maxMints = event.params.maxMints

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleMintClosedStatusChanged(
  event: MintClosedStatusChangedEvent,
): void {
  let entity = new MintClosedStatusChanged(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.organizationId = event.params.organizationId
  entity.isMintClosed = event.params.isMintClosed

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleProductMaxSupplyUpdated(
  event: ProductMaxSupplyUpdatedEvent,
): void {
  let entity = new ProductMaxSupplyUpdated(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.organizationId = event.params.organizationId
  entity.productId = event.params.productId
  entity.maxSupply = event.params.maxSupply

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleWhitelistPassOwnerUpdated(
  event: WhitelistPassOwnerUpdatedEvent,
): void {
  let entity = new WhitelistPassOwnerUpdated(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.organizationId = event.params.organizationId
  entity.passOwner = event.params.passOwner
  entity.isWhitelisted = event.params.isWhitelisted

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleWhitelistStatusChanged(
  event: WhitelistStatusChangedEvent,
): void {
  let entity = new WhitelistStatusChanged(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.organizationId = event.params.organizationId
  entity.isWhitelist = event.params.isWhitelist

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}
