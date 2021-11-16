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
import { User } from "@pooltogether/draw-calculator-js";

const debug = require("debug")("pt:draw-calculator-cli");

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
    debug(`Running Draw Calculator CLI tool..`);

    const program = new Command();
    program
        .requiredOption(
            "-n, --network <string>",
            "select network (mainnet, rinkeby, polygon or binance)"
        )
        .requiredOption("-t, --ticket <string>", "ticket contract address")

        .requiredOption("-d, --drawId <string>", "drawId to perform lookup for")
        .requiredOption("-o, --outputDir <string>", "relative path to output resulting JSON blob")
        .option("-u --user <string>", "user address to filter");
    program.parse(process.argv);
    const options = program.opts();
    const network = options.network;
    const ticket = options.ticket;
    const drawId = options.drawId;
    const outputDir = options.outputDir;
    const userAddress = options.user;

    debug(`was passed ${network} for network`);
    debug(`was passed ${ticket} for ticket`);
    debug(`was passed ${drawId} for drawId`);
    debug(`was passed ${outputDir} for outputDir`);
    debug(`was passed ${userAddress} for userAddress`);

    // validate inputs
    validateInputs(network, ticket, drawId, outputDir);
    const provider = getRpcProvider();

    // lookup draw buffer address for network
    const drawBufferAddress = getDrawBufferAddress(network);

    // lookup PrizeDistrbution address for network
    const prizeDistributionBufferAddress = getPrizeDistributionBufferAddress(network); // refactor to use same code as getDrawBufferAddress
    // get PrizeDistribution for drawId
    const prizeDistribution: PrizeDistribution = await getPrizeDistribution(
        prizeDistributionBufferAddress,
        drawId,
        provider
    );
    debug("got prizeDistribution: ", JSON.stringify(prizeDistribution));
    debug(`prizeDistribution.numberOfPicks `, prizeDistribution.numberOfPicks);

    // get draw timestamp using drawId
    const draw: Draw = await getDrawFromDrawId(drawId, drawBufferAddress, provider);

    debug(`draw: ${JSON.stringify(draw)}`);
    debug(`draw.timestamp: ${draw.timestamp}`);

    const drawTimestamp = draw.timestamp;
    const drawStartTimestamp = drawTimestamp - prizeDistribution.startTimestampOffset;
    const drawEndTimestamp = drawTimestamp - prizeDistribution.endTimestampOffset;

    console.log("drawStartTimestamp: ", drawStartTimestamp);
    console.log("drawEndTimestamp: ", drawEndTimestamp);

    // get accounts from subgraph for ticket and network

    const userAccounts = await getUserAccountsFromSubgraphForTicket(
        network,
        ticket,
        drawStartTimestamp,
        drawEndTimestamp,
        userAddress
    );
    // calculate user balances from twabs
    const userBalances: any[] = userAccounts.map((account: any) => {
        const balance = calculateUserBalanceFromAccount(
            account,
            drawStartTimestamp,
            drawEndTimestamp
        );
        if (!balance) {
            return undefined;
        }
        return {
            balance: calculateUserBalanceFromAccount(account, drawStartTimestamp, drawEndTimestamp),
            address: account.id,
        };
    });
    debug("userBalances length ", userBalances.length);

    // filter out undefined balances
    const filteredUserBalances: UserBalance[] = filterUndef<UserBalance>(userBalances);
    debug("filteredUserBalances length ", filteredUserBalances.length);

    // normalize
    const ticketTotalSupply = await getTotalSupplyFromTicket(
        ticket,
        drawStartTimestamp,
        drawEndTimestamp,
        provider
    );
    debug(`got total ticket supply ${ticketTotalSupply}`);
    debug(`normalizing balances..`);
    const normalizedUserBalances = normalizeUserBalances(
        filteredUserBalances,
        ticketTotalSupply[0]
    );

    // run worker for each userBalance
    debug(`running draw calculator workers..`);
    const prizes = await runCalculateDrawResultsWorker(
        normalizedUserBalances,
        prizeDistribution,
        draw
    );
    debug(`draw calc workers returned: ${prizes.length} prizes`);
    console.log(prizes);
    // now write to outputDir as JSON blob
    const outputFilePath = `${outputDir}/draw${draw.drawId}.json`;
    writeFileSync(outputFilePath, JSON.stringify(prizes, null, 2));

    debug(`exiting program`); // exit with zero status - can commander do this?
}
main();
