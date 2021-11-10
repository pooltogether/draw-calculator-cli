import { readFileSync } from "fs";

export function getPrizeDistributionBufferAddress(network: string): string {
    let path = `node_modules/@pooltogether/v4-mainnet/deployments/`;
    let result = "";
    switch (network) {
        case "mainnet":
            result = JSON.parse(
                readFileSync(path + `mainnet/PrizeDistributionBuffer.json`, { encoding: "utf-8" })
            ).address;
            break;
        case "polygon":
            result = JSON.parse(
                readFileSync(path + `polygon/PrizeDistributionBuffer.json`, { encoding: "utf-8" })
            ).address;
            break;
        default:
            throw new Error("Invalid network");
    }
    return result;
}
