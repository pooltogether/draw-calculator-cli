import { providers } from "ethers";
const debug = require("debug")("pt:draw-calculator-cli");

export function getRpcProvider(chainId: string): providers.Provider {
    let providerURL: any;

    console.log("getRpcProvider for chainId ", chainId);

    if (chainId == "1") {
        providerURL = process.env.ALCHEMY_MAINNET_URL;
        console.log("checking for ALCHEMY_MAINNET_URL ", providerURL);
        if (!providerURL) {
            throwError(chainId);
        }
    } else if (chainId == "4") {
        providerURL = process.env.ALCHEMY_RINKEBY_URL;
        console.log("checking for ALCHEMY_RINKEBY_URL ", providerURL);
        if (!providerURL) {
            throwError(chainId);
        }
    } else if (chainId == "137") {
        providerURL = process.env.MATICVIGIL_URL;
        console.log("checking for MATICVIGIL_URL ", providerURL);
        if (!providerURL) {
            throwError(chainId);
        }
    } else if (chainId == "80001") {
        providerURL = process.env.MUMBAI_URL;
        console.log("checking for MUMBAI_URL ", providerURL);
        if (!providerURL) {
            throwError(chainId);
        }
    }
    debug(`using ${providerURL} for JSONRPC provider`);

    return new providers.JsonRpcProvider(providerURL);
}

function throwError(network: string) {
    throw new Error(`${network} RPC URL not set. Check .env`);
}
