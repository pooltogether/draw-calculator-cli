import { BigNumber } from 'ethers';
import { calculateUserBalanceFromTwab } from '../src/utils/calculateUserBalanceFromTwab';

describe('calculateUserBalanceFromTwab', () => {
    it('returns correct value', () => {
        const exampleTwabEntry = {
            beforeOrAtDrawEndTime: [{ amount: '30000000000', timestamp: '1634789910' }],
            beforeOrAtDrawStartTime: [{ amount: '30000000000', timestamp: '1634789910' }],
            delegateBalance: '30000000000',
            id: '0x00e6acb9346c6d4940a167f7b196104fa7d84c85',
            zeroBalanceOccurredAt: null,
        };

        expect(calculateUserBalanceFromTwab(exampleTwabEntry)).toMatchObject({
            balance: BigNumber.from(0),
            address: exampleTwabEntry.id,
        });
    });
});
