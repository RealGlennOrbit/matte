'use strict';
/* ================= Motor: ringtornet ================= */
function runHanoi(el, n, done, onEsc){
  let pegs, sel, moves, invalid, hints, finished, hl = null;
  const minMoves = 2**n - 1;
  const colors = ['#e0a526','#2e9e4f','#2f6fd6','#d64545','#8e44ad'];
  function reset(){ pegs = [repeat(n, k => n-k), [], []]; sel = null; moves = 0; finished = false; hl = null; }
  reset(); invalid = 0; hints = 0;
  el.innerHTML = `<p class="ask" style="text-align:center;margin:0 auto">Flytta alla ringar till det <b style="color:#2e9e4f">gröna</b> tornet. En stor ring får aldrig ligga på en mindre ring.</p>
    <div class="hanoi" id="hn"></div><div class="msg" id="msg"></div>
    <div class="tools"><span style="font-weight:bold;font-size:1.2rem" id="mv"></span><button class="btn secondary small" id="lamp">Ledtråd</button><button class="btn secondary small" id="rs">Börja om</button></div>
    <p class="keys">Klicka på ett torn för att ta en ring. Klicka på ett annat torn för att lägga den där. Tangenter: 1, 2, 3.</p>`;
  const hn = el.querySelector('#hn'), msg = el.querySelector('#msg'), mv = el.querySelector('#mv');
  const say = (t, good) => { msg.textContent = t; msg.className = 'msg' + (good ? ' good' : ''); };
  function draw(){
    hn.innerHTML = pegs.map((pg,i) => `<button class="peg ${i===2?'target':''} ${sel===i?'sel':''} ${hl&&hl.to===i?'goal':''}" data-i="${i}" aria-label="Torn ${i+1}">
      <span class="pole"></span><span class="base"></span>
      <span class="stack">${pg.map((s,k) => `<span class="ring ${sel===i&&k===pg.length-1?'lift':''} ${hl&&hl.ring===s?'glow':''}" style="width:${28 + s*(66/n)}%;background:${colors[s-1]}"></span>`).join('')}</span>
      <span class="num">${i===2 ? 'Mål · ' : ''}${i+1}</span></button>`).join('');
    hn.querySelectorAll('.peg').forEach(b => b.onclick = () => click(+b.dataset.i));
    mv.textContent = `Drag: ${moves}  (bästa: ${minMoves})`;
  }
  function nextMove(){
    const pos = {}; pegs.forEach((pg,i) => pg.forEach(s => pos[s] = i));
    const nm = (k, target) => { if(k === 0) return null; if(pos[k] === target) return nm(k-1, target); const other = 3 - pos[k] - target; return nm(k-1, other) || {ring:k, from:pos[k], to:target}; };
    return nm(n, 2);
  }
  function hint(){ const m = nextMove(); if(!m) return; hints++; sel = null; hl = m; say(`Ledtråd: flytta den ring som lyser till torn ${m.to+1}.`, true); draw(); }
  function click(i){
    if(finished) return;
    if(sel === null){ if(pegs[i].length){ sel = i; sfx.click(); say(''); } }
    else if(sel === i){ sel = null; }
    else {
      const r = pegs[sel][pegs[sel].length-1], top = pegs[i][pegs[i].length-1];
      if(top && top < r){
        invalid++; sfx.bad(); say('Oj! En stor ring kan inte ligga på en liten.'); sel = null;
        hn.classList.remove('shake'); void hn.offsetWidth; hn.classList.add('shake');
        if(invalid % 2 === 0){ draw(); hint(); return; }
      } else {
        pegs[i].push(pegs[sel].pop()); moves++; sel = null; hl = null; sfx.click();
        if(pegs[2].length === n){
          finished = true; draw(); say('Alla ringar är på plats!', true); praise();
          const extra = moves - minMoves, stars = extra <= 2 && hints === 0 ? 3 : (extra <= minMoves && hints <= 3 ? 2 : 1);
          record('logik', stars === 3);
          setTimeout(() => done(stars), 900); return;
        }
      }
    }
    draw();
  }
  el.querySelector('#lamp').onclick = hint;
  el.querySelector('#rs').onclick = () => { reset(); say(''); draw(); };
  keyHandler = e => { if(e.key === 'Escape') onEsc(); else if(['1','2','3'].includes(e.key)) click(+e.key - 1); };
  draw();
}

