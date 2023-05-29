const Delay = (ms) => new Promise(res => setTimeout(res, ms));

// This is a really interesting way to kinda do classes.
// It's probably not efficient though. Consider this UNSAFE.
exports("util", () => {
    return { 
        Delay: (ms) => { return Delay(ms) }
    }
});

exports("math", () => {
    return {
        round: function (number, place) {
            if (number == 0) { return 0; }
            let pow = (place === undefined) ? 1 : place;
            return Number(Math.round((number + Number.EPSILON) + 'e' + pow) + 'e-' + pow)
        }
    }
});

console.log(exports.twiliCore.math().round(10.1346821676, 3))