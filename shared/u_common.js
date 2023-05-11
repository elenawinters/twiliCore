const Delay = (ms) => new Promise(res => setTimeout(res, ms));

exports("math0round", (number, place) => {
    if (number == 0) { return 0; }
    let pow = (place === undefined) ? 1 : place;
    return Number(Math.round((number + Number.EPSILON) + 'e' + pow) + 'e-' + pow)
});
