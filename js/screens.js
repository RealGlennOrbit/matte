'use strict';
/* ================= Skärm: profiler ================= */
function showProfiles(){
  player = null; setTheme('menu');
  const list = store.profiles.filter(p => !p.cloud).sort((a,b) => (b.last||0) - (a.last||0));
  const showLocal = !(cloudOn() && store.schoolOnly);
  app.innerHTML = topbar((/^https?:/.test(location.protocol) && location.pathname.replace(/index\.html$/, '') !== '/' ? '<a class="btn secondary small" href="../">← Alla spel</a>' : '') + '<button class="btn secondary small" id="adult">Vuxen</button>') + `<h1>Underverkens gåtor</h1><p class="center" style="font-size:1.4rem;font-weight:bold;color:#5a3a12;margin:0">Antikens sju underverk · Vem spelar idag?</p>
    ${classSectionHTML()}
    ${showLocal ? `${cloudOn() ? '<h2 class="localhead">På den här datorn</h2>' : ''}<div class="profiles">${list.map(p => {
      const c = curWorld(p), done = (p.progress && p.progress.faros && p.progress.faros.done >= roomCount(6));
      return `<div style="position:relative"><button class="pcard" data-id="${p.id}">${avatarSVG(p.avatar,96)}<div>${esc(p.name)}</div><div class="sub">${done ? 'Mattemästare!' : `${WORLDS[c.w].short}: rum ${Math.min(roomCount(c.w),c.room+1)}`} · <span class="stars">★</span>${totalStars(p)}</div></button><button class="del" data-del="${p.id}" aria-label="Ta bort ${esc(p.name)}">×</button></div>`;
    }).join('')}
    ${list.length < 40 ? '<button class="pcard new" id="newp"><span class="plus">+</span>Ny spelare</button>' : ''}</div>` : ''}`;
  wireTop();
  app.querySelectorAll('.pcard[data-id]').forEach(b => b.onclick = () => {
    const p = store.profiles.find(x => x.id === b.dataset.id); sfx.click();
    if(p) openLocalProfile(p);
  });
  app.querySelectorAll('[data-del]').forEach(b => b.onclick = () => askCode(() => confirmDelete(b.dataset.del), 'Ta bort en spelare'));
  document.getElementById('newp') && (document.getElementById('newp').onclick = showNewProfile);
  document.getElementById('adult').onclick = () => cloudOn() ? showAdultChoice() : askCode(showAdult, 'Lärarvy');
  keyHandler = null;
  wireClassSection();
  const first = app.querySelector('.pcard'); if(first) first.focus({preventScroll:true});
}
function confirmDelete(id){
  const p = store.profiles.find(x => x.id === id); if(!p) return;
  const ov = overlay(`${avatarSVG(p.avatar,90)}<h2>Ta bort ${esc(p.name)}?</h2><p style="font-size:1.2rem">Allt som ${esc(p.name)} har sparat försvinner.</p><div class="btns"><button class="btn secondary" id="no">Nej</button><button class="btn" id="yes" style="background:#e46b6b;box-shadow:0 4px 0 #9a2d2d">Ja, ta bort</button></div>`);
  const close = () => { ov.remove(); keyHandler = null; };
  ov.querySelector('#no').onclick = close;
  ov.querySelector('#yes').onclick = () => { store.profiles = store.profiles.filter(x => x.id !== id); saveStore(); close(); if(document.body.classList.contains('adult')) showAdult(); else showProfiles(); };
  ov.querySelector('#no').focus();
  keyHandler = e => { if(e.key === 'Escape') close(); };
}
function showNewProfile(){
  setTheme('menu'); let av = rnd(0, AVATARS.length-1);
  app.innerHTML = topbar('<button class="btn secondary small" id="back">← Tillbaka</button>') + `<div class="panel"><h2>Ny spelare</h2>
    <p style="font-size:1.3rem;font-weight:bold;margin-bottom:6px">Vad heter du?</p>
    <input class="nameinput" id="nm" maxlength="14" autocomplete="off" placeholder="Ditt namn">
    <p style="font-size:1.3rem;font-weight:bold;margin:18px 0 0">Välj din figur:</p>
    <div class="avatars">${AVATARS.map((a,i) => `<button class="avbtn" data-i="${i}">${avatarSVG(i,96)}<div>${a.name}</div></button>`).join('')}</div>
    <div class="center"><button class="btn" id="go" disabled>Börja spela!</button></div>
    <p class="note center">Går du i åk 2 eller åk 3? Be en vuxen öppna en senare värld åt dig.</p></div>`;
  wireTop();
  const nm = document.getElementById('nm'), go = document.getElementById('go');
  const mark = () => app.querySelectorAll('.avbtn').forEach(b => b.classList.toggle('on', +b.dataset.i === av));
  mark();
  app.querySelectorAll('.avbtn').forEach(b => b.onclick = () => { av = +b.dataset.i; mark(); sfx.click(); });
  nm.oninput = () => go.disabled = !nm.value.trim();
  const create = () => {
    const name = nm.value.trim(); if(!name){ nm.focus(); return; }
    const p = {id:'p'+Date.now().toString(36)+rnd(100,999), name, avatar:av, progress:{}, stats:{}, unlocked:0, seen:{}, created:Date.now(), last:Date.now()};
    const start = () => { store.profiles.push(p); player = p; saveStore(); sfx.ok(); showMap(0); };
    if(localLockOn()) chooseLock(p, start, () => {}); else start();
  };
  go.onclick = create;
  document.getElementById('back').onclick = showProfiles;
  keyHandler = e => { if(e.key === 'Enter' && document.activeElement === nm) create(); if(e.key === 'Escape') showProfiles(); };
  nm.focus();
}

