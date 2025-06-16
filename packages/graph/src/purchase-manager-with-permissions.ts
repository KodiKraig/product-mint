import {
  OwnershipTransferStarted as OwnershipTransferStartedEvent,
  OwnershipTransferred as OwnershipTransferredEvent,
  Paused as PausedEvent,
  PerformPurchase as PerformPurchaseEvent,
  ProductsPurchased as ProductsPurchasedEvent,
  SubscriptionRenewed as SubscriptionRenewedEvent,
  Unpaused as UnpausedEvent,
} from "../generated/PurchaseManagerWithPermissions/PurchaseManagerWithPermissions"
import {
  OwnershipTransferStarted,
  OwnershipTransferred,
  Paused,
  PerformPurchase,
  ProductsPurchased,
  SubscriptionRenewed,
  Unpaused,
} from "../generated/schema"

export function handleOwnershipTransferStarted(
  event: OwnershipTransferStartedEvent,
): void {
  let entity = new OwnershipTransferStarted(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.previousOwner = event.params.previousOwner
  entity.newOwner = event.params.newOwner

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleOwnershipTransferred(
  event: OwnershipTransferredEvent,
): void {
  let entity = new OwnershipTransferred(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.previousOwner = event.params.previousOwner
  entity.newOwner = event.params.newOwner

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handlePaused(event: PausedEvent): void {
  let entity = new Paused(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.account = event.params.account

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handlePerformPurchase(event: PerformPurchaseEvent): void {
  let entity = new PerformPurchase(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.orgId = event.params.orgId
  entity.passOwner = event.params.passOwner
  entity.purchaser = event.params.purchaser
  entity.token = event.params.token
  entity.amountPaid = event.params.amountPaid

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleProductsPurchased(event: ProductsPurchasedEvent): void {
  let entity = new ProductsPurchased(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.orgId = event.params.orgId
  entity.productPassId = event.params.productPassId
  entity.passOwner = event.params.passOwner
  entity.productIds = event.params.productIds
  entity.pricingIds = event.params.pricingIds
  entity.quantities = event.params.quantities
  entity.token = event.params.token
  entity.amountPaid = event.params.amountPaid

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleSubscriptionRenewed(
  event: SubscriptionRenewedEvent,
): void {
  let entity = new SubscriptionRenewed(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.orgId = event.params.orgId
  entity.productPassId = event.params.productPassId
  entity.productId = event.params.productId
  entity.purchaser = event.params.purchaser
  entity.token = event.params.token
  entity.subtotalAmount = event.params.subtotalAmount

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleUnpaused(event: UnpausedEvent): void {
  let entity = new Unpaused(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.account = event.params.account

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}
