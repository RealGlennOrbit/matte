'use strict';
/* Algebra */
function tGlyphs(set, patterns, nOpts){
  const p = pick(patterns), letters = [...new Set(p)];
  const syms = shuffle([...set]).slice(0, letters.length), map = {};
  letters.forEach((l,i) => map[l] = syms[i]);
  const len = p.length*2 + rnd(0, p.length-1);
  const seq = repeat(len+1, i => map[p[i % p.length]]);
  const ans = seq[len];
  const opts = [ans, ...syms.filter(s => s!==ans)];
  shuffle(set.filter(s => s!==ans)).forEach(s => { if(opts.length < nOpts && !opts.includes(s)) opts.push(s); });
  const cell = g => `<span class="cell">${glyph(g)}</span>`;
  let chunks = '';
  for(let i=0;i<=len;i+=p.length) chunks += '<span class="chunk">' + seq.slice(i, i+p.length).map((g,k) => i+k===len ? '<span class="cell q">?</span>' : cell(g)).join('') + '</span>';
  return sk({prompt:`<div class="seq">${seq.slice(0,len).map(cell).join('')}<span class="cell q">?</span></div><p class="ask">Vilken bild kommer sedan?</p>`,
    answer:ans, options:shuffle(opts.slice(0,nOpts)), fmt:g => glyph(g,52), mcOnly:true,
    hint:`<p>Bilderna kommer i grupper. Titta på varje grupp!</p><div class="seq">${chunks}</div>`}, 'monster');
}
function tSeq(steps, max){
  const step = pick(steps);
  const start = step > 0 ? rnd(0, max-5*step) : rnd(-5*step, max);
  const nums = repeat(5, i => start + i*step), ans = nums[4];
  const sgn = (step>0?'+':'−') + Math.abs(step);
  return sk({prompt:`<div class="seq">${nums.slice(0,4).map(n => `<span class="cell">${n}</span>`).join('')}<span class="cell q">?</span></div><p class="ask">Vilket tal kommer sedan?</p>`,
    answer:ans, options:distract(ans,[ans+1,ans-1,ans+step,ans+2,ans-2]),
    hint:`<p>Hur mycket ändras talen varje gång?</p><div class="jumps">${nums.slice(0,4).map(n => `<span>${n}</span>`).join(`<span class="j">${sgn} →</span>`)}<span class="j">${sgn} →</span><span style="color:#e0a526">?</span></div>`}, 'monster');
}
/* level: 0 = upp till 10, 1 = upp till 20, 2 = upp till 100, 3 = upp till 1000 och gånger */
function tEquality(level){
  const k = rnd(0, level===3 ? 4 : 3);
  if(k === 3 && level < 3){
    const a = rnd(1, level===0?5:level===1?9:50), b = rnd(1, level===0?5:level===1?9:40), c = rnd(1, a+b-1);
    const truth = Math.random() < .5, d = truth ? a+b-c : a+b-c + pick([1,-1,2,10]);
    if(d <= 0) return tEquality(level);
    return sk({prompt:`<div class="eq mid">${a} + ${b} = ${c} + ${d}</div><p class="ask">Stämmer det? Är det lika mycket på båda sidor?</p>`,
      answer:truth ? 'Ja' : 'Nej', options:['Ja','Nej'], optClass:'wide', mcOnly:true,
      hint:`<p>Räkna ut båda sidorna. Vänster: ${a} + ${b} = ${a+b}. Höger: ${c} + ${d} = ?</p><p>Likhetstecknet betyder "lika mycket som".</p>`}, 'likhet');
  }
  let txt, ans, h;
  const max = [10,20,100,1000][level];
  if(k === 4){ const t = pick([2,3,4,5,10]), f = rnd(2,10); txt = `${t} · ${BOX} = ${t*f}`; ans = f; h = `Räkna ${t}-hopp tills du kommer till ${t*f}. Hur många hopp?`; }
  else {
    let a, c;
    if(level===3){ a = rnd(1,6)*100 + pick([0, rnd(1,9)*10, rnd(10,95)]); c = a + rnd(1, (999-a)/10|0)*10; }
    else { a = rnd(1, max-3); c = rnd(a+1, max); }
    const b = c - a;
    if(k === 0){ txt = `${a} + ${BOX} = ${c}`; ans = b; h = `Hur mycket fattas från ${a} till ${c}? Räkna ${c} − ${a}.`; }
    else if(k === 1){ txt = `${BOX} + ${a} = ${c}`; ans = b; h = `Vilket tal plus ${a} blir ${c}? Räkna ${c} − ${a}.`; }
    else { txt = `${c} − ${BOX} = ${a}`; ans = b; h = `Hur mycket ska du ta bort från ${c} för att få ${a}?`; }
  }
  return sk({prompt:`<div class="eq ${level===3?'mid':''}">${txt}</div><p class="ask">Vilket tal ska stå i rutan?</p>`, answer:ans,
    options:distract(ans,[ans+1,ans-1,ans+10,ans-10]), hint:`<p>${h}</p><p>Båda sidorna ska vara lika mycket.</p>`}, 'likhet');
}
/* Vågen */
const HALF = 150;
function tiltAngle(diff){ return diff===0 ? 0 : Math.sign(diff) * Math.min(14, 5 + Math.abs(diff)); }
function panT(th, side){
  const r = th*Math.PI/180, dx = HALF - HALF*Math.cos(r), dy = HALF*Math.sin(r);
  return side==='L' ? `translate(${dx.toFixed(1)}px,${(-dy).toFixed(1)}px)` : `translate(${(-dx).toFixed(1)}px,${dy.toFixed(1)}px)`;
}
function weightsMk(cx, items){
  const w = 40, g = 4, tot = items.length*w + (items.length-1)*g; let x = cx - tot/2;
  return items.map(it => { const s = `<g class="${it.u?'uk':'w'}"><rect x="${x}" y="112" width="${w}" height="38" rx="7"/><text x="${x+w/2}" y="138">${it.v}</text></g>`; x += w+g; return s; }).join('');
}
function panMk(cx, inner, side, th){
  return `<g class="pan" data-side="${side}" style="transform:${panT(th,side)}"><path d="M${cx} 72 L${cx-58} 150 M${cx} 72 L${cx+58} 150" stroke="#666" stroke-width="2"/>${inner}<path d="M${cx-66} 150 Q${cx} 176 ${cx+66} 150 Z" fill="#e0a526" stroke="#9a6b0c" stroke-width="2"/></g>`;
}
function scaleTask(left, known, unk, ask, cands){
  const ls = sum(left), ks = sum(known), ans = (ls - ks)/unk, th0 = tiltAngle(ks - ls);
  return sk({answer:ans, options:distract(ans, cands(ans,ls,ks), 3, 1),
    render(){ return `<div class="scalebox"><svg class="scale" viewBox="0 0 440 240">
      <rect x="214" y="70" width="12" height="150" fill="#8a5d2b"/><path d="M160 232 L280 232 L250 214 L190 214Z" fill="#8a5d2b"/>
      <g class="beam" style="transform-origin:220px 70px;transform:rotate(${th0}deg)"><rect x="66" y="66" width="308" height="9" rx="4" fill="#6b4520"/></g>
      ${panMk(70, weightsMk(70, left.map(v => ({v}))), 'L', th0)}
      ${panMk(370, weightsMk(370, [...known.map(v => ({v})), ...repeat(unk, () => ({v:'?', u:true}))]), 'R', th0)}
      <circle cx="220" cy="70" r="9" fill="#e0a526" stroke="#6b4520" stroke-width="3"/></svg></div><p class="ask">${ask}</p>`; },
    update(el, v){
      const svg = el.querySelector('svg.scale'); if(!svg) return;
      const th = tiltAngle(ks + (v==null ? 0 : v*unk) - ls);
      svg.querySelector('.beam').style.transform = `rotate(${th}deg)`;
      svg.querySelectorAll('.pan').forEach(p => p.style.transform = panT(th, p.dataset.side));
      svg.querySelectorAll('.uk rect').forEach(r => r.classList.toggle('filled', v!=null));
      svg.querySelectorAll('.uk text').forEach(t => t.textContent = v==null ? '?' : v);
    },
    hint:`<p>Vänster sida väger ${left.join(' + ')} = ${ls}.</p><p>Höger sida måste också bli ${ls}.</p>${unk===2 ? `<p>Två lika stora vikter: dela ${ls} i två lika delar.</p>` : `<p>${ks} + ? = ${ls}</p>`}`}, 'likhet');
}
function tScaleEasy(){
  let L; do{ L = Math.random()<.4 ? [rnd(5,15)] : [rnd(2,9), rnd(2,9)]; } while(sum(L) > 18 || sum(L) < 5);
  return scaleTask(L, [rnd(1, sum(L)-1)], 1, 'Vilken vikt gör vågen rak?', (a,ls,ks) => [a+1,a-1,a+2,ls,ks]);
}
function tScaleHard(big){
  if(Math.random() < .5){
    let L; do{ L = repeat(rnd(2,3), () => big ? rnd(10,60) : rnd(4,22)); } while(sum(L) > (big?150:60));
    return scaleTask(L, [rnd(3, sum(L)-3)], 1, 'Vilken vikt gör vågen rak?', (a,ls) => [a+1,a-1,a+10,a-10,ls]);
  }
  let L; do{ L = repeat(rnd(1,2), () => big ? rnd(10,50) : rnd(4,20)); } while(sum(L)%2 || sum(L) > (big?100:40) || sum(L) < 8);
  return scaleTask(L, [], 2, 'De två vikterna med ? väger lika mycket. Hur mycket väger en?', (a,ls) => [a+1,a-1,a+2,ls]);
}
