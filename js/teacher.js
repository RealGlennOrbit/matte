'use strict';
/* =====================================================================
   LÄRARVY FÖR SKOLAN: klasser, elever, resultat och inloggningskort
   Lärarens inloggning sparas bara tills webbläsarfliken stängs.
   ===================================================================== */
const tToken = {
  get(){ try{ return sessionStorage.getItem('bikupan.tt'); }catch(e){ return null; } },
  set(v){ try{ v ? sessionStorage.setItem('bikupan.tt', v) : sessionStorage.removeItem('bikupan.tt'); }catch(e){} }
};
async function tapi(action, data){
  const res = await api(action, data, tToken.get());
  if(res.status === 401){ tToken.set(null); showTeacherLogin('Du har blivit utloggad. Logga in igen.'); throw new Error('utloggad'); }
  return res;
}

function showAdultChoice(){
  player = null; setTheme('adult');
  app.innerHTML = `<div class="top"><button class="btn secondary small" id="back">← Till spelet</button></div>
    <div class="panel"><h2>Vuxen</h2>
    <div class="choice">
      <button class="pitem" id="school"><b>Lärarinloggning</b><small style="color:#555">Klasser och elever som sparas på servern. Fungerar på alla datorer.</small></button>
      <button class="pitem" id="local"><b>Den här datorn</b><small style="color:#555">Spelare som bara finns här. Skyddas med vuxenkoden.</small></button>
    </div></div>`;
  document.getElementById('back').onclick = showProfiles;
  document.getElementById('school').onclick = () => tToken.get() ? showTeacher() : showTeacherLogin();
  document.getElementById('local').onclick = () => askCode(showAdult, 'Lärarvy');
  keyHandler = e => { if(e.key === 'Escape') showProfiles(); };
}

function showTeacherLogin(note){
  player = null; setTheme('adult');
  app.innerHTML = `<div class="top"><button class="btn secondary small" id="back">← Till spelet</button></div>
    <div class="panel" style="max-width:460px;margin:0 auto"><h2>Lärarinloggning</h2>
    ${note ? `<p class="msg">${esc(note)}</p>` : ''}
    <form id="tf" autocomplete="on">
      <label class="lbl">Användarnamn<input class="tin" id="tu" autocomplete="username" required></label>
      <label class="lbl">Lösenord<input class="tin" id="tp" type="password" autocomplete="current-password" required></label>
      <p class="msg" id="tmsg"></p><button class="btn" type="submit">Logga in</button>
    </form>
    <p class="note">Lärarkonton skapas på installationssidan för spel-api (se README).</p></div>`;
  document.getElementById('back').onclick = showProfiles;
  const f = document.getElementById('tf'), msg = document.getElementById('tmsg');
  f.onsubmit = async e => {
    e.preventDefault(); msg.textContent = 'Loggar in…';
    const res = await api('teacher_login', {username:document.getElementById('tu').value, password:document.getElementById('tp').value});
    if(res.ok){ tToken.set(res.token); showTeacher(); }
    else msg.textContent = res.offline ? 'Ingen kontakt med servern.' : res.error;
  };
  keyHandler = null;
  document.getElementById('tu').focus();
}

function progressText(data){
  const pr = (data && data.progress) || {};
  for(let i=0;i<WORLDS.length;i++){
    const d = (pr[WORLDS[i].id] || {}).done || 0;
    if(d < WORLDS[i].rooms.length) return {w:i, text:`${i+1}. ${WORLDS[i].short} – rum ${d+1}`};
  }
  return {w:6, text:'Alla världar klara!'};
}
const starCount = data => sum(Object.values((data && data.progress) || {}).map(p => sum(p.stars || [])));
const picsHTML = (pics, s=30) => (pics||[]).map(i => glyph(PIC_SET[i], s)).join('');

