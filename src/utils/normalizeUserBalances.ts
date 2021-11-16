import { BigNumber, constants } from "ethers";
import { NormalizedUserBalance, UserBalance } from "../types";

export function normalizeUserBalances(
    userBalances: UserBalance[],
    ticketTotalSupply: BigNumber
): NormalizedUserBalance[] {
    return userBalances.map((userBalance) => {
        return {
            address: userBalance.address,
            normalizedBalance: userBalance.balance
                .mul(constants.WeiPerEther)
                .div(ticketTotalSupply),
        };
    });
}
