import { utils } from "ethers";

export function validateInputs(
    network: string,
    address: string,
    drawId: string,
    outputDir: string
) {
    // parse address
    utils.getAddress(address); // this will throw if not a correctly formatted address

    // check network can give network id

    // check output directory makes sense
}
