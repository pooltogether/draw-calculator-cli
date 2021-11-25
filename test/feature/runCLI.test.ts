import { run } from '../../src/run';
import { resolve } from 'path';
import { rmSync } from 'fs';
import { getClaimTier } from '../helpers/getClaimTier';

import { expect } from 'chai';
import { solidity } from 'ethereum-waffle';
import { BigNumber } from 'ethers';

// chai.use(solidity);

describe('run CLI tool ()', () => {
    beforeEach(() => {
        jest.setTimeout(120000);
    });

    it('runCLICommand', async () => {
        const outputDir = './temp';
        const drawId = '8';
        const chainId = '1';
        const drawCalculatorAddress = '0x14d0675580C7255043a3AeD3726F5D7f33292730';

        const resultsPath = `../../${outputDir}/${chainId}/draw${drawId}`;
        const resolvedDirPath = resolve(__dirname, resultsPath);

        // delete files if they exist
        rmSync(resolvedDirPath, { recursive: true, force: true });

        // // generate results
        await run(chainId, '0xdd4d117723C257CEe402285D3aCF218E9A8236E1', drawId, outputDir);

        // now read results
        const prizesFilePath = resolvedDirPath + '/prizes.json';
        const results = require(prizesFilePath);

        expect(results.length).to.be.gt(0);

        for (let i = 0; i < 10; i++) {
            const exampleResult = results[i];
            const prizeTierResult = await getClaimTier(
                chainId,
                drawCalculatorAddress,
                exampleResult.address,
                exampleResult.pick,
                drawId,
                exampleResult.tier,
            );

            expect(prizeTierResult.tier).to.equal(exampleResult.tier.toString());
            // expect(prizeTierResult.amount).to.be.closeTo(BigNumber.from(exampleResult.amount), 100);
        }
    });
});
