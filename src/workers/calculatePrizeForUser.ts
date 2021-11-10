import {
    calculateDrawResults,
    Draw,
    DrawResults,
    PrizeDistribution,
    PrizeAwardable,
} from "@pooltogether/draw-calculator-js";
import { UserBalance, Prize } from "../types";

export function calculatePrizeForUser(
    user: UserBalance,
    prizeDistribution: PrizeDistribution,
    draw: Draw
): Prize[] | undefined {
    // formats the correct input for draw-calculate-js

    const _user = {
        address: user.address,
        normalizedBalances: [user.balance],
    };

    // calls calculateDrawResults
    const results: DrawResults = calculateDrawResults(prizeDistribution, draw, _user);

    if (results.prizes.length === 0) {
        return undefined;
    }

    const prizesAwardable: PrizeAwardable[] = results.prizes;

    const prizes: Prize[] = prizesAwardable.map((prize) => {
        return {
            address: user.address,
            pick: prize.pick,
            tier: prize.distributionIndex,
        };
    });

    return prizes;
}
