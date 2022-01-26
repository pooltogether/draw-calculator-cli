import { StatusState, Status, StatusError } from "../types";

function updateStatusFailure(createdAt: number, error: StatusError): Status {
    return {
        status: StatusState.SUCCESS,
        createdAt: createdAt,
        updatedAt: Date.now(),
        error: error
    };
}

export default updateStatusFailure;
