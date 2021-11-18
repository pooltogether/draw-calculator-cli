import { Command } from "commander";
import { getDrawBufferAddress } from "./utils/getDrawBufferAddress";
import { getDrawFromDrawId } from "./utils/getDrawFromDrawId";
import { getPrizeDistribution } from "./utils/getPrizeDistribution";
import { getPrizeDistributionBufferAddress } from "./utils/getPrizeDistributionAddress";
import { getRpcProvider } from "./utils/getRpcProvider";
import { getAverageTotalSuppliesFromTicket } from "./utils/getAverageTotalSuppliesFromTicket";
import { getUserAccountsFromSubgraphForTicket } from "./utils/getUserAccountsFromSubgraphForTicket";
import { validateInputs } from "./utils/validateInputs";
import { Account, NormalizedUserBalance, Prize, UserBalance } from "./types";
import { filterUndef } from "./utils/filterUndefinedValues";
import { BigNumber } from "ethers";
import { calculateUserBalanceFromAccount } from "./utils/calculateUserBalanceFromAccount";
import { normalizeUserBalances } from "./utils/normalizeUserBalances";
import { runCalculateDrawResultsWorker } from "./utils/runCalculateDrawResultsWorker";
import { PrizeDistribution, Draw } from "@pooltogether/draw-calculator-js";
import { writeToOutput } from "./utils/writeToOutput";
import { parseAndWriteAddressesToOutput } from "./utils/parseAndWriteAddressesToOutput";

const debug = require("debug")("pt:draw-calculator-cli");

async function main() {
    debug(`Running Draw Calculator CLI tool..`);
    console.time("draw-calculator-cli/run took:");

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

    // validate inputs
    validateInputs(network, ticket, drawId, outputDir);
    const provider = getRpcProvider(network);

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
    // get draw timestamp using drawId
    const draw: Draw = await getDrawFromDrawId(drawId, drawBufferAddress, provider);
    const drawTimestamp = (draw as any).timestamp;
    const drawStartTimestamp = drawTimestamp - (prizeDistribution as any).startTimestampOffset;
    const drawEndTimestamp = drawTimestamp - (prizeDistribution as any).endTimestampOffset;

    // for testing remove
    debug("drawStartTimestamp: ", drawStartTimestamp);
    debug("drawEndTimestamp: ", drawEndTimestamp);

    // get accounts from subgraph for ticket and network
    const userAccounts: Account[] = await getUserAccountsFromSubgraphForTicket(
        network,
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
    writeToOutput(outputDir, network, draw.drawId.toString(), "prizes", prizes);
    parseAndWriteAddressesToOutput(outputDir, network, draw.drawId.toString(), prizes);

    console.timeEnd("draw-calculator-cli/run took:");
    debug(`exiting program`);
}
main();
