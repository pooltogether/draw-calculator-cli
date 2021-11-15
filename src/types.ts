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
};
