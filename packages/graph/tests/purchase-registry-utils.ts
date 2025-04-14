import { newMockEvent } from "matchstick-as"
import { ethereum, BigInt, Address } from "@graphprotocol/graph-ts"
import {
  GiftingStatusChanged,
  MaxMintsUpdated,
  MintClosedStatusChanged,
  ProductMaxSupplyUpdated,
  WhitelistPassOwnerUpdated,
  WhitelistStatusChanged
} from "../generated/PurchaseRegistry/PurchaseRegistry"

export function createGiftingStatusChangedEvent(
  organizationId: BigInt,
  isGifting: boolean
): GiftingStatusChanged {
  let giftingStatusChangedEvent =
    changetype<GiftingStatusChanged>(newMockEvent())

  giftingStatusChangedEvent.parameters = new Array()

  giftingStatusChangedEvent.parameters.push(
    new ethereum.EventParam(
      "organizationId",
      ethereum.Value.fromUnsignedBigInt(organizationId)
    )
  )
  giftingStatusChangedEvent.parameters.push(
    new ethereum.EventParam("isGifting", ethereum.Value.fromBoolean(isGifting))
  )

  return giftingStatusChangedEvent
}

export function createMaxMintsUpdatedEvent(
  organizationId: BigInt,
  maxMints: BigInt
): MaxMintsUpdated {
  let maxMintsUpdatedEvent = changetype<MaxMintsUpdated>(newMockEvent())

  maxMintsUpdatedEvent.parameters = new Array()

  maxMintsUpdatedEvent.parameters.push(
    new ethereum.EventParam(
      "organizationId",
      ethereum.Value.fromUnsignedBigInt(organizationId)
    )
  )
  maxMintsUpdatedEvent.parameters.push(
    new ethereum.EventParam(
      "maxMints",
      ethereum.Value.fromUnsignedBigInt(maxMints)
    )
  )

  return maxMintsUpdatedEvent
}

export function createMintClosedStatusChangedEvent(
  organizationId: BigInt,
  isMintClosed: boolean
): MintClosedStatusChanged {
  let mintClosedStatusChangedEvent =
    changetype<MintClosedStatusChanged>(newMockEvent())

  mintClosedStatusChangedEvent.parameters = new Array()

  mintClosedStatusChangedEvent.parameters.push(
    new ethereum.EventParam(
      "organizationId",
      ethereum.Value.fromUnsignedBigInt(organizationId)
    )
  )
  mintClosedStatusChangedEvent.parameters.push(
    new ethereum.EventParam(
      "isMintClosed",
      ethereum.Value.fromBoolean(isMintClosed)
    )
  )

  return mintClosedStatusChangedEvent
}

export function createProductMaxSupplyUpdatedEvent(
  organizationId: BigInt,
  productId: BigInt,
  maxSupply: BigInt
): ProductMaxSupplyUpdated {
  let productMaxSupplyUpdatedEvent =
    changetype<ProductMaxSupplyUpdated>(newMockEvent())

  productMaxSupplyUpdatedEvent.parameters = new Array()

  productMaxSupplyUpdatedEvent.parameters.push(
    new ethereum.EventParam(
      "organizationId",
      ethereum.Value.fromUnsignedBigInt(organizationId)
    )
  )
  productMaxSupplyUpdatedEvent.parameters.push(
    new ethereum.EventParam(
      "productId",
      ethereum.Value.fromUnsignedBigInt(productId)
    )
  )
  productMaxSupplyUpdatedEvent.parameters.push(
    new ethereum.EventParam(
      "maxSupply",
      ethereum.Value.fromUnsignedBigInt(maxSupply)
    )
  )

  return productMaxSupplyUpdatedEvent
}

export function createWhitelistPassOwnerUpdatedEvent(
  organizationId: BigInt,
  passOwner: Address,
  isWhitelisted: boolean
): WhitelistPassOwnerUpdated {
  let whitelistPassOwnerUpdatedEvent =
    changetype<WhitelistPassOwnerUpdated>(newMockEvent())

  whitelistPassOwnerUpdatedEvent.parameters = new Array()

  whitelistPassOwnerUpdatedEvent.parameters.push(
    new ethereum.EventParam(
      "organizationId",
      ethereum.Value.fromUnsignedBigInt(organizationId)
    )
  )
  whitelistPassOwnerUpdatedEvent.parameters.push(
    new ethereum.EventParam("passOwner", ethereum.Value.fromAddress(passOwner))
  )
  whitelistPassOwnerUpdatedEvent.parameters.push(
    new ethereum.EventParam(
      "isWhitelisted",
      ethereum.Value.fromBoolean(isWhitelisted)
    )
  )

  return whitelistPassOwnerUpdatedEvent
}

export function createWhitelistStatusChangedEvent(
  organizationId: BigInt,
  isWhitelist: boolean
): WhitelistStatusChanged {
  let whitelistStatusChangedEvent =
    changetype<WhitelistStatusChanged>(newMockEvent())

  whitelistStatusChangedEvent.parameters = new Array()

  whitelistStatusChangedEvent.parameters.push(
    new ethereum.EventParam(
      "organizationId",
      ethereum.Value.fromUnsignedBigInt(organizationId)
    )
  )
  whitelistStatusChangedEvent.parameters.push(
    new ethereum.EventParam(
      "isWhitelist",
      ethereum.Value.fromBoolean(isWhitelist)
    )
  )

  return whitelistStatusChangedEvent
}