/* ================= Skärm: karta ================= */
function showFacts(wi, then){
  const w = WORLDS[wi];
  const ov = overlay(`<div class="temple-art">${w.art}</div><h2>${w.name}</h2><ul class="fact">${w.facts.map(f => `<li>${f}</li>`).join('')}</ul><div class="btns"><button class="btn" id="ok">Spela!</button></div>`);
  const prev = keyHandler;
  const close = () => { ov.remove(); keyHandler = prev; if(then) then(); };
  ov.querySelector('#ok').onclick = close; ov.querySelector('#ok').focus();
  keyHandler = e => { if(e.key === 'Escape'){ e.preventDefault(); close(); } };
}
function showMap(wi){
  if(!worldOpen(wi)) wi = 0;
  const W = WORLDS[wi], p = prog(wi);
  setTheme('w'+wi);
  app.innerHTML = topbar('<button class="btn secondary small" id="back">← Byt spelare</button>') + `
    <div class="worlds">${WORLDS.map((w,i) => `<button class="wtab ${i===wi?'on':''} ${worldDone(i)?'done':''}" data-w="${i}" ${worldOpen(i)?'':'disabled'}><span class="wn">${worldOpen(i)?i+1:lockSVG}</span>${w.short}</button>`).join('')}</div>
    <div class="panel"><div class="temple-art">${W.art}</div>
    <div class="maphead"><h2 style="margin:0">${W.name}</h2><span class="grade">${W.grade}</span><button class="btn secondary small" id="facts">Om underverket</button><button class="btn small" id="train">Träningsrummet</button></div>
    <p class="center" style="font-size:1.25rem;font-weight:bold;margin:-6px 0 22px">${p.done >= W.rooms.length ? (wi < 6 ? 'Klart! Nästa underverk är öppet.' : 'Du har klarat alla sju underverken!') : `Rum ${p.done+1} väntar på dig!`}</p>
    <div class="rooms">${W.rooms.map((r,i) => {
      const st = i < p.done ? 'done' : (i === p.done ? 'current' : 'locked');
      return `<button class="room-tile ${st}" data-i="${i}" ${st==='locked'?'disabled':''}><span class="n">${i+1}</span>
        ${st==='current' ? `<span class="here">${avatarSVG(player.avatar,54)}</span>` : ''}
        ${st==='locked' ? lockSVG : roomIcon(r.icon,48)}<span>${r.name}</span>${st==='done' ? starsHtml(p.stars[i]||0) : ''}</button>`;
    }).join('')}</div>
    <p class="keys">Klicka på ett rum, eller tryck Enter för att gå in i nästa rum.</p></div>`;
  wireTop();
  document.getElementById('back').onclick = showProfiles;
  document.getElementById('facts').onclick = () => showFacts(wi);
  document.getElementById('train').onclick = () => showPractice(wi);
  app.querySelectorAll('.wtab').forEach(b => b.onclick = () => { if(!b.disabled){ sfx.click(); showMap(+b.dataset.w); } });
  app.querySelectorAll('.room-tile').forEach(b => b.onclick = () => { if(!b.disabled){ sfx.click(); showRoom(wi, +b.dataset.i); } });
  keyHandler = e => {
    if(e.key === 'Escape') showProfiles();
    else if(e.key === 'Enter' && !(document.activeElement && document.activeElement.tagName === 'BUTTON')){ if(p.done < W.rooms.length) showRoom(wi, p.done); }
  };
  const cur = app.querySelector('.room-tile.current'); if(cur) cur.focus({preventScroll:true});
  player.seen = player.seen || {};
  if(!player.seen[W.id]){ player.seen[W.id] = true; saveStore(); showFacts(wi); }
}

