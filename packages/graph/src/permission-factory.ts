import {
  DefaultPermissionAdded as DefaultPermissionAddedEvent,
  DefaultPermissionRemoved as DefaultPermissionRemovedEvent,
  OwnershipTransferStarted as OwnershipTransferStartedEvent,
  OwnershipTransferred as OwnershipTransferredEvent,
  PermissionActivation as PermissionActivationEvent,
  PermissionCreated as PermissionCreatedEvent,
  PermissionDescriptionUpdated as PermissionDescriptionUpdatedEvent,
} from "../generated/PermissionFactory/PermissionFactory"
import {
  DefaultPermissionAdded,
  DefaultPermissionRemoved,
  OwnershipTransferStarted,
  OwnershipTransferred,
  PermissionActivation,
  PermissionCreated,
  PermissionDescriptionUpdated,
} from "../generated/schema"

export function handleDefaultPermissionAdded(
  event: DefaultPermissionAddedEvent,
): void {
  let entity = new DefaultPermissionAdded(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.permissionId = event.params.permissionId

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleDefaultPermissionRemoved(
  event: DefaultPermissionRemovedEvent,
): void {
  let entity = new DefaultPermissionRemoved(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.permissionId = event.params.permissionId

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

export function handlePermissionActivation(
  event: PermissionActivationEvent,
): void {
  let entity = new PermissionActivation(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.permissionId = event.params.permissionId
  entity.isActive = event.params.isActive

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handlePermissionCreated(event: PermissionCreatedEvent): void {
  let entity = new PermissionCreated(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.permissionId = event.params.permissionId
  entity.name = event.params.name
  entity.description = event.params.description
  entity.isDefault = event.params.isDefault

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handlePermissionDescriptionUpdated(
  event: PermissionDescriptionUpdatedEvent,
): void {
  let entity = new PermissionDescriptionUpdated(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.permissionId = event.params.permissionId
  entity.description = event.params.description

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}
