import { newMockEvent } from "matchstick-as"
import { ethereum, BigInt, Address } from "@graphprotocol/graph-ts"
import {
  DiscountCreated,
  DiscountMinted,
  DiscountUpdated,
  RestrictedAccessUpdated
} from "../generated/DiscountRegistry/DiscountRegistry"

export function createDiscountCreatedEvent(
  orgId: BigInt,
  discountId: BigInt,
  name: string,
  discount: BigInt
): DiscountCreated {
  let discountCreatedEvent = changetype<DiscountCreated>(newMockEvent())

  discountCreatedEvent.parameters = new Array()

  discountCreatedEvent.parameters.push(
    new ethereum.EventParam("orgId", ethereum.Value.fromUnsignedBigInt(orgId))
  )
  discountCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "discountId",
      ethereum.Value.fromUnsignedBigInt(discountId)
    )
  )
  discountCreatedEvent.parameters.push(
    new ethereum.EventParam("name", ethereum.Value.fromString(name))
  )
  discountCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "discount",
      ethereum.Value.fromUnsignedBigInt(discount)
    )
  )

  return discountCreatedEvent
}

export function createDiscountMintedEvent(
  orgId: BigInt,
  passId: BigInt,
  discountId: BigInt,
  minter: Address
): DiscountMinted {
  let discountMintedEvent = changetype<DiscountMinted>(newMockEvent())

  discountMintedEvent.parameters = new Array()

  discountMintedEvent.parameters.push(
    new ethereum.EventParam("orgId", ethereum.Value.fromUnsignedBigInt(orgId))
  )
  discountMintedEvent.parameters.push(
    new ethereum.EventParam("passId", ethereum.Value.fromUnsignedBigInt(passId))
  )
  discountMintedEvent.parameters.push(
    new ethereum.EventParam(
      "discountId",
      ethereum.Value.fromUnsignedBigInt(discountId)
    )
  )
  discountMintedEvent.parameters.push(
    new ethereum.EventParam("minter", ethereum.Value.fromAddress(minter))
  )

  return discountMintedEvent
}

export function createDiscountUpdatedEvent(
  orgId: BigInt,
  discountId: BigInt
): DiscountUpdated {
  let discountUpdatedEvent = changetype<DiscountUpdated>(newMockEvent())

  discountUpdatedEvent.parameters = new Array()

  discountUpdatedEvent.parameters.push(
    new ethereum.EventParam("orgId", ethereum.Value.fromUnsignedBigInt(orgId))
  )
  discountUpdatedEvent.parameters.push(
    new ethereum.EventParam(
      "discountId",
      ethereum.Value.fromUnsignedBigInt(discountId)
    )
  )

  return discountUpdatedEvent
}

export function createRestrictedAccessUpdatedEvent(
  orgId: BigInt,
  accessId: BigInt,
  passOwner: Address,
  restricted: boolean
): RestrictedAccessUpdated {
  let restrictedAccessUpdatedEvent =
    changetype<RestrictedAccessUpdated>(newMockEvent())

  restrictedAccessUpdatedEvent.parameters = new Array()

  restrictedAccessUpdatedEvent.parameters.push(
    new ethereum.EventParam("orgId", ethereum.Value.fromUnsignedBigInt(orgId))
  )
  restrictedAccessUpdatedEvent.parameters.push(
    new ethereum.EventParam(
      "accessId",
      ethereum.Value.fromUnsignedBigInt(accessId)
    )
  )
  restrictedAccessUpdatedEvent.parameters.push(
    new ethereum.EventParam("passOwner", ethereum.Value.fromAddress(passOwner))
  )
  restrictedAccessUpdatedEvent.parameters.push(
    new ethereum.EventParam(
      "restricted",
      ethereum.Value.fromBoolean(restricted)
    )
  )

  return restrictedAccessUpdatedEvent
}
