import {
  ExoticFeeSet as ExoticFeeSetEvent,
  FeeEnabled as FeeEnabledEvent,
  FeeExemptSet as FeeExemptSetEvent,
  FeeReducerSet as FeeReducerSetEvent,
  FeeSet as FeeSetEvent,
  FeeWithdraw as FeeWithdrawEvent,
  OrgBalanceWithdrawn as OrgBalanceWithdrawnEvent,
  OrgChargeAbilityUpdate as OrgChargeAbilityUpdateEvent,
  RoleAdminChanged as RoleAdminChangedEvent,
  RoleGranted as RoleGrantedEvent,
  RoleRevoked as RoleRevokedEvent,
  TransferAmount as TransferAmountEvent,
  WhitelistedTokenSet as WhitelistedTokenSetEvent,
} from "../generated/PaymentEscrow/PaymentEscrow"
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
  WhitelistedTokenSet,
} from "../generated/schema"

export function handleExoticFeeSet(event: ExoticFeeSetEvent): void {
  let entity = new ExoticFeeSet(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.fee = event.params.fee

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleFeeEnabled(event: FeeEnabledEvent): void {
  let entity = new FeeEnabled(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.isEnabled = event.params.isEnabled

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleFeeExemptSet(event: FeeExemptSetEvent): void {
  let entity = new FeeExemptSet(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.orgId = event.params.orgId
  entity.isExempt = event.params.isExempt

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleFeeReducerSet(event: FeeReducerSetEvent): void {
  let entity = new FeeReducerSet(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.feeReducer = event.params.feeReducer

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleFeeSet(event: FeeSetEvent): void {
  let entity = new FeeSet(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.token = event.params.token
  entity.newFee = event.params.newFee

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleFeeWithdraw(event: FeeWithdrawEvent): void {
  let entity = new FeeWithdraw(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.token = event.params.token
  entity.amount = event.params.amount

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleOrgBalanceWithdrawn(
  event: OrgBalanceWithdrawnEvent,
): void {
  let entity = new OrgBalanceWithdrawn(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.orgId = event.params.orgId
  entity.token = event.params.token
  entity.amount = event.params.amount

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleOrgChargeAbilityUpdate(
  event: OrgChargeAbilityUpdateEvent,
): void {
  let entity = new OrgChargeAbilityUpdate(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.orgId = event.params.orgId
  entity.isRevoked = event.params.isRevoked

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleRoleAdminChanged(event: RoleAdminChangedEvent): void {
  let entity = new RoleAdminChanged(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.role = event.params.role
  entity.previousAdminRole = event.params.previousAdminRole
  entity.newAdminRole = event.params.newAdminRole

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleRoleGranted(event: RoleGrantedEvent): void {
  let entity = new RoleGranted(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.role = event.params.role
  entity.account = event.params.account
  entity.sender = event.params.sender

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleRoleRevoked(event: RoleRevokedEvent): void {
  let entity = new RoleRevoked(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.role = event.params.role
  entity.account = event.params.account
  entity.sender = event.params.sender

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleTransferAmount(event: TransferAmountEvent): void {
  let entity = new TransferAmount(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.orgId = event.params.orgId
  entity.from = event.params.from
  entity.token = event.params.token
  entity.totalAmount = event.params.totalAmount
  entity.orgAmount = event.params.orgAmount

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleWhitelistedTokenSet(
  event: WhitelistedTokenSetEvent,
): void {
  let entity = new WhitelistedTokenSet(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.token = event.params.token
  entity.isWhitelisted = event.params.isWhitelisted

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}
