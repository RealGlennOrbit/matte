'use strict';
/* ================= Motor: frågor ================= */
function runQuiz(el, tasks, done, onEsc, keypad){
  let i = 0, mistakes = 0, wrongHere = 0, locked = false, buf = '', bufT = null, firstTry = true, mode = 'mc';
  el.innerHTML = `<div class="pips">${tasks.map(() => '<span class="pip"></span>').join('')}</div>
    <div class="prompt" id="pr"></div><div class="hint" id="hi" hidden></div><div class="typed" id="ty"></div>
    <div id="ans"></div><div class="tools"><button class="btn secondary small" id="lamp">Ledtråd</button></div><p class="keys" id="kh"></p>`;
  const pr = el.querySelector('#pr'), hi = el.querySelector('#hi'), ans = el.querySelector('#ans'), ty = el.querySelector('#ty'), kh = el.querySelector('#kh');
  let op = null, kd = null;
  function show(){
    const t = tasks[i]; window.__task = t;
    wrongHere = 0; locked = false; buf = ''; firstTry = true; ty.textContent = '';
    mode = keypad && typeof t.answer === 'number' && !t.mcOnly ? 'kp' : 'mc';
    pr.innerHTML = (t.review ? '<div class="revtag">Repetition</div>' : '') + (t.render ? t.render() : t.prompt);
    hi.hidden = true; hi.innerHTML = '';
    if(mode === 'mc'){
      ans.innerHTML = `<div class="opts ${t.optClass||''}" id="op">${t.options.map((v,k) => `<button class="opt" data-k="${k}">${t.fmt ? t.fmt(v) : esc(v)}</button>`).join('')}</div>`;
      op = ans.querySelector('#op'); kd = null;
      op.querySelectorAll('.opt').forEach(b => b.onclick = () => choose(+b.dataset.k));
      kh.textContent = typeof t.options[0] === 'number' ? 'Klicka på svaret. Du kan också skriva siffrorna och trycka Enter, eller använda pilarna.' : 'Klicka på svaret, eller välj med pilarna och tryck Enter.';
    } else {
      ans.innerHTML = `<div class="kp"><div class="kpdisp" id="kd">?</div><div class="kpgrid">${[1,2,3,4,5,6,7,8,9].map(n=>`<button data-n="${n}">${n}</button>`).join('')}<button data-n="del" class="kdel">Sudda</button><button data-n="0">0</button><button data-n="ok" class="ok">OK</button></div></div>`;
      kd = ans.querySelector('#kd'); op = null;
      ans.querySelectorAll('.kpgrid button').forEach(b => b.onclick = () => kpPress(b.dataset.n));
      kh.textContent = 'Skriv ditt svar med knapparna eller tangentbordet och tryck OK (Enter).';
    }
    el.querySelectorAll('.pip').forEach((p,k) => p.className = 'pip' + (k < i ? ' done' : (k === i ? ' now' : '')));
  }
  function showHint(reveal){
    const t = tasks[i];
    if(hi.hidden){ hi.innerHTML = t.hint; hi.hidden = false; }
    if(reveal && !hi.querySelector('.reveal')) hi.insertAdjacentHTML('beforeend', `<p class="reveal">Rätt svar är ${t.answer}. Skriv in det!</p>`);
  }
  function right(){
    const t = tasks[i]; locked = true; sfx.ok(); praise();
    setTimeout(() => { i++; if(i >= tasks.length){ el.querySelectorAll('.pip').forEach(p => p.className = 'pip done'); done(mistakes <= 1 ? 3 : mistakes <= 4 ? 2 : 1); } else show(); }, t.update ? 1400 : 900);
  }
  function wrong(){
    mistakes++; wrongHere++; sfx.bad();
    const sh = op || kd; sh.classList.remove('shake'); void sh.offsetWidth; sh.classList.add('shake');
    if(wrongHere >= 2) showHint(mode === 'kp' && wrongHere >= 3);
  }
  function check(v){
    const t = tasks[i], ok = v === t.answer;
    if(firstTry){ record(t.skill, ok); firstTry = false; }
    return ok;
  }
  function choose(k){
    if(locked) return;
    const t = tasks[i], v = t.options[k], b = op.children[k];
    if(!b || b.disabled) return;
    if(t.update) t.update(pr, v);
    if(check(v)){ b.classList.add('right'); right(); }
    else {
      b.classList.add('wrong'); b.disabled = true; wrong();
      if(t.update) setTimeout(() => { if(!locked) t.update(pr, null); }, 1300);
    }
  }
  function kpPress(n){
    if(locked) return;
    if(n === 'del'){ buf = buf.slice(0,-1); }
    else if(n === 'ok'){
      if(!buf) return;
      const v = +buf, t = tasks[i];
      if(t.update) t.update(pr, v);
      if(check(v)){ kd.className = 'kpdisp good'; right(); return; }
      kd.className = 'kpdisp bad'; wrong(); buf = '';
      setTimeout(() => { if(!locked){ kd.className = 'kpdisp'; kd.textContent = buf || '?'; if(t.update) t.update(pr, null); } }, 700);
      return;
    }
    else if(buf.length < 4){ buf = (buf === '0' ? '' : buf) + n; }
    kd.className = 'kpdisp'; kd.textContent = buf || '?';
  }
  el.querySelector('#lamp').onclick = () => { if(hi.hidden){ mistakes += .5; showHint(false); } };
  function resolveBuf(force){
    const t = tasks[i]; clearTimeout(bufT);
    const idx = t.options.findIndex((v,k) => String(v) === buf && !op.children[k].disabled);
    const longer = t.options.some((v,k) => String(v).startsWith(buf) && String(v) !== buf && !op.children[k].disabled);
    if(idx >= 0 && (force || !longer)){ buf = ''; ty.textContent = ''; choose(idx); return; }
    if(!t.options.some(v => String(v).startsWith(buf)) || force){ buf = ''; ty.textContent = ''; return; }
    bufT = setTimeout(() => resolveBuf(true), 1200);
  }
  keyHandler = e => {
    if(e.key === 'Escape'){ onEsc(); return; }
    if(locked) return;
    const t = tasks[i];
    if(mode === 'kp'){
      if(/^[0-9]$/.test(e.key)) kpPress(e.key);
      else if(e.key === 'Backspace'){ e.preventDefault(); kpPress('del'); }
      else if(e.key === 'Enter'){ e.preventDefault(); kpPress('ok'); }
      return;
    }
    if(/^[0-9]$/.test(e.key) && typeof t.options[0] === 'number'){ buf += e.key; ty.textContent = 'Du skriver: ' + buf; resolveBuf(false); return; }
    if(e.key === 'Enter' && buf){ e.preventDefault(); resolveBuf(true); return; }
    if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)){
      e.preventDefault();
      const bs = [...op.querySelectorAll('.opt:not(:disabled)')]; if(!bs.length) return;
      let k = bs.indexOf(document.activeElement);
      const cols = op.classList.contains('wide') ? 2 : op.classList.contains('three') ? 3 : 4;
      const d = {ArrowLeft:-1, ArrowRight:1, ArrowUp:-cols, ArrowDown:cols}[e.key];
      k = k < 0 ? 0 : Math.max(0, Math.min(bs.length-1, k + (Math.abs(d) > 1 && bs.length <= cols ? Math.sign(d) : d)));
      bs[k].focus();
    }
  };
  show();
}
