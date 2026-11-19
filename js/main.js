'use strict';
/* ================= Start ================= */
// Uppgradera sparade data från version 2 (8 rum per värld) till 12 rum per värld.
function migrateProfile(p){
  Object.values(p.progress || {}).forEach(pr => {
    const old = pr.stars || [];
    pr.done = pr.done >= 8 ? 12 : Math.floor((pr.done || 0) * 12 / 8);
    pr.stars = repeat(pr.done, i => old[Math.floor(i * 8 / 12)] || 1);
  });
}
function migrate(){
  if(store.layout === 12) return;
  store.profiles.forEach(migrateProfile);
  store.layout = 12; saveStore();
}
migrate();
showIntro(showProfiles);
