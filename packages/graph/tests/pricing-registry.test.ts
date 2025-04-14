import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterAll
} from "matchstick-as/assembly/index"
import { BigInt, Address } from "@graphprotocol/graph-ts"
import { PricingCreated } from "../generated/schema"
import { PricingCreated as PricingCreatedEvent } from "../generated/PricingRegistry/PricingRegistry"
import { handlePricingCreated } from "../src/pricing-registry"
import { createPricingCreatedEvent } from "./pricing-registry-utils"

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/developer/matchstick/#tests-structure-0-5-0

describe("Describe entity assertions", () => {
  beforeAll(() => {
    let organizationId = BigInt.fromI32(234)
    let pricingId = BigInt.fromI32(234)
    let newPricingCreatedEvent = createPricingCreatedEvent(
      organizationId,
      pricingId
    )
    handlePricingCreated(newPricingCreatedEvent)
  })

  afterAll(() => {
    clearStore()
  })

  // For more test scenarios, see:
  // https://thegraph.com/docs/en/developer/matchstick/#write-a-unit-test

  test("PricingCreated created and stored", () => {
    assert.entityCount("PricingCreated", 1)

    // 0xa16081f360e3847006db660bae1c6d1b2e17ec2a is the default address used in newMockEvent() function
    assert.fieldEquals(
      "PricingCreated",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "organizationId",
      "234"
    )
    assert.fieldEquals(
      "PricingCreated",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "pricingId",
      "234"
    )

    // More assert options:
    // https://thegraph.com/docs/en/developer/matchstick/#asserts
  })
})
