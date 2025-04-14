import { newMockEvent } from "matchstick-as"
import { ethereum, BigInt, Address, Bytes } from "@graphprotocol/graph-ts"
import {
  ExoticFeeSet,
  FeeEnabled,
  FeeExemptSet,
  FeeReducerSet,
  FeeSet,
  FeeWithdraw,
  OrgBalanceWithdrawn,
  OrgChargeAbilityUpdate,
  RoleAdminChanged,
  RoleGranted,
  RoleRevoked,
  TransferAmount,
  WhitelistedTokenSet
} from "../generated/PaymentEscrow/PaymentEscrow"

export function createExoticFeeSetEvent(fee: BigInt): ExoticFeeSet {
  let exoticFeeSetEvent = changetype<ExoticFeeSet>(newMockEvent())

  exoticFeeSetEvent.parameters = new Array()

  exoticFeeSetEvent.parameters.push(
    new ethereum.EventParam("fee", ethereum.Value.fromUnsignedBigInt(fee))
  )

  return exoticFeeSetEvent
}

export function createFeeEnabledEvent(isEnabled: boolean): FeeEnabled {
  let feeEnabledEvent = changetype<FeeEnabled>(newMockEvent())

  feeEnabledEvent.parameters = new Array()

  feeEnabledEvent.parameters.push(
    new ethereum.EventParam("isEnabled", ethereum.Value.fromBoolean(isEnabled))
  )

  return feeEnabledEvent
}

export function createFeeExemptSetEvent(
  orgId: BigInt,
  isExempt: boolean
): FeeExemptSet {
  let feeExemptSetEvent = changetype<FeeExemptSet>(newMockEvent())

  feeExemptSetEvent.parameters = new Array()

  feeExemptSetEvent.parameters.push(
    new ethereum.EventParam("orgId", ethereum.Value.fromUnsignedBigInt(orgId))
  )
  feeExemptSetEvent.parameters.push(
    new ethereum.EventParam("isExempt", ethereum.Value.fromBoolean(isExempt))
  )

  return feeExemptSetEvent
}

export function createFeeReducerSetEvent(feeReducer: Address): FeeReducerSet {
  let feeReducerSetEvent = changetype<FeeReducerSet>(newMockEvent())

  feeReducerSetEvent.parameters = new Array()

  feeReducerSetEvent.parameters.push(
    new ethereum.EventParam(
      "feeReducer",
      ethereum.Value.fromAddress(feeReducer)
    )
  )

  return feeReducerSetEvent
}

export function createFeeSetEvent(token: Address, newFee: BigInt): FeeSet {
  let feeSetEvent = changetype<FeeSet>(newMockEvent())

  feeSetEvent.parameters = new Array()

  feeSetEvent.parameters.push(
    new ethereum.EventParam("token", ethereum.Value.fromAddress(token))
  )
  feeSetEvent.parameters.push(
    new ethereum.EventParam("newFee", ethereum.Value.fromUnsignedBigInt(newFee))
  )

  return feeSetEvent
}

export function createFeeWithdrawEvent(
  token: Address,
  amount: BigInt
): FeeWithdraw {
  let feeWithdrawEvent = changetype<FeeWithdraw>(newMockEvent())

  feeWithdrawEvent.parameters = new Array()

  feeWithdrawEvent.parameters.push(
    new ethereum.EventParam("token", ethereum.Value.fromAddress(token))
  )
  feeWithdrawEvent.parameters.push(
    new ethereum.EventParam("amount", ethereum.Value.fromUnsignedBigInt(amount))
  )

  return feeWithdrawEvent
}

export function createOrgBalanceWithdrawnEvent(
  orgId: BigInt,
  token: Address,
  amount: BigInt
): OrgBalanceWithdrawn {
  let orgBalanceWithdrawnEvent = changetype<OrgBalanceWithdrawn>(newMockEvent())

  orgBalanceWithdrawnEvent.parameters = new Array()

  orgBalanceWithdrawnEvent.parameters.push(
    new ethereum.EventParam("orgId", ethereum.Value.fromUnsignedBigInt(orgId))
  )
  orgBalanceWithdrawnEvent.parameters.push(
    new ethereum.EventParam("token", ethereum.Value.fromAddress(token))
  )
  orgBalanceWithdrawnEvent.parameters.push(
    new ethereum.EventParam("amount", ethereum.Value.fromUnsignedBigInt(amount))
  )

  return orgBalanceWithdrawnEvent
}

