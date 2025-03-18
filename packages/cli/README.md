# @product-mint/cli

ProductMint CLI tool for interacting with deployed contracts from the command line.

## Example Commands

```bash
npx ts-node src/index.ts <command>

# Get balance of a native token
npx ts-node src/index.ts balance native <address>

# Get balance of an ERC20 token
npx ts-node src/index.ts balance erc20 <tokenAddress> <address>

# Get total passes minted
npx ts-node src/index.ts manager getTotalPassesMinted
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
npx ts-node src/index.ts <command>
```
