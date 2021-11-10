import { providers } from "ethers";

export function getRpcProvider(): providers.Provider {
    const ALCHEMY_URL = process.env.ALCHEMY_URL;
    if (!ALCHEMY_URL) {
        throw new Error("ALCHEMY_URL is not set");
    }
    return new providers.JsonRpcProvider(ALCHEMY_URL);
}
