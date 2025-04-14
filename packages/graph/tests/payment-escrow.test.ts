import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterAll
} from "matchstick-as/assembly/index"
import { BigInt, Address, Bytes } from "@graphprotocol/graph-ts"
import { ExoticFeeSet } from "../generated/schema"
import { ExoticFeeSet as ExoticFeeSetEvent } from "../generated/PaymentEscrow/PaymentEscrow"
import { handleExoticFeeSet } from "../src/payment-escrow"
import { createExoticFeeSetEvent } from "./payment-escrow-utils"

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/developer/matchstick/#tests-structure-0-5-0

describe("Describe entity assertions", () => {
  beforeAll(() => {
    let fee = BigInt.fromI32(234)
    let newExoticFeeSetEvent = createExoticFeeSetEvent(fee)
    handleExoticFeeSet(newExoticFeeSetEvent)
  })

  afterAll(() => {
    clearStore()
  })

  // For more test scenarios, see:
  // https://thegraph.com/docs/en/developer/matchstick/#write-a-unit-test

  test("ExoticFeeSet created and stored", () => {
    assert.entityCount("ExoticFeeSet", 1)

    // 0xa16081f360e3847006db660bae1c6d1b2e17ec2a is the default address used in newMockEvent() function
    assert.fieldEquals(
      "ExoticFeeSet",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "fee",
      "234"
    )

    // More assert options:
    // https://thegraph.com/docs/en/developer/matchstick/#asserts
  })
})
