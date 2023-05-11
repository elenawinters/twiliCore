const BUILD = GetGameBuildNumber();
const GAME = GetGameName();
const FIVEM = 'fivem';
const REDM = 'redm';

function PLAYER_PED() { return GetPlayerPed(-1); }

const PLAYER_INDEX = NetworkGetPlayerIndexFromPed(PLAYER_PED());

const PLAYER_NETID = GetPlayerServerId(PLAYER_INDEX);


exports("BUILD", () => { return BUILD; });
exports("GAME", () => { return GAME; });
exports("FIVEM", () => { return FIVEM; });
exports("REDM", () => { return REDM; });
exports("PLAYER_PED", PLAYER_PED);
exports("PLAYER_INDEX", () => { return PLAYER_INDEX; });
exports("PLAYER_NETID", () => { return PLAYER_NETID; });

