import { newMockEvent } from "matchstick-as"
import { ethereum, BigInt } from "@graphprotocol/graph-ts"
import { RenewalProcessed } from "../generated/RenewalProcessor/RenewalProcessor"

export function createRenewalProcessedEvent(
  orgId: BigInt,
  productPassId: BigInt,
  productId: BigInt,
  status: i32
): RenewalProcessed {
  let renewalProcessedEvent = changetype<RenewalProcessed>(newMockEvent())

  renewalProcessedEvent.parameters = new Array()

  renewalProcessedEvent.parameters.push(
    new ethereum.EventParam("orgId", ethereum.Value.fromUnsignedBigInt(orgId))
  )
  renewalProcessedEvent.parameters.push(
    new ethereum.EventParam(
      "productPassId",
      ethereum.Value.fromUnsignedBigInt(productPassId)
    )
  )
  renewalProcessedEvent.parameters.push(
    new ethereum.EventParam(
      "productId",
      ethereum.Value.fromUnsignedBigInt(productId)
    )
  )
  renewalProcessedEvent.parameters.push(
    new ethereum.EventParam(
      "status",
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(status))
    )
  )

  return renewalProcessedEvent
}