/* ================= Skärm: rum ================= */
function showRoom(wi, idx){
  setTheme('w'+wi); const W = WORLDS[wi], room = W.rooms[idx];
  app.innerHTML = topbar('<button class="btn secondary small" id="back">← Kartan</button>') + `<div class="panel">
    <div class="roomhead">${roomIcon(room.icon,60)}<div><div class="roomnum">${W.short} · Rum ${idx+1} av ${W.rooms.length}</div><h2>${room.name}</h2></div></div>
    <p class="intro">${room.intro}</p><div class="stage" id="stage"></div></div>`;
  wireTop();
  document.getElementById('back').onclick = () => showMap(wi);
  const stage = document.getElementById('stage');
  const finish = stars => roomDone(wi, idx, stars);
  const back = () => showMap(wi);
  if(room.type === 'quiz'){
    const tasks = room.tasks();
    if(wi > 0 && room.review !== false) tasks.splice(rnd(1, tasks.length), 0, reviewTask(wi));
    runQuiz(stage, tasks, finish, back, W.keypad);
  }
  else if(room.type === 'hanoi') runHanoi(stage, room.rings, finish, back);
  else if(room.type === 'push') runPush(stage, room.levels, finish, back);
  else if(room.type === 'prog') runProg(stage, room.levels, room.repeat, finish, back);
}
function roomDone(wi, idx, stars){
  const p = prog(wi);
  p.stars[idx] = Math.max(p.stars[idx]||0, stars);
  const first = idx === p.done;
  if(first) p.done = idx + 1;
  player.last = Date.now(); saveStore();
  sfx.win();
  const last = idx === WORLDS[wi].rooms.length - 1;
  const ov = overlay(`<div class="door" id="door"><i class="l"></i><i class="r"></i><span class="who">${avatarSVG(player.avatar,110)}</span></div>
    <h2>${last ? 'Du klarade sista rummet!' : 'Dörren öppnas!'}</h2><div class="bigstars">${repeat(3, i => i<stars ? '★' : '<span class="off">★</span>').join('')}</div>
    ${stars < 3 ? '<p style="font-size:1.1rem">Spela rummet igen om du vill samla fler stjärnor!</p>' : ''}<div class="btns"><button class="btn secondary" id="tomap">Kartan</button>${stars < 3 ? '<button class="btn secondary" id="again">Spela igen</button>' : ''}<button class="btn" id="next">${last ? 'Vidare!' : 'Nästa rum →'}</button></div>`);
  setTimeout(() => ov.querySelector('#door').classList.add('open'), 50);
  const next = () => { ov.remove(); if(last && first) showWorldDone(wi); else if(last) showMap(wi); else showRoom(wi, idx+1); };
  ov.querySelector('#next').onclick = next;
  ov.querySelector('#tomap').onclick = () => { ov.remove(); showMap(wi); };
  const ag = ov.querySelector('#again'); if(ag) ag.onclick = () => { ov.remove(); showRoom(wi, idx); };
  ov.querySelector('#next').focus();
  keyHandler = e => { if(e.key === 'Escape'){ ov.remove(); showMap(wi); } };
}
function showWorldDone(wi){
  setTheme('w'+wi); confetti(90); sfx.win();
  const lastW = wi === WORLDS.length - 1, nxt = WORLDS[wi+1];
  app.innerHTML = topbar() + `<div class="panel center"><div class="temple-art">${lastW ? WORLDS[wi].art : nxt.art}</div>
    <h2 style="font-size:2.2rem">${lastW ? `${esc(player.name)} är Mattemästare!` : `Grattis ${esc(player.name)}!`}</h2>
    <p style="font-size:1.4rem">${lastW ? 'Du har klarat alla antikens sju underverk. Uppgifterna i sista världen är på samma nivå som man ska klara i slutet av årskurs 3. Spela gärna rummen igen och samla tre stjärnor i alla!' : `Du har klarat ${WORLDS[wi].name}. Nu reser du vidare till ${nxt.name}!`}</p>
    <div style="margin:10px 0">${avatarSVG(player.avatar,140)}</div>
    <button class="btn" id="go">${lastW ? 'Till kartan' : 'Res vidare!'}</button></div>`;
  wireTop();
  const go = document.getElementById('go'); go.onclick = () => showMap(lastW ? wi : wi+1); go.focus();
  keyHandler = null;
}

