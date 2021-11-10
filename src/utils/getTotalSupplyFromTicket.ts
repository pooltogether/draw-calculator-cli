import { BigNumber, Contract } from "ethers";
import TicketAbi from "@pooltogether/v4-core/abis/PrizeDistributor.json";
import { Provider } from "@ethersproject/abstract-provider";

export async function getTotalSupplyFromTicket(
    ticketAddress: string,
    provider: Provider
): Promise<BigNumber> {
    const ticketContract = new Contract(ticketAddress, TicketAbi, provider);

    const totalSupply = await ticketContract.totalSupply();
    return totalSupply;
}
