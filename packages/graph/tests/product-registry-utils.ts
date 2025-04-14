import { newMockEvent } from "matchstick-as"
import { ethereum, BigInt } from "@graphprotocol/graph-ts"
import {
  ProductCreated,
  ProductPricingLinkUpdate,
  ProductStatusChanged,
  ProductUpdated
} from "../generated/ProductRegistry/ProductRegistry"

export function createProductCreatedEvent(
  organizationId: BigInt,
  productId: BigInt
): ProductCreated {
  let productCreatedEvent = changetype<ProductCreated>(newMockEvent())

  productCreatedEvent.parameters = new Array()

  productCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "organizationId",
      ethereum.Value.fromUnsignedBigInt(organizationId)
    )
  )
  productCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "productId",
      ethereum.Value.fromUnsignedBigInt(productId)
    )
  )

  return productCreatedEvent
}

export function createProductPricingLinkUpdateEvent(
  organizationId: BigInt,
  productId: BigInt,
  pricingId: BigInt,
  isLinked: boolean
): ProductPricingLinkUpdate {
  let productPricingLinkUpdateEvent =
    changetype<ProductPricingLinkUpdate>(newMockEvent())

  productPricingLinkUpdateEvent.parameters = new Array()

  productPricingLinkUpdateEvent.parameters.push(
    new ethereum.EventParam(
      "organizationId",
      ethereum.Value.fromUnsignedBigInt(organizationId)
    )
  )
  productPricingLinkUpdateEvent.parameters.push(
    new ethereum.EventParam(
      "productId",
      ethereum.Value.fromUnsignedBigInt(productId)
    )
  )
  productPricingLinkUpdateEvent.parameters.push(
    new ethereum.EventParam(
      "pricingId",
      ethereum.Value.fromUnsignedBigInt(pricingId)
    )
  )
  productPricingLinkUpdateEvent.parameters.push(
    new ethereum.EventParam("isLinked", ethereum.Value.fromBoolean(isLinked))
  )

  return productPricingLinkUpdateEvent
}

export function createProductStatusChangedEvent(
  organizationId: BigInt,
  productId: BigInt,
  isActive: boolean
): ProductStatusChanged {
  let productStatusChangedEvent =
    changetype<ProductStatusChanged>(newMockEvent())

  productStatusChangedEvent.parameters = new Array()

  productStatusChangedEvent.parameters.push(
    new ethereum.EventParam(
      "organizationId",
      ethereum.Value.fromUnsignedBigInt(organizationId)
    )
  )
  productStatusChangedEvent.parameters.push(
    new ethereum.EventParam(
      "productId",
      ethereum.Value.fromUnsignedBigInt(productId)
    )
  )
  productStatusChangedEvent.parameters.push(
    new ethereum.EventParam("isActive", ethereum.Value.fromBoolean(isActive))
  )

  return productStatusChangedEvent
}

export function createProductUpdatedEvent(
  organizationId: BigInt,
  productId: BigInt
): ProductUpdated {
  let productUpdatedEvent = changetype<ProductUpdated>(newMockEvent())

  productUpdatedEvent.parameters = new Array()

  productUpdatedEvent.parameters.push(
    new ethereum.EventParam(
      "organizationId",
      ethereum.Value.fromUnsignedBigInt(organizationId)
    )
  )
  productUpdatedEvent.parameters.push(
    new ethereum.EventParam(
      "productId",
      ethereum.Value.fromUnsignedBigInt(productId)
    )
  )

  return productUpdatedEvent
}
