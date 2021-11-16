import { BigNumber } from "ethers";
import { UserBalance } from "../types";

export function calculateUserBalanceFromAccount(
    accountEntry: any,
    drawStartTime: number,
    drawEndTime: number
): BigNumber | undefined {
    // console.log(`\n enter function for user ${accountEntry.id}\n`);
    console.log("calculating twabEntry from ", JSON.stringify(accountEntry));

    // beforeOrAtDrawStartTime: S
    // beforeOrAtDrawEndTime: E

    // [], [S], [SE], [E]

    // if beforeOrAtDrawStartTime exists, beforeOrAtDrawEndTime must exist
    // if beforeOrAtDrawEndTime == null, beforeOrAtDrawStartTime must be null

    const sTwab = accountEntry.beforeOrAtDrawStartTime[0];
    const eTwab = accountEntry.beforeOrAtDrawEndTime[0];

    if (!sTwab && !eTwab) {
        console.log("no twab");
        return undefined;
    }

    let drawStartTwab;
    let drawEndTwab;

    if (sTwab) {
        drawStartTwab = {
            amount: BigNumber.from(sTwab.amount).add(
                BigNumber.from(sTwab.delegateBalance).mul(drawStartTime - sTwab.timestamp)
            ),
            timestamp: drawStartTime,
        };
    } else {
        drawStartTwab = {
            amount: BigNumber.from(0),
            timestamp: drawStartTime,
        };
    }

    drawEndTwab = {
        amount: BigNumber.from(eTwab.amount).add(
            BigNumber.from(eTwab.delegateBalance).mul(drawEndTime - eTwab.timestamp)
        ),
        timestamp: drawEndTime,
    };

    const average: BigNumber = drawEndTwab.amount
        .sub(drawStartTwab.amount)
        .div(drawEndTime - drawStartTime);

    return average;
}
