'use strict';
/* ================= Uppgiftsgeneratorer ================= */
const eq = (s, cls='') => `<div class="eq ${cls}">${s} = <span class="qm">?</span></div>`;
const BOX = '<span class="box"></span>';
function dots(n, cls, crossLast=0, empty=0){
  let s = '<span class="dots">';
  const tot = n + empty;
  for(let g=0; g<tot; g+=5){
    s += '<span class="five">';
    for(let i=g; i<Math.min(tot,g+5); i++) s += `<span class="dot ${i >= n ? 'empty' : (i >= n-crossLast ? 'x' : cls)}"></span>`;
    s += '</span>';
  }
  return s + '</span>';
}
function tensOnes(n){
  const h = Math.floor(n/100), t = Math.floor(n%100/10), e = n%10;
  return `<span class="tobox"><span class="to">${'<i class="hun"></i>'.repeat(h)}${'<i class="ten"></i>'.repeat(t)}${'<i class="one"></i>'.repeat(e)}</span><small><b>${n}</b> = ${h ? h+' hundratal, ' : ''}${t} tiotal och ${e} ental</small></span>`;
}
const pvTable = n => { const s = String(n).padStart(3,'0'); return `<table class="pvt"><tr><th>Hundratal</th><th>Tiotal</th><th>Ental</th></tr><tr><td>${s[0]}</td><td>${s[1]}</td><td>${s[2]}</td></tr></table>`; };

