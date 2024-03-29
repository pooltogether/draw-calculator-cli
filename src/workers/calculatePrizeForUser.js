const drawCalculatorLib = require("@pooltogether/draw-calculator-js");
const { BigNumber } = require("ethers");

const debug = require("debug")("pt:draw-calculator-cli");

module.exports = function calculatePrizeForUser({ user, prizeDistribution, draw }) {
    if (BigNumber.from(user.balance).lt(0)) {
        throw new Error(`user ${JSON.stringify(user)} has negative balance`);
    }

    const _user = {
        address: user.address,
        normalizedBalances: [user.balance]
    };
    const _draw = draw;

    // calls calculateDrawResults js lib
    let results;
    debug(`in worker thread user is ${JSON.stringify(_user)}`);
    try {
        results = drawCalculatorLib.calculateDrawResults(prizeDistribution, _draw, _user); // all sync
    } catch (error) {
        debug("error calling draw calc: ", error);
        return;
    }

    if (results.prizes.length === 0) {
        return undefined;
    }

    const prizesAwardable = results.prizes;

    const prizes = prizesAwardable
        .map(prize => {
            if (prize.amount.eq(BigNumber.from(0))) {
                return undefined;
            }
            return {
                address: user.address,
                pick: prize.pick.toString(),
                tier: prize.distributionIndex,
                amount: prize.amount.toString()
            };
        })
        .filter(prize => prize !== undefined);

    // const nonZeroPrizes = prizes.filter((prize) => prize !== undefined);

    debug(`worker thread: result: user ${_user.address} had ${prizes.length} prizes`);

    return prizes;
};
