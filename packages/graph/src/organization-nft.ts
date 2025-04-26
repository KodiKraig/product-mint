import {
  Approval as ApprovalEvent,
  ApprovalForAll as ApprovalForAllEvent,
  MetadataProviderSet as MetadataProviderSetEvent,
  MintOpenSet as MintOpenSetEvent,
  RoleAdminChanged as RoleAdminChangedEvent,
  RoleGranted as RoleGrantedEvent,
  RoleRevoked as RoleRevokedEvent,
  Transfer as TransferEvent,
  WhitelistedSet as WhitelistedSetEvent,
} from '../generated/OrganizationNFT/OrganizationNFT';
import {
  Approval,
  ApprovalForAll,
  MetadataProviderSet,
  MintOpenSet,
  OrganizationNFTRoleAdminChanged,
  OrganizationNFTRoleGranted,
  OrganizationNFTRoleRevoked,
  Transfer,
  WhitelistedSet,
} from '../generated/schema';

export function handleApproval(event: ApprovalEvent): void {
  let entity = new Approval(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  );
  entity.owner = event.params.owner;
  entity.approved = event.params.approved;
  entity.tokenId = event.params.tokenId;

  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;

  entity.save();
}

export function handleApprovalForAll(event: ApprovalForAllEvent): void {
  let entity = new ApprovalForAll(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  );
  entity.owner = event.params.owner;
  entity.operator = event.params.operator;
  entity.approved = event.params.approved;

  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;

  entity.save();
}

export function handleMetadataProviderSet(
  event: MetadataProviderSetEvent,
): void {
  let entity = new MetadataProviderSet(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  );
  entity.previousProvider = event.params.previousProvider;
  entity.newProvider = event.params.newProvider;

  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;

  entity.save();
}

export function handleMintOpenSet(event: MintOpenSetEvent): void {
  let entity = new MintOpenSet(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  );
  entity.mintOpen = event.params.mintOpen;

  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;

  entity.save();
}

export function handleRoleAdminChanged(event: RoleAdminChangedEvent): void {
  let entity = new OrganizationNFTRoleAdminChanged(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  );
  entity.role = event.params.role;
  entity.previousAdminRole = event.params.previousAdminRole;
  entity.newAdminRole = event.params.newAdminRole;

  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;

  entity.save();
}

export function handleRoleGranted(event: RoleGrantedEvent): void {
  let entity = new OrganizationNFTRoleGranted(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  );
  entity.role = event.params.role;
  entity.account = event.params.account;
  entity.sender = event.params.sender;

  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;

  entity.save();
}

export function handleRoleRevoked(event: RoleRevokedEvent): void {
  let entity = new OrganizationNFTRoleRevoked(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  );
  entity.role = event.params.role;
  entity.account = event.params.account;
  entity.sender = event.params.sender;

  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;

  entity.save();
}

export function handleTransfer(event: TransferEvent): void {
  let entity = new Transfer(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  );
  entity.from = event.params.from;
  entity.to = event.params.to;
  entity.tokenId = event.params.tokenId;

  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;

  entity.save();
}

export function handleWhitelistedSet(event: WhitelistedSetEvent): void {
  let entity = new WhitelistedSet(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  );
  entity.account = event.params.account;
  entity.isWhitelisted = event.params.isWhitelisted;

  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;

  entity.save();
}
