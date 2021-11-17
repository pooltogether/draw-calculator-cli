import { BigNumber } from "ethers";
import Piscina from "piscina";
import { Draw, PrizeDistribution } from "@pooltogether/draw-calculator-js";
import { NormalizedUserBalance, Prize } from "../types";
import { resolve } from "path";
import { filterUndef } from "./filterUndefinedValues";

const debug = require("debug")("pt:draw-calculator-cli");

export async function runCalculateDrawResultsWorker(
    normalizedUserBalances: NormalizedUserBalance[],
    prizeDistribution: PrizeDistribution,
    draw: Draw
): Promise<Prize[]> {
    const piscina = new Piscina({
        filename: resolve(__dirname, "../src/workers/calculatePrizeForUser.js"),
    });

    const prizes = await Promise.all(
        normalizedUserBalances.map(async (userBalance: NormalizedUserBalance) => {
            debug(
                `creating thread for ${
                    userBalance.address
                }... with balance ${userBalance.normalizedBalance.toString()}`
            );

            // serialize the data as strings
            const user = {
                address: userBalance.address,
                balance: userBalance.normalizedBalance.toString(),
            };
            const _prizeDistribution = {
                ...prizeDistribution,
                numberOfPicks: prizeDistribution.numberOfPicks.toString(),
                bitRangeSize: prizeDistribution.bitRangeSize,
                prize: prizeDistribution.prize.toString(),
            };
            const _draw = {
                ...draw,
                winningRandomNumber: draw.winningRandomNumber.toString(),
            };
            const workerArgs = {
                user,
                prizeDistribution: _prizeDistribution,
                draw: _draw,
            };

            return await piscina.run(workerArgs);
        })
    );
    const filteredPrizes: Prize[] = filterUndef<Prize>(prizes);
    debug(`runCalculateDrawResultsWorker returning ${prizes.length} results..`);
    return filteredPrizes;
}
