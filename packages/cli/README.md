# @product-mint/cli

ProductMint CLI tool for interacting with deployed contracts from the command line.

## Example Commands

```bash
./run.sh <command>

# Get balance of a native token
./run.sh balance native <address>

# Get balance of an ERC20 token
./run.sh balance erc20 <tokenAddress> <address>

# Get total passes minted
./run.sh manager totalPassesMinted

# Mint an organization
./run.sh tokens org mint <tokenAddress> <organizationAddress>

# Create a product
./run.sh registry product create <organizationId> <name> <description>

# Create a pricing model tier
./run.sh registry pricing create flatRate <organizationId> <flatPrice> <token> <chargeFrequency>

# Link pricing model to product
./run.sh registry product linkPricing <productId> <pricingIds>

# Mint a product pass!
./run.sh manager purchaseProducts <organizationId> <productIds> <pricingIds> <quantities>
```

## Getting Started

In order to use the CLI, you need to have a `.env` file in the root of the project with the variables from the `.env.example` file.

Copy the `.env.example` file to `.env` and fill in the values.

```bash
cp .env.example .env
```

Install dependencies

```bash
npm install
```

Build the ethers-sdk (used to interact with the contracts)

```bash
npm run build:ethers-sdk
```

Run the CLI

```bash
./run.sh <command>
```
