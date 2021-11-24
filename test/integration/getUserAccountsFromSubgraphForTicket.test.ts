import { BigNumber } from 'ethers';
import { getUserAccountsFromSubgraphForTicket } from '../../src/network/getUserAccountsFromSubgraphForTicket';

describe('call the graph endpoint', () => {
    it('polygon draw 30 twab query result contains pierricks address', async () => {
        // draw 8 timestamps
        const drawStartTimestamp = 1635879776; //1634930149;
        const drawEndTimestamp = 1635879776; //1635015649;

        const subgraphResult = await getUserAccountsFromSubgraphForTicket(
            '137',
            '0x6a304dFdb9f808741244b6bfEe65ca7B3b3A6076',
            drawStartTimestamp,
            drawEndTimestamp,
        );
        const result = subgraphResult.some((account: any) => {
            if (account.id == '0xd70804463bb2760c3384fc87bbe779e3d91bab3a') {
                console.log('contains address');
                console.log(JSON.stringify(account));
                return true;
            }
            return false;
        });
        console.log(`result lenght ${subgraphResult.length}`);
        expect(result).toBe(true);
    });
});
