import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterAll
} from "matchstick-as/assembly/index"
import { Address, Bytes } from "@graphprotocol/graph-ts"
import { DynamicTokenRegistrationUpdated } from "../generated/schema"
import { DynamicTokenRegistrationUpdated as DynamicTokenRegistrationUpdatedEvent } from "../generated/DynamicPriceRegistry/DynamicPriceRegistry"
import { handleDynamicTokenRegistrationUpdated } from "../src/dynamic-price-registry"
import { createDynamicTokenRegistrationUpdatedEvent } from "./dynamic-price-registry-utils"

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/developer/matchstick/#tests-structure-0-5-0

describe("Describe entity assertions", () => {
  beforeAll(() => {
    let token = Address.fromString("0x0000000000000000000000000000000000000001")
    let registered = "boolean Not implemented"
    let newDynamicTokenRegistrationUpdatedEvent =
      createDynamicTokenRegistrationUpdatedEvent(token, registered)
    handleDynamicTokenRegistrationUpdated(
      newDynamicTokenRegistrationUpdatedEvent
    )
  })

  afterAll(() => {
    clearStore()
  })

  // For more test scenarios, see:
  // https://thegraph.com/docs/en/developer/matchstick/#write-a-unit-test

  test("DynamicTokenRegistrationUpdated created and stored", () => {
    assert.entityCount("DynamicTokenRegistrationUpdated", 1)

    // 0xa16081f360e3847006db660bae1c6d1b2e17ec2a is the default address used in newMockEvent() function
    assert.fieldEquals(
      "DynamicTokenRegistrationUpdated",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "token",
      "0x0000000000000000000000000000000000000001"
    )
    assert.fieldEquals(
      "DynamicTokenRegistrationUpdated",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "registered",
      "boolean Not implemented"
    )

    // More assert options:
    // https://thegraph.com/docs/en/developer/matchstick/#asserts
  })
})
