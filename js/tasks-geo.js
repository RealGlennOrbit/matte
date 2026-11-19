'use strict';
/* Geometri */
function tShapes(){
  const names = Object.keys(SHAPES);
  if(Math.random() < .55){
    const ans = pick(names);
    return sk({prompt:`<p class="ask" style="font-size:1.8rem">Vilken är en <u>${ans}</u>?</p>`, answer:ans, options:shuffle([...names]), fmt:n => shapeSVG(n, 70), mcOnly:true,
      hint:'<p>Cirkel: rund. Triangel: 3 hörn. Kvadrat: 4 lika långa sidor. Rektangel: 4 hörn, två långa och två korta sidor.</p>'}, 'former');
  }
  const n = pick(names), ans = CORNERS[n];
  return sk({prompt:`${shapeSVG(n,120)}<p class="ask">Hur många hörn har ${n === 'cirkel' ? 'cirkeln' : n === 'triangel' ? 'triangeln' : n === 'kvadrat' ? 'kvadraten' : 'rektangeln'}?</p>`, answer:ans,
    options:shuffle([0,3,4,5]), hint:'<p>Ett hörn är där två sidor möts. Peka på varje hörn och räkna. En cirkel har inga hörn.</p>'}, 'former');
}
function tSolids(){
  const all = Object.keys(SOLIDS);
  const qs = [
    ['klot','Vilken kropp kan rulla åt alla håll, som en boll?'], ['kon','Vilken kropp liknar en glasstrut?'],
    ['cylinder','Vilken kropp liknar en burk?'], ['ratblock','Vilken kropp liknar en skokartong?'], ['kub','Vilken kropp liknar en tärning?'],
  ];
  const k = rnd(0,2);
  if(k === 0){
    const [ans, q] = pick(qs);
    const pool = all.filter(x => !(ans==='kub' && x==='ratblock') && !(ans==='ratblock' && x==='kub'));
    return sk({prompt:`<p class="ask" style="font-size:1.6rem">${q}</p>`, answer:ans, options:mcOpts(ans, pool), fmt:n => solidSVG(n, 74), mcOnly:true,
      hint:`<p>${solidSVG(ans,60)} Det här är en ${SOLIDNAME[ans].toLowerCase()}. Hittar du den?</p>`}, 'kroppar');
  }
  if(k === 1){
    const ans = pick(all);
    return sk({prompt:`${solidSVG(ans,130)}<p class="ask">Vad heter kroppen?</p>`, answer:ans, options:mcOpts(ans, all), fmt:n => SOLIDNAME[n], optClass:'wide', mcOnly:true,
      hint:'<p>Klot = rund som en boll. Kon = spetsig som en strut. Cylinder = som en burk. Rätblock = som en låda. Kub = alla sidor är lika stora kvadrater.</p>'}, 'kroppar');
  }
  const ans = pick(['klot','kon','cylinder']);
  const q = {klot:'Vilken kropp har inga hörn och inga platta ytor?', kon:'Vilken kropp har en spets och en rund botten?', cylinder:'Vilken kropp har två runda platta ytor?'}[ans];
  return sk({prompt:`<p class="ask" style="font-size:1.6rem">${q}</p>`, answer:ans, options:mcOpts(ans, all), fmt:n => solidSVG(n, 74), mcOnly:true,
    hint:'<p>Titta på varje kropp. Var finns det runda ytor? Var finns det spetsar och hörn?</p>'}, 'kroppar');
}
function tPosition(){
  const rels = [['ovanför',0,-1],['under',0,1],['till vänster om',-1,0],['till höger om',1,0]];
  for(let tries=0; tries<200; tries++){
    const items = shuffle([...EGYPT, 'palm','kista']).slice(0,5);
    const cells = shuffle(repeat(9, i => i)).slice(0,5);
    const at = {}; items.forEach((g,i) => at[cells[i]] = g);
    const ri = rnd(0,4), [rel,dx,dy] = pick(rels);
    const rc = cells[ri], x = rc%3 + dx, y = Math.floor(rc/3) + dy;
    if(x<0||x>2||y<0||y>2) continue;
    const tc = y*3+x; if(!at[tc]) continue;
    const ref = items[ri], ans = at[tc];
    const grid = mark => `<div class="posgrid">${repeat(9, i => `<div class="${mark && i===rc ? 'ref' : ''}">${at[i] ? glyph(at[i],60) : ''}</div>`).join('')}</div>`;
    return sk({prompt:`${grid(false)}<p class="ask">Vad finns <u>${rel}</u> ${GNAME1[ref]} ${glyph(ref,36)}?</p>`, answer:ans,
      options:shuffle(items.filter(g => g!==ref)), fmt:g => glyph(g,52), mcOnly:true,
      hint:`<p>Hitta ${GNAME1[ref]} (den blå rutan). Titta sedan ${rel === 'ovanför' ? 'uppåt' : rel === 'under' ? 'neråt' : rel === 'till vänster om' ? 'åt vänster' : 'åt höger'}.</p>${grid(true)}`}, 'lage');
  }
  return tShapes();
}
function tSymmetry(){
  let L, ok = false;
  while(!ok){
    L = repeat(4, () => repeat(3, () => Math.random() < .5 ? 1 : 0));
    const filled = sum(L.map(r => sum(r)));
    ok = filled >= 4 && filled <= 9 && L.some(r => r[0] !== r[2]);
  }
  const mirror = L.map(r => [...r].reverse()), copy = L.map(r => [...r]);
  const wrong = mirror.map(r => [...r]); const y = rnd(0,3), x = rnd(0,2); wrong[y][x] ^= 1;
  const full = R => L.map((r,i) => [...r, ...R[i]]);
  const key = R => JSON.stringify(R);
  const opts = [['A',mirror],['B',copy],['C',wrong]];
  if(key(copy) === key(wrong)) wrong[(y+1)%4][(x+1)%3] ^= 1;
  const ord = shuffle(opts);
  const map = {}; ord.forEach(([k,R]) => map[k] = R);
  const half = L.map(r => [...r, 0,0,0]);
  return sk({prompt:`${pixelFig(half,6,4,26,'#2f6fd6',3)}<p class="ask">Den röda linjen är en spegel. Vilken bild blir symmetrisk?</p>`, answer:'A',
    options:ord.map(o => o[0]), fmt:k => pixelFig(full(map[k]),6,4,18,'#2f6fd6',3), optClass:'three', mcOnly:true,
    hint:'<p>Det som är nära spegeln på vänster sida ska också vara nära spegeln på höger sida. Det är som att vika pappret på mitten.</p>'}, 'symmetri');
}
function tScaleGeo(){
  if(Math.random() < .5){
    const w = rnd(2,3), h = rnd(2,3);
    let F; do{ F = repeat(h, () => repeat(w, () => Math.random() < .7 ? 1 : 0)); } while(sum(F.map(r=>sum(r))) < 3 || F.some(r => !sum(r)) || !repeat(w, x => F.some(r => r[x])).every(Boolean));
    const big = repeat(h*2, y => repeat(w*2, x => F[y>>1][x>>1]));
    const wide = repeat(h, y => repeat(w*2, x => F[y][x>>1]));
    const tall = repeat(h*2, y => repeat(w, x => F[y>>1][x]));
    const m = {A:[big,w*2,h*2], B:[wide,w*2,h], C:[tall,w,h*2]};
    return sk({prompt:`${pixelFig(F,w,h,14,'#c0392b')}<p class="ask">Förstora figuren så att den blir dubbelt så bred och dubbelt så hög. Vilken bild är rätt?</p>`, answer:'A',
      options:shuffle(['A','B','C']), fmt:k => pixelFig(m[k][0], m[k][1], m[k][2], 14, '#c0392b'), optClass:'three', mcOnly:true,
      hint:`<p>Varje ruta blir 2 rutor bred och 2 rutor hög. Figuren är ${w} rutor bred, så den nya blir ${w*2} rutor bred.</p>`}, 'skala');
  }
  const k = rnd(0,1);
  if(k===0){ const len = rnd(2,9), f = pick([2,3,10]); const ans = len*f;
    return sk({prompt:`<div class="story">På en bild är ett skepp ${len} cm långt.<br>På en förstorad bild är allt ${f === 2 ? 'dubbelt så stort' : f + ' gånger så stort'}.<br>Hur långt är skeppet på den nya bilden?</div>`, answer:ans,
      options:distract(ans,[len+f, ans+len, ans-len]), hint:`<p>Allt blir ${f} gånger så stort: ${f} · ${len} = ?</p>`}, 'skala'); }
  const real = pick([20,30,40,60,80]), f = pick([2,10]), ans = real/f;
  return sk({prompt:`<div class="story">Kolossen var ungefär ${real} meter hög.<br>En modell är ${f === 2 ? 'hälften så stor' : '10 gånger mindre'}.<br>Hur hög är modellen i meter?</div>`, answer:ans,
    options:distract(ans,[real-f, ans*2, ans+10].filter(v=>v>0)), hint:`<p>${f===2 ? 'Hälften: dela med 2.' : '10 gånger mindre: dela med 10.'} ${real} / ${f} = ?</p>`}, 'skala');
}
function tLength(){
  if(Math.random() < .6){
    const n = rnd(3,12), U = 34;
    const svg = `<svg viewBox="0 0 ${13*U+10} 90" width="${13*U+10}" height="90" style="max-width:100%"><path d="M8 26 Q${8+n*U*0.25} 6 ${8+n*U*0.5} 26 T${8+n*U} 26" stroke="#4f9a3a" stroke-width="12" fill="none" stroke-linecap="round"/><circle cx="${8+n*U}" cy="26" r="9" fill="#4f9a3a"/><circle cx="${11+n*U}" cy="23" r="2" fill="#111"/>${repeat(12, i => `<rect x="${8+i*U}" y="50" width="${U}" height="${U-4}" fill="${i<n?'#ffe08a':'#f3f0e6'}" stroke="#8a6b10" stroke-width="2"/>`).join('')}</svg>`;
    return sk({prompt:`${svg.replace(/#ffe08a/g,'#f3f0e6')}<p class="ask">Ormen ligger från början av första klossen. Hur många klossar lång är ormen?</p>`, answer:n,
      options:distract(n,[n+1,n-1,n+2]), hint:`<p>Räkna klossarna under ormen, från vänster till ormens huvud.</p>${svg}`}, 'matning');
  }
  const cols = [['Röda','#d64545'],['Blå','#2f6fd6'],['Gröna','#2e9e4f']];
  const lens = shuffle([rnd(4,6), rnd(7,9), rnd(10,12)]), longest = Math.random() < .5;
  const target = longest ? Math.max(...lens) : Math.min(...lens);
  const ans = cols[lens.indexOf(target)][0];
  const svg = `<svg viewBox="0 0 430 130" width="430" height="130" style="max-width:100%">${cols.map((c,i) => `<rect x="${10 + (i===1?40:0)}" y="${12+i*40}" width="${lens[i]*30}" height="22" rx="11" fill="${c[1]}"/>`).join('')}</svg>`;
  return sk({prompt:`${svg}<p class="ask">Vilken orm är ${longest ? 'längst' : 'kortast'}?</p>`, answer:ans, options:cols.map(c => c[0]), optClass:'three', mcOnly:true,
    hint:'<p>Akta dig! Ormarna börjar inte på samma ställe. Titta på hur långa de är, inte var de slutar.</p>'}, 'matning');
}
/* kinds: 'langd', 'massa', 'volym' (standard: alla) */
function tUnits(level, kinds){
  kinds = kinds || ['langd','massa','volym'];
  const KIND = {cm:'langd',m:'langd',km:'langd',dm:'langd',g:'massa',kg:'massa',dl:'volym',liter:'volym'};
  const k = rnd(0, level >= 2 ? 2 : 1);
  if(k === 0){
    const qs = [['En penna är 15 ___ lång.','cm',['cm','m','km']],['En dörr är 2 ___ hög.','m',['cm','m','km']],['Till nästa stad är det 12 ___.','km',['cm','m','km']],
      ['En katt väger 4 ___.','kg',['g','kg']],['Ett äpple väger 150 ___.','g',['g','kg']],['Ett mjölkpaket rymmer 1 ___.','liter',['dl','liter']],
      ['En kopp rymmer 2 ___.','dl',['dl','liter']],['En säng är 2 ___ lång.','m',['cm','m','km']],['Ett suddgummi väger 20 ___.','g',['g','kg']],['Ett badkar rymmer 150 ___.','liter',['dl','liter']]];
    const [q, ans, opts] = pick(qs.filter(x => kinds.includes(KIND[x[1]])));
    return sk({prompt:`<div class="story">${q.replace('___','<span class="box"></span>')}</div><p class="ask">Vilken enhet passar?</p>`, answer:ans, options:opts, optClass:opts.length===3?'three':'wide', mcOnly:true,
      hint:'<p>Längd: cm (kort), m (meter), km (långt). Vikt: g (lätt), kg (tungt). Volym: dl (lite), liter (mer).</p>'}, 'matning');
  }
  if(k === 1){
    const qs = [[n => `${n} m = ? cm`, 100, 'cm'],[n => `${n} liter = ? dl`, 10, 'dl'],[n => `${n} kg = ? g`, 1000, 'g'],[n => `${n} m = ? dm`, 10, 'dm']];
    const [f, mul] = pick(qs.slice(0, level >= 2 ? 4 : 2).filter(x => kinds.includes(KIND[x[2]])).concat(kinds.includes('langd') || kinds.includes('volym') ? [] : [qs[2]])), n = mul === 1000 ? 1 : rnd(1, mul===100 ? 5 : 9), ans = n*mul;
    return sk({prompt:`<div class="eq mid">${f(n).replace('?', '<span class="qm">?</span>')}</div>`, answer:ans, options:distract(ans,[n*10, n*100, n, ans+mul].filter(v=>v!==ans)),
      hint:'<p>1 meter = 10 dm = 100 cm. 1 liter = 10 dl. 1 kg = 1000 g.</p>'}, 'matning');
  }
  const sets = [[['1 m','100 cm'],'90 cm','120 cm','80 cm'],[['1 liter','10 dl'],'8 dl','12 dl','5 dl']].filter(x => kinds.includes(x[0][0]==='1 m'?'langd':'volym'));
  if(!sets.length) return tUnits(level, kinds);
  const which = pick(sets), cand = [which[1], which[2], which[3]];
  const vals = cand.map(s => parseInt(s));
  const ans = cand[vals.indexOf(Math.max(...vals))];
  return sk({prompt:`<p class="ask" style="font-size:1.6rem">Vilken är mest? Tänk på att ${which[0][0]} = ${which[0][1]}.</p>`, answer:ans, options:shuffle([...cand, which[0][0]]).filter((v,i,a)=>a.indexOf(v)===i), optClass:'wide', mcOnly:true,
    hint:`<p>Gör om allt till samma enhet. ${which[0][0]} = ${which[0][1]}.</p>`}, 'matning');
}
const nx = h => h%12 + 1;
function clockLabel(h, m){
  if(m===0) return `Klockan ${h}`;
  if(m===30) return `Halv ${nx(h)}`;
  if(m===15) return `Kvart över ${h}`;
  return `Kvart i ${nx(h)}`;
}
/* level: 0 = hel timme, 1 = hel och halv, 2 = + kvart, 3 = + tidsskillnad och minuter */
function tClock(level){
  if(level >= 3 && Math.random() < .4){
    if(Math.random() < .5){
      const [w, ans] = pick([['en kvart',15],['en halvtimme',30],['en timme',60],['tre kvart',45]]);
      return sk({prompt:`<p class="ask" style="font-size:1.6rem">Hur många minuter är ${w}?</p>`, answer:ans, options:distract(ans,[15,30,45,60,100]),
        hint:'<p>En timme = 60 minuter. En halvtimme = 30 minuter. En kvart = 15 minuter.</p>'}, 'tid');
    }
    const h = rnd(1,9), dur = pick([30,60,90,120]), endM = dur%60, endH = h + Math.floor(dur/60) + (endM ? 0 : 0);
    const label = d => ({30:'en halvtimme', 60:'1 timme', 90:'1 och en halv timme', 120:'2 timmar'})[d];
    return sk({prompt:`<div class="story">Filmen börjar ${clockLabel(h,0).toLowerCase()}.<br>Den slutar ${clockLabel(endH, endM).toLowerCase()}.<br>Hur lång är filmen?</div>`, answer:label(dur), options:shuffle([30,60,90,120].map(label)), optClass:'wide', mcOnly:true,
      hint:'<p>Räkna halvtimmar på klockan: klockan 3 → halv 4 → klockan 4. Varje steg är en halvtimme.</p>'}, 'tid');
  }
  const mins = level >= 2 ? [0,15,30,45] : level === 1 ? [0,30] : [0];
  const h = rnd(1,12), m = pick(mins), ans = clockLabel(h,m), prev = h===1 ? 12 : h-1;
  const cands = new Set();
  [[h,(m+30)%60],[nx(h),m],[prev,m],[h,0],[prev,30],[h,30],[nx(h),0]].forEach(([a,b]) => { if(mins.includes(b)) cands.add(clockLabel(a,b)); });
  if(level >= 2){ cands.add(clockLabel(h,(m+15)%60)); cands.add(clockLabel(h,(m+45)%60)); }
  cands.delete(ans);
  const opts = shuffle([...cands]).slice(0,3);
  while(opts.length < 3){ const l = clockLabel(rnd(1,12), pick(mins)); if(l!==ans && !opts.includes(l)) opts.push(l); }
  return sk({prompt:`${clockSVG(h,m)}<p class="ask">Vad är klockan?</p>`, answer:ans, options:shuffle([ans,...opts]), optClass:'wide', mcOnly:true,
    hint:`${clockSVG(h,m,true,170)}<p><span style="color:#2456a8">Korta visaren</span> visar timmen. <span style="color:#d64545">Långa visaren</span> visar minuterna.</p><p>Långa visaren på 12 = hel timme, på 6 = halv${level>=2?', på 3 = kvart över, på 9 = kvart i':''}.</p><p>"Halv ${nx(h)}" betyder en halvtimme innan ${nx(h)}.</p>`}, 'tid');
}
