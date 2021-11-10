import { BigNumber } from "ethers";

export function calculateUserBalanceFromTwab(twabEntry: any): any {
    console.log("calculating twabEntry from ", JSON.stringify(twabEntry));

    const beforeOrAtDrawStartTime = twabEntry.beforeOrAtDrawStartTime;
    const beforeOrAtDrawEndTime = twabEntry.beforeOrAtDrawEndTime;

    const result = BigNumber.from(beforeOrAtDrawEndTime[0].amount).sub(
        BigNumber.from(beforeOrAtDrawStartTime[0].amount)
    );
    return {
        address: twabEntry.id,
        balance: result,
    };
}
