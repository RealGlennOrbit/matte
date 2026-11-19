'use strict';
/* ================= Uppgifter: statistik, samband och problemlösning ================= */
/* Statistik */
function barChart(cats, vals, step, title){
  const W = 420, H = 230, x0 = 46, y0 = 196, top = Math.max(...vals) + step, ys = (y0-20)/top;
  let g = '';
  for(let v=0; v<=top; v+=step) g += `<line x1="${x0}" y1="${y0-v*ys}" x2="${W-6}" y2="${y0-v*ys}" stroke="#ddd"/><text x="${x0-8}" y="${y0-v*ys+5}" font-size="14" text-anchor="end" fill="#555">${v}</text>`;
  const bw = (W-x0-20)/cats.length;
  const cols = ['#2f6fd6','#e0a526','#2e9e4f','#d64545'];
  cats.forEach((c,i) => {
    const x = x0 + 10 + i*bw;
    g += `<rect x="${x+bw*0.18}" y="${y0-vals[i]*ys}" width="${bw*0.64}" height="${vals[i]*ys}" fill="${cols[i]}" rx="3"/><text x="${x+bw/2}" y="${y0+20}" font-size="15" font-weight="bold" text-anchor="middle" fill="#333">${c}</text>`;
  });
  return `<svg viewBox="0 0 ${W} ${H+10}" width="${W}" height="${H+10}" style="max-width:100%;background:#fff;border-radius:12px"><text x="${W/2}" y="16" font-size="15" font-weight="bold" text-anchor="middle">${title}</text><line x1="${x0}" y1="${y0}" x2="${W-6}" y2="${y0}" stroke="#333" stroke-width="2"/><line x1="${x0}" y1="20" x2="${x0}" y2="${y0}" stroke="#333" stroke-width="2"/>${g}</svg>`;
}
function tChart(level){
  const themes = [
    {t:'Medaljer i Olympia', c:['Ana','Bo','Cia','Dan']},
    {t:'Fiskar som fångades', c:['Mån','Tis','Ons','Tor']},
    {t:'Skepp i hamnen', c:['Röda','Blå','Gula','Vita']},
    {t:'Blommor i trädgården', c:['Rosor','Liljor','Tulpan','Vallmo']},
  ];
  const th = pick(themes), step = level===1 ? 1 : 2;
  let vals; do{ vals = repeat(4, () => rnd(1, level===1 ? 9 : 10)*step); } while(new Set(vals).size < 4);
  const chart = barChart(th.c, vals, step, th.t);
  const k = rnd(0,3), i = rnd(0,3); let j = rnd(0,3); while(j===i) j = rnd(0,3);
  if(k === 0) return sk({prompt:`${chart}<p class="ask">Hur många har ${th.c[i]}?</p>`, answer:vals[i], options:distract(vals[i],[vals[i]+step,vals[i]-step,...vals]),
    hint:`<p>Följ stapelns topp åt vänster till talen.${step===2 ? ' Linjerna går med 2 i taget.' : ''}</p>`}, 'diagram');
  if(k === 1){ const most = Math.random()<.5, v = most ? Math.max(...vals) : Math.min(...vals), ans = th.c[vals.indexOf(v)];
    return sk({prompt:`${chart}<p class="ask">Vilken har ${most?'flest':'minst'}?</p>`, answer:ans, options:[...th.c], optClass:'wide', mcOnly:true,
      hint:`<p>Leta efter den ${most?'högsta':'lägsta'} stapeln.</p>`}, 'diagram'); }
  if(k === 2){ const a = Math.max(vals[i],vals[j]), b = Math.min(vals[i],vals[j]); const A = th.c[vals.indexOf(a)], B = th.c[vals.indexOf(b)];
    return sk({prompt:`${chart}<p class="ask">Hur många fler har ${A} än ${B}?</p>`, answer:a-b, options:distract(a-b,[a,b,a+b,a-b+step]),
      hint:`<p>${A} har ${a}. ${B} har ${b}. Skillnaden: ${a} − ${b}.</p>`}, 'diagram'); }
  const s = sum(vals);
  return sk({prompt:`${chart}<p class="ask">Hur många är det sammanlagt?</p>`, answer:s, options:distract(s,[s+step,s-step,s+10,s-10]),
    hint:`<p>Läs av varje stapel och lägg ihop: ${vals.join(' + ')}.</p>`}, 'diagram');
}
function bagSVG(r, b){
  const balls = shuffle([...repeat(r, () => '#d64545'), ...repeat(b, () => '#2f6fd6')]);
  return `<svg viewBox="0 0 160 140" width="180" height="158"><path d="M30 40 Q20 130 80 132 Q140 130 130 40Z" fill="#c9a46a" stroke="#7a5a2a" stroke-width="3"/><path d="M30 40 Q80 28 130 40" stroke="#7a5a2a" stroke-width="5" fill="none"/>${balls.map((c,i) => `<circle cx="${50 + (i%4)*20}" cy="${68 + Math.floor(i/4)*20}" r="9" fill="${c}" stroke="#333" stroke-width="1.5"/>`).join('')}</svg>`;
}
function tRandom(level){
  const O = ['Säkert','Kanske','Omöjligt'];
  if(Math.random() < .5){
    const ev = pick([['du får en 7:a','Omöjligt'],['du får ett tal från 1 till 6','Säkert'],['du får en 6:a','Kanske'],['du får en 0:a','Omöjligt'],['du får en 3:a','Kanske'],['du får ett tal som är mindre än 10','Säkert']]);
    return sk({prompt:`<svg viewBox="0 0 80 80" width="90" height="90"><rect x="6" y="6" width="68" height="68" rx="12" fill="#fff" stroke="#333" stroke-width="3"/><circle cx="24" cy="24" r="6"/><circle cx="56" cy="24" r="6"/><circle cx="40" cy="40" r="6"/><circle cx="24" cy="56" r="6"/><circle cx="56" cy="56" r="6"/></svg><div class="story">Du slår en vanlig tärning med 1 till 6 prickar.<br>Hur troligt är det att ${ev[0]}?</div>`,
      answer:ev[1], options:O, optClass:'three', mcOnly:true, hint:'<p>Säkert = det händer alltid. Kanske = det kan hända. Omöjligt = det kan aldrig hända.</p><p>Tärningen har bara 1, 2, 3, 4, 5 och 6.</p>'}, 'slump');
  }
  const r = rnd(0,6), b = r===0 ? rnd(2,6) : (Math.random()<.3 ? 0 : rnd(1,6));
  if(level >= 2 && r !== b && r>0 && b>0 && Math.random() < .5){
    const ans = r > b ? 'Röd' : 'Blå';
    return sk({prompt:`${bagSVG(r,b)}<div class="story">Du tar en kula utan att titta.<br>Vilken färg är det störst chans att du får?</div>`, answer:ans, options:['Röd','Blå'], optClass:'wide', mcOnly:true,
      hint:`<p>Räkna kulorna: ${r} röda och ${b} blå. Det finns fler av den ena färgen.</p>`}, 'slump');
  }
  const ans = b === 0 ? 'Säkert' : (r === 0 ? 'Omöjligt' : 'Kanske');
  return sk({prompt:`${bagSVG(r,b)}<div class="story">Du tar en kula utan att titta.<br>Hur troligt är det att den är <b style="color:#d64545">röd</b>?</div>`, answer:ans, options:O, optClass:'three', mcOnly:true,
    hint:`<p>Det finns ${r} röda och ${b} blå kulor i påsen.</p><p>Säkert = alla är röda. Omöjligt = ingen är röd. Kanske = några är röda.</p>`}, 'slump');
}

