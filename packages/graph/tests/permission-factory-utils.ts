import { newMockEvent } from "matchstick-as"
import { ethereum, Bytes, Address } from "@graphprotocol/graph-ts"
import {
  DefaultPermissionAdded,
  DefaultPermissionRemoved,
  OwnershipTransferStarted,
  OwnershipTransferred,
  PermissionActivation,
  PermissionCreated,
  PermissionDescriptionUpdated
} from "../generated/PermissionFactory/PermissionFactory"

export function createDefaultPermissionAddedEvent(
  permissionId: Bytes
): DefaultPermissionAdded {
  let defaultPermissionAddedEvent =
    changetype<DefaultPermissionAdded>(newMockEvent())

  defaultPermissionAddedEvent.parameters = new Array()

  defaultPermissionAddedEvent.parameters.push(
    new ethereum.EventParam(
      "permissionId",
      ethereum.Value.fromFixedBytes(permissionId)
    )
  )

  return defaultPermissionAddedEvent
}

export function createDefaultPermissionRemovedEvent(
  permissionId: Bytes
): DefaultPermissionRemoved {
  let defaultPermissionRemovedEvent =
    changetype<DefaultPermissionRemoved>(newMockEvent())

  defaultPermissionRemovedEvent.parameters = new Array()

  defaultPermissionRemovedEvent.parameters.push(
    new ethereum.EventParam(
      "permissionId",
      ethereum.Value.fromFixedBytes(permissionId)
    )
  )

  return defaultPermissionRemovedEvent
}

export function createOwnershipTransferStartedEvent(
  previousOwner: Address,
  newOwner: Address
): OwnershipTransferStarted {
  let ownershipTransferStartedEvent =
    changetype<OwnershipTransferStarted>(newMockEvent())

  ownershipTransferStartedEvent.parameters = new Array()

  ownershipTransferStartedEvent.parameters.push(
    new ethereum.EventParam(
      "previousOwner",
      ethereum.Value.fromAddress(previousOwner)
    )
  )
  ownershipTransferStartedEvent.parameters.push(
    new ethereum.EventParam("newOwner", ethereum.Value.fromAddress(newOwner))
  )

  return ownershipTransferStartedEvent
}

export function createOwnershipTransferredEvent(
  previousOwner: Address,
  newOwner: Address
): OwnershipTransferred {
  let ownershipTransferredEvent =
    changetype<OwnershipTransferred>(newMockEvent())

  ownershipTransferredEvent.parameters = new Array()

  ownershipTransferredEvent.parameters.push(
    new ethereum.EventParam(
      "previousOwner",
      ethereum.Value.fromAddress(previousOwner)
    )
  )
  ownershipTransferredEvent.parameters.push(
    new ethereum.EventParam("newOwner", ethereum.Value.fromAddress(newOwner))
  )

  return ownershipTransferredEvent
}

export function createPermissionActivationEvent(
  permissionId: Bytes,
  isActive: boolean
): PermissionActivation {
  let permissionActivationEvent =
    changetype<PermissionActivation>(newMockEvent())

  permissionActivationEvent.parameters = new Array()

  permissionActivationEvent.parameters.push(
    new ethereum.EventParam(
      "permissionId",
      ethereum.Value.fromFixedBytes(permissionId)
    )
  )
  permissionActivationEvent.parameters.push(
    new ethereum.EventParam("isActive", ethereum.Value.fromBoolean(isActive))
  )

  return permissionActivationEvent
}

export function createPermissionCreatedEvent(
  permissionId: Bytes,
  name: string,
  description: string,
  isDefault: boolean
): PermissionCreated {
  let permissionCreatedEvent = changetype<PermissionCreated>(newMockEvent())

  permissionCreatedEvent.parameters = new Array()

  permissionCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "permissionId",
      ethereum.Value.fromFixedBytes(permissionId)
    )
  )
  permissionCreatedEvent.parameters.push(
    new ethereum.EventParam("name", ethereum.Value.fromString(name))
  )
  permissionCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "description",
      ethereum.Value.fromString(description)
    )
  )
  permissionCreatedEvent.parameters.push(
    new ethereum.EventParam("isDefault", ethereum.Value.fromBoolean(isDefault))
  )

  return permissionCreatedEvent
}

export function createPermissionDescriptionUpdatedEvent(
  permissionId: Bytes,
  description: string
): PermissionDescriptionUpdated {
  let permissionDescriptionUpdatedEvent =
    changetype<PermissionDescriptionUpdated>(newMockEvent())

  permissionDescriptionUpdatedEvent.parameters = new Array()

  permissionDescriptionUpdatedEvent.parameters.push(
    new ethereum.EventParam(
      "permissionId",
      ethereum.Value.fromFixedBytes(permissionId)
    )
  )
  permissionDescriptionUpdatedEvent.parameters.push(
    new ethereum.EventParam(
      "description",
      ethereum.Value.fromString(description)
    )
  )

  return permissionDescriptionUpdatedEvent
}
