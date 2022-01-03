import { providers } from "ethers";
const debug = require("debug")("pt:draw-calculator-cli");

export function getRpcProvider(chainId: string): providers.Provider {
    let providerURL: any;

    debug("getRpcProvider for chainId ", chainId);

    if (chainId == "1") {
        providerURL = process.env.ALCHEMY_MAINNET_URL;
        debug("checking for ALCHEMY_MAINNET_URL ", providerURL);
        if (!providerURL) {
            throwError(chainId);
        }
    } else if (chainId == "4") {
        providerURL = process.env.ALCHEMY_RINKEBY_URL;
        debug("checking for ALCHEMY_RINKEBY_URL ", providerURL);
        if (!providerURL) {
            throwError(chainId);
        }
    } else if (chainId == "137") {
        providerURL = process.env.MATICVIGIL_URL;
        debug("checking for MATICVIGIL_URL ", providerURL);
        if (!providerURL) {
            throwError(chainId);
        }
    } else if (chainId == "80001") {
        providerURL = process.env.MUMBAI_URL;
        debug("checking for MUMBAI_URL ", providerURL);
        if (!providerURL) {
            throwError(chainId);
        }
    } else if (chainId == "43114") {
        providerURL = process.env.AVALANCHE_URL;
        debug("checking for AVALANCHE_URL ", providerURL);
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