export function createOrgChargeAbilityUpdateEvent(
  orgId: BigInt,
  isRevoked: boolean
): OrgChargeAbilityUpdate {
  let orgChargeAbilityUpdateEvent =
    changetype<OrgChargeAbilityUpdate>(newMockEvent())

  orgChargeAbilityUpdateEvent.parameters = new Array()

  orgChargeAbilityUpdateEvent.parameters.push(
    new ethereum.EventParam("orgId", ethereum.Value.fromUnsignedBigInt(orgId))
  )
  orgChargeAbilityUpdateEvent.parameters.push(
    new ethereum.EventParam("isRevoked", ethereum.Value.fromBoolean(isRevoked))
  )

  return orgChargeAbilityUpdateEvent
}

export function createRoleAdminChangedEvent(
  role: Bytes,
  previousAdminRole: Bytes,
  newAdminRole: Bytes
): RoleAdminChanged {
  let roleAdminChangedEvent = changetype<RoleAdminChanged>(newMockEvent())

  roleAdminChangedEvent.parameters = new Array()

  roleAdminChangedEvent.parameters.push(
    new ethereum.EventParam("role", ethereum.Value.fromFixedBytes(role))
  )
  roleAdminChangedEvent.parameters.push(
    new ethereum.EventParam(
      "previousAdminRole",
      ethereum.Value.fromFixedBytes(previousAdminRole)
    )
  )
  roleAdminChangedEvent.parameters.push(
    new ethereum.EventParam(
      "newAdminRole",
      ethereum.Value.fromFixedBytes(newAdminRole)
    )
  )

  return roleAdminChangedEvent
}

export function createRoleGrantedEvent(
  role: Bytes,
  account: Address,
  sender: Address
): RoleGranted {
  let roleGrantedEvent = changetype<RoleGranted>(newMockEvent())

  roleGrantedEvent.parameters = new Array()

  roleGrantedEvent.parameters.push(
    new ethereum.EventParam("role", ethereum.Value.fromFixedBytes(role))
  )
  roleGrantedEvent.parameters.push(
    new ethereum.EventParam("account", ethereum.Value.fromAddress(account))
  )
  roleGrantedEvent.parameters.push(
    new ethereum.EventParam("sender", ethereum.Value.fromAddress(sender))
  )

  return roleGrantedEvent
}

export function createRoleRevokedEvent(
  role: Bytes,
  account: Address,
  sender: Address
): RoleRevoked {
  let roleRevokedEvent = changetype<RoleRevoked>(newMockEvent())

  roleRevokedEvent.parameters = new Array()

  roleRevokedEvent.parameters.push(
    new ethereum.EventParam("role", ethereum.Value.fromFixedBytes(role))
  )
  roleRevokedEvent.parameters.push(
    new ethereum.EventParam("account", ethereum.Value.fromAddress(account))
  )
  roleRevokedEvent.parameters.push(
    new ethereum.EventParam("sender", ethereum.Value.fromAddress(sender))
  )

  return roleRevokedEvent
}

export function createTransferAmountEvent(
  orgId: BigInt,
  from: Address,
  token: Address,
  totalAmount: BigInt,
  orgAmount: BigInt
): TransferAmount {
  let transferAmountEvent = changetype<TransferAmount>(newMockEvent())

  transferAmountEvent.parameters = new Array()

  transferAmountEvent.parameters.push(
    new ethereum.EventParam("orgId", ethereum.Value.fromUnsignedBigInt(orgId))
  )
  transferAmountEvent.parameters.push(
    new ethereum.EventParam("from", ethereum.Value.fromAddress(from))
  )
  transferAmountEvent.parameters.push(
    new ethereum.EventParam("token", ethereum.Value.fromAddress(token))
  )
  transferAmountEvent.parameters.push(
    new ethereum.EventParam(
      "totalAmount",
      ethereum.Value.fromUnsignedBigInt(totalAmount)
    )
  )
  transferAmountEvent.parameters.push(
    new ethereum.EventParam(
      "orgAmount",
      ethereum.Value.fromUnsignedBigInt(orgAmount)
    )
  )

  return transferAmountEvent
}

export function createWhitelistedTokenSetEvent(
  token: Address,
  isWhitelisted: boolean
): WhitelistedTokenSet {
  let whitelistedTokenSetEvent = changetype<WhitelistedTokenSet>(newMockEvent())

  whitelistedTokenSetEvent.parameters = new Array()

  whitelistedTokenSetEvent.parameters.push(
    new ethereum.EventParam("token", ethereum.Value.fromAddress(token))
  )
  whitelistedTokenSetEvent.parameters.push(
    new ethereum.EventParam(
      "isWhitelisted",
      ethereum.Value.fromBoolean(isWhitelisted)
    )
  )

  return whitelistedTokenSetEvent
}
