import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterAll
} from "matchstick-as/assembly/index"
import { Bytes, Address } from "@graphprotocol/graph-ts"
import { DefaultPermissionAdded } from "../generated/schema"
import { DefaultPermissionAdded as DefaultPermissionAddedEvent } from "../generated/PermissionFactory/PermissionFactory"
import { handleDefaultPermissionAdded } from "../src/permission-factory"
import { createDefaultPermissionAddedEvent } from "./permission-factory-utils"

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/developer/matchstick/#tests-structure-0-5-0

describe("Describe entity assertions", () => {
  beforeAll(() => {
    let permissionId = Bytes.fromI32(1234567890)
    let newDefaultPermissionAddedEvent =
      createDefaultPermissionAddedEvent(permissionId)
    handleDefaultPermissionAdded(newDefaultPermissionAddedEvent)
  })

  afterAll(() => {
    clearStore()
  })

  // For more test scenarios, see:
  // https://thegraph.com/docs/en/developer/matchstick/#write-a-unit-test

  test("DefaultPermissionAdded created and stored", () => {
    assert.entityCount("DefaultPermissionAdded", 1)

    // 0xa16081f360e3847006db660bae1c6d1b2e17ec2a is the default address used in newMockEvent() function
    assert.fieldEquals(
      "DefaultPermissionAdded",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "permissionId",
      "1234567890"
    )

    // More assert options:
    // https://thegraph.com/docs/en/developer/matchstick/#asserts
  })
})
