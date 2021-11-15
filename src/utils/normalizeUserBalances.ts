import { BigNumber, constants } from "ethers";
import { NormalizedUserBalance, UserBalance } from "../types";

export function normalizeUserBalances(
    userBalances: UserBalance[],
    ticketTotalSupply: BigNumber
): NormalizedUserBalance[] {
    console.log("ticket total supply ", ticketTotalSupply);
    const ticketTotalSupplyBigNum = (ticketTotalSupply as any)[0]; // why?
    console.log("ticketTotalSupplyBigNum ", ticketTotalSupplyBigNum);

    const result = userBalances.map((userBalance) => {
        console.log(
            `user ${userBalance.address} input ${
                userBalance.balance
            } output: ${userBalance.balance
                .mul(constants.WeiPerEther)
                .div(ticketTotalSupplyBigNum)}`
        );
        return {
            address: userBalance.address,
            normalizedBalance: userBalance.balance
                .mul(constants.WeiPerEther)
                .div(ticketTotalSupplyBigNum),
        };
    });
    return result;
}
