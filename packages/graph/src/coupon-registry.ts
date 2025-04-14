import {
  CouponCreated as CouponCreatedEvent,
  CouponRedeemed as CouponRedeemedEvent,
  CouponStatusUpdated as CouponStatusUpdatedEvent,
  CouponUpdated as CouponUpdatedEvent,
  PassCouponCodeSet as PassCouponCodeSetEvent,
  RestrictedAccessUpdated as RestrictedAccessUpdatedEvent
} from "../generated/CouponRegistry/CouponRegistry"
import {
  CouponCreated,
  CouponRedeemed,
  CouponStatusUpdated,
  CouponUpdated,
  PassCouponCodeSet,
  RestrictedAccessUpdated
} from "../generated/schema"

export function handleCouponCreated(event: CouponCreatedEvent): void {
  let entity = new CouponCreated(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.orgId = event.params.orgId
  entity.couponId = event.params.couponId

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleCouponRedeemed(event: CouponRedeemedEvent): void {
  let entity = new CouponRedeemed(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.orgId = event.params.orgId
  entity.couponId = event.params.couponId
  entity.passOwner = event.params.passOwner

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleCouponStatusUpdated(
  event: CouponStatusUpdatedEvent
): void {
  let entity = new CouponStatusUpdated(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.orgId = event.params.orgId
  entity.couponId = event.params.couponId
  entity.isActive = event.params.isActive

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleCouponUpdated(event: CouponUpdatedEvent): void {
  let entity = new CouponUpdated(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.orgId = event.params.orgId
  entity.couponId = event.params.couponId

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handlePassCouponCodeSet(event: PassCouponCodeSetEvent): void {
  let entity = new PassCouponCodeSet(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.orgId = event.params.orgId
  entity.passOwner = event.params.passOwner
  entity.code = event.params.code

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleRestrictedAccessUpdated(
  event: RestrictedAccessUpdatedEvent
): void {
  let entity = new RestrictedAccessUpdated(
    event.transaction.hash.concatI32(event.logIndex.toI32())
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
