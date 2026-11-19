'use strict';
/* ================= Bilder ================= */
const AVATARS = [
  {name:'John', shirt:'#2f6fd6', hat:'cap', hc:'#d93b3b', skin:'#f3c9a0'},
  {name:'Edvin', shirt:'#2e9e4f', hat:'cap', hc:'#f2c81d', skin:'#f3c9a0'},
  {name:'Utforskare', shirt:'#b08a4f', hat:'pith', hc:'#efe2b6', skin:'#d9a477'},
  {name:'Farao', shirt:'#f4f1e6', hat:'farao', hc:'#e8c04a', skin:'#c68b59'},
  {name:'Grek', shirt:'#5b8fd8', hat:'laurel', hc:'#4f9a3a', skin:'#f0c093'},
  {name:'Rymdis', shirt:'#8e44ad', hat:'helmet', hc:'#bfe6ff', skin:'#8d5a3b'},
];
function avatarSVG(i, h=90){
  const a = AVATARS[i] || AVATARS[0]; const w = Math.round(h*0.75);
  let hat = '', over = '';
  if(a.hat==='cap') hat = `<path d="M15 25 Q16 9 30 9 Q44 9 45 25 Z" fill="${a.hc}"/><rect x="36" y="21" width="16" height="5" rx="2.5" fill="${a.hc}"/>`;
  if(a.hat==='pith') hat = `<path d="M17 21 Q18 5 30 5 Q42 5 43 21Z" fill="${a.hc}" stroke="#a8935a" stroke-width="1.5"/><ellipse cx="30" cy="21" rx="21" ry="4.5" fill="${a.hc}" stroke="#a8935a" stroke-width="1.5"/>`;
  if(a.hat==='farao') hat = `<path d="M13 47 L15 22 Q16 9 30 9 Q44 9 45 22 L47 47 L41 47 L40 25 L20 25 L19 47Z" fill="${a.hc}"/><path d="M15 31H20M15 37H20M14 43H19M40 31H45M40 37H45M41 43H46M19 16H41" stroke="#2456a8" stroke-width="3"/>`;
  if(a.hat==='laurel'){ for(let k=0;k<9;k++){ const ang = Math.PI*(1.05+k*0.1125); const x = 30+15*Math.cos(ang), y = 28+15*Math.sin(ang); hat += `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="4" ry="2.2" fill="${a.hc}" transform="rotate(${(ang*180/Math.PI+90).toFixed(0)} ${x.toFixed(1)} ${y.toFixed(1)})"/>`; } }
  if(a.hat==='helmet') over = `<circle cx="30" cy="28" r="19" fill="${a.hc}" opacity=".35" stroke="#7d9db5" stroke-width="2.5"/><path d="M19 19 Q24 13 30 12" stroke="#fff" stroke-width="2.5" fill="none" opacity=".8"/>`;
  return `<svg viewBox="0 0 60 80" width="${w}" height="${h}" aria-hidden="true">
    <rect x="19" y="62" width="9" height="15" rx="3" fill="#3b3b5c"/><rect x="32" y="62" width="9" height="15" rx="3" fill="#3b3b5c"/>
    <rect x="15" y="41" width="30" height="25" rx="9" fill="${a.shirt}" stroke="rgba(0,0,0,.15)"/>
    <circle cx="30" cy="28" r="14" fill="${a.skin}"/>
    <circle cx="25" cy="28" r="2" fill="#222"/><circle cx="35" cy="28" r="2" fill="#222"/>
    <path d="M24 34 Q30 39 36 34" stroke="#222" stroke-width="2" fill="none" stroke-linecap="round"/>
    ${hat}${over}</svg>`;
}
const GLYPHS = {
  sol:'<circle cx="20" cy="20" r="9" fill="#f08a24"/><path d="M20 3v5M20 32v5M3 20h5M32 20h5M8 8l3.5 3.5M28.5 28.5L32 32M8 32l3.5-3.5M28.5 11.5L32 8" stroke="#f08a24" stroke-width="3" stroke-linecap="round"/>',
  pyramid:'<path d="M20 5 L37 34 H3Z" fill="#e0a526" stroke="#8a5d0b" stroke-width="2" stroke-linejoin="round"/><path d="M20 5 L25 34" stroke="#8a5d0b" stroke-width="2"/>',
  vatten:'<polyline points="3,15 9,9 15,15 21,9 27,15 33,9 37,13" fill="none" stroke="#2f7fd6" stroke-width="3.5" stroke-linejoin="round"/><polyline points="3,29 9,23 15,29 21,23 27,29 33,23 37,27" fill="none" stroke="#2f7fd6" stroke-width="3.5" stroke-linejoin="round"/>',
  oga:'<path d="M3 20 Q20 5 37 20 Q20 35 3 20Z" fill="#fff" stroke="#222" stroke-width="2.5"/><circle cx="20" cy="20" r="6" fill="#1b6b4a"/><circle cx="20" cy="20" r="2.5" fill="#111"/>',
  ankh:'<ellipse cx="20" cy="11" rx="6" ry="7.5" fill="none" stroke="#c0392b" stroke-width="4"/><path d="M20 19V37M9 21H31" stroke="#c0392b" stroke-width="4" stroke-linecap="round"/>',
  kolonn:'<rect x="8" y="4" width="24" height="5" rx="1" fill="#cfd6de" stroke="#6b7785" stroke-width="1.5"/><rect x="12" y="9" width="16" height="23" fill="#e8ecf0" stroke="#6b7785" stroke-width="1.5"/><path d="M16 10V31M20 10V31M24 10V31" stroke="#9aa6b3" stroke-width="1.5"/><rect x="8" y="32" width="24" height="5" rx="1" fill="#cfd6de" stroke="#6b7785" stroke-width="1.5"/>',
  amfora:'<path d="M15 4H25V9Q33 15 31 25Q29 34 20 37Q11 34 9 25Q7 15 15 9Z" fill="#d2691e" stroke="#5a2a0a" stroke-width="2"/><path d="M10 21H30" stroke="#222" stroke-width="4"/><path d="M15 9Q7 9 9 17M25 9Q33 9 31 17" fill="none" stroke="#5a2a0a" stroke-width="2"/>',
  blad:'<path d="M5 34 Q6 8 34 5 Q33 31 5 34Z" fill="#4f9a3a" stroke="#2c5d1e" stroke-width="2"/><path d="M6 33 L28 11" stroke="#2c5d1e" stroke-width="2"/>',
  stjarna:'<path d="M20 3 L25 15 L38 15 L28 23 L32 36 L20 28 L8 36 L12 23 L2 15 L15 15Z" fill="#f2c81d" stroke="#a07c00" stroke-width="2" stroke-linejoin="round"/>',
  blomma:'<g fill="#e05a8a"><circle cx="20" cy="10" r="7"/><circle cx="30" cy="18" r="7"/><circle cx="26" cy="30" r="7"/><circle cx="14" cy="30" r="7"/><circle cx="10" cy="18" r="7"/></g><circle cx="20" cy="21" r="6" fill="#f2c81d"/>',
  fisk:'<path d="M4 20 Q16 6 30 20 Q16 34 4 20Z" fill="#2f9fd6" stroke="#1a6a94" stroke-width="2"/><path d="M29 20 L38 12 L38 28Z" fill="#2f9fd6" stroke="#1a6a94" stroke-width="2"/><circle cx="12" cy="18" r="2" fill="#111"/>',
  skepp:'<path d="M4 26 H36 L31 34 H9Z" fill="#8a5d2b"/><path d="M20 4 V26" stroke="#5e4425" stroke-width="2.5"/><path d="M21 6 L33 22 H21Z" fill="#fff" stroke="#999"/><path d="M19 8 L9 22 H19Z" fill="#f4e7c7" stroke="#999"/>',
  medalj:'<path d="M12 3 L20 15 L28 3" stroke="#2f6fd6" stroke-width="5" fill="none"/><circle cx="20" cy="25" r="11" fill="#e0a526" stroke="#9a6b0c" stroke-width="2.5"/><text x="20" y="30" font-size="12" font-weight="bold" text-anchor="middle" fill="#6b4a05">1</text>',
  kamel:'<path d="M6 30 V20 Q6 14 11 14 Q14 6 18 14 Q22 8 26 14 L30 12 Q34 10 34 14 L33 20 L30 20 V30 M10 30 V22 M26 30 V22" fill="#c9954a" stroke="#7a5420" stroke-width="2.5" stroke-linejoin="round"/>',
  palm:'<path d="M20 38 Q18 26 21 14" stroke="#8a5d2b" stroke-width="4" fill="none"/><path d="M21 14 Q12 6 4 12 M21 14 Q30 6 37 12 M21 14 Q14 14 9 22 M21 14 Q28 14 33 22 M21 14 Q21 6 22 3" stroke="#2e9e4f" stroke-width="4" fill="none" stroke-linecap="round"/>',
  kista:'<rect x="5" y="15" width="30" height="19" rx="2" fill="#a0652a" stroke="#5e3a14" stroke-width="2"/><path d="M5 15 Q20 3 35 15Z" fill="#b8762f" stroke="#5e3a14" stroke-width="2"/><rect x="17" y="18" width="6" height="7" fill="#f2c81d"/>',
};
const GNAMES = {sol:'solar', pyramid:'pyramider', vatten:'vågor', oga:'ögon', ankh:'kors', kolonn:'pelare', amfora:'vaser', blad:'blad', stjarna:'stjärnor', blomma:'blommor', fisk:'fiskar', skepp:'skepp', medalj:'medaljer', kamel:'kameler', palm:'palmer', kista:'kistor'};
const GNAME1 = {sol:'solen', pyramid:'pyramiden', vatten:'vågorna', oga:'ögat', ankh:'korset', kolonn:'pelaren', amfora:'vasen', blad:'bladet', stjarna:'stjärnan', blomma:'blomman', fisk:'fisken', skepp:'skeppet', medalj:'medaljen', kamel:'kamelen', palm:'palmen', kista:'kistan'};
const EGYPT = ['sol','pyramid','vatten','oga','ankh'];
const GREEK = ['kolonn','amfora','blad','stjarna','oga'];
const COUNTABLE = ['sol','pyramid','oga','ankh','kolonn','amfora','blad','stjarna','blomma','fisk','skepp','medalj','kamel','palm'];
const glyph = (n, s=56) => `<svg viewBox="0 0 40 40" width="${s}" height="${s}" aria-hidden="true" class="inl">${GLYPHS[n]}</svg>`;