/* Samband */
function tDouble(max){
  const dbl = Math.random() < .5;
  if(dbl){ const n = rnd(2, max/2), ans = 2*n;
    return sk({prompt:`<p class="ask" style="font-size:1.8rem">Dubbelt så mycket som</p><div class="eq">${n}</div>`, answer:ans, options:distract(ans,[n+2,ans+1,ans-1,n]),
      hint:`<p>Dubbelt betyder två gånger: ${n} + ${n}.</p>${n<=10 ? `<div class="hintrow">${dots(n,'blue')}<b class="op">+</b>${dots(n,'blue')}</div>` : ''}`}, 'dubbelt'); }
  const n = rnd(2, max/2), tot = 2*n;
  return sk({prompt:`<p class="ask" style="font-size:1.8rem">Hälften av</p><div class="eq">${tot}</div>`, answer:n, options:distract(n,[n+1,n-1,tot,tot-2]),
    hint:`<p>Dela i två lika stora delar. Vilket tal + samma tal blir ${tot}?</p>${tot<=20 ? `<div class="hintrow">${dots(n,'gold')}<b class="op">|</b>${dots(n,'gold')}</div>` : ''}`}, 'dubbelt');
}
function tProp(){
  const [it, its] = pick([['ljus','ljus'],['vas','vaser'],['bröd','bröd'],['bok','böcker']]);
  const p = rnd(2,10), n = rnd(2,5), ans = p*n;
  return sk({prompt:`<div class="story">1 ${it} kostar ${p} kr.<br>Vad kostar ${n} ${its}?</div>`, answer:ans, options:distract(ans,[p+n, ans+p, ans-p]),
    hint:`<table class="ptable"><tr><th>Antal</th>${repeat(n, i => `<td>${i+1}</td>`).join('')}</tr><tr><th>Pris</th>${repeat(n, i => `<td>${i===0 ? p : (i===n-1 ? '?' : p*(i+1))}</td>`).join('')}</tr></table><p>Varje gång blir det ${p} kr mer.</p>`}, 'dubbelt');
}

