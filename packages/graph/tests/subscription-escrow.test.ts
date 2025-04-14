import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterAll
} from "matchstick-as/assembly/index"
import { BigInt } from "@graphprotocol/graph-ts"
import { OwnerChangePricingSet } from "../generated/schema"
import { OwnerChangePricingSet as OwnerChangePricingSetEvent } from "../generated/SubscriptionEscrow/SubscriptionEscrow"
import { handleOwnerChangePricingSet } from "../src/subscription-escrow"
import { createOwnerChangePricingSetEvent } from "./subscription-escrow-utils"

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/developer/matchstick/#tests-structure-0-5-0

describe("Describe entity assertions", () => {
  beforeAll(() => {
    let organizationId = BigInt.fromI32(234)
    let canChange = "boolean Not implemented"
    let newOwnerChangePricingSetEvent = createOwnerChangePricingSetEvent(
      organizationId,
      canChange
    )
    handleOwnerChangePricingSet(newOwnerChangePricingSetEvent)
  })

  afterAll(() => {
    clearStore()
  })

  // For more test scenarios, see:
  // https://thegraph.com/docs/en/developer/matchstick/#write-a-unit-test

  test("OwnerChangePricingSet created and stored", () => {
    assert.entityCount("OwnerChangePricingSet", 1)

    // 0xa16081f360e3847006db660bae1c6d1b2e17ec2a is the default address used in newMockEvent() function
    assert.fieldEquals(
      "OwnerChangePricingSet",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "organizationId",
      "234"
    )
    assert.fieldEquals(
      "OwnerChangePricingSet",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "canChange",
      "boolean Not implemented"
    )

    // More assert options:
    // https://thegraph.com/docs/en/developer/matchstick/#asserts
  })
})
