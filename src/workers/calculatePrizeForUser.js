const drawCalculatorLib = require("@pooltogether/draw-calculator-js");
const { BigNumber } = require("ethers");

const debug = require("debug")("pt:draw-calculator-cli");

module.exports = function calculatePrizeForUser({ user, prizeDistribution, draw }) {
    if (BigNumber.from(user.balance).lt(0)) {
        throw new Error(`user ${JSON.stringify(user)} has negative balance`);
    }

    const _user = {
        address: user.address,
        normalizedBalances: [user.balance],
    };
    const _draw = draw;

    // calls calculateDrawResults js lib
    let results;
    try {
        console.log(
            `calculateDrawResults for ${_user.address} with balance: ${_user.normalizedBalances[0]}`
        );
        results = drawCalculatorLib.calculateDrawResults(prizeDistribution, _draw, _user); // all sync
    } catch (error) {
        debug("error calling draw calc: ", error);
        return;
    }

    // if (results.prizes.length === 0) {
    //     return undefined;
    // }

    const prizesAwardable = results.prizes;

    const prizes = prizesAwardable.map((prize) => {
        return {
            address: user.address,
            pick: prize.pick,
            tier: prize.distributionIndex,
        };
    });

    debug(`worker thread: result: user ${_user.address} had ${prizes.length} prizes`);

    return prizes;
};
