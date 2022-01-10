import { request, gql } from "graphql-request";

export async function makeGraphQlQuery(
    subgraphURL: string,
    _ticket: string,
    drawStartTime: number,
    drawEndTime: number
): Promise<any> {
    const maxPageSize = 1000;
    let lastId = "";

    let data;
    let results = [];

    while (true) {
        const queryString = `{
            ticket(id: "${_ticket}") {
                accounts(first: ${maxPageSize} , where: { 
                    zeroBalanceOccurredAt: null,
                    id_gt: "${lastId}"
                    }) {
                    id
                    delegateBalance
                    zeroBalanceOccurredAt
    
                    # get twab beforeOrAt drawStartTime
                    beforeOrAtDrawStartTime: twabs(
                        orderBy: timestamp
                        orderDirection: desc
                        first: 1
                        where: { timestamp_lte: ${drawStartTime} } #drawStartTime
                    ) {
                        amount
                        timestamp
                        delegateBalance
                    }
                    # now get twab beforeOrAt drawEndTime (may be the same as above)
                    beforeOrAtDrawEndTime: twabs(
                        orderBy: timestamp
                        orderDirection: desc
                        first: 1
                        where: { timestamp_lte: ${drawEndTime} } #drawEndTime
                    ) {
                        amount
                        timestamp
                        delegateBalance
                    }
                }
            }
        }`;
        console.log(`making query: ${queryString}`);

        let query = gql`
            ${queryString}
        `;

        data = await request(subgraphURL, query);
        results.push(data.ticket.accounts);
        console.log(`got ${data.ticket.accounts.length} more results`);

        const numberOfResults = data.ticket.accounts.length;
        if (numberOfResults < maxPageSize) {
            // we have gotten all the results
            break;
        }

        lastId = data.ticket.accounts[data.ticket.accounts.length - 1].id;
    }
    return results.flat(1);
}
