import { providers } from "ethers";

export function getRpcProvider(chainId: string): providers.Provider {
    let providerURL: any;

    if (chainId == "1") {
        providerURL = process.env.ALCHEMY_URL;
        if (!providerURL) {
            throwError(chainId);
        }
    } else if (chainId == "4") {
        providerURL = process.env.ALCHEMY_RINKEBY_URL;
        if (!providerURL) {
            throwError(chainId);
        }
    } else if (chainId == "137") {
        const providerURL = process.env.MATICVIGIL_URL;
        if (!providerURL) {
            throwError(chainId);
        }
    } else if (chainId == "80001") {
        providerURL = process.env.MUMBAI_URL;
        if (!providerURL) {
            throwError(chainId);
        }
    }

    return new providers.JsonRpcProvider(providerURL);
}

function throwError(network: string) {
    throw new Error(`${network} RPC URL not set. Check .env`);
}
