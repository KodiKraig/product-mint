import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterAll
} from "matchstick-as/assembly/index"
import { BigInt, Address } from "@graphprotocol/graph-ts"
import { GiftingStatusChanged } from "../generated/schema"
import { GiftingStatusChanged as GiftingStatusChangedEvent } from "../generated/PurchaseRegistry/PurchaseRegistry"
import { handleGiftingStatusChanged } from "../src/purchase-registry"
import { createGiftingStatusChangedEvent } from "./purchase-registry-utils"

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/developer/matchstick/#tests-structure-0-5-0

describe("Describe entity assertions", () => {
  beforeAll(() => {
    let organizationId = BigInt.fromI32(234)
    let isGifting = "boolean Not implemented"
    let newGiftingStatusChangedEvent = createGiftingStatusChangedEvent(
      organizationId,
      isGifting
    )
    handleGiftingStatusChanged(newGiftingStatusChangedEvent)
  })

  afterAll(() => {
    clearStore()
  })

  // For more test scenarios, see:
  // https://thegraph.com/docs/en/developer/matchstick/#write-a-unit-test

  test("GiftingStatusChanged created and stored", () => {
    assert.entityCount("GiftingStatusChanged", 1)

    // 0xa16081f360e3847006db660bae1c6d1b2e17ec2a is the default address used in newMockEvent() function
    assert.fieldEquals(
      "GiftingStatusChanged",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "organizationId",
      "234"
    )
    assert.fieldEquals(
      "GiftingStatusChanged",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "isGifting",
      "boolean Not implemented"
    )

    // More assert options:
    // https://thegraph.com/docs/en/developer/matchstick/#asserts
  })
})
