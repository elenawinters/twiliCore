console.log('twiliCore:damage is running on the server.')

// TODO: Create a hash list that is a hash of suspect, victim, and situation. If item is found in hash list, ignore
// Any single hash will expire after 2 seconds or so

onNet('twiliCore:damage:_sync', (suspect, victim, situation) => {
    console.log(`damage:_sync ${JSON.stringify(suspect)} -> ${JSON.stringify(victim)} /w ${JSON.stringify(situation)}`);
    // console.log(`${suspectName}(${suspect}) killed ${victimName}(${victim}) with ${weaponHash}. Critical(${criticalHit}) Cause(${getKeyByValue(DamageTypes, damageType)}) Bone(${getKeyByValue(PedBones, damageBone[1])}) Killstreak(${killStreaks[suspect]})`);
    emitNet('twiliCore:damage:event', -1, suspect, victim, situation);



    // console.log('Server has been notified to update the killfeed globally');
})