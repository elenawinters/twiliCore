

onNet('twiliCore:damage:event', (suspect, victim, situation) => {
    console.log(`damage:event ${JSON.stringify(suspect)} -> ${JSON.stringify(victim)} /w ${JSON.stringify(situation)}`);

})