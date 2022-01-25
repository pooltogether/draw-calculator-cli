import DrawAbi from "@pooltogether/v4-core/abis/DrawBuffer.json";
import { Contract, providers } from "ethers";

export async function getDrawFromDrawId(
    drawId: string,
    drawBufferAddress: string,
    provider: providers.Provider
): Promise<any> {
    const drawBufferContract = new Contract(drawBufferAddress, DrawAbi, provider);

    const draw = await drawBufferContract.getDraw(drawId);
    return draw;
}
