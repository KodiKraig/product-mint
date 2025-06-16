import { newMockEvent } from "matchstick-as"
import { ethereum, BigInt, Bytes, Address } from "@graphprotocol/graph-ts"
import {
  ExcludeDefaultPermissionsUpdated,
  OrgPermissionUpdated,
  OwnerPermissionsUpdated,
  OwnershipTransferStarted,
  OwnershipTransferred
} from "../generated/PermissionRegistry/PermissionRegistry"

export function createExcludeDefaultPermissionsUpdatedEvent(
  _orgId: BigInt,
  _exclude: boolean
): ExcludeDefaultPermissionsUpdated {
  let excludeDefaultPermissionsUpdatedEvent =
    changetype<ExcludeDefaultPermissionsUpdated>(newMockEvent())

  excludeDefaultPermissionsUpdatedEvent.parameters = new Array()

  excludeDefaultPermissionsUpdatedEvent.parameters.push(
    new ethereum.EventParam("_orgId", ethereum.Value.fromUnsignedBigInt(_orgId))
  )
  excludeDefaultPermissionsUpdatedEvent.parameters.push(
    new ethereum.EventParam("_exclude", ethereum.Value.fromBoolean(_exclude))
  )

  return excludeDefaultPermissionsUpdatedEvent
}

export function createOrgPermissionUpdatedEvent(
  _orgId: BigInt,
  _permission: Bytes,
  _add: boolean
): OrgPermissionUpdated {
  let orgPermissionUpdatedEvent =
    changetype<OrgPermissionUpdated>(newMockEvent())

  orgPermissionUpdatedEvent.parameters = new Array()

  orgPermissionUpdatedEvent.parameters.push(
    new ethereum.EventParam("_orgId", ethereum.Value.fromUnsignedBigInt(_orgId))
  )
  orgPermissionUpdatedEvent.parameters.push(
    new ethereum.EventParam(
      "_permission",
      ethereum.Value.fromFixedBytes(_permission)
    )
  )
  orgPermissionUpdatedEvent.parameters.push(
    new ethereum.EventParam("_add", ethereum.Value.fromBoolean(_add))
  )

  return orgPermissionUpdatedEvent
}

export function createOwnerPermissionsUpdatedEvent(
  _orgId: BigInt,
  _owner: Address,
  _grantAccess: boolean,
  _permissions: Array<Bytes>
): OwnerPermissionsUpdated {
  let ownerPermissionsUpdatedEvent =
    changetype<OwnerPermissionsUpdated>(newMockEvent())

  ownerPermissionsUpdatedEvent.parameters = new Array()

  ownerPermissionsUpdatedEvent.parameters.push(
    new ethereum.EventParam("_orgId", ethereum.Value.fromUnsignedBigInt(_orgId))
  )
  ownerPermissionsUpdatedEvent.parameters.push(
    new ethereum.EventParam("_owner", ethereum.Value.fromAddress(_owner))
  )
  ownerPermissionsUpdatedEvent.parameters.push(
    new ethereum.EventParam(
      "_grantAccess",
      ethereum.Value.fromBoolean(_grantAccess)
    )
  )
  ownerPermissionsUpdatedEvent.parameters.push(
    new ethereum.EventParam(
      "_permissions",
      ethereum.Value.fromFixedBytesArray(_permissions)
    )
  )

  return ownerPermissionsUpdatedEvent
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
