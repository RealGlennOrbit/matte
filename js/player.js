'use strict';
/* ================= Spelare ================= */
let player = null;
function prog(wi){
  player.progress = player.progress || {};
  const id = WORLDS[wi].id;
  const p = player.progress[id] = player.progress[id] || {done:0, stars:[]};
  if(!Array.isArray(p.stars)) p.stars = [];
  return p;
}
const roomCount = wi => WORLDS[wi].rooms.length;
const worldDone = wi => prog(wi).done >= roomCount(wi);
const worldOpen = wi => wi === 0 || (player.unlocked||0) >= wi || worldDone(wi-1);
const totalStars = pl => sum(Object.values(pl.progress||{}).map(p => sum(p.stars||[])));
function curWorld(pl){
  const save = player; player = pl;
  let w = 0; for(let i=0;i<WORLDS.length;i++) if(worldOpen(i)) w = i;
  const p = prog(w); player = save;
  return {w, room:p.done};
}
function record(skill, ok){
  if(!player || !skill) return;
  player.stats = player.stats || {};
  const s = player.stats[skill] = player.stats[skill] || {n:0, ok:0};
  s.n++; if(ok) s.ok++;
  saveStore();
}
function starsHtml(n, max=3){ return '<span class="stars">' + repeat(max, i => i<n ? '★' : '<span class="off">★</span>').join('') + '</span>'; }
function setTheme(t){ document.body.className = t; }
function topbar(left){
  return `<div class="top">${left||''}<div class="grow"></div>
    ${player ? `<span class="chip">${avatarSVG(player.avatar,44)}${esc(player.name)} <span class="stars">★</span>${totalStars(player)}</span>` : ''}
    <button class="btn secondary small" id="snd">${store.sound===false ? 'Ljud av' : 'Ljud på'}</button></div>
    ${storageOK ? '' : '<div class="warn">Obs! Den här webbläsaren kan inte spara. Spelet glöms när du stänger.</div>'}`;
}
function wireTop(){
  const b = document.getElementById('snd');
  if(b) b.onclick = () => { store.sound = store.sound===false; saveStore(); b.textContent = store.sound ? 'Ljud på' : 'Ljud av'; sfx.click(); };
}
function overlay(html){
  const ov = document.createElement('div'); ov.className = 'overlay'; ov.innerHTML = `<div class="dialog">${html}</div>`;
  document.body.appendChild(ov); return ov;
}
