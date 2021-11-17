import { writeFileSync, mkdirSync } from "fs";
const debug = require("debug")("pt:draw-calculator-cli");

export function writeToOutput(
    outputDir: string,
    network: string,
    drawId: string,
    fileName: string,
    blob: any
) {
    const baseOutputPath = `${outputDir}/${network}/draw${drawId}/`;
    mkdirSync(baseOutputPath, { recursive: true });
    const outputFilePath = `${baseOutputPath}${fileName}.json`;
    writeFileSync(outputFilePath, JSON.stringify(blob, null, 2));
    debug(`wrote to file ${outputFilePath}`);
}
