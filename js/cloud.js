'use strict';
/* =====================================================================
   SKOLLÄGET: klasskod, elevinloggning med bildkod och synk med servern
   Elevens data sparas alltid lokalt först och skickas till servern när det går.
   ===================================================================== */
const PIC_SET = ['sol','pyramid','vatten','oga','ankh','blomma','fisk','skepp','stjarna'];   // samma ordning som på servern
const cloudOn = () => !!CLOUD_API;

async function api(action, data, token){
  const ctrl = new AbortController(), t = setTimeout(() => ctrl.abort(), 9000);
  try{
    const res = await fetch(CLOUD_API, {method:'POST', signal:ctrl.signal,
      headers:{'Content-Type':'application/json', ...(token ? {'Authorization':'Bearer ' + token} : {})},
      body:JSON.stringify({action, ...(data||{})})});
    let j = null; try{ j = await res.json(); }catch(e){}
    if(!j) return {ok:false, status:res.status, error:'Servern svarade konstigt.'};
    j.status = res.status; return j;
  }catch(e){
    return {ok:false, status:0, offline:true, error:'Ingen kontakt med servern.'};
  }finally{ clearTimeout(t); }
}

/* ---------- sammanslagning (samma regler som på servern) ---------- */
function mergeData(a, b){
  a = a || {}; b = b || {};
  const out = {progress:{}, stats:{}, seen:{}};
  const pa = a.progress || {}, pb = b.progress || {};
  new Set([...Object.keys(pa), ...Object.keys(pb)]).forEach(w => {
    const x = pa[w] || {}, y = pb[w] || {}, sx = x.stars || [], sy = y.stars || [];
    out.progress[w] = {done:Math.max(x.done||0, y.done||0), stars:repeat(Math.max(sx.length, sy.length), i => Math.max(sx[i]||0, sy[i]||0))};
  });
  const ea = a.statsEpoch || 0, eb = b.statsEpoch || 0;
  const ta = ea < eb ? {} : (a.stats || {}), tb = eb < ea ? {} : (b.stats || {});
  new Set([...Object.keys(ta), ...Object.keys(tb)]).forEach(k => {
    const x = ta[k] || {n:0, ok:0}, y = tb[k] || {n:0, ok:0};
    out.stats[k] = (x.n||0) >= (y.n||0) ? {n:x.n||0, ok:x.ok||0} : {n:y.n||0, ok:y.ok||0};
  });
  out.statsEpoch = Math.max(ea, eb);
  Object.keys({...(a.seen||{}), ...(b.seen||{})}).forEach(k => out.seen[k] = true);
  out.last = Math.max(a.last||0, b.last||0);
  return out;
}
const payload = p => ({progress:p.progress||{}, stats:p.stats||{}, statsEpoch:p.statsEpoch||0, seen:p.seen||{}, last:p.last||0});
function applyServer(p, res){
  const m = mergeData(payload(p), res.data);
  p.progress = m.progress; p.stats = m.stats; p.statsEpoch = m.statsEpoch; p.seen = m.seen; p.last = m.last;
  if(res.name) p.name = res.name;
  if(res.avatar != null) p.avatar = res.avatar;
  if(res.unlocked != null) p.unlocked = res.unlocked;
}

/* ---------- synk ---------- */
let syncTimer = null, syncBusy = false, applying = false;
function afterSave(){
  if(applying || !cloudOn()) return;
  const p = player;
  if(p && p.cloud){ p.cloud.dirty = true; p.cloud.ver = (p.cloud.ver||0) + 1; scheduleSync(1500); }
}
function scheduleSync(ms){ clearTimeout(syncTimer); syncTimer = setTimeout(syncAll, ms); }
async function syncProfile(p){
  if(!p.cloud || !p.cloud.token) return 'nologin';
  const ver = p.cloud.ver || 0;
  const res = await api('student_sync', {data:payload(p)}, p.cloud.token);
  if(res.ok){
    applying = true;
    applyServer(p, res);
    if((p.cloud.ver||0) === ver) p.cloud.dirty = false;
    p.cloud.synced = Date.now();
    saveStore(); applying = false;
    return 'ok';
  }
  if(res.status === 401){ p.cloud.token = null; applying = true; saveStore(); applying = false; return 'nologin'; }
  if(res.status === 404){ return 'gone'; }
  return 'offline';
}
async function syncAll(){
  if(syncBusy || !cloudOn()) return;
  syncBusy = true;
  let retry = false;
  for(const p of store.profiles.filter(x => x.cloud && x.cloud.dirty && x.cloud.token)){
    if(await syncProfile(p) === 'offline') retry = true;
  }
  syncBusy = false;
  if(retry) scheduleSync(30000);
}
window.addEventListener('online', () => scheduleSync(500));

