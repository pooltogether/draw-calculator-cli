import {
    MAINNET_TWAB_SUBGRAPH_URL,
    POLYGON_TWAB_SUBGRAPH_URL,
    RINKEBY_TWAB_SUBGRAPH_URL,
    MUMBAI_TWAB_SUBGRAPH_URL,
} from "../constants";

export function getSubgraphUrlForNetwork(network: string): string {
    switch (network) {
        case "mainnet":
            return MAINNET_TWAB_SUBGRAPH_URL;
        case "polygon":
            return POLYGON_TWAB_SUBGRAPH_URL;
        case "rinkeby":
            return RINKEBY_TWAB_SUBGRAPH_URL;
        case "mumbai":
            return MUMBAI_TWAB_SUBGRAPH_URL;
        default:
            throw new Error(`Unsupported network: ${network}`);
    }
}
