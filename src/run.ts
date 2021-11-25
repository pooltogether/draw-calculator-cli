import { getDrawBufferAddress } from "./getters/getDrawBufferAddress";
import { getDrawFromDrawId } from "./network/getDrawFromDrawId";
import { getPrizeDistribution } from "./network/getPrizeDistribution";
import { getPrizeDistributionBufferAddress } from "./getters/getPrizeDistributionAddress";
import { getRpcProvider } from "./getters/getRpcProvider";
import { getAverageTotalSuppliesFromTicket } from "./network/getAverageTotalSuppliesFromTicket";
import { getUserAccountsFromSubgraphForTicket } from "./network/getUserAccountsFromSubgraphForTicket";
import { validateInputs } from "./utils/validateInputs";
import { Account, NormalizedUserBalance, Prize, UserBalance } from "./types";
import { filterUndef } from "./utils/filterUndefinedValues";
import { BigNumber } from "ethers";
import { calculateUserBalanceFromAccount } from "./calculate/calculateUserBalanceFromAccount";
import { normalizeUserBalances } from "./utils/normalizeUserBalances";
import { runCalculateDrawResultsWorker } from "./runCalculateDrawResultsWorker";
import { PrizeDistribution, Draw } from "@pooltogether/draw-calculator-js";
import { writeToOutput } from "./output/writeToOutput";
import { parseAndWriteAddressesToOutput } from "./output/parseAndWriteAddressesToOutput";

const debug = require("debug")("pt:draw-calculator-cli");

export async function run(chainId: string, ticket: string, drawId: string, outputDir: string) {
    debug(`Running Draw Calculator CLI tool..`);
    console.time("draw-calculator-cli/run took:");

    // validate inputs
    validateInputs(chainId, ticket, drawId, outputDir);
    const provider = getRpcProvider(chainId);

    // lookup draw buffer address for network
    const drawBufferAddress = getDrawBufferAddress(chainId);

    // lookup PrizeDistrbution address for network
    const prizeDistributionBufferAddress = getPrizeDistributionBufferAddress(chainId); // refactor to use same code as getDrawBufferAddress
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
            address: account.id,
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

    // now write prizes to outputDir as JSON blob
    writeToOutput(outputDir, chainId, draw.drawId.toString(), "prizes", prizes.flat(1));
    parseAndWriteAddressesToOutput(outputDir, chainId, draw.drawId.toString(), prizes);

    console.timeEnd("draw-calculator-cli/run took:");
    debug(`exiting program`);
}
