import { getSubgraphUrlForNetwork } from "./getSubgraphUrlForNetwork";
import { request, gql } from "graphql-request";
import { Account } from "../types";

const debug = require("debug")("pt:draw-calculator-cli");

export async function getUserAccountsFromSubgraphForTicket(
    chainId: string,
    ticket: string,
    drawStartTime: number,
    drawEndTime: number
): Promise<Account[]> {
    const subgraphURL = getSubgraphUrlForNetwork(chainId);

    let offset = 0;
    const maxPageSize = 1000;
    const _ticket = '"' + ticket.toLowerCase() + '"';
    // now call subgraph
    let dynamicAccountQueryResults: any = [];

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
        debug(`\n query string ${staticAccountsQueryString} \n`);
        let query = gql`
            ${staticAccountsQueryString}
        `;
        let response;
        try {
            response = await request(subgraphURL, query);
            staticAccountQueryResults.push(response.ticket.accounts);

            const numberOfResults = response.ticket.accounts.length;
            if (numberOfResults < maxPageSize) {
                // we have gotten all the results
                break;
            }
            // else increment offset and make another query
            offset += maxPageSize;
        } catch (e) {
            debug(`error calling subgraph ${e}`);
            break;
        }
    }

    let allUserBalances: any[] = staticAccountQueryResults.concat(dynamicAccountQueryResults);

    return allUserBalances.flat(1) as Account[];
}
