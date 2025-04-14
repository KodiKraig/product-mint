import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterAll
} from "matchstick-as/assembly/index"
import { BigInt, Address } from "@graphprotocol/graph-ts"
import { OrgAdminUpdate } from "../generated/schema"
import { OrgAdminUpdate as OrgAdminUpdateEvent } from "../generated/OrganizationAdmin/OrganizationAdmin"
import { handleOrgAdminUpdate } from "../src/organization-admin"
import { createOrgAdminUpdateEvent } from "./organization-admin-utils"

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/developer/matchstick/#tests-structure-0-5-0

describe("Describe entity assertions", () => {
  beforeAll(() => {
    let orgId = BigInt.fromI32(234)
    let admin = Address.fromString("0x0000000000000000000000000000000000000001")
    let status = "boolean Not implemented"
    let newOrgAdminUpdateEvent = createOrgAdminUpdateEvent(orgId, admin, status)
    handleOrgAdminUpdate(newOrgAdminUpdateEvent)
  })

  afterAll(() => {
    clearStore()
  })

  // For more test scenarios, see:
  // https://thegraph.com/docs/en/developer/matchstick/#write-a-unit-test

  test("OrgAdminUpdate created and stored", () => {
    assert.entityCount("OrgAdminUpdate", 1)

    // 0xa16081f360e3847006db660bae1c6d1b2e17ec2a is the default address used in newMockEvent() function
    assert.fieldEquals(
      "OrgAdminUpdate",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "orgId",
      "234"
    )
    assert.fieldEquals(
      "OrgAdminUpdate",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "admin",
      "0x0000000000000000000000000000000000000001"
    )
    assert.fieldEquals(
      "OrgAdminUpdate",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "status",
      "boolean Not implemented"
    )

    // More assert options:
    // https://thegraph.com/docs/en/developer/matchstick/#asserts
  })
})
