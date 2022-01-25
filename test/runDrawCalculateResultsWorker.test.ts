import { Draw } from '@pooltogether/draw-calculator-js';
import { BigNumber } from 'ethers';

import { runCalculateDrawResultsWorker } from '../src/runCalculateDrawResultsWorker';

describe('runCalculateDrawResultsWorker', () => {
    it('creates a thread and returns result', async () => {
        const user = {
            address: '0x89c46e4b8a76a252f574406bc8cea1b70772ef69',
            normalizedBalance: BigNumber.from('1240401947796217'),
        };
        const users = [user];
        const prizeDistribution = {
            bitRangeSize: 2,
            matchCardinality: 11,
            startTimestampOffset: 86400,
            endTimestampOffset: 900,
            maxPicksPerUser: 2,
            expiryDuration: 5184000,
            numberOfPicks: BigNumber.from('0x15bb56'),
            tiers: [166889185, 0, 0, 320427236, 0, 512683578, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            prize: BigNumber.from('0x037ce0a900'),
        };

        const draw: Draw = {
            drawId: 8,
            winningRandomNumber: BigNumber.from(
                '0xdf0838834f0bfdff60700316fc64d0e62a0aaa067452fc2ed2b746bf40b7c5d6',
            ),
            timestamp: 1635016549,
            beaconPeriodStartedAt: BigNumber.from('0x61745f65').toNumber(),
            beaconPeriodSeconds: BigNumber.from('0x1e').toNumber(),
        };

        const result = await runCalculateDrawResultsWorker(users, prizeDistribution, draw);
        console.log('result', result);
    });
});
