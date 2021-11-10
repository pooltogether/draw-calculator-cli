import { Contract, providers } from "ethers";
import DrawAbi from "@pooltogether/v4-core/abis/DrawBuffer.json";

export async function getDrawTimestampFromDrawId(
    drawId: string,
    drawBufferAddress: string,
    provider: providers.Provider
): Promise<number> {
    const drawBufferContract = new Contract(drawBufferAddress, DrawAbi, provider);

    const draw = await drawBufferContract.getDraw(drawId);
    return draw.timestamp;
}
