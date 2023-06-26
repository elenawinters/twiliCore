const Delay = (ms) => new Promise(res => setTimeout(res, ms));

// This is a really interesting way to kinda do classes.
// It's probably not efficient though. Consider this UNSAFE.
exports("util", () => {
    return { 
        Delay: (ms) => { return Delay(ms) }
    }
});

function preciseRound (number, place) {
    if (number == 0) { return 0; }
    let pow = (place === undefined) ? 1 : place;
    return Number(Math.round((number + Number.EPSILON) + 'e' + pow) + 'e-' + pow)
}

function arrayAdd(alpha, bravo) {  // LISTS MUST BE THE SAME SIDE
    let adder = []
    for (let i = 0; i < alpha.length; i++) {
        adder[i] = alpha[i] + bravo[i]
    }
    return adder
}

function arrayMultiply(alpha, times) {
    let mult = []
    for (let i = 0; i < alpha.length; i++) {
        mult[i] = alpha[i] * times
    }
    return mult
}

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