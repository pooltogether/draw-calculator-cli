import { BigNumber } from "@ethersproject/bignumber";

import { Prize } from "../types";

function sumPrizeAmounts(list: Prize[][]) {
    return list
        .flat(1)
        .map((prize: Prize) => prize.amount)
        .reduce((a, b) => a.add(b), BigNumber.from(0))
        .toString();
}

export default sumPrizeAmounts;