/* Taluppfattning */
function tCount(max, set){
  const g = pick(set || COUNTABLE), n = rnd(3, max);
  return sk({prompt:`<div class="items">${repeat(n, () => glyph(g,50)).join('')}</div><p class="ask">Hur många ${GNAMES[g]} är det?</p>`, answer:n,
    options:distract(n,[n+1,n-1,n+2,n-2]), hint:`<p>Peka och räkna en i taget. Säg talen högt!</p><div class="items">${repeat(n, i => `<span class="tobox">${glyph(g,40)}<small>${i+1}</small></span>`).join('')}</div>`}, 'antal');
}
function tCompare(max){
  const type = rnd(0,2);
  if(type === 0){
    const nums = new Set(); while(nums.size < 4) nums.add(rnd(0,max));
    const arr = [...nums], ans = Math.max(...arr);
    return sk({prompt:'<p class="ask" style="font-size:1.8rem">Vilket tal är störst?</p>', answer:ans, options:shuffle(arr), mcOnly:true,
      hint:`<p>Titta på tiotalen först. Sedan på entalen.</p><div class="jumps">${[...arr].sort((a,b)=>a-b).map(n => `<span>${n}</span>`).join('<span class="j">&lt;</span>')}</div>`}, 'antal');
  }
  if(type === 1){
    const n = rnd(1, max-1);
    return sk({prompt:`<p class="ask" style="font-size:1.8rem">Vilket tal kommer efter</p><div class="eq">${n}</div>`, answer:n+1, options:distract(n+1,[n-1,n+2,n+10]),
      hint:`<p>Räkna ett steg framåt.</p><div class="jumps"><span>${n}</span><span class="j">+1 →</span><span style="color:#e0a526">?</span></div>`}, 'antal');
  }
  const n = rnd(2, max-1);
  return sk({prompt:`<p class="ask" style="font-size:1.8rem">Vilket tal står mellan</p><div class="eq">${n-1} och ${n+1}</div>`, answer:n, options:distract(n,[n-2,n+2,n+1,n-1]),
    hint:`<div class="jumps"><span>${n-1}</span><span class="j">+1 →</span><span style="color:#e0a526">?</span><span class="j">+1 →</span><span>${n+1}</span></div>`}, 'antal');
}
function tFriends(total){
  const a = rnd(1, total-1), b = total - a;
  return sk({prompt:`<div class="eq">${total} = ${a} + ${BOX}</div><div style="margin-top:8px">${dots(a,'blue',0,b)}</div><p class="ask">Hur många fattas?</p>`, answer:b,
    options:distract(b,[b+1,b-1,a,total]), hint:`<p>Räkna de tomma rutorna!</p>${dots(a,'blue',0,b)}`}, 'tiokompisar');
}
/* mode: undefined = valfritt inom max, 'teen' = 11+5 (ingen tiotalsövergång), 'carry' = 8+5 (tiotalsövergång) */
function tPlus(max, mode){
  let a, b;
  if(mode === 'carry'){ do{ a = rnd(3,9); b = rnd(11-a, Math.min(9, max-a)); } while(a+b > max || a+b <= 10); if(Math.random()<.5) [a,b] = [b,a]; }
  else if(mode === 'teen'){ const e = rnd(0,8); a = 10 + e; b = rnd(1, 9-e); if(Math.random()<.3) [a,b] = [b,a]; }
  else { do{ a = rnd(max<=5?0:1, max-1); b = rnd(1, max-a); } while(max>10 && a+b<=10); }
  const ans = a+b;
  const hint = mode === 'carry' ? `Fyll upp till 10 först: ${Math.max(a,b)} + ${10-Math.max(a,b)} = 10. Sedan resten.`
    : mode === 'teen' ? `Räkna bara entalen: ${a%10} + ${b%10} = ${a%10+b%10}. Tiotalet följer med.` : 'Räkna alla prickar!';
  return sk({prompt:eq(`${a} + ${b}`), answer:ans, options:distract(ans,[ans+1,ans-1,ans+2,ans-2,ans+10,a,b]),
    hint:`<p>${hint}</p><div class="hintrow">${dots(a,'blue')}<b class="op">+</b>${dots(b,'gold')}</div>`}, max<=10 ? 'pm10' : 'pm20');
}
/* mode: undefined = valfritt inom max, 'teen' = 17−4 (ingen växling), 'carry' = 13−5 (över tiotalsgränsen) */
function tMinus(max, mode){
  let a, b;
  if(mode === 'carry'){ do{ a = rnd(11, max); } while(a%10 === 9); b = rnd(a%10+1, 9); }
  else if(mode === 'teen'){ a = rnd(11, Math.min(19,max)); b = rnd(1, a%10 || 1); if(a%10 === 0) b = 10; }
  else { a = rnd(Math.max(max<=5?2:3, max-9), max); b = rnd(1, a-1); }
  const ans = a-b;
  const hint = mode === 'carry' ? `Ta först bort ${a-10} så att du kommer till 10. Ta sedan bort resten.`
    : mode === 'teen' ? `Ta bort från entalen: ${a%10} − ${b} = ${a%10-b}. Tiotalet är kvar.` : `Det finns ${a}. Ta bort ${b}. Hur många är kvar?`;
  return sk({prompt:eq(`${a} − ${b}`), answer:ans, options:distract(ans,[ans+1,ans-1,ans+2,ans-2,a+b]),
    hint:`<p>${hint}</p><div class="hintrow">${dots(a,'blue',b)}</div>`}, max<=10 ? 'pm10' : 'pm20');
}
function tPV100(){
  const type = rnd(0,2), n = rnd(11,99), t = Math.floor(n/10), e = n%10;
  if(type === 0) return sk({prompt:`<div class="hintrow">${'<i class="ten"></i>'.repeat(t)} ${'<i class="one"></i>'.repeat(e)}</div><p class="ask">Vilket tal är det? Stavarna är tiotal och rutorna ental.</p>`, answer:n,
    options:distract(n,[e*10+t, n+10, n-10, n+1]), hint:`<p>Räkna tiotalen: 10, 20, 30 … Lägg sedan till entalen.</p>${tensOnes(n)}`}, 'pos100');
  if(type === 1) return sk({prompt:`<p class="ask" style="font-size:1.6rem">${t} tiotal och ${e} ental.<br>Vilket tal är det?</p>`, answer:n,
    options:distract(n,[e*10+t, t+e, n+10]), hint:tensOnes(n)}, 'pos100');
  return sk({prompt:`<p class="ask" style="font-size:1.6rem">Hur många tiotal finns det i talet</p><div class="eq">${n}</div>`, answer:t,
    options:distract(t,[e, t+1, t-1, n]), hint:tensOnes(n)}, 'pos100');
}
/* kind: 'tens' = 30+40, 'ones' = 34+5 (utan övergång), 'plustens' = 34+20, 'nocarry' = 34+25, 'carry' = 38+25 / 62−17 */
function tMental100(kind){
  if(kind === true) kind = 'carry';
  if(kind === false || !kind) kind = pick(['tens','ones','plustens']);
  let a, b, plus = Math.random() < .55, ans;
  if(kind === 'tens'){ a = rnd(1,8)*10; b = rnd(1, 9-a/10)*10; }
  else if(kind === 'ones'){ a = rnd(2,8)*10 + rnd(0,5); b = rnd(1, 9-a%10); }
  else if(kind === 'plustens'){ a = rnd(2,8)*10 + rnd(1,8); b = rnd(1, 9-Math.floor(a/10))*10; }
  else if(kind === 'nocarry'){ do{ a = rnd(12,75); b = rnd(11, 98-a); } while((a%10)+(b%10) > 9 || b%10 === 0); }
  if(kind !== 'carry'){
    if(!plus){ a = a + b; }
    ans = plus ? a+b : a-b;
  } else {
    if(plus){ do{ a = rnd(15,75); b = rnd(5, 99-a); } while((a%10)+(b%10) < 10); ans = a+b; }
    else { do{ a = rnd(30,99); b = rnd(5, a-10); } while((a%10) >= (b%10)); ans = a-b; }
  }
  return sk({prompt:eq(`${a} ${plus?'+':'−'} ${b}`), answer:ans, options:distract(ans,[ans+10,ans-10,ans+1,ans-1,ans+2]),
    hint:`<p>${plus ? 'Räkna tiotalen för sig och entalen för sig.' : 'Ta bort tiotalen först. Sedan entalen.'}</p><div class="hintrow">${tensOnes(a)}<b class="op">${plus?'+':'−'}</b>${tensOnes(b)}</div>`}, 'huvud100');
}
function runningHint(list){
  const s = [...list].sort((x,y) => y-x); let acc = 0;
  return `<p>Börja med den största. Räkna vidare!</p><div class="jumps">` + s.map(v => { acc += v; return `<span class="tobox">${money(v)}<small>${acc}</small></span>`; }).join('') + '</div>';
}
function tMoney(maxSum, kinds){
  let list;
  do{ list = repeat(rnd(3,5), () => pick(kinds)); } while(sum(list) > maxSum || sum(list) < 8);
  const ans = sum(list);
  return sk({prompt:`<div class="coins">${list.map(money).join('')}</div><p class="ask">Hur många kronor är det?</p>`, answer:ans,
    options:distract(ans,[ans+1,ans-1,ans+10,ans-10,ans+5,ans-5]), hint:runningHint(list)}, 'pengar');
}
function tChange(easy){
  const have = easy ? pick([20,50]) : pick([20,50,100,100]);
  let price = easy ? rnd(1, have/5 - 1)*5 : (have===20 ? rnd(5,18) : have===50 ? rnd(12,47) : rnd(25,95));
  const ans = have - price;
  let j = `<span>${price}</span>`, cur = price;
  if(cur % 10){ const nx = Math.ceil(cur/10)*10; j += `<span class="j">+${nx-cur} →</span><span>${nx}</span>`; cur = nx; }
  if(cur < have) j += `<span class="j">+${have-cur} →</span><span>${have}</span>`;
  return sk({prompt:`<div class="shop">${money(have)}<span class="arrow">→</span>${glyph('amfora',80)}<span class="tag">${price} kr</span></div><p class="ask">Du betalar ${have} kr. Vasen kostar ${price} kr.<br>Hur mycket får du tillbaka?</p>`,
    answer:ans, options:distract(ans,[ans+1,ans-1,ans+10,ans-10,price]),
    hint:`<p>Räkna uppåt från ${price} till ${have}!</p><div class="jumps">${j}</div><p>Lägg ihop hoppen.</p>`}, 'pengar');
}
function tTimes(tables, maxF){
  const t = pick(tables), f = rnd(2, maxF), ans = f*t;
  const pic = ans <= 40
    ? '<div class="hintrow">' + repeat(f, i => `<span class="group">${dots(t,'green')}<span class="lab">${(i+1)*t}</span></span>`).join('') + '</div>'
    : '<div class="jumps">' + repeat(f, i => `<span>${(i+1)*t}</span>`).join('<span class="j">→</span>') + '</div>';
  return sk({prompt:eq(`${f} · ${t}`), answer:ans, options:distract(ans,[ans+t,ans-t,ans+1,ans-1,f+t]),
    hint:`<p>${f} grupper med ${t} i varje. Räkna ${t}, ${2*t}, ${3*t} …</p>${pic}`}, 'ganger');
}
function tDiv(tables, story=true){
  const t = pick(tables), q = rnd(2,10), tot = t*q;
  const things = pick([['mynt','kistor'],['äpplen','korgar'],['pärlor','askar'],['stenar','högar']]);
  const prompt = story && Math.random() < .6
    ? `<div class="story">${tot} ${things[0]} delas lika i ${t} ${things[1]}.<br>Hur många ${things[0]} blir det i varje?</div>`
    : eq(`${tot} / ${t}`);
  const pic = tot <= 40 ? `<div class="hintrow">${repeat(t, () => `<span class="group">${dots(q,'gold')}</span>`).join('')}</div>` : '';
  return sk({prompt, answer:q, options:distract(q,[q+1,q-1,t,q+2]),
    hint:`<p>Tänk gånger: ${t} · ? = ${tot}</p>${pic}`}, 'division');
}
/* types: 0 = bygga tal av H/T/E, 1 = siffrans värde, 2 = 10/100 mer eller mindre, 3 = störst, 4 = hela hundratal */
function tPlace1000(types){
  const type = pick(types || [0,1,2,3]);
  if(type === 4){
    const h = rnd(1,9);
    if(Math.random() < .5) return sk({prompt:`<div class="hintrow">${'<i class="hun"></i>'.repeat(h)}</div><p class="ask">Varje platta är 100. Hur mycket är det?</p>`, answer:h*100,
      options:distract(h*100,[h*10, h, (h+1)*100, (h-1)*100].filter(v=>v>0)), hint:`<p>Räkna hundratal: 100, 200, 300 …</p>`}, 'pos1000');
    return sk({prompt:`<p class="ask" style="font-size:1.6rem">Hur många hundratal finns det i</p><div class="eq mid">${h*100}</div>`, answer:h,
      options:distract(h,[h*10, h*100, h+1]), hint:pvTable(h*100)}, 'pos1000');
  }
  if(type === 0){
    const h = rnd(1,9), t = pick([0,rnd(1,9)]), e = rnd(0,9), n = h*100+t*10+e;
    return sk({prompt:`<p class="ask" style="font-size:1.6rem">${h} hundratal, ${t} tiotal och ${e} ental.<br>Vilket tal är det?</p>`, answer:n,
      options:distract(n,[h*100+e*10+t, h*10+e, n+100, n+10]), hint:pvTable(n)}, 'pos1000');
  }
  if(type === 1){
    let n; do{ n = rnd(102, 987); } while(new Set(String(n)).size < 3 || String(n).includes('0'));
    const idx = rnd(0,2), d = +String(n)[idx], val = d * [100,10,1][idx];
    return sk({prompt:`<div class="eq mid">${String(n).split('').map((c,i) => i===idx ? `<span style="color:#d64545;text-decoration:underline">${c}</span>` : c).join('')}</div><p class="ask">Hur mycket är den röda siffran värd?</p>`,
      answer:val, options:distract(val,[d, d*10, d*100]), hint:pvTable(n)}, 'pos1000');
  }
  if(type === 2){
    const step = pick([10,100,-10,-100]), n = step > 0 ? rnd(105, 885) : rnd(205, 990), ans = n + step;
    return sk({prompt:`<p class="ask" style="font-size:1.6rem">Vilket tal är ${Math.abs(step)} ${step>0?'mer':'mindre'} än</p><div class="eq mid">${n}</div>`, answer:ans,
      options:distract(ans,[n-step, n+step/10, n+step*10].filter(x=>x>0 && x<1000)), hint:`<p>${Math.abs(step)===100 ? 'Hundratalssiffran' : 'Tiotalssiffran'} ändras.</p>${pvTable(n)}`}, 'pos1000');
  }
  const nums = new Set(); const base = rnd(1,8)*100;
  while(nums.size < 4) nums.add(base + rnd(0,199));
  const arr = [...nums], ans = Math.max(...arr);
  return sk({prompt:'<p class="ask" style="font-size:1.8rem">Vilket tal är störst?</p>', answer:ans, options:shuffle(arr), mcOnly:true,
    hint:'<p>Jämför hundratalen först. Är de lika? Jämför tiotalen. Sedan entalen.</p>'}, 'pos1000');
}
function tMental1000(){
  const k = rnd(0,4); let a, b, plus;
  if(k===0){ a = rnd(1,7)*100; b = rnd(1, 9-a/100)*100; plus = true; }
  else if(k===1){ a = rnd(3,9)*100; b = rnd(1, a/100-1)*100; plus = false; }
  else if(k===2){ a = rnd(1,8)*100 + rnd(1,7)*10; b = rnd(1, 9-(a%100)/10)*10; plus = true; }
  else if(k===3){ a = rnd(1,7)*100 + rnd(10,99); b = rnd(1, 9-Math.floor(a/100))*100; plus = true; }
  else { a = rnd(2,9)*100 + rnd(10,99); b = rnd(1, Math.floor(a/100)-1)*100; plus = false; }
  const ans = plus ? a+b : a-b;
  return sk({prompt:eq(`${a} ${plus?'+':'−'} ${b}`, 'mid'), answer:ans, options:distract(ans,[ans+100,ans-100,ans+10,ans-10]),
    hint:`<p>Räkna med hundratal som med ental: ${Math.floor(a/100)} hundratal ${plus?'+':'−'} ${Math.floor(b/100)} hundratal.</p>${pvTable(a)}`}, 'huvud1000');
}
/* carry: true = minnessiffra/växling i entalen, false = utan, undefined = blandat */
function tWritten(op, carry){
  let a, b, ok;
  do{
    if(op === '+'){ a = rnd(105, 689); b = rnd(48, 999-a); }
    else { a = rnd(240, 985); b = rnd(35, a-60); }
    const c1 = op === '+' ? (a%10)+(b%10) >= 10 : (a%10) < (b%10);
    const c2 = op === '+' ? (Math.floor(a/10)%10)+(Math.floor(b/10)%10) >= 10 : (Math.floor(a/10)%10) < (Math.floor(b/10)%10);
    ok = (op !== '+' || a+b <= 999) && (carry === undefined || (carry ? c1 : (!c1 && !c2)));
  } while(!ok);
  const ans = op === '+' ? a+b : a-b;
  const A = String(a).padStart(3,' '), B = String(b).padStart(3,' ');
  const row = s => s.split('').map(c => `<td>${c===' '?'':c}</td>`).join('');
  const e1 = a%10, e2 = b%10;
  const first = op === '+'
    ? `Entalen: ${e1} + ${e2} = ${e1+e2}. ${e1+e2 >= 10 ? `Skriv ${(e1+e2)%10} och sätt en minnessiffra 1 ovanför tiotalen.` : `Skriv ${e1+e2}.`}`
    : (e1 >= e2 ? `Entalen: ${e1} − ${e2} = ${e1-e2}.` : `Entalen: ${e1} − ${e2} går inte. Växla ett tiotal till 10 ental: ${e1+10} − ${e2} = ${e1+10-e2}.`);
  return sk({prompt:`<table class="written"><tr><td></td>${row(A)}</tr><tr><td>${op==='+'?'+':'−'}</td>${row(B)}</tr><tr class="sum"><td></td><td colspan="3" style="color:#e0a526">?</td></tr></table>`,
    answer:ans, options:distract(ans,[ans+10,ans-10,ans+100,ans-100,ans+1]),
    hint:`<p>Börja alltid med entalen, längst till höger.</p><p>${first}</p><p>Gör sedan likadant med tiotalen och hundratalen.</p>`}, 'skriftlig');
}
function tFracPic(level){
  const pool = level === 1 ? [[2,1],[4,1],[4,2],[4,3],[3,1]] : [[2,1],[3,1],[3,2],[4,1],[4,3],[5,2],[6,1],[8,3]];
  const [n,k] = pick(pool), ans = `${k}/${n}`;
  const others = new Set(); [[k,n+1],[n-k,n],[1,n],[k,n-1],[k+1,n],[n,k]].forEach(([x,y]) => { if(y>0 && x>0 && x!==y && `${x}/${y}`!==ans) others.add(`${x}/${y}`); });
  const opts = shuffle([ans, ...shuffle([...others]).slice(0,3)]);
  const names = {2:'halvor',3:'tredjedelar',4:'fjärdedelar',5:'femtedelar',6:'sjättedelar',8:'åttondelar'};
  return sk({prompt:`${fracPic(n,k,pick(['circle','rect']))}<p class="ask">Hur stor del är gul?</p>`, answer:ans, options:opts, fmt:fracHTML, mcOnly:true,
    hint:`<p>Helheten är delad i ${n} lika stora delar (${names[n]}). Det nedre talet är ${n}.</p><p>${k} delar är gula. Det övre talet är ${k}.</p>`}, 'brak');
}
function tFracOf(){
  const [n, word] = pick([[2,'Hälften'],[2,'Hälften'],[4,'En fjärdedel'],[3,'En tredjedel'],[5,'En femtedel']]);
  const q = rnd(2, n===2 ? 15 : 8), tot = n*q;
  const thing = pick(['skepp','fiskar','mynt','måsar']);
  return sk({prompt:`<div class="story">${word} av ${tot} ${thing}.<br>Hur många är det?</div>`, answer:q, options:distract(q,[q+1,q-1,tot-q,n]),
    hint:`<p>Dela ${tot} i ${n} lika stora högar. Hur många blir det i en hög?</p>${tot<=40 ? `<div class="hintrow">${repeat(n, () => `<span class="group">${dots(q,'gold')}</span>`).join('')}</div>` : `<p>${n} · ? = ${tot}</p>`}`}, 'brak');
}
function tEstimate(){
  if(Math.random() < .5){
    const h1 = rnd(1,5), h2 = rnd(1, 8-h1);
    const a = h1*100 + pick([-3,-2,-1,1,2,3,4]), b = h2*100 + pick([-4,-2,-1,1,2,3]);
    const ans = (h1+h2)*100;
    return sk({prompt:`<p class="ask" style="font-size:1.6rem">Ungefär hur mycket är</p><div class="eq mid">${a} + ${b}</div>`, answer:ans, mcOnly:true,
      options:shuffle([ans, ans-200, ans+100, ans-100].filter(v => v>0).slice(0,4)), fmt:v => `ca ${v}`, optClass:'wide',
      hint:`<p>Avrunda till hela hundratal: ${a} är nästan ${h1*100}, och ${b} är nästan ${h2*100}.</p>`}, 'rimlighet');
  }
  const a = rnd(23, 68), b = rnd(12, 30), real = a+b;
  const wrong = pick([real+100, real-10, a*b > 300 ? real+50 : real+90]);
  const shown = Math.random() < .5 ? real : wrong, ok = shown === real;
  return sk({prompt:`<div class="story">Ali räknar: ${a} + ${b} = ${shown}.<br>Är det rimligt?</div>`, answer:ok ? 'Ja, rimligt' : 'Nej, orimligt', mcOnly:true,
    options:['Ja, rimligt','Nej, orimligt'], optClass:'wide',
    hint:`<p>${a} är ungefär ${Math.round(a/10)*10} och ${b} är ungefär ${Math.round(b/10)*10}. Svaret borde vara ungefär ${Math.round(a/10)*10 + Math.round(b/10)*10}.</p>`}, 'rimlighet');
}
