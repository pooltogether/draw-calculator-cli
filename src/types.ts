import { BigNumber } from "ethers";

export type UserBalance = {
    address: string;
    balance: BigNumber;
};
export type Prize = {
    address: string;
    pick: BigNumber;
    tier: number;
};
