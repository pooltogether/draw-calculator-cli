import { Provider } from "@ethersproject/abstract-provider";
import PrizeDistributionBufferAbi from "@pooltogether/v4-core/abis/PrizeDistributionBuffer.json";
import { Contract } from "ethers";

const debug = require("debug")("pt:draw-calculator-cli");

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
    debug(`using provider ${JSON.stringify(provider)}`);
    debug(`calling getPrizeDistribution(${drawId}) @ ${prizeDistributionBufferAddress}`);

    const prizeDistribution = await prizeDistributionBufferContract.getPrizeDistribution(drawId);
    return prizeDistribution;
}
