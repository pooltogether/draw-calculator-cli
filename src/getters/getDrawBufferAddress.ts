import { getAddressFromDeploymentFile } from "../utils";

export function getDrawBufferAddress(network: string): string {
    return getAddressFromDeploymentFile(network, "DrawBuffer");
}
