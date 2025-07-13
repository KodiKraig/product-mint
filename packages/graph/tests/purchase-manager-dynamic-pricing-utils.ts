import { newMockEvent } from "matchstick-as"
import { ethereum, Address, BigInt } from "@graphprotocol/graph-ts"
import {
  DynamicPriceRegistryUpdated,
  OwnershipTransferStarted,
  OwnershipTransferred,
  Paused,
  PerformPurchase,
  ProductsPurchased,
  SubscriptionRenewed,
  Unpaused
} from "../generated/PurchaseManagerDynamicPricing/PurchaseManagerDynamicPricing"

export function createDynamicPriceRegistryUpdatedEvent(
  _dynamicPriceRegistry: Address
): DynamicPriceRegistryUpdated {
  let dynamicPriceRegistryUpdatedEvent =
    changetype<DynamicPriceRegistryUpdated>(newMockEvent())

  dynamicPriceRegistryUpdatedEvent.parameters = new Array()

  dynamicPriceRegistryUpdatedEvent.parameters.push(
    new ethereum.EventParam(
      "_dynamicPriceRegistry",
      ethereum.Value.fromAddress(_dynamicPriceRegistry)
    )
  )

  return dynamicPriceRegistryUpdatedEvent
}

export function createOwnershipTransferStartedEvent(
  previousOwner: Address,
  newOwner: Address
): OwnershipTransferStarted {
  let ownershipTransferStartedEvent =
    changetype<OwnershipTransferStarted>(newMockEvent())

  ownershipTransferStartedEvent.parameters = new Array()

  ownershipTransferStartedEvent.parameters.push(
    new ethereum.EventParam(
      "previousOwner",
      ethereum.Value.fromAddress(previousOwner)
    )
  )
  ownershipTransferStartedEvent.parameters.push(
    new ethereum.EventParam("newOwner", ethereum.Value.fromAddress(newOwner))
  )

  return ownershipTransferStartedEvent
}

export function createOwnershipTransferredEvent(
  previousOwner: Address,
  newOwner: Address
): OwnershipTransferred {
  let ownershipTransferredEvent =
    changetype<OwnershipTransferred>(newMockEvent())

  ownershipTransferredEvent.parameters = new Array()

  ownershipTransferredEvent.parameters.push(
    new ethereum.EventParam(
      "previousOwner",
      ethereum.Value.fromAddress(previousOwner)
    )
  )
  ownershipTransferredEvent.parameters.push(
    new ethereum.EventParam("newOwner", ethereum.Value.fromAddress(newOwner))
  )

  return ownershipTransferredEvent
}

export function createPausedEvent(account: Address): Paused {
  let pausedEvent = changetype<Paused>(newMockEvent())

  pausedEvent.parameters = new Array()

  pausedEvent.parameters.push(
    new ethereum.EventParam("account", ethereum.Value.fromAddress(account))
  )

  return pausedEvent
}

export function createPerformPurchaseEvent(
  orgId: BigInt,
  passOwner: Address,
  purchaser: Address,
  token: Address,
  amountPaid: BigInt
): PerformPurchase {
  let performPurchaseEvent = changetype<PerformPurchase>(newMockEvent())

  performPurchaseEvent.parameters = new Array()

  performPurchaseEvent.parameters.push(
    new ethereum.EventParam("orgId", ethereum.Value.fromUnsignedBigInt(orgId))
  )
  performPurchaseEvent.parameters.push(
    new ethereum.EventParam("passOwner", ethereum.Value.fromAddress(passOwner))
  )
  performPurchaseEvent.parameters.push(
    new ethereum.EventParam("purchaser", ethereum.Value.fromAddress(purchaser))
  )
  performPurchaseEvent.parameters.push(
    new ethereum.EventParam("token", ethereum.Value.fromAddress(token))
  )
  performPurchaseEvent.parameters.push(
    new ethereum.EventParam(
      "amountPaid",
      ethereum.Value.fromUnsignedBigInt(amountPaid)
    )
  )

  return performPurchaseEvent
}

export function createProductsPurchasedEvent(
  orgId: BigInt,
  productPassId: BigInt,
  passOwner: Address,
  productIds: Array<BigInt>,
  pricingIds: Array<BigInt>,
  quantities: Array<BigInt>,
  token: Address,
  amountPaid: BigInt
): ProductsPurchased {
  let productsPurchasedEvent = changetype<ProductsPurchased>(newMockEvent())

  productsPurchasedEvent.parameters = new Array()

  productsPurchasedEvent.parameters.push(
    new ethereum.EventParam("orgId", ethereum.Value.fromUnsignedBigInt(orgId))
  )
  productsPurchasedEvent.parameters.push(
    new ethereum.EventParam(
      "productPassId",
      ethereum.Value.fromUnsignedBigInt(productPassId)
    )
  )
  productsPurchasedEvent.parameters.push(
    new ethereum.EventParam("passOwner", ethereum.Value.fromAddress(passOwner))
  )
  productsPurchasedEvent.parameters.push(
    new ethereum.EventParam(
      "productIds",
      ethereum.Value.fromUnsignedBigIntArray(productIds)
    )
  )
  productsPurchasedEvent.parameters.push(
    new ethereum.EventParam(
      "pricingIds",
      ethereum.Value.fromUnsignedBigIntArray(pricingIds)
    )
  )
  productsPurchasedEvent.parameters.push(
    new ethereum.EventParam(
      "quantities",
      ethereum.Value.fromUnsignedBigIntArray(quantities)
    )
  )
  productsPurchasedEvent.parameters.push(
    new ethereum.EventParam("token", ethereum.Value.fromAddress(token))
  )
  productsPurchasedEvent.parameters.push(
    new ethereum.EventParam(
      "amountPaid",
      ethereum.Value.fromUnsignedBigInt(amountPaid)
    )
  )

  return productsPurchasedEvent
}

export function createSubscriptionRenewedEvent(
  orgId: BigInt,
  productPassId: BigInt,
  productId: BigInt,
  purchaser: Address,
  token: Address,
  subtotalAmount: BigInt
): SubscriptionRenewed {
  let subscriptionRenewedEvent = changetype<SubscriptionRenewed>(newMockEvent())

  subscriptionRenewedEvent.parameters = new Array()

  subscriptionRenewedEvent.parameters.push(
    new ethereum.EventParam("orgId", ethereum.Value.fromUnsignedBigInt(orgId))
  )
  subscriptionRenewedEvent.parameters.push(
    new ethereum.EventParam(
      "productPassId",
      ethereum.Value.fromUnsignedBigInt(productPassId)
    )
  )
  subscriptionRenewedEvent.parameters.push(
    new ethereum.EventParam(
      "productId",
      ethereum.Value.fromUnsignedBigInt(productId)
    )
  )
  subscriptionRenewedEvent.parameters.push(
    new ethereum.EventParam("purchaser", ethereum.Value.fromAddress(purchaser))
  )
  subscriptionRenewedEvent.parameters.push(
    new ethereum.EventParam("token", ethereum.Value.fromAddress(token))
  )
  subscriptionRenewedEvent.parameters.push(
    new ethereum.EventParam(
      "subtotalAmount",
      ethereum.Value.fromUnsignedBigInt(subtotalAmount)
    )
  )

  return subscriptionRenewedEvent
}

export function createUnpausedEvent(account: Address): Unpaused {
  let unpausedEvent = changetype<Unpaused>(newMockEvent())

  unpausedEvent.parameters = new Array()

  unpausedEvent.parameters.push(
    new ethereum.EventParam("account", ethereum.Value.fromAddress(account))
  )

  return unpausedEvent
}
