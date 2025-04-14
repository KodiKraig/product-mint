import { newMockEvent } from "matchstick-as"
import { ethereum, BigInt, Address } from "@graphprotocol/graph-ts"
import {
  CouponCreated,
  CouponRedeemed,
  CouponStatusUpdated,
  CouponUpdated,
  PassCouponCodeSet,
  RestrictedAccessUpdated
} from "../generated/CouponRegistry/CouponRegistry"

export function createCouponCreatedEvent(
  orgId: BigInt,
  couponId: BigInt
): CouponCreated {
  let couponCreatedEvent = changetype<CouponCreated>(newMockEvent())

  couponCreatedEvent.parameters = new Array()

  couponCreatedEvent.parameters.push(
    new ethereum.EventParam("orgId", ethereum.Value.fromUnsignedBigInt(orgId))
  )
  couponCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "couponId",
      ethereum.Value.fromUnsignedBigInt(couponId)
    )
  )

  return couponCreatedEvent
}

export function createCouponRedeemedEvent(
  orgId: BigInt,
  couponId: BigInt,
  passOwner: Address
): CouponRedeemed {
  let couponRedeemedEvent = changetype<CouponRedeemed>(newMockEvent())

  couponRedeemedEvent.parameters = new Array()

  couponRedeemedEvent.parameters.push(
    new ethereum.EventParam("orgId", ethereum.Value.fromUnsignedBigInt(orgId))
  )
  couponRedeemedEvent.parameters.push(
    new ethereum.EventParam(
      "couponId",
      ethereum.Value.fromUnsignedBigInt(couponId)
    )
  )
  couponRedeemedEvent.parameters.push(
    new ethereum.EventParam("passOwner", ethereum.Value.fromAddress(passOwner))
  )

  return couponRedeemedEvent
}

export function createCouponStatusUpdatedEvent(
  orgId: BigInt,
  couponId: BigInt,
  isActive: boolean
): CouponStatusUpdated {
  let couponStatusUpdatedEvent = changetype<CouponStatusUpdated>(newMockEvent())

  couponStatusUpdatedEvent.parameters = new Array()

  couponStatusUpdatedEvent.parameters.push(
    new ethereum.EventParam("orgId", ethereum.Value.fromUnsignedBigInt(orgId))
  )
  couponStatusUpdatedEvent.parameters.push(
    new ethereum.EventParam(
      "couponId",
      ethereum.Value.fromUnsignedBigInt(couponId)
    )
  )
  couponStatusUpdatedEvent.parameters.push(
    new ethereum.EventParam("isActive", ethereum.Value.fromBoolean(isActive))
  )

  return couponStatusUpdatedEvent
}

export function createCouponUpdatedEvent(
  orgId: BigInt,
  couponId: BigInt
): CouponUpdated {
  let couponUpdatedEvent = changetype<CouponUpdated>(newMockEvent())

  couponUpdatedEvent.parameters = new Array()

  couponUpdatedEvent.parameters.push(
    new ethereum.EventParam("orgId", ethereum.Value.fromUnsignedBigInt(orgId))
  )
  couponUpdatedEvent.parameters.push(
    new ethereum.EventParam(
      "couponId",
      ethereum.Value.fromUnsignedBigInt(couponId)
    )
  )

  return couponUpdatedEvent
}

export function createPassCouponCodeSetEvent(
  orgId: BigInt,
  passOwner: Address,
  code: string
): PassCouponCodeSet {
  let passCouponCodeSetEvent = changetype<PassCouponCodeSet>(newMockEvent())

  passCouponCodeSetEvent.parameters = new Array()

  passCouponCodeSetEvent.parameters.push(
    new ethereum.EventParam("orgId", ethereum.Value.fromUnsignedBigInt(orgId))
  )
  passCouponCodeSetEvent.parameters.push(
    new ethereum.EventParam("passOwner", ethereum.Value.fromAddress(passOwner))
  )
  passCouponCodeSetEvent.parameters.push(
    new ethereum.EventParam("code", ethereum.Value.fromString(code))
  )

  return passCouponCodeSetEvent
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
