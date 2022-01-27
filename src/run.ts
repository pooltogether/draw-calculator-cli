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
import {
    createStatus,
    writeStatus,
    updateStatusSuccess,
    updateStatusFailure,
    sumPrizeAmounts
} from "./utils";
import { filterUndef } from "./utils/filterUndefinedValues";
import { normalizeUserBalances } from "./utils/normalizeUserBalances";
import { verifyAgainstSchema } from "./utils/verifyAgainstSchema";

const debug = require("debug")("pt:draw-calculator-cli");

export async function run(chainId: string, ticket: string, drawId: string, outputDir: string) {
    // Initialize the status.json file with the status and the current time in epoch miliseconds.
    const statusLoading = createStatus();
    writeStatus(outputDir, chainId, drawId, statusLoading);

    debug(`Running Draw Calculator CLI tool..`);
    const provider = getRpcProvider(chainId);
    const drawBufferAddress = getDrawBufferAddress(chainId);
    const prizeDistributionBufferAddress = getPrizeDistributionBufferAddress(chainId);

    /* -------------------------------------------------- */
    // JsonRpcProvider Fetching
    /* -------------------------------------------------- */
    let draw: Draw | undefined = undefined;
    let prizeDistribution: PrizeDistribution | undefined = undefined;
    let drawStartTimestamp = 0;
    let drawEndTimestamp = 0;
    try {
        prizeDistribution = await getPrizeDistribution(
            prizeDistributionBufferAddress,
            drawId,
            provider
        );
        draw = await getDrawFromDrawId(drawId, drawBufferAddress, provider);
        const drawTimestamp = draw?.timestamp;
        // @ts-ignore
        drawStartTimestamp = drawTimestamp - prizeDistribution.startTimestampOffset;
        // @ts-ignore
        drawEndTimestamp = drawTimestamp - prizeDistribution.endTimestampOffset;
    } catch (error) {
        const statusFailure = updateStatusFailure(statusLoading.createdAt, {
            code: 1,
            msg: "provider-error"
        });
        writeStatus(outputDir, chainId, drawId, statusFailure);
    }

    /* -------------------------------------------------- */
    // Subgraph Fetching
    /* -------------------------------------------------- */
    let userAccounts: Account[] = [];
    try {
        userAccounts = await getUserAccountsFromSubgraphForTicket(
            chainId,
            ticket,
            drawStartTimestamp,
            drawEndTimestamp
        );
    } catch (error) {
        const statusFailure = updateStatusFailure(statusLoading.createdAt, {
            code: 2,
            msg: "subgraph-error"
        });
        writeStatus(outputDir, chainId, drawId, statusFailure);
    }

    /* -------------------------------------------------- */
    // Unexpected Error
    /* -------------------------------------------------- */
    // @TODO validate more inputs?
    if (!draw || !prizeDistribution || !userAccounts) {
        const statusFailure = updateStatusFailure(statusLoading.createdAt, {
            code: 3,
            msg: "unexpected-error"
        });
        writeStatus(outputDir, chainId, drawId, statusFailure);
        throw new Error(`Unexpected Error`);
    }

    /* -------------------------------------------------- */
    // Computation
    /* -------------------------------------------------- */
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
    const filteredUserBalances: UserBalance[] = filterUndef<UserBalance>(userBalances);
    const ticketTotalSupplies: BigNumber[] = await getAverageTotalSuppliesFromTicket(
        ticket,
        drawStartTimestamp,
        drawEndTimestamp,
        provider
    );
    const normalizedUserBalances: NormalizedUserBalance[] = normalizeUserBalances(
        filteredUserBalances,
        ticketTotalSupplies[0]
    );
    const prizes: Prize[][] = await runCalculateDrawResultsWorker(
        normalizedUserBalances,
        prizeDistribution,
        draw
    );
    /* -------------------------------------------------- */
    // Invalid Data (Schema)
    // @dev Should not happen, but just in case.
    /* -------------------------------------------------- */
    if (!verifyAgainstSchema(prizes.flat(1))) {
        const statusFailure = updateStatusFailure(statusLoading.createdAt, {
            code: 4,
            msg: "invalid-prize-schema"
        });
        writeStatus(outputDir, chainId, drawId, statusFailure);
        throw new Error(`Invalid Prize Schema`);
    }

    /* -------------------------------------------------- */
    // Write (Flat File Database Schema)
    /* -------------------------------------------------- */
    writeToOutput(outputDir, chainId, draw.drawId.toString(), "prizes", prizes.flat(1));
    verifyParseAndWriteAddressesToOutput(outputDir, chainId, draw.drawId.toString(), prizes);
    const statusSuccess = updateStatusSuccess(statusLoading.createdAt, {
        prizeLength: prizes.length,
        amountsTotal: sumPrizeAmounts(prizes)
    });
    writeStatus(outputDir, chainId, drawId, statusSuccess);
}
