import { resolve } from "path";

import { Draw, PrizeDistribution } from "@pooltogether/draw-calculator-js";
import Piscina from "piscina";

import { NormalizedUserBalance, Prize } from "./types";
import { filterUndef } from "./utils/filterUndefinedValues";

const debug = require("debug")("pt:draw-calculator-cli");

export async function runCalculateDrawResultsWorker(
    normalizedUserBalances?: NormalizedUserBalance[],
    prizeDistribution?: PrizeDistribution,
    draw?: Draw
): Promise<Prize[][]> {
    if (!normalizedUserBalances || !prizeDistribution || !draw) {
        throw new Error(`Invalid input parameters`);
    }
    const piscina = new Piscina({
        filename: resolve(__dirname, "../src/workers/calculatePrizeForUser.js")
    });

    let prizes = await Promise.all(
        normalizedUserBalances.map(async (userBalance: NormalizedUserBalance) => {
            debug(
                `creating thread for ${
                    userBalance.address
                }... with balance ${userBalance.normalizedBalance.toString()}`
            );

            // serialize the data as strings
            const user = {
                address: userBalance.address,
                balance: userBalance.normalizedBalance.toString()
            };
            const _prizeDistribution = {
                ...prizeDistribution,
                numberOfPicks: prizeDistribution.numberOfPicks.toString(),
                bitRangeSize: prizeDistribution.bitRangeSize,
                prize: prizeDistribution.prize.toString()
            };
            const _draw = {
                ...draw,
                winningRandomNumber: draw.winningRandomNumber.toString()
            };
            const workerArgs = {
                user,
                prizeDistribution: _prizeDistribution,
                draw: _draw
            };

            return await piscina.run(workerArgs);
        })
    );
    // remove empty arrays and zero value prizes
    prizes = prizes.filter(prize => {
        if (!prize) {
            return false;
        }

        return prize.length > 0;
    });
    // remove undefined values
    const filteredPrizes: Prize[][] = filterUndef<Prize[]>(prizes);
    debug(`runCalculateDrawResultsWorker returning ${filteredPrizes.length} results..`);
    return filteredPrizes;
}
