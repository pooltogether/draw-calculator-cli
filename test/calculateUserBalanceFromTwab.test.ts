import { BigNumber } from 'ethers';
import { calculateUserBalanceFromAccount } from '../src/utils/calculateUserBalanceFromAccount';

describe('calculateUserBalanceFromTwab', () => {
    it('returns correct value - beforeOrAtDrawStartTime, beforeOrAtDrawEndTime defined', () => {
        const exampleTwabEntry = {
            beforeOrAtDrawEndTime: [{ amount: '30000000000', timestamp: '1634789910' }],
            beforeOrAtDrawStartTime: [{ amount: '30000000000', timestamp: '1634789910' }],
            delegateBalance: '30000000000',
            id: '0x00e6acb9346c6d4940a167f7b196104fa7d84c85',
            zeroBalanceOccurredAt: null,
        };

        const drawStartTime = 1634789910;
        const drawEndTime = 1634789999;

        expect(
            calculateUserBalanceFromAccount(exampleTwabEntry, drawStartTime, drawEndTime),
        ).toMatchObject({
            balance: BigNumber.from(exampleTwabEntry.beforeOrAtDrawEndTime[0].amount),
            address: exampleTwabEntry.id,
        });
    });
    it('another user ', () => {
        const user = {
            beforeOrAtDrawEndTime: [
                { amount: '0', delegateBalance: '310000000', timestamp: '1634988536' },
            ],
            beforeOrAtDrawStartTime: [],
            delegateBalance: '310000000',
            id: '0x883e5bef307b99fba45335a612a40bc3d5a8b9c3',
            lastUpdatedTimestamp: '1634988536',
            zeroBalanceOccurredAt: null,
        };
    });
});
