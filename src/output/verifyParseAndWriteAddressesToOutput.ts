import { Prize } from "../types";
import { verifyAgainstSchema } from "../utils/verifyAgainstSchema";
import { writeToOutput } from "./writeToOutput";

export function verifyParseAndWriteAddressesToOutput(
    outDir: string,
    network: string,
    drawId: string,
    prizes: Prize[][]
) {
    prizes.forEach((prize: Prize[]) => {
        if (!verifyAgainstSchema(prize)) {
            throw new Error(`Prize ${prize} does not match schema`);
        }
        const address = prize[0].address;
        writeToOutput(outDir, network, drawId, address, prize);
    });
}