let tState = {classId:null, studentId:null};
async function showTeacher(classId, studentId){
  player = null; setTheme('adult');
  if(classId !== undefined) tState.classId = classId;
  tState.studentId = studentId || null;
  app.innerHTML = '<div class="panel"><p>Hämtar klasserna…</p></div>';
  let cl;
  try{ cl = await tapi('classes'); }catch(e){ return; }
  if(!cl.ok){ app.innerHTML = `<div class="panel"><p class="msg">${esc(cl.offline ? 'Ingen kontakt med servern.' : cl.error)}</p><button class="btn secondary small" id="back">← Till spelet</button></div>`; document.getElementById('back').onclick = showProfiles; return; }
  const classes = cl.classes;
  if(!classes.find(c => c.id === tState.classId)) tState.classId = classes.length ? classes[0].id : null;
  let detail = '<p>Skapa din första klass ovan.</p>', cd = null;
  if(tState.classId){
    try{ cd = await tapi('class_detail', {class_id:tState.classId}); }catch(e){ return; }
    if(cd.ok) detail = classHTML(cd);
  }
  app.innerHTML = `<div class="top"><button class="btn secondary small" id="back">← Till spelet</button><div class="grow"></div>
      <button class="btn secondary small" id="pw">Byt lösenord</button><button class="btn secondary small" id="logout">Logga ut</button></div>
    <div class="panel"><h2>Lärarvy – skolan</h2>
    <div class="kids">${classes.map(c => `<button class="kid ${c.id===tState.classId?'on':''}" data-c="${c.id}">${esc(c.name)} <small>(${c.n})</small></button>`).join('')}
      <form id="nc" class="inl-form"><input class="tin" id="ncn" maxlength="60" placeholder="Ny klass, t.ex. 2B"><button class="btn small" type="submit">Skapa klass</button></form></div>
    ${detail}</div>`;
  document.getElementById('back').onclick = showProfiles;
  document.getElementById('logout').onclick = async () => { await api('logout', {}, tToken.get()); tToken.set(null); showProfiles(); };
  document.getElementById('pw').onclick = changePassword;
  app.querySelectorAll('.kid[data-c]').forEach(b => b.onclick = () => showTeacher(+b.dataset.c));
  document.getElementById('nc').onsubmit = async e => {
    e.preventDefault(); const name = document.getElementById('ncn').value.trim(); if(!name) return;
    const r = await tapi('class_create', {name}); if(r.ok) showTeacher(r.class.id); else alert(r.error);
  };
  if(cd && cd.ok) wireClass(cd);
  keyHandler = null;
}