/* ================= Rutnät (gemensamt) ================= */
function parseMap(m){
  const S = {walls:new Set(), plates:[], blocks:[], p:null, g:null, w:m[0].length, h:m.length};
  m.forEach((row,y) => [...row].forEach((c,x) => {
    if(c === '#') S.walls.add(x+','+y);
    if(c === 'X') S.plates.push([x,y]);
    if(c === 'B') S.blocks.push([x,y]);
    if(c === 'P' || c === 'S') S.p = [x,y];
    if(c === 'G') S.g = [x,y];
  }));
  return S;
}
function cellSize(el, w, side){ const avail = el.clientWidth - (el.clientWidth > 720 ? side : 20); return Math.max(32, Math.min(62, Math.floor(Math.min(avail, 560) / w))); }

/* ================= Motor: stenblocken ================= */
function runPush(el, levels, done, onEsc){
  let li = 0, restarts = 0, hinted = false, S, hist, busy = false;
  const load = () => { S = parseMap(levels[li].map); hist = []; };
  el.innerHTML = `<div class="pips" id="lv"></div><div class="pushwrap"><div class="grid" id="gr"></div>
    <div class="pad"><button class="u" data-d="0,-1" aria-label="Upp">↑</button><button class="l" data-d="-1,0" aria-label="Vänster">←</button><button class="r" data-d="1,0" aria-label="Höger">→</button><button class="d" data-d="0,1" aria-label="Ner">↓</button></div></div>
    <div class="msg" id="msg"></div><div class="hint" id="hi" hidden></div>
    <div class="tools"><button class="btn secondary small" id="lamp">Ledtråd</button><button class="btn secondary small" id="un">Ångra</button><button class="btn secondary small" id="rs">Börja om</button></div>
    <p class="keys">Gå med pilarna (eller W A S D), med knapparna, eller klicka bredvid din figur.</p>`;
  const gr = el.querySelector('#gr'), msg = el.querySelector('#msg'), hi = el.querySelector('#hi');
  const isBlock = (x,y) => S.blocks.findIndex(b => b[0]===x && b[1]===y);
  const onPlate = (x,y) => S.plates.some(p => p[0]===x && p[1]===y);
  function draw(){
    const c = cellSize(el, S.w, 240);
    gr.style.setProperty('--c', c+'px'); gr.style.gridTemplateColumns = `repeat(${S.w}, ${c}px)`;
    let h = '';
    for(let y=0;y<S.h;y++) for(let x=0;x<S.w;x++){
      h += `<div class="t ${S.walls.has(x+','+y)?'wall':'floor'} ${onPlate(x,y)?'plate':''}" data-x="${x}" data-y="${y}">`;
      if(isBlock(x,y) >= 0) h += `<span class="block ${onPlate(x,y)?'on':''}"></span>`;
      if(S.p[0]===x && S.p[1]===y) h += `<span class="me">${avatarSVG(player.avatar, Math.round(c*.92))}</span>`;
      h += '</div>';
    }
    gr.innerHTML = h;
    gr.querySelectorAll('.t.floor').forEach(t => t.onclick = () => { const dx = +t.dataset.x - S.p[0], dy = +t.dataset.y - S.p[1]; if(Math.abs(dx) + Math.abs(dy) === 1) move(dx, dy); });
    el.querySelector('#lv').innerHTML = levels.map((_,k) => `<span class="pip ${k<li?'done':(k===li?'now':'')}"></span>`).join('');
  }
  function move(dx, dy){
    if(busy) return;
    const nx = S.p[0]+dx, ny = S.p[1]+dy;
    if(S.walls.has(nx+','+ny)){ sfx.bad(); return; }
    const bi = isBlock(nx, ny), snap = {p:[...S.p], blocks:S.blocks.map(b => [...b])};
    if(bi >= 0){
      const tx = nx+dx, ty = ny+dy;
      if(S.walls.has(tx+','+ty) || isBlock(tx,ty) >= 0){ sfx.bad(); msg.textContent = 'Den sitter fast åt det hållet.'; msg.className = 'msg'; return; }
      S.blocks[bi] = [tx, ty]; tone(160,.12,'triangle',0,.12);
    }
    hist.push(snap); S.p = [nx, ny]; msg.textContent = ''; draw();
    if(S.plates.every(p => isBlock(p[0],p[1]) >= 0)){
      busy = true; sfx.ok(); praise();
      if(li < levels.length - 1){
        msg.textContent = 'Bra! En dörr till öppnas…'; msg.className = 'msg good';
        setTimeout(() => { li++; hinted = false; hi.hidden = true; load(); busy = false; msg.textContent = ''; draw(); }, 1200);
      } else { const st = restarts === 0 ? 3 : restarts <= 2 ? 2 : 1; record('logik', st === 3); setTimeout(() => done(st), 900); }
    }
  }
  const showHint = () => { hi.innerHTML = `<p>${levels[li].hint}</p>`; hi.hidden = false; hinted = true; };
  el.querySelectorAll('.pad button').forEach(b => b.onclick = () => { const [dx,dy] = b.dataset.d.split(',').map(Number); move(dx,dy); });
  el.querySelector('#un').onclick = () => { if(busy || !hist.length) return; const s = hist.pop(); S.p = s.p; S.blocks = s.blocks; draw(); };
  el.querySelector('#rs').onclick = () => { if(busy) return; restarts++; load(); draw(); if(restarts >= 2 && !hinted) showHint(); };
  el.querySelector('#lamp').onclick = () => { if(!hinted){ restarts++; showHint(); } };
  keyHandler = e => {
    if(e.key === 'Escape'){ onEsc(); return; }
    const d = {ArrowUp:[0,-1], ArrowDown:[0,1], ArrowLeft:[-1,0], ArrowRight:[1,0], w:[0,-1], s:[0,1], a:[-1,0], d:[1,0], W:[0,-1], S:[0,1], A:[-1,0], D:[1,0]}[e.key];
    if(d){ e.preventDefault(); move(d[0], d[1]); }
    if(e.key === 'z' || e.key === 'Backspace') el.querySelector('#un').click();
  };
  load(); draw();
}

