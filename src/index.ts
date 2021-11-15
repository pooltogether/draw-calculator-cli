import { Command } from "commander";
import { getDrawBufferAddress } from "./utils/getDrawBufferAddress";
import { getDrawFromDrawId } from "./utils/getDrawFromDrawId";
import { getPrizeDistribution } from "./utils/getPrizeDistribution";
import { getPrizeDistributionBufferAddress } from "./utils/getPrizeDistributionAddress";
import { getRpcProvider } from "./utils/getRpcProvider";
import { getTotalSupplyFromTicket } from "./utils/getTotalSupplyFromTicket";
import { getUserAccountsFromSubgraphForTicket } from "./utils/getUserAccountsFromSubgraphForTicket";
import { validateInputs } from "./utils/validateInputs";
import { NormalizedUserBalance, UserBalance } from "./types";
import { filterUndef } from "./utils/filterUndefinedValues";
import { writeFileSync } from "fs";

import { BigNumber } from "ethers";
import { calculateUserBalanceFromAccount } from "./utils/calculateUserBalanceFromAccount";
import { normalizeUserBalances } from "./utils/normalizeUserBalances";
import { runCalculateDrawResultsWorker } from "./utils/runCalculateDrawResultsWorker";

const debug = require("debug")("pt:draw_calculator-cli");

export type Draw = {
    drawId: number;
    winningRandomNumber: BigNumber;
    timestamp: number;
    beaconPeriodStartedAt?: number;
    beaconPeriodSeconds?: number;
};

export type PrizeDistribution = {
    matchCardinality: number;
    numberOfPicks: BigNumber;
    tiers: number[];
    bitRangeSize: number;
    prize: BigNumber;
    startTimestampOffset: number;
    endTimestampOffset: number;
    maxPicksPerUser: number;
    expiryDuration: number;
};

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
    const prizeDistribution: PrizeDistribution = await getPrizeDistribution(
        prizeDistributionBufferAddress,
        drawId,
        provider
    );
    console.log("got prizeDistribution: ", JSON.stringify(prizeDistribution));
    console.log(`prizeDistribution.numberOfPicks `, prizeDistribution.numberOfPicks);

    // get draw timestamp using drawId
    const draw: Draw = await getDrawFromDrawId(drawId, drawBufferAddress, provider);

    console.log(`draw: ${JSON.stringify(draw)}`);
    console.log(`draw.timestamp: ${draw.timestamp}`);
    throw new Error("stop");

    const drawTimestamp = draw.timestamp;
    const drawStartTimestamp = drawTimestamp - prizeDistribution.startTimestampOffset;
    const drawEndTimestamp = drawTimestamp - prizeDistribution.endTimestampOffset;

    // get accounts from subgraph for ticket and network
    const userAccounts = await getUserAccountsFromSubgraphForTicket(
        network,
        ticket,
        drawStartTimestamp,
        drawEndTimestamp
    );

    // calculate user balances from twabs
    const userBalances = userAccounts.map((twab: any) => {
        // console.log("\n this twab: ", twab);

        const userBalance = calculateUserBalanceFromAccount(
            twab,
            drawStartTimestamp,
            drawEndTimestamp
        );
        if (!userBalance) {
            console.log(`user ${twab.id} did not have a balance for this draw`);
            return;
        }
        return userBalance;
    });

    console.log("userBalances length ", userBalances.length);
    // console.log(userBalances);

    // filter out undefined balances
    const filteredUserBalances = filterUndef<UserBalance>(userBalances);
    console.log("filteredUserBalances length ", filteredUserBalances.length);
    // normalize
    console.log(`normalizing balances..`);

    const ticketTotalSupply = await getTotalSupplyFromTicket(
        ticket,
        drawStartTimestamp,
        drawEndTimestamp,
        provider
    );
    console.log(`got total ticket supply ${ticketTotalSupply}`);
    const normalizedUserBalances = normalizeUserBalances(filteredUserBalances, ticketTotalSupply);

    // run worker for each userBalance
    const prizes = runCalculateDrawResultsWorker(normalizedUserBalances, prizeDistribution, draw);

    // now write to outputDir as JSON blob
    // console.log(`prizes: ${prizes.length}`);
    // writeFileSync(outputDir, JSON.stringify(prizes, null, 2));

    console.log(`exiting program`); // exit with zero status - can commander do this?
}
main();
