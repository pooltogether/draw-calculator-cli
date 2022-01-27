import { StatusState, Status } from "../types";

function createStatus(): Status {
    return {
        status: StatusState.LOADING,
        createdAt: Date.now()
    };
}

export default createStatus;
