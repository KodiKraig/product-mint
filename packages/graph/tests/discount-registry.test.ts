import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterAll
} from "matchstick-as/assembly/index"
import { BigInt, Address } from "@graphprotocol/graph-ts"
import { DiscountCreated } from "../generated/schema"
import { DiscountCreated as DiscountCreatedEvent } from "../generated/DiscountRegistry/DiscountRegistry"
import { handleDiscountCreated } from "../src/discount-registry"
import { createDiscountCreatedEvent } from "./discount-registry-utils"

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/developer/matchstick/#tests-structure-0-5-0

describe("Describe entity assertions", () => {
  beforeAll(() => {
    let orgId = BigInt.fromI32(234)
    let discountId = BigInt.fromI32(234)
    let name = "Example string value"
    let discount = BigInt.fromI32(234)
    let newDiscountCreatedEvent = createDiscountCreatedEvent(
      orgId,
      discountId,
      name,
      discount
    )
    handleDiscountCreated(newDiscountCreatedEvent)
  })

  afterAll(() => {
    clearStore()
  })

  // For more test scenarios, see:
  // https://thegraph.com/docs/en/developer/matchstick/#write-a-unit-test

  test("DiscountCreated created and stored", () => {
    assert.entityCount("DiscountCreated", 1)

    // 0xa16081f360e3847006db660bae1c6d1b2e17ec2a is the default address used in newMockEvent() function
    assert.fieldEquals(
      "DiscountCreated",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "orgId",
      "234"
    )
    assert.fieldEquals(
      "DiscountCreated",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "discountId",
      "234"
    )
    assert.fieldEquals(
      "DiscountCreated",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "name",
      "Example string value"
    )
    assert.fieldEquals(
      "DiscountCreated",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "discount",
      "234"
    )

    // More assert options:
    // https://thegraph.com/docs/en/developer/matchstick/#asserts
  })
})
