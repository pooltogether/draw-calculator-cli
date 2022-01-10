import { BigNumber } from 'ethers';
import { makeGraphQlQuery } from '../../src/utils/makeGraphQlQuery';
import { POLYGON_TWAB_SUBGRAPH_URL } from '../../src/constants';
describe('make a graphql request', () => {
    it('test max results polygon', async () => {
        const _ticket = '0x6a304dfdb9f808741244b6bfee65ca7b3b3a6076';
        const drawStartTime = 1640286968;
        const drawEndTime = 1640372468;
        const result = await makeGraphQlQuery(
            POLYGON_TWAB_SUBGRAPH_URL,
            _ticket,
            drawStartTime,
            drawEndTime,
        );
        // console.log(result);
    });
    it.only('polygon draw 1', async () => {
        const _ticket = '0x6a304dfdb9f808741244b6bfee65ca7b3b3a6076';
        const drawStartTime = 1634324524;
        const drawEndTime = 1634410024;
        const result = await makeGraphQlQuery(
            POLYGON_TWAB_SUBGRAPH_URL,
            _ticket,
            drawStartTime,
            drawEndTime,
        );
        console.log(result);
        console.log('result length: ', result.length);
    });
});
