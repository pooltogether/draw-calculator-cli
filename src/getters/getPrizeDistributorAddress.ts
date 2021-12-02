import { getAddressFromDeploymentFile } from "../utils/getAddressFromDeploymentFile";

export function getPrizeDistributorAddress(chainId: string) {
    return getAddressFromDeploymentFile(chainId, "PrizeDistributor");
}
