# Draw Calculator CLI

[![CI](https://github.com/pooltogether/draw-calculator-cli/actions/workflows/main.yml/badge.svg)](https://github.com/pooltogether/draw-calculator-cli/actions/workflows/main.yml)

A CLI tool for all things Draw Calculator!

See (here)[https://www.notion.so/ptinc/CLI-Lib-to-calculate-prizes-01ae87125fab460b907a35efc3496ca8]

## Description

Uses the [TWAB subgraphs](https://github.com/pooltogether/twab-subgraph) across networks to calculate

Then creates a thread for each address (using Piscina) to call the [Draw Calculator JS library](https://github.com/pooltogether/draw-calculators-js).

### Adding a new network

1. Create a new subgraph for that network.
1. Add the subgraph query endpoint to `src/constants.ts`
1. Add Ethers Provider RPC URL to the `.env` and lookup logic to `src/utils/getRpcProvider.ts`

## Usage

The CLI has a number of required args:

```js
.requiredOption("-n, --network <string>", "select network (mainnet, rinkeby, polygon or binance etc.)")

.requiredOption("-t, --ticket <string>", "ticket contract address")

.requiredOption("-d, --drawId <string>", "drawId to perform lookup for")

.requiredOption("-o, --outputDir <string>", "relative path to output resulting JSON blob");`
```

For example:
`node ./dist/index.js -n mainnet -t 0xdd4d117723C257CEe402285D3aCF218E9A8236E1 -d 8 -o ./`
will run the CLI for Mainnet ticket "0xdd4d117723C257CEe402285D3aCF218E9A8236E1" for drawId 8, and output the resulting JSON file in the directory this command is run.

`node ./dist/index.js -n polygon -t 0x6a304dFdb9f808741244b6bfEe65ca7B3b3A6076 -d 32 -o ./`
will run the CLI for Polygon ticket "0xdd4d117723C257CEe402285D3aCF218E9A8236E1" for drawId 32, and output the resulting JSON file in the directory this command is run.
