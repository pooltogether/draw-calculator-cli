
#!/usr/bin/env bash

# This script can be used to run the CLI for several sequential draws.
# The user may need to run `chmod +x PATH_TO_THIS_FILE` to make it executable with ./runLoop.sh

# Note: update the following variables to match your setup
# mainnet usdc ticket: 0xdd4d117723C257CEe402285D3aCF218E9A8236E1
# polygon usdc ticket: 0x6a304dFdb9f808741244b6bfEe65ca7B3b3A6076


startDraw=51;
endDraw=54;
ticket=0x6a304dFdb9f808741244b6bfEe65ca7B3b3A6076;
chainId=137;


for ((i = $startDraw ; i < $endDraw ; i++)); do
  node ./dist/index.js -c $chainId -t $ticket -d $i -o ./results
done