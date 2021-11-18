import { BigNumber } from "ethers";

export function calculateNormalizedBalance(balance: BigNumber, ticketTotalSupply: BigNumber) {
    return balance.div(ticketTotalSupply);
}
