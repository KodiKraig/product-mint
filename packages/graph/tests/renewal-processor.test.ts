import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterAll
} from "matchstick-as/assembly/index"
import { BigInt } from "@graphprotocol/graph-ts"
import { RenewalProcessed } from "../generated/schema"
import { RenewalProcessed as RenewalProcessedEvent } from "../generated/RenewalProcessor/RenewalProcessor"
import { handleRenewalProcessed } from "../src/renewal-processor"
import { createRenewalProcessedEvent } from "./renewal-processor-utils"

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/developer/matchstick/#tests-structure-0-5-0

describe("Describe entity assertions", () => {
  beforeAll(() => {
    let orgId = BigInt.fromI32(234)
    let productPassId = BigInt.fromI32(234)
    let productId = BigInt.fromI32(234)
    let status = 123
    let newRenewalProcessedEvent = createRenewalProcessedEvent(
      orgId,
      productPassId,
      productId,
      status
    )
    handleRenewalProcessed(newRenewalProcessedEvent)
  })

  afterAll(() => {
    clearStore()
  })

  // For more test scenarios, see:
  // https://thegraph.com/docs/en/developer/matchstick/#write-a-unit-test

  test("RenewalProcessed created and stored", () => {
    assert.entityCount("RenewalProcessed", 1)

    // 0xa16081f360e3847006db660bae1c6d1b2e17ec2a is the default address used in newMockEvent() function
    assert.fieldEquals(
      "RenewalProcessed",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "orgId",
      "234"
    )
    assert.fieldEquals(
      "RenewalProcessed",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "productPassId",
      "234"
    )
    assert.fieldEquals(
      "RenewalProcessed",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "productId",
      "234"
    )
    assert.fieldEquals(
      "RenewalProcessed",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "status",
      "123"
    )

    // More assert options:
    // https://thegraph.com/docs/en/developer/matchstick/#asserts
  })
})
