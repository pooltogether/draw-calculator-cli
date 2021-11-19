import { getAddressFromDeploymentFile } from "../utils/getAddressFromDeploymentFile";

export function getDrawBufferAddress(network: string): string {
    return getAddressFromDeploymentFile(network, "DrawBuffer");
}
