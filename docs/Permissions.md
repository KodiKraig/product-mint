# ProductMint - Permissions

Organization Permissions give full control to Product Pass NFT owners on how organizations can charge for their products.

In essence, each organization must be given the permission to charge for their products.

Permissions are granted to organizations by the Product Pass NFT owner during the initial minting of the pass or by the pass owner explicitly granting permission to an organization.

## Permissions

### `pass.wallet.spend`

Can an organization spend tokens from the owner wallet.

### `pass.purchase.additional`

Purchase additional products for an existing product pass.

### `pass.subscription.renewal`

Renew an existing expired subscription.

### `pass.subscription.pricing`

Change the pricing model for an existing subscription.

### `pass.subscription.quantity`

Change the unit quantity for an existing TIERED subscription.

## Permissions Management

Product Pass NFT owners use the [PermissionRegistry](../packages/contracts/contracts/registry/PermissionRegistry.sol) contract to grant and revoke permissions to organizations.

### Granting Permissions

The following are the steps to grant permissions to an organization.

1. The Product Pass NFT owner must call the `addOwnerPermissions` function on the [PermissionRegistry](../packages/contracts/contracts/registry/PermissionRegistry.sol) contract.
2. The Product Pass NFT owner must provide the organization ID and the permissions to grant.
3. The Product Pass NFT owner must provide the address of the organization to grant the permissions to.

### Revoking Permissions

The following are the steps to revoke permissions from an organization.

1. The Product Pass NFT owner must call the `removeOwnerPermissions` function on the [PermissionRegistry](../packages/contracts/contracts/registry/PermissionRegistry.sol) contract.
2. The Product Pass NFT owner must provide the organization ID and the permissions to revoke.
3. The Product Pass NFT owner must provide the address of the organization to revoke the permissions from.

## Organization Permission Management

By default, permissions are granted to the organization during the initial minting of the pass. An organization can optionally exclude the granting of permissions during the initial minting of the pass and specify the permissions to be granted or require pass owners to grant permissions to the organization after the pass is minted.

### Excluding Permissions from Initial Minting

Calling the `setExcludeDefaultPermissions` function on the [PermissionRegistry](../packages/contracts/contracts/registry/PermissionRegistry.sol) contract with the `_exclude` parameter set to `true` will exclude the granting of permissions during the initial minting of the pass.

```solidity
function setExcludeDefaultPermissions(
    uint256 _orgId,
    bool _exclude
) external onlyOrgAdmin(_orgId) {
```

### Specifying Permissions to be Granted

When excluding permissions from the initial minting process, the Organization Admin can specify the permissions to be granted to the organization by calling the `updateOrgPermissions` function on the [PermissionRegistry](../packages/contracts/contracts/registry/PermissionRegistry.sol) contract.

```solidity
function updateOrgPermissions(
    uint256 _orgId,
    bytes32[] memory _permissions,
    bool[] memory _add
) external onlyOrgAdmin(_orgId) activePermissions(_permissions) {
```