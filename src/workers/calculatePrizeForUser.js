const drawCalculatorLib = require("@pooltogether/draw-calculator-js");
const { BigNumber } = require("ethers");

module.exports = function calculatePrizeForUser({ user, prizeDistribution, draw }) {
    // formats the correct input for draw-calculate-js
    // console.log("in worker: draw: ", JSON.stringify(draw));
    // console.log("in worker: user: ", JSON.stringify(user));
    // console.log("in worker: prizeDistribution: ", JSON.stringify(prizeDistribution));

    const _user = {
        address: user.address,
        normalizedBalances: [user.balance],
    };
    const _draw = draw;

    console.log(
        "worker thread: running calculateDrawResults with:",
        "\n user.normalizedBalance",
        JSON.stringify(user.balance),
        "\n prizeDistribution: ",
        JSON.stringify(prizeDistribution),
        "\n _draw: ",
        JSON.stringify(_draw),
        "\n _user: ",
        JSON.stringify(_user)
    );

    // calls calculateDrawResults
    let results;
    try {
        results = drawCalculatorLib.calculateDrawResults(prizeDistribution, _draw, _user);
    } catch (error) {
        console.log("error calling draw calc: ", error);
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

    console.log(`user ${_user.address} had ${prizes.length} prizes`);

    return prizes;
};
