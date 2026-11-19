'use strict';
/* ================= Vuxenkod ================= */
function askCode(onOk, title){
  const creating = !store.code;
  let buf = '', first = null;
  const ov = overlay(`<h2>${esc(title)}</h2><p id="ct" style="font-size:1.15rem">${creating ? 'Välj en vuxenkod med 4 siffror. Den skyddar lärarvyn.' : 'Skriv vuxenkoden.'}</p>
    <div class="kp"><div class="kpdisp" id="cd">&nbsp;</div><div class="kpgrid">${[1,2,3,4,5,6,7,8,9].map(n=>`<button data-n="${n}">${n}</button>`).join('')}<button data-n="del" class="kdel">Sudda</button><button data-n="0">0</button><button data-n="ok" class="ok">OK</button></div></div>
    <div class="btns"><button class="btn secondary small" id="cx">Avbryt</button></div>`);
  const cd = ov.querySelector('#cd'), ct = ov.querySelector('#ct');
  const show = () => cd.innerHTML = buf ? '•'.repeat(buf.length) : '&nbsp;';
  const close = () => { ov.remove(); keyHandler = prevKH; };
  const prevKH = keyHandler;
  const press = n => {
    if(n === 'del'){ buf = buf.slice(0,-1); show(); return; }
    if(n === 'ok'){
      if(buf.length !== 4){ cd.classList.add('shake'); setTimeout(()=>cd.classList.remove('shake'),400); return; }
      if(creating){
        if(first === null){ first = buf; buf = ''; show(); ct.textContent = 'Skriv samma kod en gång till.'; return; }
        if(first !== buf){ first = null; buf = ''; show(); ct.textContent = 'Koderna var olika. Välj en ny kod med 4 siffror.'; return; }
        store.code = buf; saveStore(); close(); onOk(); return;
      }
      if(buf === store.code){ close(); onOk(); }
      else { buf = ''; show(); cd.classList.add('bad'); sfx.bad(); setTimeout(()=>cd.classList.remove('bad'),600); }
      return;
    }
    if(buf.length < 4){ buf += n; show(); }
  };
  ov.querySelectorAll('.kpgrid button').forEach(b => b.onclick = () => press(b.dataset.n));
  ov.querySelector('#cx').onclick = close;
  keyHandler = e => { if(/^[0-9]$/.test(e.key)) press(e.key); else if(e.key==='Backspace') press('del'); else if(e.key==='Enter'){ e.preventDefault(); press('ok'); } else if(e.key==='Escape') close(); };
}

