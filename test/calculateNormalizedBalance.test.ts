import { BigNumber } from 'ethers';
import { calculateNormalizedBalance } from '../src/utils/calculateNormalizedBalance';

describe('calculateNormalizedBalance()', () => {
    it('polygon drawId 32', () => {
        const ticketTotalSupply = '10494737252977';
        const normalizedBalance = calculateNormalizedBalance(
            BigNumber.from(3000000000),
            BigNumber.from(ticketTotalSupply),
        );
        console.log(normalizedBalance);
    });
});
