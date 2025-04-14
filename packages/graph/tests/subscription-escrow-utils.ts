import { newMockEvent } from "matchstick-as"
import { ethereum, BigInt } from "@graphprotocol/graph-ts"
import {
  OwnerChangePricingSet,
  SubscriptionCycleUpdated,
  SubscriptionPausableSet,
  SubscriptionPricingChanged,
  UnitQuantitySet
} from "../generated/SubscriptionEscrow/SubscriptionEscrow"

export function createOwnerChangePricingSetEvent(
  organizationId: BigInt,
  canChange: boolean
): OwnerChangePricingSet {
  let ownerChangePricingSetEvent =
    changetype<OwnerChangePricingSet>(newMockEvent())

  ownerChangePricingSetEvent.parameters = new Array()

  ownerChangePricingSetEvent.parameters.push(
    new ethereum.EventParam(
      "organizationId",
      ethereum.Value.fromUnsignedBigInt(organizationId)
    )
  )
  ownerChangePricingSetEvent.parameters.push(
    new ethereum.EventParam("canChange", ethereum.Value.fromBoolean(canChange))
  )

  return ownerChangePricingSetEvent
}

export function createSubscriptionCycleUpdatedEvent(
  organizationId: BigInt,
  productPassId: BigInt,
  productId: BigInt,
  status: i32,
  startDate: BigInt,
  endDate: BigInt
): SubscriptionCycleUpdated {
  let subscriptionCycleUpdatedEvent =
    changetype<SubscriptionCycleUpdated>(newMockEvent())

  subscriptionCycleUpdatedEvent.parameters = new Array()

  subscriptionCycleUpdatedEvent.parameters.push(
    new ethereum.EventParam(
      "organizationId",
      ethereum.Value.fromUnsignedBigInt(organizationId)
    )
  )
  subscriptionCycleUpdatedEvent.parameters.push(
    new ethereum.EventParam(
      "productPassId",
      ethereum.Value.fromUnsignedBigInt(productPassId)
    )
  )
  subscriptionCycleUpdatedEvent.parameters.push(
    new ethereum.EventParam(
      "productId",
      ethereum.Value.fromUnsignedBigInt(productId)
    )
  )
  subscriptionCycleUpdatedEvent.parameters.push(
    new ethereum.EventParam(
      "status",
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(status))
    )
  )
  subscriptionCycleUpdatedEvent.parameters.push(
    new ethereum.EventParam(
      "startDate",
      ethereum.Value.fromUnsignedBigInt(startDate)
    )
  )
  subscriptionCycleUpdatedEvent.parameters.push(
    new ethereum.EventParam(
      "endDate",
      ethereum.Value.fromUnsignedBigInt(endDate)
    )
  )

  return subscriptionCycleUpdatedEvent
}

export function createSubscriptionPausableSetEvent(
  organizationId: BigInt,
  pausable: boolean
): SubscriptionPausableSet {
  let subscriptionPausableSetEvent =
    changetype<SubscriptionPausableSet>(newMockEvent())

  subscriptionPausableSetEvent.parameters = new Array()

  subscriptionPausableSetEvent.parameters.push(
    new ethereum.EventParam(
      "organizationId",
      ethereum.Value.fromUnsignedBigInt(organizationId)
    )
  )
  subscriptionPausableSetEvent.parameters.push(
    new ethereum.EventParam("pausable", ethereum.Value.fromBoolean(pausable))
  )

  return subscriptionPausableSetEvent
}

export function createSubscriptionPricingChangedEvent(
  organizationId: BigInt,
  productPassId: BigInt,
  productId: BigInt,
  newPricingId: BigInt
): SubscriptionPricingChanged {
  let subscriptionPricingChangedEvent =
    changetype<SubscriptionPricingChanged>(newMockEvent())

  subscriptionPricingChangedEvent.parameters = new Array()

  subscriptionPricingChangedEvent.parameters.push(
    new ethereum.EventParam(
      "organizationId",
      ethereum.Value.fromUnsignedBigInt(organizationId)
    )
  )
  subscriptionPricingChangedEvent.parameters.push(
    new ethereum.EventParam(
      "productPassId",
      ethereum.Value.fromUnsignedBigInt(productPassId)
    )
  )
  subscriptionPricingChangedEvent.parameters.push(
    new ethereum.EventParam(
      "productId",
      ethereum.Value.fromUnsignedBigInt(productId)
    )
  )
  subscriptionPricingChangedEvent.parameters.push(
    new ethereum.EventParam(
      "newPricingId",
      ethereum.Value.fromUnsignedBigInt(newPricingId)
    )
  )

  return subscriptionPricingChangedEvent
}

export function createUnitQuantitySetEvent(
  productPassId: BigInt,
  productId: BigInt,
  quantity: BigInt,
  maxQuantity: BigInt
): UnitQuantitySet {
  let unitQuantitySetEvent = changetype<UnitQuantitySet>(newMockEvent())

  unitQuantitySetEvent.parameters = new Array()

  unitQuantitySetEvent.parameters.push(
    new ethereum.EventParam(
      "productPassId",
      ethereum.Value.fromUnsignedBigInt(productPassId)
    )
  )
  unitQuantitySetEvent.parameters.push(
    new ethereum.EventParam(
      "productId",
      ethereum.Value.fromUnsignedBigInt(productId)
    )
  )
  unitQuantitySetEvent.parameters.push(
    new ethereum.EventParam(
      "quantity",
      ethereum.Value.fromUnsignedBigInt(quantity)
    )
  )
  unitQuantitySetEvent.parameters.push(
    new ethereum.EventParam(
      "maxQuantity",
      ethereum.Value.fromUnsignedBigInt(maxQuantity)
    )
  )

  return unitQuantitySetEvent
}
