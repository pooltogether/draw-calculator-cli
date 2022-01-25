import { Prize } from "../types";
import { writeToOutput } from "./writeToOutput";

export function parseAndWriteAddressesToOutput(
    outDir: string,
    network: string,
    drawId: string,
    prizes: Prize[][]
) {
    prizes.forEach((prize: Prize[]) => {
        const address = prize[0].address;
        writeToOutput(outDir, network, drawId, address, prize);
    });
}
