import { BigNumber } from "@ethersproject/bignumber";

import { StatusState, Status } from "../types";

export interface SuccessStats {
    prizeLength: number;
    amountsTotal: BigNumber;
}

function updateStatusSuccess(createdAt: number, meta: SuccessStats): Status {
    return {
        status: StatusState.SUCCESS,
        createdAt: createdAt,
        updatedAt: Date.now(),
        meta: meta
    };
}

export default updateStatusSuccess;
