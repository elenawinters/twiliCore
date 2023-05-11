const Delay = (ms) => new Promise(res => setTimeout(res, ms));

exports("math", () => {
    return {
        round: function test(number, place) {
            if (number == 0) { return 0; }
            let pow = (place === undefined) ? 1 : place;
            return Number(Math.round((number + Number.EPSILON) + 'e' + pow) + 'e-' + pow)
        }
    }
});

console.log(exports.twiliCore.math().round(10.1346821676, 3))