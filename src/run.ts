import { hrtime } from "process";

import { BigNumber } from "@ethersproject/bignumber";
import { PrizeDistribution, Draw } from "@pooltogether/draw-calculator-js";

import { calculateUserBalanceFromAccount } from "./calculate/calculateUserBalanceFromAccount";
import { getDrawBufferAddress } from "./getters/getDrawBufferAddress";
import { getPrizeDistributionBufferAddress } from "./getters/getPrizeDistributionAddress";
import { getRpcProvider } from "./getters/getRpcProvider";
import { getAverageTotalSuppliesFromTicket } from "./network/getAverageTotalSuppliesFromTicket";
import { getDrawFromDrawId } from "./network/getDrawFromDrawId";
import { getPrizeDistribution } from "./network/getPrizeDistribution";
import { getUserAccountsFromSubgraphForTicket } from "./network/getUserAccountsFromSubgraphForTicket";
import { verifyParseAndWriteAddressesToOutput } from "./output/verifyParseAndWriteAddressesToOutput";
import { writeToOutput } from "./output/writeToOutput";
import { runCalculateDrawResultsWorker } from "./runCalculateDrawResultsWorker";
import { Account, NormalizedUserBalance, Prize, UserBalance } from "./types";
import { createOrUpdateStatus } from "./utils/createOrUpdateStatus";
import { filterUndef } from "./utils/filterUndefinedValues";
import { normalizeUserBalances } from "./utils/normalizeUserBalances";
import { verifyAgainstSchema } from "./utils/verifyAgainstSchema";

const debug = require("debug")("pt:draw-calculator-cli");

export async function run(chainId: string, ticket: string, drawId: string, outputDir: string) {
    debug(`Running Draw Calculator CLI tool..`);
    const startTime = hrtime();
    const provider = getRpcProvider(chainId);
    const drawBufferAddress = getDrawBufferAddress(chainId);
    const prizeDistributionBufferAddress = getPrizeDistributionBufferAddress(chainId);

    // get PrizeDistribution for drawId
    const prizeDistribution: PrizeDistribution = await getPrizeDistribution(
        prizeDistributionBufferAddress,
        drawId,
        provider
    );
    // get draw timestamp using drawId
    const draw: Draw = await getDrawFromDrawId(drawId, drawBufferAddress, provider);
    const drawTimestamp = (draw as any).timestamp;
    const drawStartTimestamp = drawTimestamp - (prizeDistribution as any).startTimestampOffset;
    const drawEndTimestamp = drawTimestamp - (prizeDistribution as any).endTimestampOffset;

    // get accounts from subgraph for ticket and network
    const userAccounts: Account[] = await getUserAccountsFromSubgraphForTicket(
        chainId,
        ticket,
        drawStartTimestamp,
        drawEndTimestamp
    );
    // calculate user balances from twabs
    const userBalances: any[] = userAccounts.map((account: Account) => {
        const balance = calculateUserBalanceFromAccount(
            account,
            drawStartTimestamp,
            drawEndTimestamp
        );
        if (!balance) {
            return undefined;
        }
        return {
            balance,
            address: account.id
        };
    });
    debug("userBalances length ", userBalances.length);

    // filter out undefined balances
    const filteredUserBalances: UserBalance[] = filterUndef<UserBalance>(userBalances);
    debug("filteredUserBalances length ", filteredUserBalances.length);

    // normalize - getAverageTotalSuppliesFromTicket and normalize (div) with this value
    const ticketTotalSupplies: BigNumber[] = await getAverageTotalSuppliesFromTicket(
        ticket,
        drawStartTimestamp,
        drawEndTimestamp,
        provider
    );
    debug(`got total ticket supply ${ticketTotalSupplies[0]}`);
    debug(`normalizing balances..`);
    const normalizedUserBalances: NormalizedUserBalance[] = normalizeUserBalances(
        filteredUserBalances,
        ticketTotalSupplies[0]
    );

    // run worker for each userBalance
    debug(`running draw calculator workers..`);
    const prizes: Prize[][] = await runCalculateDrawResultsWorker(
        normalizedUserBalances,
        prizeDistribution,
        draw
    );
    debug(`draw calc workers returned: ${prizes.length} prizes`);

    // verify all prizes data
    if (!verifyAgainstSchema(prizes.flat(1))) {
        throw new Error("prizes data is not valid");
    }
    debug(`verified all prizes data against schema`);

    // now write prizes to outputDir as JSON blob
    writeToOutput(outputDir, chainId, draw.drawId.toString(), "prizes", prizes.flat(1));

    // write each address data
    verifyParseAndWriteAddressesToOutput(outputDir, chainId, draw.drawId.toString(), prizes);

    const elapsedSeconds = parseHrtimeToSeconds(hrtime(startTime));
    createOrUpdateStatus(outputDir, chainId, draw.drawId.toString(), elapsedSeconds);
    debug(`exiting program`);
}

function parseHrtimeToSeconds(hrtime: number[]) {
    return (hrtime[0] + hrtime[1] / 1e9).toFixed(3);
}
