import { BigNumber } from 'ethers';
import { calculateUserBalanceFromAccount } from '../src/utils/calculateUserBalanceFromAccount';
import { normalizeUserBalances } from '../src/utils/normalizeUserBalances';

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
    it.only('negative balance user drawId 8', () => {
        const account = {
            delegateBalance: '109999982',
            id: '0x636bae3f76b4ccb486f50bf192ea2a8d22d1a79a',
            lastUpdatedTimestamp: '1635077632',
            zeroBalanceOccurredAt: null,
            beforeOrAtDrawEndTime: [
                {
                    amount: '60299700000000000',
                    delegateBalance: '0',
                    timestamp: '1634988722',
                },
            ],
            beforeOrAtDrawStartTime: [
                {
                    amount: '0',
                    delegateBalance: '150000000000',
                    timestamp: '1634586724',
                },
            ],
        };
        const drawStartTime = 1634930149;
        const drawEndTime = 1635015649;
        const balance = calculateUserBalanceFromAccount(account, drawStartTime, drawEndTime);

        expect(balance).toEqual(BigNumber.from('102759649122'));
    });
});
