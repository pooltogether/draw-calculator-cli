import { BigNumber } from 'ethers';
import { getUserAccountsFromSubgraphForTicket } from '../../src/network/getUserAccountsFromSubgraphForTicket';

describe('call the graph endpoint', () => {
    it('returns sane result', async () => {
        // draw 8 timestamps
        const drawStartTimestamp = 1634930149;
        const drawEndTimestamp = 1635015649;

        const subgraphResult = await getUserAccountsFromSubgraphForTicket(
            'mainnet',
            '0xdd4d117723C257CEe402285D3aCF218E9A8236E1',
            drawStartTimestamp,
            drawEndTimestamp,
        );
        subgraphResult.some((account: any) => {
            if (account.id == '0x636bae3f76b4ccb486f50bf192ea2a8d22d1a79a') {
                return true;
            }
            return false;
        });
    });
});
