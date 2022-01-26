<p align="center">
  <a href="https://github.com/pooltogether/pooltogether--brand-assets">
    <img src="https://github.com/pooltogether/pooltogether--brand-assets/blob/977e03604c49c63314450b5d432fe57d34747c66/logo/pooltogether-logo--purple-gradient.png?raw=true" alt="PoolTogether Brand" style="max-width:100%;" width="200">
  </a>
</p>

<br />

# Draw Calculator CLI

[![CI](https://github.com/pooltogether/draw-calculator-cli/actions/workflows/main.yml/badge.svg)](https://github.com/pooltogether/draw-calculator-cli/actions/workflows/main.yml)
[![npm version](https://badge.fury.io/js/@pooltogether%2Fdraw-calculator-cli.svg)](https://badge.fury.io/js/@pooltogether%2Fdraw-calculator-cli)
[![TypeScript definitions on DefinitelyTyped](https://definitelytyped.org/badges/standard.svg)](https://definitelytyped.org)\
A NodeJs CLI tool for calculating prizes for PoolTogether v4 draws.

## Description

This CLI uses the [TWAB subgraphs](https://github.com/pooltogether/twab-subgraph) across networks to calculate TWABS for a given `drawId`, `ticket` and `network` (specified as CLI input args).

Then creates a thread for each address (using [Piscina](https://www.npmjs.com/package/piscina)) to call the [Draw Calculator JS library](https://github.com/pooltogether/draw-calculators-js) and outputs a `prizes.json` file (written to `outputDir` CLI arg) with structure:

```js
[
    {
        address: "0x1a",
        pick: "1319",
        tier: 5,
        amount: "9999999",
    },
    {
        address: "0x1b",
        pick: "2636",
        tier: 5,
        amount: "9999999",
    },
];
```

alongside a `<address>.json` of similar structure for each winning address.

This tool can be run locally or in a cloud setting.

## Status File (status.json)

```json
{
  "status": "RUNNING",
  "createdAt": "11"
}
```

### Success

```json
{
  "status": "SUCCESS",
  "createdAt": "11",
  "updatedAt": "33",
  "runtime": "22",
  "meta": {
    "prizeLength": "10",
    "amountsTotal": "5000000"
  }
}
```

### Failure

**Provider Failure**

```json
{
  "status": "FAILURE",
  "createdAt": "11",
  "updatedAt": "33",
  "runtime": "22",
  "error": {
    "code": "1",
    "msg": "provider-error"
  }
}
```

**Subgraph Failure**
```json
{
  "status": "FAILURE",
  "createdAt": "11",
  "updatedAt": "33",
  "runtime": "22",
  "error": {
    "code": "2",
    "msg": "subgraph-error"
  }
}
```

**Unexpected Failure**

```json
{
  "status": "FAILURE",
  "createdAt": "11",
  "updatedAt": "33",
  "runtime": "22",
  "error": {
    "code": "3",
    "msg": "unexpected-error"
  }
}
```

**Invalid Prize Schema Failure**

```json
{
  "status": "FAILURE",
  "createdAt": "11",
  "updatedAt": "33",
  "runtime": "22",
  "error": {
    "code": "4",
    "msg": "invalid-prize-schema"
  }
}
```

Catch on a per address thread basis an log in status.json

### Adding a new network

1. Create a (new subgraph)[https://github.com/pooltogether/twab-subgraph] for the network.
1. Add the subgraph query endpoint to `src/constants.ts` and lookup logic to `src/network/getSubgraphUrlForNetwork.ts`
1. Add Ethers Provider RPC URL to the `.env` and lookup logic to `src/getters/getRpcProvider.ts`

## Usage

1. Install the CLI tool by running `yarn add @pooltogether/draw-calculator-cli`
1. Add the required env variables listed in `.envrc.example` to `.envrc` and run `direnv allow`.

1. The CLI has a number of required args:

```js
.requiredOption("-c, --chainId <string>", "select network (mainnet (1), rinkeby (4), polygon (137) or mumbai (80001) etc.)")

.requiredOption("-t, --ticket <string>", "ticket contract address")

.requiredOption("-d, --drawId <string>", "drawId to perform lookup for")

.requiredOption("-o, --outputDir <string>", "relative path to output resulting JSON blob");`
```

### Run for Multiple Draws

A convience bash script for running the CLI tool over multiple runs is included at `scripts/runLoop.sh`. After modifying with the desired params, this can be run with:

```sh
chmod +x ./scripts/runLoop.sh

./scripts/runLoop

```

### Example Use

#### Mainnet

`node ./dist/index.js -c 1 -t 0xdd4d117723C257CEe402285D3aCF218E9A8236E1 -d 8 -o ./results`
will run the CLI for Mainnet ticket "0xdd4d117723C257CEe402285D3aCF218E9A8236E1" for drawId 8, and output the resulting JSON files in ./results directory.

#### Polygon

`node ./dist/index.js -c 137 -t 0x6a304dFdb9f808741244b6bfEe65ca7B3b3A6076 -d 32 -o ./results`
will run the CLI for Polygon ticket "0xdd4d117723C257CEe402285D3aCF218E9A8236E1" for drawId 32, and output the resulting JSON files in ./results directory.

#### Avalanche

`node ./dist/index.js -c 43114 -t 0xb27f379c050f6ed0973a01667458af6ecebc1d90 -d 1 -o ./results`
will run the CLI for Avalanche ticket "0xb27f379c050f6ed0973a01667458af6ecebc1d90" for drawId 1, and output the resulting JSON files in ./results directory.

#### Rinkeby

`node ./dist/index.js -c 4 -t 0xF04E1400Cf4f0867880e88e2201EDecCDD36227c -d 1 -o ./results`

#### Mumbai:

`node ./dist/index.js -c 80001 -t 0x8c26F9526a0b9639Edb7080dFba596e8FeFafAcC -d 1 -o ./results`
