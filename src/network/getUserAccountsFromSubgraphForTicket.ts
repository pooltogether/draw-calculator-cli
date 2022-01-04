import { getSubgraphUrlForNetwork } from "./getSubgraphUrlForNetwork";
import { request, gql } from "graphql-request";
import { Account } from "../types";
import { makeGraphQlQuery } from "../utils/makeGraphQlQuery";

const debug = require("debug")("pt:draw-calculator-cli");

export async function getUserAccountsFromSubgraphForTicket(
    chainId: string,
    ticket: string,
    drawStartTime: number,
    drawEndTime: number
): Promise<Account[]> {
    const subgraphURL = getSubgraphUrlForNetwork(chainId);
    const _ticket = ticket.toLowerCase();

    // now call subgraph
    const allUserBalances = await makeGraphQlQuery(
        subgraphURL,
        _ticket,
        drawStartTime,
        drawEndTime
    );

    return allUserBalances.flat(1) as Account[];
}