/* Problemlösning: textuppgifter */
function tWord(level){
  const L1 = [
    () => { const a=rnd(3,12), b=rnd(2,20-a); return {t:`Det sitter ${a} fåglar i trädet. ${b} till kommer flygande.<br>Hur många fåglar är det nu?`, a:a+b, h:`${a} + ${b}`, p:[dots(a,'blue'),dots(b,'gold')]}; },
    () => { const a=rnd(8,20), b=rnd(2,a-2); return {t:`Det växer ${a} blommor. Du plockar ${b}.<br>Hur många blommor är kvar?`, a:a-b, h:`${a} − ${b}`, p:[dots(a,'green',b)]}; },
    () => { const a=rnd(3,10), b=rnd(2,8); return {t:`Lisa har ${a} kulor. Omar har ${b} fler än Lisa.<br>Hur många kulor har Omar?`, a:a+b, h:`${a} + ${b}`, p:[dots(a,'blue'),dots(b,'gold')]}; },
    () => { const a=rnd(10,20), b=rnd(2,9); return {t:`Du har ${a} kr. En glass kostar ${b} kr.<br>Hur mycket har du kvar?`, a:a-b, h:`${a} − ${b}`, p:[dots(a,'gold',b)]}; },
    () => { const a=rnd(4,10), b=rnd(3,10); return {t:`${a} grodor sitter på en sten. ${b} grodor simmar i dammen.<br>Hur många grodor är det sammanlagt?`, a:a+b, h:`${a} + ${b}`, p:[dots(a,'green'),dots(b,'green')]}; },
  ];
  const L2 = [
    () => { const p=rnd(2,10), n=rnd(2,5); return {t:`Ett äpple kostar ${p} kr. Du köper ${n} äpplen.<br>Vad kostar det?`, a:p*n, h:`${n} · ${p} (eller ${repeat(n,()=>p).join(' + ')})`}; },
    () => { const a=rnd(30,90), b=rnd(10,a-5); return {t:`I loppet springer ${a} löpare. ${b} har gått i mål.<br>Hur många springer fortfarande?`, a:a-b, h:`${a} − ${b}`}; },
    () => { const a=rnd(20,60), b=rnd(10,39); return {t:`Elsa har ${a} kr. Hon får ${b} kr av mormor.<br>Hur mycket har hon nu?`, a:a+b, h:`${a} + ${b}`}; },
    () => { const k=pick([2,5,10]), n=rnd(2,9); return {t:`Det är ${n} lag med ${k} spelare i varje lag.<br>Hur många spelare är det?`, a:n*k, h:`${n} · ${k}`}; },
    () => { const a=rnd(7,12), b=rnd(25,60); return {t:`Johan är ${a} år. Hans morfar är ${b} år äldre.<br>Hur gammal är morfar?`, a:a+b, h:`${a} + ${b}`}; },
  ];
  const L3 = [
    () => { const a=rnd(120,400), b=rnd(20,a-50), c=rnd(30,200); return {t:`Skeppet har ${a} säckar. I hamnen lastas ${b} säckar av och ${c} nya säckar på.<br>Hur många säckar finns på skeppet nu?`, a:a-b+c, h:`Steg 1: ${a} − ${b} = ${a-b}. Steg 2: ${a-b} + ${c}.`}; },
    () => { const p=rnd(5,20), n=rnd(2,4); return {t:`En biljett till fyren kostar ${p} kr. Ni köper ${n} biljetter och betalar med 100 kr.<br>Hur mycket får ni tillbaka?`, a:100-p*n, h:`Steg 1: ${n} · ${p} = ${p*n} kr. Steg 2: 100 − ${p*n}.`}; },
    () => { const h=rnd(100,140), t=rnd(12,35); return {t:`Fyren är ${h} m hög. Ett träd är ${t} m högt.<br>Hur mycket högre är fyren?`, a:h-t, h:`${h} − ${t}`}; },
    () => { const n=rnd(3,6), k=pick([4,5,10]), s=rnd(5, n*k-3); return {t:`I templet finns ${n} rader med ${k} stolar i varje rad. ${s} stolar är upptagna.<br>Hur många stolar är lediga?`, a:n*k-s, h:`Steg 1: ${n} · ${k} = ${n*k} stolar. Steg 2: ${n*k} − ${s}.`}; },
    () => { const x=rnd(4,20)*3; return {t:`Tre vänner delar ${x} kr lika.<br>Hur mycket får var och en?`, a:x/3, h:`${x} / 3. Tänk: 3 · ? = ${x}`}; },
    () => { const a=rnd(150,480), b=rnd(120,999-a-20); return {t:`${a} turister besöker underverket på förmiddagen och ${b} på eftermiddagen.<br>Hur många turister blev det sammanlagt?`, a:a+b, h:`${a} + ${b}. Ställ gärna upp talen.`}; },
  ];
  const g = pick(level===1 ? L1 : level===2 ? L2 : L3)();
  return sk({prompt:`<div class="story">${g.t}</div>`, answer:g.a, options:distract(g.a,[g.a+1,g.a-1,g.a+10,g.a-10]),
    hint:`<p>Vad vet du? Vad ska du ta reda på?</p><p>Räkna: ${g.h}</p>${g.p ? `<div class="hintrow">${g.p.join(' ')}</div>` : ''}`}, 'problem');
}
