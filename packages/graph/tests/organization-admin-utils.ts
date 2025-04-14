import { newMockEvent } from "matchstick-as"
import { ethereum, BigInt, Address } from "@graphprotocol/graph-ts"
import { OrgAdminUpdate } from "../generated/OrganizationAdmin/OrganizationAdmin"

export function createOrgAdminUpdateEvent(
  orgId: BigInt,
  admin: Address,
  status: boolean
): OrgAdminUpdate {
  let orgAdminUpdateEvent = changetype<OrgAdminUpdate>(newMockEvent())

  orgAdminUpdateEvent.parameters = new Array()

  orgAdminUpdateEvent.parameters.push(
    new ethereum.EventParam("orgId", ethereum.Value.fromUnsignedBigInt(orgId))
  )
  orgAdminUpdateEvent.parameters.push(
    new ethereum.EventParam("admin", ethereum.Value.fromAddress(admin))
  )
  orgAdminUpdateEvent.parameters.push(
    new ethereum.EventParam("status", ethereum.Value.fromBoolean(status))
  )

  return orgAdminUpdateEvent
}
