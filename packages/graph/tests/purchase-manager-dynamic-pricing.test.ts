import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterAll
} from "matchstick-as/assembly/index"
import { Address, BigInt } from "@graphprotocol/graph-ts"
import { DynamicPriceRegistryUpdated } from "../generated/schema"
import { DynamicPriceRegistryUpdated as DynamicPriceRegistryUpdatedEvent } from "../generated/PurchaseManagerDynamicPricing/PurchaseManagerDynamicPricing"
import { handleDynamicPriceRegistryUpdated } from "../src/purchase-manager-dynamic-pricing"
import { createDynamicPriceRegistryUpdatedEvent } from "./purchase-manager-dynamic-pricing-utils"

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/developer/matchstick/#tests-structure-0-5-0

describe("Describe entity assertions", () => {
  beforeAll(() => {
    let _dynamicPriceRegistry = Address.fromString(
      "0x0000000000000000000000000000000000000001"
    )
    let newDynamicPriceRegistryUpdatedEvent =
      createDynamicPriceRegistryUpdatedEvent(_dynamicPriceRegistry)
    handleDynamicPriceRegistryUpdated(newDynamicPriceRegistryUpdatedEvent)
  })

  afterAll(() => {
    clearStore()
  })

  // For more test scenarios, see:
  // https://thegraph.com/docs/en/developer/matchstick/#write-a-unit-test

  test("DynamicPriceRegistryUpdated created and stored", () => {
    assert.entityCount("DynamicPriceRegistryUpdated", 1)

    // 0xa16081f360e3847006db660bae1c6d1b2e17ec2a is the default address used in newMockEvent() function
    assert.fieldEquals(
      "DynamicPriceRegistryUpdated",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "_dynamicPriceRegistry",
      "0x0000000000000000000000000000000000000001"
    )

    // More assert options:
    // https://thegraph.com/docs/en/developer/matchstick/#asserts
  })
})
