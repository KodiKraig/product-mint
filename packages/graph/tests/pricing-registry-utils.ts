import { newMockEvent } from "matchstick-as"
import { ethereum, BigInt, Address } from "@graphprotocol/graph-ts"
import {
  PricingCreated,
  PricingStatusChanged,
  PricingUpdated,
  RestrictedAccessGranted
} from "../generated/PricingRegistry/PricingRegistry"

export function createPricingCreatedEvent(
  organizationId: BigInt,
  pricingId: BigInt
): PricingCreated {
  let pricingCreatedEvent = changetype<PricingCreated>(newMockEvent())

  pricingCreatedEvent.parameters = new Array()

  pricingCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "organizationId",
      ethereum.Value.fromUnsignedBigInt(organizationId)
    )
  )
  pricingCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "pricingId",
      ethereum.Value.fromUnsignedBigInt(pricingId)
    )
  )

  return pricingCreatedEvent
}

export function createPricingStatusChangedEvent(
  organizationId: BigInt,
  pricingId: BigInt,
  isActive: boolean
): PricingStatusChanged {
  let pricingStatusChangedEvent =
    changetype<PricingStatusChanged>(newMockEvent())

  pricingStatusChangedEvent.parameters = new Array()

  pricingStatusChangedEvent.parameters.push(
    new ethereum.EventParam(
      "organizationId",
      ethereum.Value.fromUnsignedBigInt(organizationId)
    )
  )
  pricingStatusChangedEvent.parameters.push(
    new ethereum.EventParam(
      "pricingId",
      ethereum.Value.fromUnsignedBigInt(pricingId)
    )
  )
  pricingStatusChangedEvent.parameters.push(
    new ethereum.EventParam("isActive", ethereum.Value.fromBoolean(isActive))
  )

  return pricingStatusChangedEvent
}

export function createPricingUpdatedEvent(
  organizationId: BigInt,
  pricingId: BigInt
): PricingUpdated {
  let pricingUpdatedEvent = changetype<PricingUpdated>(newMockEvent())

  pricingUpdatedEvent.parameters = new Array()

  pricingUpdatedEvent.parameters.push(
    new ethereum.EventParam(
      "organizationId",
      ethereum.Value.fromUnsignedBigInt(organizationId)
    )
  )
  pricingUpdatedEvent.parameters.push(
    new ethereum.EventParam(
      "pricingId",
      ethereum.Value.fromUnsignedBigInt(pricingId)
    )
  )

  return pricingUpdatedEvent
}

export function createRestrictedAccessGrantedEvent(
  organizationId: BigInt,
  pricingId: BigInt,
  productPassOwner: Address,
  isRestricted: boolean
): RestrictedAccessGranted {
  let restrictedAccessGrantedEvent =
    changetype<RestrictedAccessGranted>(newMockEvent())

  restrictedAccessGrantedEvent.parameters = new Array()

  restrictedAccessGrantedEvent.parameters.push(
    new ethereum.EventParam(
      "organizationId",
      ethereum.Value.fromUnsignedBigInt(organizationId)
    )
  )
  restrictedAccessGrantedEvent.parameters.push(
    new ethereum.EventParam(
      "pricingId",
      ethereum.Value.fromUnsignedBigInt(pricingId)
    )
  )
  restrictedAccessGrantedEvent.parameters.push(
    new ethereum.EventParam(
      "productPassOwner",
      ethereum.Value.fromAddress(productPassOwner)
    )
  )
  restrictedAccessGrantedEvent.parameters.push(
    new ethereum.EventParam(
      "isRestricted",
      ethereum.Value.fromBoolean(isRestricted)
    )
  )

  return restrictedAccessGrantedEvent
}
