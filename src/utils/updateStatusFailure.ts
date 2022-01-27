import { StatusState, Status, StatusError } from "../types";

function updateStatusFailure(createdAt: number, error: StatusError): Status {
    const now = Date.now();
    return {
        status: StatusState.SUCCESS,
        createdAt: createdAt,
        updatedAt: now,
        runtime: now - createdAt,
        error: error
    };
}

export default updateStatusFailure;
