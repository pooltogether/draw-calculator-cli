import { BigNumber } from "ethers";

export function calculateNormalizedBalance(balance: BigNumber, ticketTotalSupply: BigNumber) {
    console.log(balance, ticketTotalSupply);
    return balance.div(ticketTotalSupply);
}
