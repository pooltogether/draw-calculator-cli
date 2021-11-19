import { readFileSync } from "fs";

export function getAddressFromDeploymentFile(network: string, contractName: string): string {
    let mainnetOrTestnet;
    if (network == "mainnet" || network == "polygon") {
        mainnetOrTestnet = "v4-mainnet";
    } else if (network == "rinkeby" || network == "mumbai") {
        mainnetOrTestnet = "v4-testnet";
    } else {
        throw new Error(
            `Cannot find deployment file for contract ${contractName} on network: ${network}`
        );
    }

    let path = `node_modules/@pooltogether/${mainnetOrTestnet}/deployments/${network}/${contractName}.json`;

    return JSON.parse(readFileSync(path, { encoding: "utf-8" })).address;
}
