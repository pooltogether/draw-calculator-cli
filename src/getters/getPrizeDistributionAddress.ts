import { getAddressFromDeploymentFile } from "../utils/getAddressFromDeploymentFile";

export function getPrizeDistributionBufferAddress(network: string): string {
    return getAddressFromDeploymentFile(network, "PrizeDistributionBuffer");
}