/* ================= Lärarvy ================= */
function skillStatus(s){
  if(!s || s.n === 0) return [0,'Inte tränat'];
  const r = s.ok / s.n;
  if(s.n >= 6 && r >= .8) return [3,'Säker'];
  if(r >= .5) return [2,'På väg'];
  return [1,'Behöver träna'];
}
/* Resultat per kursplaneområde (används både lokalt och i skolläget) */
function weakSkills(st){ return Object.entries(SKILLS).filter(([k]) => skillStatus((st||{})[k])[0] === 1).map(([,v]) => v[1]); }
function resultsHTML(st){
  st = st || {};
  const rows = Object.entries(AREAS).map(([a, aname]) => {
    const sks = Object.entries(SKILLS).filter(([,v]) => v[0]===a);
    const n = sum(sks.map(([k]) => (st[k]||{}).n||0)), ok = sum(sks.map(([k]) => (st[k]||{}).ok||0));
    const pct = n ? Math.round(100*ok/n) : 0, col = !n ? '#ccc' : pct>=80 ? '#2e9e4f' : pct>=50 ? '#e0a526' : '#d64545';
    return `<tr><td><b>${aname}</b><br>${sks.map(([k,v]) => { const [lv, lab] = skillStatus(st[k]); return `<span class="st s${lv}" title="${lab}${st[k]?`: ${st[k].ok} av ${st[k].n} rätt`:''}">${v[1]}${st[k]?` ${Math.round(100*st[k].ok/st[k].n)} %`:''}</span>`; }).join('')}</td>
      <td style="width:190px"><div class="bar"><i style="width:${n?pct:0}%;background:${col}"></i></div><small>${n ? `${pct} % rätt på första försöket (${n} uppgifter)` : 'Inga uppgifter än'}</small></td></tr>`;
  }).join('');
  const weak = weakSkills(st);
  return `${weak.length ? `<h3>Behöver mer träning</h3><p>${weak.join(', ')}</p>` : ''}
    <h3>Kursplanens centrala innehåll (åk 1–3)</h3>
    <table class="areas"><tr><th>Område och förmågor</th><th>Resultat</th></tr>${rows}</table>
    <p class="note"><span class="st s3">Säker</span> minst 80 % rätt på första försöket och minst 6 uppgifter. <span class="st s2">På väg</span> 50–79 %. <span class="st s1">Behöver träna</span> under 50 %. Bara första svaret på varje uppgift räknas. Resultaten är ett stöd för din bedömning, inte en bedömning i sig.</p>`;
}
function showAdult(selId){
  player = null; setTheme('adult');
  const kids = store.profiles.filter(p => !p.cloud);
  const sel = kids.find(k => k.id === selId) || kids[0];
  let detail = '<p>Det finns inga spelare än.</p>';
  if(sel){
    const st = sel.stats || {};
    const save = player; player = sel;
    const worldsHtml = WORLDS.map((w,i) => { const p = prog(i); return `<button data-w="${i}" class="${(sel.unlocked||0)===i?'on':''}">${i+1}. ${w.short}${p.done>=w.rooms.length?' ✓':(p.done?` (${p.done}/${w.rooms.length})`:'')}</button>`; }).join('');
    player = save;
    detail = `<div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap">${avatarSVG(sel.avatar,70)}<div><h2>${esc(sel.name)}</h2><div>${totalStars(sel)} stjärnor · nu i ${WORLDS[curWorld(sel).w].name}</div></div></div>
      <h3>Öppna världar</h3><p class="note">Välj den värld ${esc(sel.name)} ska kunna börja i. Alla världar fram till och med den blir öppna. Värld 1–2 ≈ åk 1, värld 3–4 ≈ åk 2, värld 5–7 ≈ åk 3.</p>
      <div class="wbtns" id="wb">${worldsHtml}</div>
      ${resultsHTML(st)}
      <div class="btns" style="display:flex;gap:10px;flex-wrap:wrap;margin-top:12px"><button class="btn secondary small" id="rst">Nollställ resultat</button><button class="btn secondary small" id="delk" style="background:#f6d0d0">Ta bort spelaren</button></div>`;
  }
  app.innerHTML = `<div class="top"><button class="btn secondary small" id="back">← Till spelet</button><div class="grow"></div><button class="btn secondary small" id="backup">Spara säkerhetskopia</button><button class="btn secondary small" id="restore">Läs in säkerhetskopia</button><button class="btn secondary small" id="newcode">Byt vuxenkod</button><input type="file" id="bfile" accept=".json,application/json" hidden></div>
    <div class="panel"><h2>Lärarvy</h2><p class="note">Fyren på Faros (värld 7) motsvarar kunskapskraven för godtagbara kunskaper i slutet av åk 3.</p>
    <div class="kids">${kids.map(k => `<button class="kid ${sel && k.id===sel.id?'on':''}" data-k="${k.id}">${avatarSVG(k.avatar,40)}${esc(k.name)}</button>`).join('')}</div>
    ${detail}</div>`;
  document.getElementById('back').onclick = showProfiles;
  document.getElementById('newcode').onclick = () => { const old = store.code; store.code = null; askCode(() => showAdult(sel && sel.id), 'Ny vuxenkod'); if(!store.code) store.code = old; };
  document.getElementById('backup').onclick = () => {
    const blob = new Blob([JSON.stringify({app:'mattetemplen', saved:new Date().toISOString(), store:{...store, profiles:store.profiles.filter(p => !p.cloud)}}, null, 1)], {type:'application/json'});
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
    a.download = `underverkens-gator-${new Date().toISOString().slice(0,10)}.json`; document.body.appendChild(a); a.click(); a.remove();
  };
  const bf = document.getElementById('bfile');
  document.getElementById('restore').onclick = () => bf.click();
  bf.onchange = () => {
    const f = bf.files[0]; if(!f) return;
    f.text().then(txt => {
      let d; try{ d = JSON.parse(txt); }catch(e){ alert('Filen kunde inte läsas.'); return; }
      const inc = d && d.store && Array.isArray(d.store.profiles) ? d.store : null;
      if(!inc){ alert('Det här är ingen säkerhetskopia från Underverkens gåtor.'); return; }
      if(inc.layout !== 12) inc.profiles.forEach(migrateProfile);
      let added = 0, updated = 0;
      inc.profiles.forEach(p => {
        const i = store.profiles.findIndex(x => x.id === p.id);
        if(i < 0){ store.profiles.push(p); added++; }
        else if((p.last||0) >= (store.profiles[i].last||0)){ store.profiles[i] = p; updated++; }
      });
      saveStore(); alert(`Klart! ${added} nya spelare och ${updated} uppdaterade.`); showAdult();
    });
  };
  app.querySelectorAll('.kid').forEach(b => b.onclick = () => showAdult(b.dataset.k));
  app.querySelectorAll('#wb button').forEach(b => b.onclick = () => { sel.unlocked = +b.dataset.w; saveStore(); showAdult(sel.id); });
  const rst = document.getElementById('rst');
  if(rst) rst.onclick = () => { if(confirm(`Nollställ ${sel.name}s resultat i lärarvyn? Stjärnor och öppna rum påverkas inte.`)){ sel.stats = {}; saveStore(); showAdult(sel.id); } };
  const dk = document.getElementById('delk'); if(dk) dk.onclick = () => confirmDelete(sel.id);
  keyHandler = e => { if(e.key === 'Escape') showProfiles(); };
}
