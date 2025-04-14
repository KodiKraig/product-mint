import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterAll
} from "matchstick-as/assembly/index"
import { BigInt } from "@graphprotocol/graph-ts"
import { MeterActiveSet } from "../generated/schema"
import { MeterActiveSet as MeterActiveSetEvent } from "../generated/UsageRecorder/UsageRecorder"
import { handleMeterActiveSet } from "../src/usage-recorder"
import { createMeterActiveSetEvent } from "./usage-recorder-utils"

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/developer/matchstick/#tests-structure-0-5-0

describe("Describe entity assertions", () => {
  beforeAll(() => {
    let organizationId = BigInt.fromI32(234)
    let meterId = BigInt.fromI32(234)
    let isActive = "boolean Not implemented"
    let newMeterActiveSetEvent = createMeterActiveSetEvent(
      organizationId,
      meterId,
      isActive
    )
    handleMeterActiveSet(newMeterActiveSetEvent)
  })

  afterAll(() => {
    clearStore()
  })

  // For more test scenarios, see:
  // https://thegraph.com/docs/en/developer/matchstick/#write-a-unit-test

  test("MeterActiveSet created and stored", () => {
    assert.entityCount("MeterActiveSet", 1)

    // 0xa16081f360e3847006db660bae1c6d1b2e17ec2a is the default address used in newMockEvent() function
    assert.fieldEquals(
      "MeterActiveSet",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "organizationId",
      "234"
    )
    assert.fieldEquals(
      "MeterActiveSet",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "meterId",
      "234"
    )
    assert.fieldEquals(
      "MeterActiveSet",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "isActive",
      "boolean Not implemented"
    )

    // More assert options:
    // https://thegraph.com/docs/en/developer/matchstick/#asserts
  })
})