function classHTML(cd){
  const c = cd.class, ss = cd.students, sel = ss.find(s => s.id === tState.studentId);
  const here = store.cloud && store.cloud.code === c.code;
  const rows = ss.map(s => {
    const pt = progressText(s.data), weak = weakSkills(s.data.stats);
    return `<tr class="srow ${sel && sel.id===s.id ? 'on' : ''}" data-s="${s.id}"><td>${avatarSVG(s.avatar,34)}</td><td><b>${esc(s.name)}</b>${s.locked ? ' <span class="st s1">Låst</span>' : ''}</td>
      <td class="pics">${picsHTML(s.pics)}</td><td>${pt.text}</td><td><span class="stars">★</span>${starCount(s.data)}</td>
      <td>${weak.length ? `<span class="st s1">${weak.length} att träna</span>` : (Object.keys(s.data.stats||{}).length ? '<span class="st s3">Bra</span>' : '<span class="st s0">Inte börjat</span>')}</td></tr>`;
  }).join('');
  return `<div class="classtop"><div><div class="note">Klasskod</div><div class="bigcode">${c.code}</div></div>
      <div class="btns" style="display:flex;gap:8px;flex-wrap:wrap">
        <button class="btn small" id="cards">Skriv ut inloggningskort</button>
        <button class="btn secondary small" id="usehere">${here ? 'Den här datorn visar klassen ✓' : 'Visa klassen på den här datorn'}</button>
        <button class="btn secondary small" id="ren">Byt namn</button><button class="btn secondary small" id="cdel" style="background:#f6d0d0">Ta bort klassen</button></div></div>
    ${here ? `<label class="note" style="display:block;margin:6px 0"><input type="checkbox" id="schoolonly" ${store.schoolOnly?'checked':''}> Dölj "På den här datorn" på startsidan (bara klassens elever syns)</label>` : ''}
    <h3>Elever (${ss.length})</h3>
    ${ss.length ? `<table class="areas stable"><tr><th></th><th>Namn</th><th>Bildkod</th><th>Är nu i</th><th>Stjärnor</th><th>Läge</th></tr>${rows}</table><p class="note">Klicka på en elev för att se resultat och ändra inställningar.</p>` : '<p>Inga elever än.</p>'}
    ${sel ? studentHTML(sel) : ''}
    <h3>Lägg till elever</h3><p class="note">Skriv ett namn per rad. Använd gärna bara förnamn. Varje elev får en egen bildkod.</p>
    <textarea id="names" class="tin" rows="4" placeholder="Ida&#10;Omar&#10;Lisa B"></textarea><br><button class="btn small" id="addst">Lägg till</button>`;
}
function studentHTML(s){
  return `<div class="sdetail"><div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap">${avatarSVG(s.avatar,64)}<div><h2 style="margin:0">${esc(s.name)}</h2><div>Bildkod: ${picsHTML(s.pics,36)}</div></div></div>
    <h3>Öppna världar</h3><p class="note">Välj den värld ${esc(s.name)} ska kunna börja i. Värld 1–2 ≈ åk 1, värld 3–4 ≈ åk 2, värld 5–7 ≈ åk 3.</p>
    <div class="wbtns" id="wb">${WORLDS.map((w,i) => `<button data-w="${i}" class="${s.unlocked===i?'on':''}">${i+1}. ${w.short}</button>`).join('')}</div>
    ${resultsHTML(s.data.stats)}
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px">
      ${s.locked ? '<button class="btn small" id="sunlock">Lås upp inloggningen</button>' : ''}
      <button class="btn secondary small" id="snewpics">Ny bildkod</button><button class="btn secondary small" id="sname">Byt namn</button>
      <button class="btn secondary small" id="sreset">Nollställ resultat</button><button class="btn secondary small" id="sdel" style="background:#f6d0d0">Ta bort eleven</button></div></div>`;
}
function wireClass(cd){
  const c = cd.class, sel = cd.students.find(s => s.id === tState.studentId);
  const reload = () => showTeacher(c.id, tState.studentId);
  app.querySelectorAll('.srow').forEach(r => r.onclick = () => showTeacher(c.id, +r.dataset.s === tState.studentId ? null : +r.dataset.s));
  document.getElementById('cards').onclick = () => printCards(cd);
  document.getElementById('usehere').onclick = () => { store.cloud = {code:c.code, name:c.name, students:cd.students.map(s => ({id:s.id, name:s.name, avatar:s.avatar}))}; saveStore(); reload(); };
  const so = document.getElementById('schoolonly'); if(so) so.onchange = () => { store.schoolOnly = so.checked; saveStore(); };
  document.getElementById('ren').onclick = async () => { const n = prompt('Nytt namn på klassen:', c.name); if(n && n.trim()){ await tapi('class_rename', {class_id:c.id, name:n.trim()}); reload(); } };
  document.getElementById('cdel').onclick = async () => {
    const n = prompt(`Allt för klass ${c.name} raderas, även elevernas resultat. Skriv klassens namn för att bekräfta:`);
    if(n !== null && n.trim() === c.name){ await tapi('class_delete', {class_id:c.id}); if(store.cloud && store.cloud.code === c.code){ store.cloud = null; saveStore(); } showTeacher(null); }
    else if(n !== null) alert('Namnet stämde inte. Inget har tagits bort.');
  };
  document.getElementById('addst').onclick = async () => {
    const names = document.getElementById('names').value.split('\n').map(x => x.trim()).filter(Boolean);
    if(!names.length) return;
    const r = await tapi('students_add', {class_id:c.id, names}); if(!r.ok) alert(r.error); reload();
  };
  if(!sel) return;
  const upd = async data => { const r = await tapi('student_update', {student_id:sel.id, ...data}); if(!r.ok) alert(r.error); reload(); };
  app.querySelectorAll('#wb button').forEach(b => b.onclick = () => upd({unlocked:+b.dataset.w}));
  const un = document.getElementById('sunlock'); if(un) un.onclick = () => upd({unlock:true});
  document.getElementById('snewpics').onclick = () => { if(confirm(`Ge ${sel.name} en ny bildkod? Den gamla slutar fungera.`)) upd({new_pics:true}); };
  document.getElementById('sname').onclick = () => { const n = prompt('Nytt namn:', sel.name); if(n && n.trim()) upd({name:n.trim()}); };
  document.getElementById('sreset').onclick = () => { if(confirm(`Nollställ ${sel.name}s resultat i lärarvyn? Stjärnor och öppna rum påverkas inte.`)) upd({reset_stats:true}); };
  document.getElementById('sdel').onclick = async () => {
    if(confirm(`Ta bort ${sel.name}? Allt som eleven har klarat raderas.`)){ await tapi('student_delete', {student_id:sel.id}); showTeacher(c.id, null); }
  };
}

