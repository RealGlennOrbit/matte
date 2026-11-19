'use strict';
/* ================= Hjälpfunktioner ================= */
const app = document.getElementById('app');
const rnd = (a,b) => a + Math.floor(Math.random()*(b-a+1));
const pick = a => a[Math.floor(Math.random()*a.length)];
function shuffle(a){ for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; }
function esc(s){ return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
const repeat = (n,f) => Array.from({length:n}, (_,i) => f(i));
const sum = a => a.reduce((x,y)=>x+y,0);
function distract(ans, cands, count=3, min=0){
  const s = new Set();
  shuffle(cands.filter(v => v!==ans && v>=min && Number.isInteger(v))).forEach(v => { if(s.size<count) s.add(v); });
  let d = 1;
  while(s.size<count){ [ans+d, ans-d].forEach(v => { if(s.size<count && v>=min && v!==ans) s.add(v); }); d++; }
  return shuffle([ans, ...s]);
}
function mcOpts(ans, pool, n=4){ return shuffle([ans, ...shuffle(pool.filter(x => x!==ans)).slice(0,n-1)]); }
let keyHandler = null;
document.addEventListener('keydown', e => { if(keyHandler) keyHandler(e); });

/* ================= Ljud ================= */
let actx = null;
function tone(f, dur, type='sine', when=0, vol=.15){
  if(store.sound === false) return;
  try{
    actx = actx || new (window.AudioContext||window.webkitAudioContext)();
    const t = actx.currentTime + when, o = actx.createOscillator(), g = actx.createGain();
    o.type = type; o.frequency.value = f;
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(.001, t+dur);
    o.connect(g); g.connect(actx.destination); o.start(t); o.stop(t+dur+.05);
  }catch(e){}
}
const sfx = {
  ok(){ tone(660,.15); tone(880,.25,'sine',.12); },
  bad(){ tone(180,.25,'square',0,.06); },
  click(){ tone(520,.06,'triangle',0,.08); },
  win(){ [523,659,784,1047].forEach((f,i) => tone(f,.35,'triangle',i*.15)); }
};
function praise(){
  const el = document.getElementById('praise');
  el.textContent = pick(['Rätt!','Bra!','Snyggt!','Toppen!','Ja!','Super!']);
  el.classList.add('show'); setTimeout(() => el.classList.remove('show'), 650);
}
function confetti(n=60){
  const cols = ['#e0a526','#2f6fd6','#2e9e4f','#d64545','#8e44ad','#fff'];
  for(let i=0;i<n;i++){
    const c = document.createElement('div'); c.className = 'confetti';
    c.style.left = Math.random()*100 + 'vw'; c.style.background = pick(cols);
    c.style.animationDuration = (1.8+Math.random()*1.8) + 's'; c.style.animationDelay = Math.random()*.6 + 's';
    document.body.appendChild(c); setTimeout(() => c.remove(), 4500);
  }
}
