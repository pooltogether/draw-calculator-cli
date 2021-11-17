import { BigNumber } from "ethers";

export type UserBalance = {
    address: string;
    balance: BigNumber;
};
export type NormalizedUserBalance = {
    address: string;
    normalizedBalance: BigNumber;
};

export type Prize = {
    address: string;
    pick: BigNumber;
    tier: number;
    amount: BigNumber;
};

type Twab = {
    amount: string;
    timestamp: string;
    delegateBalance: string;
};

export type Account = {
    id: string;
    lastUpdatedTimestamp?: string;
    zeroBalanceOccurredAt?: string | null;
    delegateBalance: string;
    beforeOrAtDrawStartTime?: Twab[];
    beforeOrAtDrawEndTime?: Twab[];
};