function printCards(cd){
  const url = location.href.replace(/[?#].*$/, '').replace(/index\.html$/, '');
  const ov = document.createElement('div'); ov.className = 'printwrap';
  ov.innerHTML = `<div class="noprint" style="display:flex;gap:10px;justify-content:center;margin:12px"><button class="btn" id="pr">Skriv ut</button><button class="btn secondary" id="pc">Stäng</button></div>
    <div class="cards">${cd.students.map(s => `<div class="lcard"><div class="lc-top">${avatarSVG(s.avatar,58)}<div><div class="lc-name">${esc(s.name)}</div><div class="lc-game">Underverkens gåtor</div></div></div>
      <div class="lc-row"><span>Klasskod</span><b>${cd.class.code}</b></div>
      <div class="lc-row"><span>Mina bilder</span><span class="lc-pics">${s.pics.map((i,k) => `<span><small>${k+1}</small>${glyph(PIC_SET[i],40)}</span>`).join('')}</span></div>
      <div class="lc-url">${esc(url)}</div></div>`).join('')}</div>`;
  document.body.appendChild(ov); document.body.classList.add('printing');
  const close = () => { ov.remove(); document.body.classList.remove('printing'); };
  ov.querySelector('#pr').onclick = () => window.print();
  ov.querySelector('#pc').onclick = close;
}

function changePassword(){
  const ov = overlay(`<h2>Byt lösenord</h2><form id="pf" style="text-align:left">
    <label class="lbl">Nuvarande lösenord<input class="tin" type="password" id="po" autocomplete="current-password" required></label>
    <label class="lbl">Nytt lösenord (minst 10 tecken)<input class="tin" type="password" id="pn" autocomplete="new-password" minlength="10" required></label>
    <p class="msg" id="pm"></p><div class="btns"><button type="button" class="btn secondary" id="pcx">Avbryt</button><button class="btn" type="submit">Spara</button></div></form>`);
  const close = () => ov.remove();
  ov.querySelector('#pcx').onclick = close;
  ov.querySelector('#pf').onsubmit = async e => {
    e.preventDefault();
    const r = await tapi('teacher_password', {old:ov.querySelector('#po').value, new:ov.querySelector('#pn').value});
    if(r.ok){ close(); alert('Lösenordet är bytt.'); } else ov.querySelector('#pm').textContent = r.error;
  };
  ov.querySelector('#po').focus();
}
