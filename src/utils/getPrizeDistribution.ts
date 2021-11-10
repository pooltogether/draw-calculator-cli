import { Contract } from "ethers";
import PrizeDistributionBufferAbi from "@pooltogether/v4-core/abis/PrizeDistributionBuffer.json";
import { Provider } from "@ethersproject/abstract-provider";

export async function getPrizeDistribution(
    prizeDistributionBufferAddress: string,
    drawId: string,
    provider: Provider
): Promise<any> {
    const prizeDistributionBufferContract = new Contract(
        prizeDistributionBufferAddress,
        PrizeDistributionBufferAbi,
        provider
    );
    const prizeDistribution = await prizeDistributionBufferContract.getPrizeDistribution(drawId);
    return prizeDistribution;
}
