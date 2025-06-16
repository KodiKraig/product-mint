import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterAll
} from "matchstick-as/assembly/index"
import { BigInt, Bytes, Address } from "@graphprotocol/graph-ts"
import { ExcludeDefaultPermissionsUpdated } from "../generated/schema"
import { ExcludeDefaultPermissionsUpdated as ExcludeDefaultPermissionsUpdatedEvent } from "../generated/PermissionRegistry/PermissionRegistry"
import { handleExcludeDefaultPermissionsUpdated } from "../src/permission-registry"
import { createExcludeDefaultPermissionsUpdatedEvent } from "./permission-registry-utils"

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/developer/matchstick/#tests-structure-0-5-0

describe("Describe entity assertions", () => {
  beforeAll(() => {
    let _orgId = BigInt.fromI32(234)
    let _exclude = "boolean Not implemented"
    let newExcludeDefaultPermissionsUpdatedEvent =
      createExcludeDefaultPermissionsUpdatedEvent(_orgId, _exclude)
    handleExcludeDefaultPermissionsUpdated(
      newExcludeDefaultPermissionsUpdatedEvent
    )
  })

  afterAll(() => {
    clearStore()
  })

  // For more test scenarios, see:
  // https://thegraph.com/docs/en/developer/matchstick/#write-a-unit-test

  test("ExcludeDefaultPermissionsUpdated created and stored", () => {
    assert.entityCount("ExcludeDefaultPermissionsUpdated", 1)

    // 0xa16081f360e3847006db660bae1c6d1b2e17ec2a is the default address used in newMockEvent() function
    assert.fieldEquals(
      "ExcludeDefaultPermissionsUpdated",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "_orgId",
      "234"
    )
    assert.fieldEquals(
      "ExcludeDefaultPermissionsUpdated",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "_exclude",
      "boolean Not implemented"
    )

    // More assert options:
    // https://thegraph.com/docs/en/developer/matchstick/#asserts
  })
})
