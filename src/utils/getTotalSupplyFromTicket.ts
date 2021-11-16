import { BigNumber, Contract } from "ethers";
import TicketAbi from "@pooltogether/v4-core/abis/Ticket.json";
import { Provider } from "@ethersproject/abstract-provider";

export async function getTotalSupplyFromTicket(
    ticketAddress: string,
    drawStartTime: number,
    drawEndTime: number,
    provider: Provider
): Promise<BigNumber[]> {
    const ticketContract = new Contract(ticketAddress, TicketAbi, provider);

    const totalSupplies: BigNumber[] = await ticketContract.getAverageTotalSuppliesBetween(
        [drawStartTime],
        [drawEndTime]
    );
    return totalSupplies;
}
