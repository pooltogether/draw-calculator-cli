import { AVALANCHE_TWAB_SUBGRAPH_URL, POLYGON_TWAB_SUBGRAPH_URL } from '../../src/constants';
import { makeGraphQlQuery } from '../../src/utils/makeGraphQlQuery';

describe('make a graphql request', () => {
    it('test max results polygon', async () => {
        const _ticket = '0x6a304dfdb9f808741244b6bfee65ca7b3b3a6076';
        const drawStartTime = 1640286968;
        const drawEndTime = 1640372468;
        await makeGraphQlQuery(POLYGON_TWAB_SUBGRAPH_URL, _ticket, drawStartTime, drawEndTime);
    });
    it('polygon draw 1', async () => {
        const _ticket = '0x6a304dfdb9f808741244b6bfee65ca7b3b3a6076';
        const drawStartTime = 1634324524;
        const drawEndTime = 1634410024;
        const result = await makeGraphQlQuery(
            POLYGON_TWAB_SUBGRAPH_URL,
            _ticket,
            drawStartTime,
            drawEndTime,
        );

        let chosenAccount;

        result.forEach((account: any) => {
            if (account.id === '0x001123f9ed1f3fc7cf265888a37fdb9df0397462') {
                console.log(account);
                chosenAccount = account;
            }
        });
        expect(chosenAccount).toBeDefined();
    });
    it('avalanche draw 73', async () => {
        const _ticket = '0xb27f379c050f6ed0973a01667458af6ecebc1d90';
        const drawStartTime = 1640546819;
        const drawEndTime = 1640632319;
        const result = await makeGraphQlQuery(
            AVALANCHE_TWAB_SUBGRAPH_URL,
            _ticket,
            drawStartTime,
            drawEndTime,
        );

        let chosenAccount;

        result.forEach((account: any) => {
            if (account.id === '0xf33e9f0f34601f76aac9eafeb5dfb8ba4fda88ac') {
                console.log(account);
                chosenAccount = account;
            }
        });
        expect(chosenAccount).toBeDefined();
    });
});
