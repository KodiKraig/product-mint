import { newMockEvent } from "matchstick-as"
import { ethereum, BigInt } from "@graphprotocol/graph-ts"
import {
  MeterActiveSet,
  MeterCreated,
  MeterPaymentProcessed,
  MeterUsageSet
} from "../generated/UsageRecorder/UsageRecorder"

export function createMeterActiveSetEvent(
  organizationId: BigInt,
  meterId: BigInt,
  isActive: boolean
): MeterActiveSet {
  let meterActiveSetEvent = changetype<MeterActiveSet>(newMockEvent())

  meterActiveSetEvent.parameters = new Array()

  meterActiveSetEvent.parameters.push(
    new ethereum.EventParam(
      "organizationId",
      ethereum.Value.fromUnsignedBigInt(organizationId)
    )
  )
  meterActiveSetEvent.parameters.push(
    new ethereum.EventParam(
      "meterId",
      ethereum.Value.fromUnsignedBigInt(meterId)
    )
  )
  meterActiveSetEvent.parameters.push(
    new ethereum.EventParam("isActive", ethereum.Value.fromBoolean(isActive))
  )

  return meterActiveSetEvent
}

export function createMeterCreatedEvent(
  organizationId: BigInt,
  meterId: BigInt
): MeterCreated {
  let meterCreatedEvent = changetype<MeterCreated>(newMockEvent())

  meterCreatedEvent.parameters = new Array()

  meterCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "organizationId",
      ethereum.Value.fromUnsignedBigInt(organizationId)
    )
  )
  meterCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "meterId",
      ethereum.Value.fromUnsignedBigInt(meterId)
    )
  )

  return meterCreatedEvent
}

export function createMeterPaymentProcessedEvent(
  organizationId: BigInt,
  meterId: BigInt,
  tokenId: BigInt,
  usage: BigInt
): MeterPaymentProcessed {
  let meterPaymentProcessedEvent =
    changetype<MeterPaymentProcessed>(newMockEvent())

  meterPaymentProcessedEvent.parameters = new Array()

  meterPaymentProcessedEvent.parameters.push(
    new ethereum.EventParam(
      "organizationId",
      ethereum.Value.fromUnsignedBigInt(organizationId)
    )
  )
  meterPaymentProcessedEvent.parameters.push(
    new ethereum.EventParam(
      "meterId",
      ethereum.Value.fromUnsignedBigInt(meterId)
    )
  )
  meterPaymentProcessedEvent.parameters.push(
    new ethereum.EventParam(
      "tokenId",
      ethereum.Value.fromUnsignedBigInt(tokenId)
    )
  )
  meterPaymentProcessedEvent.parameters.push(
    new ethereum.EventParam("usage", ethereum.Value.fromUnsignedBigInt(usage))
  )

  return meterPaymentProcessedEvent
}

export function createMeterUsageSetEvent(
  organizationId: BigInt,
  meterId: BigInt,
  tokenId: BigInt,
  usage: BigInt
): MeterUsageSet {
  let meterUsageSetEvent = changetype<MeterUsageSet>(newMockEvent())

  meterUsageSetEvent.parameters = new Array()

  meterUsageSetEvent.parameters.push(
    new ethereum.EventParam(
      "organizationId",
      ethereum.Value.fromUnsignedBigInt(organizationId)
    )
  )
  meterUsageSetEvent.parameters.push(
    new ethereum.EventParam(
      "meterId",
      ethereum.Value.fromUnsignedBigInt(meterId)
    )
  )
  meterUsageSetEvent.parameters.push(
    new ethereum.EventParam(
      "tokenId",
      ethereum.Value.fromUnsignedBigInt(tokenId)
    )
  )
  meterUsageSetEvent.parameters.push(
    new ethereum.EventParam("usage", ethereum.Value.fromUnsignedBigInt(usage))
  )

  return meterUsageSetEvent
}
