import { providers } from "ethers";

export function getRpcProvider(network: string): providers.Provider {
    if (network == "mainnet") {
        const ALCHEMY_URL = process.env.ALCHEMY_URL;
        if (!ALCHEMY_URL) {
            throw new Error("ALCHEMY_URL is not set");
        }
        return new providers.JsonRpcProvider(ALCHEMY_URL);
    } else {
        const POLYGON_PROVIDER_URL = process.env.MATICVIGIL_URL;
        if (!POLYGON_PROVIDER_URL) {
            throw new Error("POLYGON_PROVIDER_URL is not set");
        }
        return new providers.JsonRpcProvider(POLYGON_PROVIDER_URL);
    }
}
