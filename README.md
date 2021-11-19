<p align="center">
  <a href="https://github.com/pooltogether/pooltogether--brand-assets">
    <img src="https://github.com/pooltogether/pooltogether--brand-assets/blob/977e03604c49c63314450b5d432fe57d34747c66/logo/pooltogether-logo--purple-gradient.png?raw=true" alt="PoolTogether Brand" style="max-width:100%;" width="200">
  </a>
</p>

<br />

# Draw Calculator CLI

[![CI](https://github.com/pooltogether/draw-calculator-cli/actions/workflows/main.yml/badge.svg)](https://github.com/pooltogether/draw-calculator-cli/actions/workflows/main.yml)

A NodeJs CLI tool for calculating prizes for PoolTogether v4 draws.

## Description

This CLI uses the [TWAB subgraphs](https://github.com/pooltogether/twab-subgraph) across networks to calculate TWABS for a given `drawId`, `ticket` and `network` (specified as CLI input args).

Then creates a thread for each address (using [Piscina](https://www.npmjs.com/package/piscina)) to call the [Draw Calculator JS library](https://github.com/pooltogether/draw-calculators-js) and outputs a `prizes.json` file (written to `outputDir` CLI arg) with structure:

```js
 [
   [
     {
        address: "0xa..",
        amount: "12183712897312",

     },
     ...
   ],
   [
      {
        address: "0xb..",
        amount: "223132132",

     },
   ],
   ...
 ]

```

alongside a per address json of similar structure for each winning address.

### Adding a new network

1. Create a new subgraph for that network.
1. Add the subgraph query endpoint to `src/constants.ts`
1. Add Ethers Provider RPC URL to the `.env` and lookup logic to `src/utils/getRpcProvider.ts`

## Usage

1. Install the CLI tool by running `yarn` in this directory.
1. Add the required env variables listed in `.envrc.example` to `.envrc` and run `direnv allow`.

1. The CLI has a number of required args:

```js
.requiredOption("-n, --network <string>", "select network (mainnet, rinkeby, polygon or binance etc.)")

.requiredOption("-t, --ticket <string>", "ticket contract address")

.requiredOption("-d, --drawId <string>", "drawId to perform lookup for")

.requiredOption("-o, --outputDir <string>", "relative path to output resulting JSON blob");`
```

For example:
`node ./dist/index.js -n mainnet -t 0xdd4d117723C257CEe402285D3aCF218E9A8236E1 -d 8 -o ./results`
will run the CLI for Mainnet ticket "0xdd4d117723C257CEe402285D3aCF218E9A8236E1" for drawId 8, and output the resulting JSON files in ./results directory.

`node ./dist/index.js -n polygon -t 0x6a304dFdb9f808741244b6bfEe65ca7B3b3A6076 -d 32 -o ./results`
will run the CLI for Polygon ticket "0xdd4d117723C257CEe402285D3aCF218E9A8236E1" for drawId 32, and output the resulting JSON files in ./results directory.

Rinkeby:
`node ./dist/index.js -n rinkeby -t 0xF04E1400Cf4f0867880e88e2201EDecCDD36227c -d 10 -o ./results`

Mumbai:
`node ./dist/index.js -n mumbai -t 0x8c26F9526a0b9639Edb7080dFba596e8FeFafAcC -d 10 -o ./results`
