import { OrgAdminUpdate as OrgAdminUpdateEvent } from "../generated/OrganizationAdmin/OrganizationAdmin"
import { OrgAdminUpdate } from "../generated/schema"

export function handleOrgAdminUpdate(event: OrgAdminUpdateEvent): void {
  let entity = new OrgAdminUpdate(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.orgId = event.params.orgId
  entity.admin = event.params.admin
  entity.status = event.params.status

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}
