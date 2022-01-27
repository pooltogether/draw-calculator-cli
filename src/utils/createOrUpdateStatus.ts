import { writeToOutput } from "../output/writeToOutput";

export function createOrUpdateStatus(
    outputDir: string,
    network: string,
    drawId: string,
    runTime: string
) {
    writeToOutput(outputDir, network, drawId, "status", { cliStatus: "ok", cliRunTime: runTime });
}

export default createOrUpdateStatus;