/* ================= Skärm: träningsrummet ================= */
function showPractice(wi){
  setTheme('w'+wi);
  let top = 0; for(let i=0;i<WORLDS.length;i++) if(worldOpen(i)) top = i;
  const st = player.stats || {};
  const open = PRACTICE.map((p,i) => ({...p, i})).filter(p => p.w <= top);
  const locked = PRACTICE.length - open.length;
  const groups = Object.entries(AREAS).map(([a, aname]) => {
    const items = open.filter(p => SKILLS[p.skill][0] === a);
    if(!items.length) return '';
    return `<h3 style="margin:16px 0 8px">${aname}</h3><div class="practice">${items.map(p => {
      const weak = skillStatus(st[p.skill])[0] === 1;
      return `<button class="pitem ${weak?'weak':''}" data-i="${p.i}">${p.name}${weak ? '<small>Träna mer!</small>' : ''}</button>`;
    }).join('')}</div>`;
  }).join('');
  app.innerHTML = topbar('<button class="btn secondary small" id="back">← Kartan</button>') + `<div class="panel">
    <div class="roomhead">${roomIcon('dumbbell',60)}<div><h2>Träningsrummet</h2><div class="roomnum">Träna så mycket du vill. Varje omgång har 10 uppgifter.</div></div></div>
    ${groups}${locked ? `<p class="note" style="margin-top:16px">${locked} övningar till blir öppna när du kommer längre i spelet.</p>` : ''}</div>`;
  wireTop();
  document.getElementById('back').onclick = () => showMap(wi);
  app.querySelectorAll('.pitem').forEach(b => b.onclick = () => { sfx.click(); runPracticeSession(wi, PRACTICE[+b.dataset.i]); });
  keyHandler = e => { if(e.key === 'Escape') showMap(wi); };
}
function runPracticeSession(wi, item){
  app.innerHTML = topbar('<button class="btn secondary small" id="back">← Övningar</button>') + `<div class="panel">
    <div class="roomhead">${roomIcon('dumbbell',60)}<div><div class="roomnum">Träningsrummet</div><h2>${item.name}</h2></div></div><div class="stage" id="stage"></div></div>`;
  wireTop();
  const back = () => showPractice(wi);
  document.getElementById('back').onclick = back;
  runQuiz(document.getElementById('stage'), repeat(10, () => item.gen()), stars => {
    sfx.win();
    const ov = overlay(`${avatarSVG(player.avatar,110)}<h2>Bra tränat!</h2><div class="bigstars">${repeat(3, i => i<stars ? '★' : '<span class="off">★</span>').join('')}</div>
      <div class="btns"><button class="btn secondary" id="list">Andra övningar</button><button class="btn" id="again">Träna igen</button></div>`);
    ov.querySelector('#list').onclick = () => { ov.remove(); back(); };
    ov.querySelector('#again').onclick = () => { ov.remove(); runPracticeSession(wi, item); };
    ov.querySelector('#again').focus();
    keyHandler = e => { if(e.key === 'Escape'){ ov.remove(); back(); } };
  }, back, item.w >= 3);
}
