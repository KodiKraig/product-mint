import {
  ExcludeDefaultPermissionsUpdated as ExcludeDefaultPermissionsUpdatedEvent,
  OrgPermissionUpdated as OrgPermissionUpdatedEvent,
  OwnerPermissionsUpdated as OwnerPermissionsUpdatedEvent,
  OwnershipTransferStarted as OwnershipTransferStartedEvent,
  OwnershipTransferred as OwnershipTransferredEvent,
} from "../generated/PermissionRegistry/PermissionRegistry"
import {
  ExcludeDefaultPermissionsUpdated,
  OrgPermissionUpdated,
  OwnerPermissionsUpdated,
  OwnershipTransferStarted,
  OwnershipTransferred,
} from "../generated/schema"

export function handleExcludeDefaultPermissionsUpdated(
  event: ExcludeDefaultPermissionsUpdatedEvent,
): void {
  let entity = new ExcludeDefaultPermissionsUpdated(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity._orgId = event.params._orgId
  entity._exclude = event.params._exclude

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleOrgPermissionUpdated(
  event: OrgPermissionUpdatedEvent,
): void {
  let entity = new OrgPermissionUpdated(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity._orgId = event.params._orgId
  entity._permission = event.params._permission
  entity._add = event.params._add

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleOwnerPermissionsUpdated(
  event: OwnerPermissionsUpdatedEvent,
): void {
  let entity = new OwnerPermissionsUpdated(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity._orgId = event.params._orgId
  entity._owner = event.params._owner
  entity._grantAccess = event.params._grantAccess
  entity._permissions = event.params._permissions

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleOwnershipTransferStarted(
  event: OwnershipTransferStartedEvent,
): void {
  let entity = new OwnershipTransferStarted(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.previousOwner = event.params.previousOwner
  entity.newOwner = event.params.newOwner

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleOwnershipTransferred(
  event: OwnershipTransferredEvent,
): void {
  let entity = new OwnershipTransferred(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.previousOwner = event.params.previousOwner
  entity.newOwner = event.params.newOwner

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}
