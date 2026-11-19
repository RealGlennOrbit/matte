'use strict';
/* ================= Intro: startskärmen ================= */
/* Visas när spelet öppnas. Klick eller valfri tangent hoppar fram, och sedan startar äventyret. */
function showIntro(onDone){
  const calm = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const title = ['UNDERVERKENS', 'GÅTOR'];   // spelets namn, en rad per ord
  const story = 'Sju underverk. Sju gåtor. Bara den som kan räkna öppnar alla dörrar.';
  const roman = ['I','II','III','IV','V','VI','VII'];
  const el = document.createElement('div');
  el.id = 'intro'; if(calm) el.classList.add('calm');
  el.setAttribute('role', 'dialog'); el.setAttribute('aria-label', 'Underverkens gåtor – start');
  const stars = repeat(110, () => {
    const s = Math.random() < .15 ? 4 : (Math.random() < .5 ? 2 : 3);
    return `<i class="i-star" style="left:${(Math.random()*100).toFixed(1)}%;top:${(Math.random()*68).toFixed(1)}%;width:${s}px;height:${s}px;animation-delay:${(Math.random()*3).toFixed(2)}s;animation-duration:${(2+Math.random()*3).toFixed(2)}s"></i>`;
  }).join('');
  const flies = repeat(16, () => `<i class="i-fly" style="left:${(Math.random()*100).toFixed(1)}%;--dx:${rnd(-80,80)}px;animation-duration:${(7+Math.random()*7).toFixed(1)}s;animation-delay:${(Math.random()*9).toFixed(1)}s"></i>`).join('');
  const pano = WORLDS.map(w => w.art).join('');
  el.innerHTML = `
    <div class="i-sky">${stars}<div class="i-moon"></div><div class="i-shoot"></div></div>
    <div class="i-pano"><div class="i-track">${pano}${pano}</div></div>
    <svg class="i-dunes back" viewBox="0 0 1440 110" preserveAspectRatio="none"><path d="M0 60 C180 20 320 30 480 55 S800 95 980 60 S1300 20 1440 50 V110 H0Z" fill="#6b3a2a"/></svg>
    <svg class="i-dunes front" viewBox="0 0 1440 92" preserveAspectRatio="none"><path d="M0 40 C220 70 400 10 620 35 S1000 80 1200 40 S1380 20 1440 30 V92 H0Z" fill="#3d1f2a"/></svg>
    <div class="i-caravan"><span>${avatarSVG(2,64)}</span><span>${avatarSVG(0,64)}</span><span>${avatarSVG(1,64)}</span></div>
    ${flies}
    <button class="i-skip" type="button">Hoppa över</button>
    <div class="i-center">
      <div class="i-kicker">Ett mattespel genom antikens sju underverk</div>
      <h1 class="i-title" aria-label="${title.join(' ')}">${(() => { let n = 0; return title.map(w => `<span class="i-word">${[...w].map(c => `<span class="i-ch" style="--d:${(.35 + (n++)*.07).toFixed(2)}s" aria-hidden="true">${c}</span>`).join('')}</span>`).join(''); })()}</h1>
      <div class="i-seals">${roman.map((r,i) => `<span class="i-seal" style="--d:${(2 + i*.16).toFixed(2)}s" title="${WORLDS[i].name}">${r}</span>`).join('')}</div>
      <p class="i-story" aria-live="polite"><span class="txt"></span><span class="cur"></span></p>
      <button class="i-start" type="button">Starta äventyret!</button>
      <div class="i-hint">eller tryck på valfri tangent</div>
    </div>
    <div class="i-door l"></div><div class="i-door r"></div>`;
  document.body.appendChild(el);

  const txt = el.querySelector('.i-story .txt');
  let typed = 0, state = 'intro', timers = [];
  const later = (f, ms) => timers.push(setTimeout(f, ms));
  function type(){
    if(state !== 'intro') return;
    txt.textContent = story.slice(0, ++typed);
    if(typed < story.length) later(type, story[typed-1] === '.' ? 320 : 32);
    else ready();
  }
  function ready(){
    if(state !== 'intro') return;
    state = 'ready'; txt.textContent = story;
    el.classList.add('ready');
    el.querySelector('.i-start').focus({preventScroll:true});
  }
  function finishNow(){ timers.forEach(clearTimeout); el.classList.add('done'); ready(); }
  function fanfare(){
    tone(70, .7, 'sine', 0, .25);
    [392, 523, 659, 784].forEach((f,i) => tone(f, .28, 'triangle', .15 + i*.12, .13));
    tone(1047, .9, 'triangle', .68, .14); tone(784, .9, 'sine', .68, .08); tone(523, 1, 'sine', .68, .06);
  }
  function start(){
    if(state === 'leaving') return;
    state = 'leaving'; timers.forEach(clearTimeout);
    fanfare();
    el.classList.add('closing');
    setTimeout(() => {
      onDone();
      el.classList.add('opening');
      setTimeout(() => { el.remove(); }, calm ? 0 : 1050);
    }, calm ? 0 : 560);
  }
  el.addEventListener('click', e => {
    if(e.target.closest('.i-skip')){ start(); return; }
    if(state === 'intro') finishNow(); else start();
  });
  keyHandler = e => {
    if(['Shift','Control','Alt','Meta','Tab'].includes(e.key)) return;
    e.preventDefault();
    if(state === 'intro') finishNow(); else start();
  };
  if(calm) ready(); else later(type, 2300);
}
