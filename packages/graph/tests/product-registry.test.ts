import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterAll
} from "matchstick-as/assembly/index"
import { BigInt } from "@graphprotocol/graph-ts"
import { ProductCreated } from "../generated/schema"
import { ProductCreated as ProductCreatedEvent } from "../generated/ProductRegistry/ProductRegistry"
import { handleProductCreated } from "../src/product-registry"
import { createProductCreatedEvent } from "./product-registry-utils"

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/developer/matchstick/#tests-structure-0-5-0

describe("Describe entity assertions", () => {
  beforeAll(() => {
    let organizationId = BigInt.fromI32(234)
    let productId = BigInt.fromI32(234)
    let newProductCreatedEvent = createProductCreatedEvent(
      organizationId,
      productId
    )
    handleProductCreated(newProductCreatedEvent)
  })

  afterAll(() => {
    clearStore()
  })

  // For more test scenarios, see:
  // https://thegraph.com/docs/en/developer/matchstick/#write-a-unit-test

  test("ProductCreated created and stored", () => {
    assert.entityCount("ProductCreated", 1)

    // 0xa16081f360e3847006db660bae1c6d1b2e17ec2a is the default address used in newMockEvent() function
    assert.fieldEquals(
      "ProductCreated",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "organizationId",
      "234"
    )
    assert.fieldEquals(
      "ProductCreated",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "productId",
      "234"
    )

    // More assert options:
    // https://thegraph.com/docs/en/developer/matchstick/#asserts
  })
})
