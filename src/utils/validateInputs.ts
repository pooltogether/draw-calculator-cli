import { utils } from "ethers";

export function validateInputs(
    network: string,
    address: string,
    drawId: string,
    outputDir: string
) {
    // parse address
    try {
        utils.getAddress(address); // this will throw if not a correctly formatted address
    } catch (e) {
        throw new Error("Invalid address");
    }

    // check output directory makes sense
}
