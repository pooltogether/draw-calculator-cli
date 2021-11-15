import { BigNumber } from "ethers";
import Piscina from "piscina";
import { Draw, PrizeDistribution } from "..";
import { NormalizedUserBalance } from "../types";
import { resolve } from "path";

const debug = require("debug")("pt:draw-calculator-cli");

export async function runCalculateDrawResultsWorker(
    normalizedUserBalances: NormalizedUserBalance[],
    prizeDistribution: PrizeDistribution,
    draw: Draw
): Promise<any> {
    const piscina = new Piscina({
        filename: resolve(__dirname, "../workers/calculatePrizeForUser.js"),
    });

    const prizes = normalizedUserBalances.map(async (userBalance: NormalizedUserBalance) => {
        console.log(
            `creating thread for ${
                userBalance.address
            }... with balance ${userBalance.normalizedBalance.toString()}`
        );

        const user = {
            address: userBalance.address,
            balance: userBalance.normalizedBalance.toString(),
        };

        // console.log(`prizeDistribution.numberOfPicks ${prizeDistribution.numberOfPicks}`);

        const _prizeDistribution = {
            ...prizeDistribution,
            numberOfPicks: prizeDistribution.numberOfPicks.toString(),
            bitRangeSize: prizeDistribution.bitRangeSize,
            prize: prizeDistribution.prize.toString(),
        };
        // const _prizeDistribution = prizeDistribution;

        const _draw = {
            ...draw,
            winningRandomNumber: draw.winningRandomNumber.toString(),
        };

        const workerArgs = {
            user,
            prizeDistribution: _prizeDistribution,
            draw: _draw,
        };
        debug("calling piscina with ", workerArgs);

        const result = await piscina.run(workerArgs);
        debug(`result from worker thread: ${result}`);
        return result;
    });
    return prizes;
}
