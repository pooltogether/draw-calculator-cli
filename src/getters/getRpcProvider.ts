import { providers } from "ethers";

export function getRpcProvider(network: string): providers.Provider {
    let providerURL: any;

    if (network == "mainnet") {
        providerURL = process.env.ALCHEMY_URL;
        if (!providerURL) {
            throwError(network);
        }
    } else if (network == "rinkeby") {
        providerURL = process.env.ALCHEMY_RINKEBY_URL;
        if (!providerURL) {
            throwError(network);
        }
    } else if (network == "mumbai") {
        providerURL = process.env.MUMBAI_URL;
        if (!providerURL) {
            throwError(network);
        }
    } else if (network == "polygon") {
        const providerURL = process.env.MATICVIGIL_URL;
        if (!providerURL) {
            throwError(network);
        }
    }

    return new providers.JsonRpcProvider(providerURL);
}

function throwError(network: string) {
    throw new Error(`${network} RPC URL not set. Check .env`);
}