function money(v){
  if(v >= 20){
    const col = {20:'#b48ad6', 50:'#f1b24a', 100:'#6fa8dc', 200:'#7fc48a'}[v];
    return `<svg viewBox="0 0 100 54" width="100" height="54" aria-label="${v} kronor"><rect x="2" y="2" width="96" height="50" rx="6" fill="${col}" stroke="rgba(0,0,0,.35)" stroke-width="2"/><rect x="8" y="8" width="84" height="38" rx="4" fill="none" stroke="rgba(255,255,255,.6)" stroke-width="2"/><circle cx="26" cy="27" r="11" fill="rgba(255,255,255,.4)"/><text x="66" y="36" font-size="24" font-weight="bold" text-anchor="middle" fill="#222">${v}</text></svg>`;
  }
  const r = {1:17, 2:19, 5:21, 10:24}[v]; const gold = v>=5, d = r*2+4;
  return `<svg viewBox="0 0 ${d} ${d}" width="${d}" height="${d}" aria-label="${v} kronor"><circle cx="${d/2}" cy="${d/2}" r="${r}" fill="${gold?'#e3b93c':'#c9ccd1'}" stroke="${gold?'#9a7410':'#7c8088'}" stroke-width="3"/><circle cx="${d/2}" cy="${d/2}" r="${r-5}" fill="none" stroke="${gold?'#f5d877':'#e6e8eb'}" stroke-width="2"/><text x="${d/2}" y="${d/2+7}" font-size="${v>=10?18:20}" font-weight="bold" text-anchor="middle" fill="#333">${v}</text></svg>`;
}
function clockSVG(h, m, colored=false, size=210){
  let nums = '', ticks = '';
  for(let i=1;i<=12;i++){ const a = i*Math.PI/6; nums += `<text x="${(100+70*Math.sin(a)).toFixed(1)}" y="${(100-70*Math.cos(a)+8).toFixed(1)}" font-size="22" font-weight="bold" text-anchor="middle" fill="#333">${i}</text>`; }
  for(let i=0;i<60;i++){ const a = i*Math.PI/30, r1 = i%5 ? 86 : 81; ticks += `<line x1="${(100+r1*Math.sin(a)).toFixed(1)}" y1="${(100-r1*Math.cos(a)).toFixed(1)}" x2="${(100+90*Math.sin(a)).toFixed(1)}" y2="${(100-90*Math.cos(a)).toFixed(1)}" stroke="#555" stroke-width="${i%5?1:3}"/>`; }
  const ha = ((h%12) + m/60)*30, ma = m*6, hc = colored ? '#2456a8' : '#222', mc = colored ? '#d64545' : '#222';
  return `<svg viewBox="0 0 200 200" width="${size}" height="${size}" aria-label="klocka"><circle cx="100" cy="100" r="94" fill="#fffdf5" stroke="#8a5d2b" stroke-width="7"/>${ticks}${nums}
    <line x1="100" y1="100" x2="100" y2="54" stroke="${hc}" stroke-width="9" stroke-linecap="round" transform="rotate(${ha} 100 100)"/>
    <line x1="100" y1="100" x2="100" y2="26" stroke="${mc}" stroke-width="5" stroke-linecap="round" transform="rotate(${ma} 100 100)"/>
    <circle cx="100" cy="100" r="6" fill="#333"/></svg>`;
}
const SHAPES = {
  cirkel: c => `<circle cx="40" cy="40" r="30" fill="${c}" stroke="#333" stroke-width="3"/>`,
  kvadrat: c => `<rect x="12" y="12" width="56" height="56" fill="${c}" stroke="#333" stroke-width="3"/>`,
  rektangel: c => `<rect x="4" y="22" width="72" height="36" fill="${c}" stroke="#333" stroke-width="3"/>`,
  triangel: c => `<path d="M40 8 L74 70 H6Z" fill="${c}" stroke="#333" stroke-width="3" stroke-linejoin="round"/>`,
};
const CORNERS = {cirkel:0, kvadrat:4, rektangel:4, triangel:3};
const SCOL = ['#f2c81d','#6fa8dc','#e46b6b','#7fc48a','#c39be0'];
const shapeSVG = (n, s=76, c) => `<svg viewBox="0 0 80 80" width="${s}" height="${s}" class="inl">${SHAPES[n](c || pick(SCOL))}</svg>`;
const SOLIDS = {
  klot:'<circle cx="40" cy="42" r="30" fill="#e46b6b" stroke="#333" stroke-width="3"/><ellipse cx="40" cy="42" rx="30" ry="9" fill="none" stroke="#333" stroke-width="1.5" stroke-dasharray="4 3"/><ellipse cx="30" cy="30" rx="8" ry="5" fill="#fff" opacity=".5"/>',
  kon:'<path d="M40 6 L68 64 A28 9 0 0 1 12 64 Z" fill="#f2c81d" stroke="#333" stroke-width="3" stroke-linejoin="round"/><path d="M12 64 A28 9 0 0 1 68 64" fill="none" stroke="#333" stroke-width="1.5" stroke-dasharray="4 3"/>',
  cylinder:'<path d="M14 18 V62 A26 9 0 0 0 66 62 V18" fill="#6fa8dc" stroke="#333" stroke-width="3"/><ellipse cx="40" cy="18" rx="26" ry="9" fill="#9cc6ea" stroke="#333" stroke-width="3"/>',
  ratblock:'<path d="M6 30 L22 18 H74 L58 30Z" fill="#a8e0b4" stroke="#333" stroke-width="3" stroke-linejoin="round"/><path d="M58 30 L74 18 V48 L58 60Z" fill="#5fb072" stroke="#333" stroke-width="3" stroke-linejoin="round"/><rect x="6" y="30" width="52" height="30" fill="#7fc48a" stroke="#333" stroke-width="3"/>',
  kub:'<path d="M14 26 L30 14 H66 L50 26Z" fill="#d9c2f0" stroke="#333" stroke-width="3" stroke-linejoin="round"/><path d="M50 26 L66 14 V50 L50 62Z" fill="#9b70c9" stroke="#333" stroke-width="3" stroke-linejoin="round"/><rect x="14" y="26" width="36" height="36" fill="#c39be0" stroke="#333" stroke-width="3"/>',
};
const SOLIDNAME = {klot:'Klot', kon:'Kon', cylinder:'Cylinder', ratblock:'Rätblock', kub:'Kub'};
const solidSVG = (n, s=80) => `<svg viewBox="0 0 80 80" width="${s}" height="${s}" class="inl">${SOLIDS[n]}</svg>`;
const fracHTML = s => { const [a,b] = s.split('/'); return `<span class="frac"><span>${a}</span><span>${b}</span></span>`; };
function fracPic(n, k, kind, s=140){
  const cols = i => i < k ? '#e0a526' : '#fff';
  let body = '';
  if(kind === 'circle'){
    for(let i=0;i<n;i++){
      const a0 = i*2*Math.PI/n - Math.PI/2, a1 = (i+1)*2*Math.PI/n - Math.PI/2;
      body += `<path d="M50 50 L${(50+44*Math.cos(a0)).toFixed(1)} ${(50+44*Math.sin(a0)).toFixed(1)} A44 44 0 0 1 ${(50+44*Math.cos(a1)).toFixed(1)} ${(50+44*Math.sin(a1)).toFixed(1)} Z" fill="${cols(i)}" stroke="#333" stroke-width="2.5"/>`;
    }
  } else {
    const w = 90/n;
    for(let i=0;i<n;i++) body += `<rect x="${5+i*w}" y="25" width="${w}" height="50" fill="${cols(i)}" stroke="#333" stroke-width="2.5"/>`;
  }
  return `<svg viewBox="0 0 100 100" width="${s}" height="${s}" class="inl">${body}</svg>`;
}
function pixelFig(cells, w, h, cs=16, col='#2f6fd6', line=null){
  let s = '';
  for(let y=0;y<h;y++) for(let x=0;x<w;x++) s += `<rect x="${x*cs}" y="${y*cs}" width="${cs}" height="${cs}" fill="${cells[y]&&cells[y][x] ? col : '#fff'}" stroke="#bbb" stroke-width="1"/>`;
  if(line != null) s += `<line x1="${line*cs}" y1="-4" x2="${line*cs}" y2="${h*cs+4}" stroke="#d64545" stroke-width="3" stroke-dasharray="6 4"/>`;
  return `<svg viewBox="-2 -6 ${w*cs+4} ${h*cs+12}" width="${w*cs+4}" height="${h*cs+12}" class="inl">${s}</svg>`;
}
function roomIcon(t, s=54){
  const txt = (str, col, fs=20) => `<text x="20" y="${20+fs*0.36}" font-size="${fs}" font-weight="bold" text-anchor="middle" fill="${col}">${str}</text>`;
  const P = {
    count:txt('123','#2f6fd6',15), plus:txt('+','#2f6fd6',34), minus:txt('−','#d64545',36), pm:txt('+−','#2f6fd6',22),
    times:txt('2·5','#8e44ad',18), div:txt('12/3','#8e44ad',13), eq:txt('=','#2e9e4f',34), half:txt('½','#e08a00',26),
    pv:txt('HTE','#8e44ad',13), written:txt('+27','#2f6fd6',15), est:txt('≈','#2f6fd6',30), seq:txt('2 4 6','#2e9e4f',13),
    unit:txt('cm','#b5462e',17), dice:'<rect x="7" y="7" width="26" height="26" rx="5" fill="#fff" stroke="#333" stroke-width="2.5"/><circle cx="14" cy="14" r="2.6"/><circle cx="20" cy="20" r="2.6"/><circle cx="26" cy="26" r="2.6"/>',
    hanoi:'<rect x="18" y="6" width="4" height="30" fill="#8a5d2b"/><rect x="6" y="28" width="28" height="6" rx="3" fill="#2f6fd6"/><rect x="10" y="21" width="20" height="6" rx="3" fill="#2e9e4f"/><rect x="13" y="14" width="14" height="6" rx="3" fill="#e0a526"/>',
    coin:'<circle cx="20" cy="20" r="15" fill="#e3b93c" stroke="#9a7410" stroke-width="3"/>'+txt('kr','#333',16),
    block:'<rect x="6" y="8" width="24" height="24" rx="4" fill="#8c6a44" stroke="#5e4425" stroke-width="3"/><circle cx="33" cy="32" r="5" fill="#ffd25a" stroke="#c8961a" stroke-width="2"/>',
    scale:'<path d="M20 6V34M8 34H32M6 12H34" stroke="#555" stroke-width="3"/><path d="M2 22 Q8 28 14 22ZM26 22 Q32 28 38 22Z" fill="#e0a526"/><path d="M6 12L2 22M6 12L14 22M34 12L26 22M34 12L38 22" stroke="#555" stroke-width="1.5"/>',
    clock:'<circle cx="20" cy="20" r="16" fill="#fff" stroke="#8a5d2b" stroke-width="3"/><path d="M20 20V9M20 20L27 24" stroke="#222" stroke-width="3" stroke-linecap="round"/>',
    crown:'<path d="M5 30L8 12L15 21L20 8L25 21L32 12L35 30Z" fill="#f2c81d" stroke="#a07c00" stroke-width="2" stroke-linejoin="round"/><rect x="5" y="30" width="30" height="5" fill="#e0a526"/>',
    chart:'<path d="M5 35H36M5 35V5" stroke="#333" stroke-width="2.5"/><rect x="9" y="20" width="6" height="15" fill="#2f6fd6"/><rect x="18" y="10" width="6" height="25" fill="#e0a526"/><rect x="27" y="25" width="6" height="10" fill="#2e9e4f"/>',
    prog:'<rect x="3" y="12" width="15" height="15" rx="3" fill="#2f6fd6"/><rect x="22" y="12" width="15" height="15" rx="3" fill="#e0a526"/><path d="M7 19.5H14M11 16L14 19.5L11 23M30 15V24M26.5 20.5L30 24L33.5 20.5" stroke="#fff" stroke-width="2.5" fill="none"/>',
    ruler:'<rect x="3" y="14" width="34" height="12" fill="#f2c81d" stroke="#8a6b10" stroke-width="2"/><path d="M8 14V20M13 14V18M18 14V20M23 14V18M28 14V20M33 14V18" stroke="#8a6b10" stroke-width="1.5"/>',
    shapes:'<circle cx="12" cy="12" r="8" fill="#e46b6b"/><rect x="22" y="4" width="15" height="15" fill="#6fa8dc"/><path d="M20 22 L30 38 H10Z" fill="#f2c81d"/>',
    solids:'<path d="M20 4 L32 30 A12 4 0 0 1 8 30Z" fill="#f2c81d" stroke="#333" stroke-width="2"/>',
    mirror:'<path d="M20 3V37" stroke="#d64545" stroke-width="2" stroke-dasharray="3 2"/><path d="M18 8 L6 20 L18 32Z" fill="#2f6fd6"/><path d="M22 8 L34 20 L22 32Z" fill="#2f6fd6" opacity=".5"/>',
    grow:'<rect x="4" y="22" width="10" height="10" fill="#2f6fd6"/><rect x="18" y="8" width="20" height="24" fill="#2f6fd6" opacity=".6"/>',
    frac:'<circle cx="20" cy="20" r="15" fill="#fff" stroke="#333" stroke-width="2.5"/><path d="M20 20 L20 5 A15 15 0 0 1 35 20Z" fill="#e0a526" stroke="#333" stroke-width="2"/>',
    pos:'<rect x="4" y="4" width="32" height="32" rx="4" fill="#fff" stroke="#333" stroke-width="2"/><path d="M20 30V12M14 18L20 12L26 18" stroke="#2f6fd6" stroke-width="3" fill="none"/>',
    dumbbell:'<rect x="4" y="12" width="6" height="16" rx="2" fill="#555"/><rect x="30" y="12" width="6" height="16" rx="2" fill="#555"/><rect x="10" y="17" width="20" height="6" fill="#888"/><rect x="1" y="15" width="3" height="10" rx="1" fill="#333"/><rect x="36" y="15" width="3" height="10" rx="1" fill="#333"/>',
    story:'<rect x="6" y="4" width="28" height="32" rx="3" fill="#fff" stroke="#333" stroke-width="2"/><path d="M11 12H29M11 18H29M11 24H23" stroke="#555" stroke-width="2"/>',
  };
  if(t==='glyph') return glyph('oga', s);
  return `<svg viewBox="0 0 40 40" width="${s}" height="${s}" aria-hidden="true">${P[t]||''}</svg>`;
}
const lockSVG = '<svg viewBox="0 0 24 24" width="22" height="22"><rect x="4" y="10" width="16" height="12" rx="2" fill="#7a5a2a"/><path d="M8 10V7a4 4 0 0 1 8 0v3" stroke="#7a5a2a" stroke-width="3" fill="none"/></svg>';

