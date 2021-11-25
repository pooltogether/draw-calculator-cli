import { BigNumber, Contract } from "ethers";
import { getRpcProvider } from "../../src/getters/getRpcProvider";
import DrawCalc from "@pooltogether/v4-mainnet/deployments/mainnet/DrawCalculator.json";
import { utils } from "ethers";

const encoder = utils.defaultAbiCoder;

export type DrawCalcCalculateResult = {
    amount: BigNumber;
    tier: string | undefined;
};

export async function getClaimTier(
    network: string,
    drawCalculatorAddress: string,
    user: string,
    pick: string,
    drawId: string,
    expectedTier: number
): Promise<DrawCalcCalculateResult> {
    const provider = getRpcProvider(network);

    const drawBufferContract = new Contract(drawCalculatorAddress, DrawCalc.abi, provider);

    const pickIndices = encoder.encode(["uint256[][]"], [[[pick]]]);
    console.log("calling drawCalc::calculate with", user, drawId, pickIndices);

    const calculateResult = await drawBufferContract.calculate(user, [drawId], pickIndices);
    console.log("calculateResult: ", calculateResult);

    // decode data
    const prizeCounts = encoder.decode(["uint256[][]"], calculateResult[1]);
    console.log(JSON.stringify(prizeCounts));
    // return prize tier

    return {
        tier: extractTierFromPrizeCounts(prizeCounts, expectedTier),
        amount: calculateResult[0],
    };
}

function extractTierFromPrizeCounts(prizeCounts: any, index: number): string | undefined {
    return prizeCounts[0][0][index].toNumber() > 0 ? index.toString() : undefined;
}