/* ================= Motor: programmering ================= */
function runProg(el, levels, rep, done, onEsc){
  let li = 0, S, pos, program = [], mult = 1, running = false, fails = 0, firstRun = true, hinted = false, cur = -1;
  const ARW = {r:['→',1,0], l:['←',-1,0], u:['↑',0,-1], d:['↓',0,1]};
  el.innerHTML = `<div class="pips" id="lv"></div><div class="pushwrap"><div class="grid" id="gr"></div>
    <div class="progside"><b>Ditt program <span id="cnt"></span></b><div class="pstrip" id="ps"></div>
      ${rep ? `<div class="mults">Antal steg: ${[1,2,3,4,5,6,7].map(n => `<button data-m="${n}">${n}</button>`).join('')}</div>` : ''}
      <div class="pad"><button class="u" data-a="u" aria-label="Upp">↑</button><button class="l" data-a="l" aria-label="Vänster">←</button><button class="r" data-a="r" aria-label="Höger">→</button><button class="d" data-a="d" aria-label="Ner">↓</button></div>
      <div class="tools" style="margin:0"><button class="btn small" id="run">Kör ▶</button><button class="btn secondary small" id="del">Sudda</button><button class="btn secondary small" id="clr">Rensa</button></div>
    </div></div>
    <div class="msg" id="msg"></div><div class="hint" id="hi" hidden></div>
    <div class="tools"><button class="btn secondary small" id="lamp">Ledtråd</button></div>
    <p class="keys">Bygg programmet först, tryck sedan Kör. Tangenter: pilar = lägg till${rep ? ', 1–7 = antal steg' : ''}, Backspace = sudda, Enter = kör.</p>`;
  const gr = el.querySelector('#gr'), ps = el.querySelector('#ps'), msg = el.querySelector('#msg'), hi = el.querySelector('#hi'), cnt = el.querySelector('#cnt');
  const say = (t, good) => { msg.textContent = t; msg.className = 'msg' + (good ? ' good' : ''); };
  const load = () => { S = parseMap(levels[li].map); pos = [...S.p]; program = []; firstRun = true; cur = -1; };
  function draw(){
    const c = cellSize(el, S.w, 500);
    gr.style.setProperty('--c', c+'px'); gr.style.gridTemplateColumns = `repeat(${S.w}, ${c}px)`;
    let h = '';
    for(let y=0;y<S.h;y++) for(let x=0;x<S.w;x++){
      h += `<div class="t ${S.walls.has(x+','+y)?'wall':'floor'}">`;
      if(S.g[0]===x && S.g[1]===y) h += `<span class="goalc">${glyph('kista', Math.round(c*.8))}</span>`;
      if(pos[0]===x && pos[1]===y) h += `<span class="me">${avatarSVG(player.avatar, Math.round(c*.92))}</span>`;
      h += '</div>';
    }
    gr.innerHTML = h;
    ps.innerHTML = program.length ? program.map((c,k) => `<span class="cmd ${k===cur?'now':''}">${c.n>1 ? c.n+' ' : ''}${ARW[c.d][0]}</span>`).join('') : '<span style="opacity:.5">Tomt – lägg till pilar</span>';
    cnt.textContent = `(${program.length} av max ${levels[li].max})`;
    el.querySelector('#lv').innerHTML = levels.map((_,k) => `<span class="pip ${k<li?'done':(k===li?'now':'')}"></span>`).join('');
    el.querySelectorAll('.mults button').forEach(b => b.classList.toggle('on', +b.dataset.m === mult));
  }
  function add(d){
    if(running) return;
    if(program.length >= levels[li].max){ sfx.bad(); say(`Du får bara använda ${levels[li].max} kommandon.`); return; }
    program.push({d, n: rep ? mult : 1}); sfx.click(); say(''); draw();
  }
  function fail(t){
    running = false; fails++; if(firstRun){ record('program', false); firstRun = false; }
    sfx.bad(); say(t + ' Ändra programmet och försök igen.');
    if(fails >= 2 && !hinted){ hi.innerHTML = `<p>${levels[li].hint}</p>`; hi.hidden = false; hinted = true; }
    setTimeout(() => { pos = [...S.p]; cur = -1; draw(); }, 1100);
  }
  function run(){
    if(running || !program.length) return;
    running = true; pos = [...S.p]; say('');
    const steps = []; program.forEach((c,k) => { for(let s=0;s<c.n;s++) steps.push([c.d,k]); });
    let si = 0;
    const tick = () => {
      if(si >= steps.length){
        cur = -1;
        if(pos[0]===S.g[0] && pos[1]===S.g[1]){
          running = false; if(firstRun){ record('program', true); firstRun = false; }
          sfx.ok(); praise();
          if(li < levels.length - 1){ say('Programmet fungerade! Nästa bana…', true); setTimeout(() => { li++; hinted = false; hi.hidden = true; load(); draw(); say(''); }, 1300); }
          else { const st = fails === 0 ? 3 : fails <= 2 ? 2 : 1; setTimeout(() => done(st), 900); }
        } else { draw(); fail('Figuren kom inte fram till kistan.'); }
        return;
      }
      const [d,k] = steps[si++], [,dx,dy] = ARW[d], n = [pos[0]+dx, pos[1]+dy];
      cur = k;
      if(S.walls.has(n[0]+','+n[1])){ draw(); fail('Aj! Figuren gick in i en vägg.'); return; }
      pos = n; tone(400 + si*20, .06, 'triangle', 0, .06); draw(); setTimeout(tick, 330);
    };
    tick();
  }
  el.querySelectorAll('.pad button').forEach(b => b.onclick = () => add(b.dataset.a));
  el.querySelectorAll('.mults button').forEach(b => b.onclick = () => { mult = +b.dataset.m; draw(); });
  el.querySelector('#run').onclick = run;
  el.querySelector('#del').onclick = () => { if(!running){ program.pop(); draw(); } };
  el.querySelector('#clr').onclick = () => { if(!running){ program = []; draw(); } };
  el.querySelector('#lamp').onclick = () => { if(!hinted){ fails++; hi.innerHTML = `<p>${levels[li].hint}</p>`; hi.hidden = false; hinted = true; } };
  keyHandler = e => {
    if(e.key === 'Escape'){ onEsc(); return; }
    const m = {ArrowUp:'u', ArrowDown:'d', ArrowLeft:'l', ArrowRight:'r'}[e.key];
    if(m){ e.preventDefault(); add(m); }
    else if(rep && /^[1-7]$/.test(e.key)){ mult = +e.key; draw(); }
    else if(e.key === 'Backspace'){ e.preventDefault(); if(!running){ program.pop(); draw(); } }
    else if(e.key === 'Enter'){ e.preventDefault(); run(); }
  };
  load(); draw();
}
