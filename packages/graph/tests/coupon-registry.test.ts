import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterAll
} from "matchstick-as/assembly/index"
import { BigInt, Address } from "@graphprotocol/graph-ts"
import { CouponCreated } from "../generated/schema"
import { CouponCreated as CouponCreatedEvent } from "../generated/CouponRegistry/CouponRegistry"
import { handleCouponCreated } from "../src/coupon-registry"
import { createCouponCreatedEvent } from "./coupon-registry-utils"

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/developer/matchstick/#tests-structure-0-5-0

describe("Describe entity assertions", () => {
  beforeAll(() => {
    let orgId = BigInt.fromI32(234)
    let couponId = BigInt.fromI32(234)
    let newCouponCreatedEvent = createCouponCreatedEvent(orgId, couponId)
    handleCouponCreated(newCouponCreatedEvent)
  })

  afterAll(() => {
    clearStore()
  })

  // For more test scenarios, see:
  // https://thegraph.com/docs/en/developer/matchstick/#write-a-unit-test

  test("CouponCreated created and stored", () => {
    assert.entityCount("CouponCreated", 1)

    // 0xa16081f360e3847006db660bae1c6d1b2e17ec2a is the default address used in newMockEvent() function
    assert.fieldEquals(
      "CouponCreated",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "orgId",
      "234"
    )
    assert.fieldEquals(
      "CouponCreated",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "couponId",
      "234"
    )

    // More assert options:
    // https://thegraph.com/docs/en/developer/matchstick/#asserts
  })
})
