let TrackedEntities = {};

function MergeVehicleHealths(veh) {
    let wheel_healths = 0;
    for (let i = 0; i < GetVehicleNumberOfWheels(veh); i++) {
        wheel_healths += GetVehicleWheelHealth(veh, i);
    };
    let heli_healths = 0;
    if (GetVehicleClass(veh) == 15) {  // if vehicle is helicopter, get it's health stats
        heli_healths = GetHeliMainRotorHealth(veh) + GetHeliTailBoomHealth(veh) + GetHeliTailRotorHealth(veh);
    }
    return GetVehicleBodyHealth(veh) + GetVehicleEngineHealth(veh) + GetVehiclePetrolTankHealth(veh) + wheel_healths + heli_healths;
}

function TrackEntityHealth() {
    // MERGE DIFFERENT ENTITY GROUPS
    TrackedEntities = {};  // this is "temporary". basically, we reconstruck the tracked entities every time to avoid mem leaks
    let entities = GetActivePlayers();

    for (let [, value] of Object.entries(GetGamePool('CPed'))) {
        entities.push(value);
    }
    for (let [, value] of Object.entries(GetGamePool('CVehicle'))) {
        entities.push(value);
    }

    // UPDATE LAST KNOWN HEALTH VALUES
    for (let [, ent] of Object.entries(entities)) {
        if (IsEntityAPed(ent)) {
            if (GAME == FIVEM) {
                TrackedEntities[ent] = {h: GetEntityHealth(ent), a: GetPedArmour(ent)}
            } else {
                TrackedEntities[ent] = {h: GetEntityHealth(ent), a: 0}
            }
        } else if (IsEntityAVehicle(ent)) {
            TrackedEntities[ent] = {h: MergeVehicleHealths(ent), a: 0}
        }
        // entities.push(value)
    }

    // UPDATE TRACKEDENTITIES TO REMOVE VOID ENTITIES
    for (let [, ent] of Object.entries(TrackedEntities)) {
        if (!entities.hasOwnProperty(ent) && TrackedEntities.hasOwnProperty(ent)) {
            const index = TrackedEntities.indexOf(ent);
            if (index > -1) {
                TrackedEntities.splice(index, 1);
                console.log(`Removed ${ent} from tracking list (index of ${index})`);
            }
        }
    }
}

function CalculateHealthLost(ent) {
    let health = 0;
    let armor = 0;
    if (IsEntityAPed(ent)) {
        health = TrackedEntities[ent].h - GetEntityHealth(ent);
        TrackedEntities[ent].h = GetEntityHealth(ent);
        armor = TrackedEntities[ent].a - GetPedArmour(ent);
        TrackedEntities[ent].a = GetPedArmour(ent);
    } else if (IsEntityAVehicle(ent)) {
        health = TrackedEntities[ent].h - MergeVehicleHealths(ent);
        TrackedEntities[ent].h = MergeVehicleHealths(ent);
    }
    return {h: health, a: armor};
}

function CalculateDamagePosition(suspect, victim, victimDied) {
    let [, position] = GetPedLastWeaponImpactCoord(suspect);
    if (position[0] == 0 && position[1] == 0 && position[2] == 0) {
        position = GetEntityCoords(victim);
        if (IsEntityAPed(victim)) {
            if (victimDied == undefined) { victimDied = IsPedFatallyInjured(victim); }
            if (victimDied && GetPedCauseOfDeath(victim) == 0) {
                position = GetPedBoneCoords(victim, 0x60F1);
            } else {
                let [success, bone] = GetPedLastDamageBone(victim);
                if (success) {
                    position = GetPedBoneCoords(victim, bone);
                } else {
                    position = GetPedBoneCoords(victim, 0x60F1);
                }
            }
        }
    }
    return position
}


function CreateSituationReport(suspect, victim, position, weaponHash, damageTypeSecondary, damageBone, victimDied, isMelee, healthLost) {
    const suspectPlayer = NetworkGetPlayerIndexFromPed(suspect)
    let suspectData = {
        entity: suspect,
        networkIndex: GetPlayerServerId(suspectPlayer),
        networkName: GetPlayerName(suspectPlayer)
    }

    const victimPlayer = NetworkGetPlayerIndexFromPed(victim)
    let victimData = {
        entity: victim,
        networkIndex: GetPlayerServerId(victimPlayer),
        networkName: GetPlayerName(victimPlayer)
    }
    let isDead = IsPedFatallyInjured(victim);
    let situation = {
        position: position,
        weaponHash: weaponHash,
        healthLost: healthLost == null ? CalculateHealthLost(victim) : healthLost,
        damageTypePrimary: GAME == FIVEM ? GetWeaponDamageType(weaponHash) : null,
        damageTypeSecondary: damageTypeSecondary,
        damageBone: damageBone,
        isDead: isDead,
        isMelee: isMelee,
        isOnFire: IsEntityOnFire(victim),
        isInWrithe: IsPedInWrithe(victim),
        isInWater: IsEntityInWater(victim),
        isUnderwater: IsPedSwimmingUnderWater(victim),
        isCritical: damageBone[1] == 0x796E,
        victimDied: victimDied
    }

    return [suspectData, victimData, situation]
}

