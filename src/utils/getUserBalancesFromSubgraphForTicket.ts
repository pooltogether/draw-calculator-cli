import { getSubgraphUrlForNetwork } from "./getSubgraphUrlForNetwork";
import { request, gql } from "graphql-request";
import { decryptCrowdsale } from "ethers/node_modules/@ethersproject/json-wallets";
import { calculateUserBalanceFromTwab } from "./calculateUserBalanceFromTwab";

export async function getUserBalancesFromSubgraphForTicket(
    network: string,
    ticket: string,
    drawStartTime: number,
    drawEndTime: number
): Promise<any[]> {
    const subgraphURL = getSubgraphUrlForNetwork(network);

    let offset = 0;
    const maxPageSize = 1000;
    const _ticket = '"' + ticket.toLowerCase() + '"';
    // now call subgraph
    let dynamicAccountQueryResults: any = [];
    // while the number of results returned is less than maxPageSize, make query
    while (true) {
        const dynamicAccountsQueryString = `{
        ticket(id: ${_ticket}) {
            accounts(first: ${maxPageSize}, skip: ${offset}, where: { zeroBalanceOccurredAt_gt: ${drawStartTime} }) {
                id
                delegateBalance
                zeroBalanceOccurredAt
                twabs(
                    orderBy: timestamp
                    orderDirection: desc
                    first: 1
                    where: { timestamp_lte: ${drawEndTime} }
                ) {
                    amount
                    timestamp
                }
            }
        }
    }`;
        console.log(`\n query string ${dynamicAccountsQueryString} \n`);
        let query = gql`
            ${dynamicAccountsQueryString}
        `;
        let response;
        try {
            response = await request(subgraphURL, query);
            console.log(`Got response with lenght ${response.ticket.accounts.length}`);

            dynamicAccountQueryResults.push(response.ticket.accounts);

            const numberOfResults = response.ticket.accounts.length;
            if (numberOfResults < maxPageSize) {
                // we have gotten all the results
                break;
            }
            // else increment offset and make another query
            offset += maxPageSize;
        } catch (e) {
            console.log(e);
        }
    }

    // now send second half of query
    let staticAccountQueryResults: any = [];

    while (true) {
        const staticAccountsQueryString = `{
            ticket(id: ${_ticket}) {
                accounts(first: ${maxPageSize}, skip:${offset} , where: { zeroBalanceOccurredAt: null }) {
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
                    }
                }
            }
        }`;
        console.log(`\n query string ${staticAccountsQueryString} \n`);
        let query = gql`
            ${staticAccountsQueryString}
        `;
        console.log(`\n making query ${staticAccountsQueryString} \n`);
        let response;
        try {
            response = await request(subgraphURL, query);
            console.log(`Got response with lenght ${response.ticket.accounts.length}`);

            staticAccountQueryResults.push(response.ticket.accounts);

            const numberOfResults = response.ticket.accounts.length;
            if (numberOfResults < maxPageSize) {
                // we have gotten all the results
                break;
            }
            // else increment offset and make another query
            offset += maxPageSize;
        } catch (e) {
            console.log(e);
            break;
        }
    }
    // staticAccountQueryResults.forEach((element: any) => {
    //     console.log(JSON.stringify(element));
    // });
    // console.log(staticAccountQueryResults[0]);

    // calculate user balances from twabs
    const staticUserBalances: any[] = staticAccountQueryResults[0].map((element: any) => {
        return calculateUserBalanceFromTwab(element);
    });
    const dynamicUserBalances: any[] = dynamicAccountQueryResults[0].map((element: any) => {
        return calculateUserBalanceFromTwab(element);
    });
    const allUserBalances: any[] = staticUserBalances.concat(dynamicUserBalances);
    return allUserBalances;
}
