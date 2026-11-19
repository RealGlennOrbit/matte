'use strict';
/* ================= Lagring ================= */
const KEY = 'mattetemplen.v2', OLDKEY = 'mattetemplen.v1';
let storageOK = true;
function loadStore(){
  try{
    localStorage.setItem(KEY+'.test','1'); localStorage.removeItem(KEY+'.test');
    const s = localStorage.getItem(KEY);
    if(s){ const d = JSON.parse(s); if(d && Array.isArray(d.profiles)) return d; }
    const o = localStorage.getItem(OLDKEY);
    if(o){ const d = JSON.parse(o); if(d && Array.isArray(d.profiles)) return {profiles:d.profiles.map(p => ({id:p.id, name:p.name, avatar:p.avatar, progress:{}, stats:{}, unlocked:0, created:p.created, last:p.last})), sound:d.sound}; }
  }catch(e){ storageOK = false; }
  return {profiles:[], sound:true};
}
let store = loadStore();
function saveStore(){
  try{ localStorage.setItem(KEY, JSON.stringify(store)); }catch(e){ storageOK = false; }
  if(typeof afterSave === 'function') afterSave();   // skolläget: skicka ändringar till servern
}