if (GAME == FIVEM) {
    setTick(async () => {
        await Delay(1000);
        TrackEntityHealth();
    })

    on('CEventDamage', function (victims, suspect) {
        for (let [, victim] of Object.entries(victims)) {
            if (!IsPedAPlayer(suspect) || !IsPedAPlayer(victim)) { return; }  // required for hybrid
            const position = CalculateDamagePosition(suspect, victim);
            const weaponHash = GetPedCauseOfDeath(victim);
            const isMelee = GetWeaponDamageType(weaponHash) == 2;
            const damageBone = GetPedLastDamageBone(victim);

            let [suspectData, victimData, situationData] = CreateSituationReport(suspect, victim, position, weaponHash, 0, damageBone, false, isMelee)

            emitNet("twiliCore:damage:_sync", suspectData, victimData, situationData);
        }
    })

    // use GetWeaponTimeBetweenShots to get dynamic fade speed per weapon
    // use log 0.7 (x) to get Fade Speed from TimeBetweenShots. If output is below 0.1, keep it at 0.1. Refine later
    on('gameEventTriggered', function (eventName, data) {
        if (eventName != 'CEventNetworkEntityDamage') { return; }

        const victim = data[0];
        const suspect = data[1];

        if (IsPedAPlayer(suspect) && IsPedAPlayer(victim) && suspect != victim) { return; }  // required for hybrid

        let offset = 0;

        if (BUILD >= 2060) {
            offset++;
            if (BUILD >= 2189) {
                offset++;
            }
        }

        const victimDied = data[3 + offset];
        const weaponHash = data[4 + offset];
        const isMelee = data[9 + offset];
        const damageType = data[10 + offset];

        const position = CalculateDamagePosition(suspect, victim, victimDied);
        const damageBone = GetPedLastDamageBone(victim);

        let [suspectData, victimData, situationData] = CreateSituationReport(suspect, victim, position, weaponHash, damageType, damageBone, victimDied, isMelee)

        emit('twiliCore:damage:event', suspectData, victimData, situationData);

    })
} else if (GAME == REDM) {
    setTick(async () => {
        const size = GetNumberOfEvents(0);
        if (size == 0) { return; }
        for (let i = 0; i < size; i++) {
            const eventAtIndex = GetEventAtIndex(0, i);
            if (eventAtIndex != 402722103) { continue; }  // EVENT_ENTITY_DAMAGED

            const eventDataSize = 9;
            // let eventDataStruct = new ArrayBuffer(8 * eventDataSize)  // DATAVIEW IS BUILT INTO JAVASCRIPT BABYYYY
            // let eventBuffer = new Uint8Array(eventDataStruct)
            // let eventView = new DataView(eventDataStruct)
            // for (let iter = 0; iter < eventDataSize; iter++) {
            //     eventView.setInt32(8 * iter, 0)
            // }

            // let eventDataExists = 0
            // let eventData = 0
            const eventBuffer = new Uint8Array(8 * eventDataSize);

            // VESPURA IS WRONG, IT'S NOT AN ANY TYPE, IT'LL RETURN THE FIRST NUMBER
            // let eventData = GetEventData(0, i, eventDataSize)  // so, we want to get the data, haha, we can only get the first index?
            // Invoking the native will give us all of our data. https://github.com/fivem-wl/fivem-js/blob/221bd95cc6071db370cfc38189b9761c05184be0/src/weapon/DlcWeaponData.ts#L69
            const eventDataExists = Citizen.invokeNative('0x57EC5FA4D4D6AFCA', 0, i, eventBuffer, eventDataSize)
            console.log(eventBuffer)
            let eventView = new DataView(eventBuffer.buffer)
            // const eventDataExists = eventData[0]
            // console.log(eventData[1])
            // console.log(eventData[2])

            // [eventDataExists, eventView.buffer] = GetEventData(0, i, eventDataSize)
            // console.log(eventDataExists)
            // console.log(eventData)  // todo parse event data
            // console.log(typeof eventData)  // todo parse event data

            // const binaryData = (eventData >>> 0).toString(2)

            // // const byteArray = [];
            // // console.log((eventData >>> 0).toString(2))
            // for (let e = 0; e < binaryData.length; e++) {
            //     eventBuffer[e] = binaryData.charCodeAt(e);
            // }
              
            // console.log(eventData)
            
            // // let eventDataBuffer = new Uint8Array(byteArray)
            // // console.log(typeof eventDataBuffer)
            // // const eventDataBuffer = new Blob(eventData).arrayBuffer()
            // let eventView = new DataView(eventBuffer.buffer)
            // // So, we have our data. Now how the fuck do we parse it??!?!

            if (!eventDataExists) { continue; }

            const victim = eventView.getInt32(0, true);
            // // const victim = eventView.slice(0, 8).reduce((acc, byte) => acc * 256 ** (byte * 8), 0);
            console.log(victim)
            const suspect = eventView.getInt32(8, true);
            console.log(suspect)
            const weaponHash = eventView.getInt32(16, true);
            console.log(weaponHash)
            const ammoHash = eventView.getInt32(24, true);
            console.log(ammoHash)
            const healthLost = eventView.getFloat32(32, true);
            console.log(healthLost)

            // const unknownValue = eventView.getInt32(40, true);  // always 1?
            // console.log(unknownValue)

            // const position = [0, 0, 0]
            const position = [eventView.getFloat32(48, true), eventView.getFloat32(56, true), eventView.getFloat32(64, true)]
            console.log(position)
            // const value = 0

            // const weaponHash = GetPedCauseOfDeath(victim);
            // const isMelee = GetWeaponDamageType(weaponHash) == 2;  // this doesn't exist in RDR3
            const damageBone = GetPedLastDamageBone(victim);

            let [suspectData, victimData, situationData] = CreateSituationReport(suspect, victim, position, weaponHash, 0, damageBone, false, null, healthLost)

            emit('twiliCore:damage:event', suspectData, victimData, situationData);

        }
    })
}