import { BigNumber } from "ethers";
import { UserBalance } from "../types";

export function calculateUserBalanceFromAccount(
    accountEntry: any,
    drawStartTime: number,
    drawEndTime: number
): UserBalance | undefined {
    console.log(`\n enter function for user ${accountEntry.id}\n`);
    console.log("calculating twabEntry from ", JSON.stringify(accountEntry));

    let beforeOrAtDrawStartTime = accountEntry.beforeOrAtDrawStartTime[0];
    let beforeOrAtDrawEndTime = accountEntry.beforeOrAtDrawEndTime[0];

    // if the user does not have entries for beforeOrAtDrawStartTime and beforeOrAtDrawEndTime then the user has no balance for that draw
    // TODO: can we filter this in the graphql query?
    if (!beforeOrAtDrawStartTime && !beforeOrAtDrawEndTime) {
        return undefined; // drop user from array
    }

    // console.log("top:: beforeOrAtDrawStartTime: ", beforeOrAtDrawStartTime);
    // console.log("top:: beforeOrAtDrawEndTime: ", beforeOrAtDrawEndTime);

    if (!beforeOrAtDrawStartTime || equalsZero(beforeOrAtDrawStartTime.amount)) {
        console.log("\n beforeOrAtDrawStartTime not defined/amoount is zero");
        // if user has a beforeOrAtDrawStartTime but not a beforeOrAtDrawStartTime - synth beforeOrAtDrawStartTime
        // user got in during the draw period
        if (!beforeOrAtDrawStartTime) {
            beforeOrAtDrawStartTime = {
                amount: BigNumber.from(0),
                timestamp: drawStartTime,
            };
        } else {
            const beforeOrAtDrawStartTimeDelegateBalance =
                accountEntry.beforeOrAtDrawStartTime[0].delegateBalance;
            beforeOrAtDrawStartTime = {
                amount: beforeOrAtDrawStartTimeDelegateBalance,
                timestamp: accountEntry.lastUpdatedTimestamp,
            };
        }
    }

    if (!beforeOrAtDrawEndTime || equalsZero(beforeOrAtDrawEndTime.amount)) {
        console.log("\n beforeOrAtDrawEndTime not defined/amoount is zero");

        // if user has a beforeOrAtDrawEndTime but not a beforeOrAtDrawEndTime - synth beforeOrAtDrawEndTime
        // user got out during the draw period
        if (!beforeOrAtDrawEndTime) {
            beforeOrAtDrawEndTime = {
                timestamp: drawEndTime,
                amount: BigNumber.from(0),
            };
        } else {
            const beforeOrAtDrawEndTimeDelegateBalance =
                accountEntry.beforeOrAtDrawEndTime[0].delegateBalance;
            beforeOrAtDrawEndTime = {
                amount: beforeOrAtDrawEndTimeDelegateBalance,
                timestamp: accountEntry.lastUpdatedTimestamp,
            };
        }
    }

    console.log("beforeOrAtDrawStartTime: ", beforeOrAtDrawStartTime);
    console.log("beforeOrAtDrawEndTime: ", beforeOrAtDrawEndTime);

    const timestampDiff = BigNumber.from(beforeOrAtDrawEndTime.timestamp).sub(
        BigNumber.from(beforeOrAtDrawStartTime.timestamp)
    );

    console.log("checking if diff is zero..");
    // if timestamp diff zero then dont need to average
    if (timestampDiff.eq(BigNumber.from(0))) {
        console.log(
            "twab entries the same, setting balance as ",
            BigNumber.from(beforeOrAtDrawEndTime.amount)
        );
        return {
            address: accountEntry.id,
            balance: BigNumber.from(beforeOrAtDrawEndTime.amount),
        };
    }

    // else calc average between the two twabs
    const result = BigNumber.from(beforeOrAtDrawEndTime.amount)
        .sub(BigNumber.from(beforeOrAtDrawStartTime.amount))
        .div(timestampDiff);

    console.log(`resulting balance is: `, result);
    return {
        address: accountEntry.id,
        balance: result,
    };
}
function equalsZero(num: number) {
    const flag = num == 0;
    return flag;
}
