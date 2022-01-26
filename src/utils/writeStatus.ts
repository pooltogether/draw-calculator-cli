import { writeToOutput } from "../output/writeToOutput";

export function writeStatus(
    outputDir: string,
    network: string,
    drawId: string,
    meta: any
) {
    writeToOutput(outputDir, network, drawId, "status", meta);
}

export default writeStatus;
