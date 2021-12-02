import { getAddressFromDeploymentFile } from "../utils/getAddressFromDeploymentFile";

export function getPrizeDistributionBufferAddress(chainId: string): string {
    return getAddressFromDeploymentFile(chainId, "PrizeDistributionBuffer");
}