/* --- Konst för underverken --- */
const ART = {
  cheops:`<svg viewBox="0 0 300 120" width="300" height="120"><circle cx="252" cy="28" r="16" fill="#ffd25a"/><path d="M150 8 L262 112 H38Z" fill="#e0a526" stroke="#8a5d0b" stroke-width="3" stroke-linejoin="round"/><path d="M150 8 L178 112 L262 112Z" fill="#c48a16"/><path d="M62 90H238M86 68H214M110 46H190" stroke="#9a6b0c" stroke-width="2" opacity=".6"/><rect x="141" y="88" width="18" height="24" rx="9" fill="#3a2a1a"/><path d="M20 112 Q14 96 20 84" stroke="#8a5d2b" stroke-width="3" fill="none"/><path d="M20 84 Q10 78 4 84M20 84 Q30 78 36 84M20 84 Q20 76 22 72" stroke="#2e9e4f" stroke-width="3" fill="none"/></svg>`,
  babylon:`<svg viewBox="0 0 300 120" width="300" height="120"><rect x="40" y="88" width="220" height="24" fill="#c9a46a" stroke="#8a6b30" stroke-width="2"/><rect x="70" y="64" width="160" height="24" fill="#d6b47a" stroke="#8a6b30" stroke-width="2"/><rect x="100" y="40" width="100" height="24" fill="#e0c088" stroke="#8a6b30" stroke-width="2"/><rect x="125" y="18" width="50" height="22" fill="#ead09c" stroke="#8a6b30" stroke-width="2"/>${[[48,88],[78,64],[108,40],[130,18],[230,88],[204,64],[180,40],[160,18]].map(([x,y])=>`<circle cx="${x+6}" cy="${y-2}" r="9" fill="#3f9a4f"/><circle cx="${x+16}" cy="${y-1}" r="7" fill="#2e7d3f"/>`).join('')}<path d="M70 70 Q66 90 70 112M230 70 Q234 90 230 112" stroke="#4fa3e0" stroke-width="4" fill="none"/><path d="M100 46 Q96 56 100 64M200 46 Q204 56 200 64" stroke="#4fa3e0" stroke-width="3" fill="none"/>${[60,90,120,150,180,210,240].map(x=>`<circle cx="${x}" cy="100" r="3" fill="#e05a8a"/>`).join('')}</svg>`,
  zeus:`<svg viewBox="0 0 300 120" width="300" height="120"><path d="M60 34 L150 6 L240 34Z" fill="#f2dfc0" stroke="#9a7a44" stroke-width="3" stroke-linejoin="round"/><rect x="60" y="34" width="180" height="8" fill="#e8d0a6" stroke="#9a7a44" stroke-width="2"/><rect x="72" y="42" width="12" height="62" fill="#f6ead2" stroke="#9a7a44" stroke-width="2"/><rect x="216" y="42" width="12" height="62" fill="#f6ead2" stroke="#9a7a44" stroke-width="2"/><rect x="118" y="80" width="64" height="24" fill="#c9954a" stroke="#7a5420" stroke-width="2"/><circle cx="150" cy="52" r="9" fill="#e0a526"/><path d="M134 62 H166 L170 90 H130Z" fill="#e0a526" stroke="#9a6b0c" stroke-width="2"/><path d="M166 66 L180 56" stroke="#9a6b0c" stroke-width="4"/><path d="M178 44 V84" stroke="#9a6b0c" stroke-width="3"/><path d="M134 66 L124 74" stroke="#9a6b0c" stroke-width="4"/><rect x="52" y="104" width="196" height="8" fill="#e8d0a6" stroke="#9a7a44" stroke-width="2"/></svg>`,
  artemis:(()=>{ let c=''; for(let i=0;i<8;i++){ const x=40+i*29; c+=`<rect x="${x}" y="44" width="14" height="58" fill="#f4f6f8" stroke="#7d8896" stroke-width="2"/><path d="M${x+4} 46V100M${x+10} 46V100" stroke="#b7c0ca"/>`; } return `<svg viewBox="0 0 300 120" width="300" height="120"><path d="M28 40 L150 8 L272 40Z" fill="#e9edf1" stroke="#7d8896" stroke-width="3" stroke-linejoin="round"/><rect x="28" y="36" width="244" height="8" fill="#dfe4ea" stroke="#7d8896" stroke-width="2"/>${c}<rect x="22" y="102" width="256" height="7" fill="#dfe4ea" stroke="#7d8896" stroke-width="2"/><rect x="14" y="109" width="272" height="7" fill="#cfd6de" stroke="#7d8896" stroke-width="2"/><circle cx="150" cy="26" r="7" fill="#c39be0"/></svg>`; })(),
  mausoleum:(()=>{ let c=''; for(let i=0;i<7;i++){ const x=84+i*20; c+=`<rect x="${x}" y="52" width="9" height="26" fill="#f1edf6" stroke="#6f5e8c" stroke-width="1.5"/>`; } return `<svg viewBox="0 0 300 120" width="300" height="120"><rect x="70" y="78" width="160" height="34" fill="#cfc4de" stroke="#6f5e8c" stroke-width="2"/><rect x="78" y="48" width="144" height="6" fill="#e3dcee" stroke="#6f5e8c" stroke-width="2"/>${c}<path d="M84 48 L104 30 H196 L216 48Z" fill="#b9acd0" stroke="#6f5e8c" stroke-width="2"/><path d="M98 36H202M110 30L120 20H180L190 30" stroke="#6f5e8c" stroke-width="2" fill="#c8bcdd"/><rect x="138" y="8" width="24" height="12" fill="#e0a526" stroke="#8a6b10" stroke-width="2"/><circle cx="142" cy="20" r="4" fill="#8a6b10"/><circle cx="158" cy="20" r="4" fill="#8a6b10"/><circle cx="40" cy="24" r="10" fill="#fff6c7" opacity=".8"/></svg>`; })(),
  rhodos:`<svg viewBox="0 0 300 120" width="300" height="120"><rect x="0" y="92" width="300" height="28" fill="#2f7fbf"/><path d="M0 96 Q15 90 30 96 T60 96 T90 96 T120 96 T150 96 T180 96 T210 96 T240 96 T270 96 T300 96" stroke="#9fd0f5" stroke-width="3" fill="none"/><rect x="128" y="84" width="44" height="12" fill="#c9b48a" stroke="#7a6a44" stroke-width="2"/><path d="M142 84 L146 52 M158 84 L154 52" stroke="#b07d3e" stroke-width="8" stroke-linecap="round"/><path d="M140 54 H160 L162 30 H138Z" fill="#c48a3e" stroke="#7a4f22" stroke-width="2"/><circle cx="150" cy="20" r="9" fill="#c48a3e" stroke="#7a4f22" stroke-width="2"/><path d="M141 14 L137 6 M145 12 L144 3 M150 11 V2 M155 12 L156 3 M159 14 L163 6" stroke="#e0a526" stroke-width="2.5"/><path d="M161 34 L174 16" stroke="#b07d3e" stroke-width="6" stroke-linecap="round"/><path d="M172 16 L176 8 L180 16Z" fill="#ff9a2e"/><path d="M139 36 L130 52" stroke="#b07d3e" stroke-width="6" stroke-linecap="round"/><g transform="translate(36 70)">${GLYPHS.skepp}</g></svg>`,
  faros:`<svg viewBox="0 0 300 120" width="300" height="120"><rect x="0" y="100" width="300" height="20" fill="#1d4a7a"/><path d="M0 104 Q20 98 40 104 T80 104 T120 104 T160 104 T200 104 T240 104 T280 104 T320 104" stroke="#6fa8dc" stroke-width="2.5" fill="none"/><rect x="118" y="66" width="64" height="36" fill="#e8e2d0" stroke="#7a6a44" stroke-width="2"/><path d="M126 66 L132 36 H168 L174 66Z" fill="#efe9da" stroke="#7a6a44" stroke-width="2"/><rect x="138" y="20" width="24" height="16" fill="#f4efe2" stroke="#7a6a44" stroke-width="2"/><path d="M143 20 Q150 2 157 20Z" fill="#ffb02e"/><path d="M146 20 Q150 9 154 20Z" fill="#fff07a"/><path d="M150 14 L60 0 L60 30Z M150 14 L240 0 L240 30Z" fill="#fff6a0" opacity=".25"/><rect x="146" y="80" width="8" height="12" fill="#7a6a44"/><circle cx="40" cy="20" r="2" fill="#fff"/><circle cx="270" cy="34" r="2" fill="#fff"/><circle cx="90" cy="44" r="1.5" fill="#fff"/></svg>`,
};
