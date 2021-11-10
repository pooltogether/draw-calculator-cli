import { Command } from "commander";
import { getDrawBufferAddress } from "./utils/getDrawBufferAddress";
import { getDrawTimestampFromDrawId } from "./utils/getDrawTimestampFromDrawId";
import { getPrizeDistribution } from "./utils/getPrizeDistribution";
import { getPrizeDistributionBufferAddress } from "./utils/getPrizeDistributionAddress";
import { getRpcProvider } from "./utils/getRpcProvider";
import { getTotalSupplyFromTicket } from "./utils/getTotalSupplyFromTicket";
import { getUserBalancesFromSubgraphForTicket } from "./utils/getUserBalancesFromSubgraphForTicket";
import { validateInputs } from "./utils/validateInputs";
import { UserBalance } from "./types";

import Piscina from "piscina";

const piscina = new Piscina({
    filename: new URL("./workers/calculatePrizeForUser.ts", import.meta.url).href,
});

async function main() {
    console.log(`Running program`);

    const program = new Command();
    program
        .requiredOption(
            "-n, --network <string>",
            "select network (mainnet, rinkeby, polygon or binance)"
        )
        .requiredOption("-t, --ticket <string>", "ticket contract address")

        .requiredOption("-d, --drawId <string>", "drawId to perform lookup for")
        .requiredOption("-o, --outputDir <string>", "relative path to output resulting JSON blob");
    program.parse(process.argv);
    const options = program.opts();
    const network = options.network;
    const ticket = options.ticket;
    const drawId = options.drawId;
    const outputDir = options.outputDir;

    console.log(`was passed ${network} for network`);
    console.log(`was passed ${ticket} for ticket`);
    console.log(`was passed ${drawId} for drawId`);
    console.log(`was passed ${outputDir} for outputDir`);

    // validate inputs
    validateInputs(network, ticket, drawId, outputDir);

    // lookup draw buffer address for network
    const drawBufferAddress = getDrawBufferAddress(network);

    const provider = getRpcProvider();

    // lookup PrizeDistrbution address for network
    const prizeDistributionBufferAddress = getPrizeDistributionBufferAddress(network); // refactor to use same code as getDrawBufferAddress
    // get PrizeDistribution for drawId
    const prizeDistribution = await getPrizeDistribution(
        prizeDistributionBufferAddress,
        drawId,
        provider
    );
    // get draw timestamp using drawId
    const drawTimestamp = await getDrawTimestampFromDrawId(drawId, drawBufferAddress, provider);

    // get ticket totalSupply -- TODO: should this be totalAverageTicketSupply between (drawTimestamp + prizeDistribution.startTimestampOffset, drawTimestamp + prizeDistribution.endTimestampOffset)
    const ticketTotalSupply = await getTotalSupplyFromTicket(ticket, provider);

    // get accounts from subgraph for ticket and network
    const userBalances = await getUserBalancesFromSubgraphForTicket(
        network,
        ticket,
        drawTimestamp + prizeDistribution.startTimestampOffset,
        drawTimestamp + prizeDistribution.endTimestampOffset
    );

    // run worker for each userBalance
    const prizes = userBalances.map(async (userBalance: UserBalance) => {
        console.log(`creating thread for ${userBalance.address}...`);
        const result = await piscina.run(userBalances);

        return result;
    });

    // now write to outputDir as JSON blob

    console.log(`exiting program`);
}
main();