/* ---------- lokal kontroll av bildkoden när servern inte nås ---------- */
function picKey(code, sid, pics){
  let h = 2166136261; const s = `${code}|${sid}|${pics.join(',')}|bikupan`;
  for(let i=0;i<s.length;i++){ h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return (h >>> 0).toString(36);
}

/* ---------- skärm: klassens elever (en del av startsidan) ---------- */
function classSectionHTML(){
  if(!cloudOn()) return '';
  const c = store.cloud;
  if(!c || !c.code) return `<div class="classbox"><button class="btn" id="joinclass">Logga in med klasskod</button><p class="note" style="margin:8px 0 0">För skolan: då sparas det du klarar på alla datorer.</p></div>`;
  return `<div class="classbox"><div class="classhead"><h2>Klass ${esc(c.name)}</h2><span class="note" id="cstatus"></span><div class="grow"></div><button class="btn secondary small" id="leaveclass">Byt klass</button></div>
    <div class="profiles">${(c.students||[]).map(s => `<button class="pcard" data-sid="${s.id}">${avatarSVG(s.avatar,90)}<div>${esc(s.name)}</div></button>`).join('') || '<p>Klassen har inga elever än. Be din lärare lägga till dig.</p>'}</div></div>`;
}
function wireClassSection(){
  if(!cloudOn()) return;
  const j = document.getElementById('joinclass'); if(j) j.onclick = showClassCode;
  const l = document.getElementById('leaveclass');
  if(l) l.onclick = () => {
    const ov = overlay(`<h2>Byta klass?</h2><p style="font-size:1.2rem">Den här datorn slutar visa klass ${esc(store.cloud.name)}. Inget som eleverna har klarat försvinner.</p><div class="btns"><button class="btn secondary" id="no">Nej</button><button class="btn" id="yes">Ja, byt klass</button></div>`);
    const prev = keyHandler, close = () => { ov.remove(); keyHandler = prev; };
    ov.querySelector('#no').onclick = close;
    ov.querySelector('#yes').onclick = () => { close(); store.cloud = null; saveStore(); showClassCode(); };
    keyHandler = e => { if(e.key === 'Escape') close(); };
  };
  app.querySelectorAll('.pcard[data-sid]').forEach(b => b.onclick = () => {
    const s = (store.cloud.students||[]).find(x => x.id === +b.dataset.sid); if(s){ sfx.click(); showPicLogin(s); }
  });
  // hämta en färsk elevlista i bakgrunden
  if(store.cloud && store.cloud.code){
    const st = document.getElementById('cstatus');
    api('class_lookup', {code:store.cloud.code}).then(res => {
      if(!document.getElementById('cstatus')) return;
      if(res.ok){
        const changed = JSON.stringify(res.students) !== JSON.stringify(store.cloud.students) || res.class.name !== store.cloud.name;
        store.cloud.students = res.students; store.cloud.name = res.class.name; saveStore();
        if(changed && !player) showProfiles();
        scheduleSync(200);
      } else if(res.offline){ if(st) st.textContent = 'Ingen internetanslutning – det du klarar sparas här och skickas senare.'; }
      else if(res.status === 404){ store.cloud = null; saveStore(); if(!player) showProfiles(); }
    });
  }
}

function showClassCode(){
  player = null; setTheme('menu');
  app.innerHTML = topbar('<button class="btn secondary small" id="back">← Tillbaka</button>') + `<div class="panel center">
    <h2>Skriv klasskoden</h2><p style="font-size:1.2rem">Du får koden av din lärare. Den har 6 tecken.</p>
    <input class="nameinput codeinput" id="cc" maxlength="6" autocomplete="off" autocapitalize="characters" spellcheck="false" placeholder="ABC123">
    <p class="msg" id="cmsg"></p><button class="btn" id="go">Fortsätt</button></div>`;
  wireTop();
  const cc = document.getElementById('cc'), msg = document.getElementById('cmsg'), go = document.getElementById('go');
  cc.oninput = () => { cc.value = cc.value.toUpperCase().replace(/[^A-Z0-9]/g, ''); };
  const submit = async () => {
    if(cc.value.length !== 6){ msg.textContent = 'Koden ska ha 6 tecken.'; return; }
    go.disabled = true; msg.className = 'msg'; msg.textContent = 'Letar efter klassen…';
    const res = await api('class_lookup', {code:cc.value});
    go.disabled = false;
    if(res.ok){ store.cloud = {code:res.class.code, name:res.class.name, students:res.students}; saveStore(); sfx.ok(); showProfiles(); }
    else { msg.textContent = res.offline ? 'Ingen kontakt med servern. Är datorn ansluten till internet?' : res.error; sfx.bad(); }
  };
  go.onclick = submit;
  document.getElementById('back').onclick = showProfiles;
  keyHandler = e => { if(e.key === 'Enter'){ e.preventDefault(); submit(); } if(e.key === 'Escape') showProfiles(); };
  cc.focus();
}

function showPicLogin(s){
  const code = store.cloud.code;
  let picks = [], busy = false;
  const ov = overlay(`${avatarSVG(s.avatar,90)}<h2>Hej ${esc(s.name)}!</h2><p style="font-size:1.2rem;margin:4px 0 10px">Tryck på dina tre bilder i rätt ordning.</p>
    <div class="picslots" id="slots"></div><div class="picgrid" id="pg">${PIC_SET.map((g,i) => `<button data-i="${i}" aria-label="${GNAME1[g]}">${glyph(g,58)}</button>`).join('')}</div>
    <p class="msg" id="pmsg"></p><div class="btns"><button class="btn secondary small" id="cx">Det är inte jag</button><button class="btn secondary small" id="undo">Sudda</button></div>`);
  ov.querySelector('.dialog').classList.add('picdialog');
  const slots = ov.querySelector('#slots'), msg = ov.querySelector('#pmsg'), pg = ov.querySelector('#pg');
  const draw = () => slots.innerHTML = repeat(3, i => `<span class="slot">${picks[i] != null ? glyph(PIC_SET[picks[i]],44) : ''}</span>`).join('');
  const prev = keyHandler, close = () => { ov.remove(); keyHandler = prev; };
  const reset = (t, bad) => { picks = []; draw(); msg.textContent = t || ''; msg.className = 'msg' + (bad ? '' : ' good'); if(bad){ pg.classList.remove('shake'); void pg.offsetWidth; pg.classList.add('shake'); sfx.bad(); } };
  async function tryLogin(){
    busy = true; msg.className = 'msg good'; msg.textContent = 'Kollar…';
    const res = await api('student_login', {code, student_id:s.id, pics:picks});
    busy = false;
    const id = `c${s.id}_${code}`;
    let p = store.profiles.find(x => x.id === id);
    if(res.ok){
      if(!p){ p = {id, name:s.name, avatar:s.avatar, progress:{}, stats:{}, unlocked:0, seen:{}, created:Date.now()}; store.profiles.push(p); }
      p.cloud = {...(p.cloud||{}), sid:s.id, code, token:res.token, pk:picKey(code, s.id, picks), dirty:true};
      applying = true; applyServer(p, res.student); applying = false;
      return enter(p);
    }
    if(res.offline && p && p.cloud && p.cloud.pk){
      if(p.cloud.pk === picKey(code, s.id, picks)) return enter(p, true);
      return reset('Fel bilder. Försök igen!', true);
    }
    if(res.offline) return reset('Ingen kontakt med servern. Första gången måste datorn vara ansluten till internet.', true);
    if(res.error === 'wrong') return reset('Fel bilder. Försök igen!', true);
    if(res.error === 'locked') return reset('För många försök. Vänta två minuter eller fråga din lärare.', true);
    return reset(res.error || 'Något gick fel.', true);
  }
  function enter(p, offline){
    close(); sfx.ok();
    player = p; player.last = Date.now(); saveStore();
    if(!offline) scheduleSync(100);
    showMap(curWorld(player).w);
  }
  pg.querySelectorAll('button').forEach(b => b.onclick = () => {
    if(busy || picks.length >= 3) return;
    picks.push(+b.dataset.i); sfx.click(); draw(); msg.textContent = '';
    if(picks.length === 3) tryLogin();
  });
  ov.querySelector('#undo').onclick = () => { if(!busy){ picks.pop(); draw(); } };
  ov.querySelector('#cx').onclick = close;
  keyHandler = e => {
    if(e.key === 'Escape') close();
    else if(/^[1-9]$/.test(e.key)) pg.querySelectorAll('button')[+e.key-1].click();
    else if(e.key === 'Backspace'){ e.preventDefault(); ov.querySelector('#undo').click(); }
  };
  draw();
}
