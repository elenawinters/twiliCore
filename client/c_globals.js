const BUILD = GetGameBuildNumber();
const GAME = GetGameName();
const FIVEM = 'fivem';
const REDM = 'redm';

function PLAYER_PED() { return GetPlayerPed(-1); }

// function PLAYER_INDEX() { return PLAYER_PED(); }

const PLAYER_INDEX = NetworkGetPlayerIndexFromPed(PLAYER_PED());

const PLAYER_NETID = GetPlayerServerId(PLAYER_INDEX);
// const 

exports("BUILD", BUILD);
exports("GAME", GAME);
exports("FIVEM", FIVEM);
exports("REDM", REDM);
exports("PLAYER_PED", PLAYER_PED);
exports("PLAYER_INDEX", PLAYER_INDEX);
exports("PLAYER_NETID", PLAYER_NETID);

