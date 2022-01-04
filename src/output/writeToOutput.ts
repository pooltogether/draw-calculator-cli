import { writeFileSync, mkdirSync } from "fs";
import { getPrizeDistributorAddress } from "../getters/getPrizeDistributorAddress";
const debug = require("debug")("pt:draw-calculator-cli");

export function writeToOutput(
    outputDir: string,
    chainId: string,
    drawId: string,
    fileName: string,
    blob: any
) {
    const baseOutputPath = `${outputDir}/${chainId}/${getPrizeDistributorAddress(
        chainId
    )}/draw/${drawId}/`;
    mkdirSync(baseOutputPath, { recursive: true });
    const outputFilePath = `${baseOutputPath}${fileName}.json`;
    writeFileSync(outputFilePath, JSON.stringify(blob, null, 2));
    debug(`wrote to file ${outputFilePath}`);
}
