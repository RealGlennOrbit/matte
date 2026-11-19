'use strict';
/* =====================================================================
   BILDKOD FÖR SPELARE PÅ DEN HÄR DATORN
   Varje barn väljer tre egna bilder. De behövs för att öppna barnets spelare,
   så att ett annat barn inte kan spela på någon annans konto.
   Det är ett enkelt lås för barn, inget starkt lösenord.
   En vuxen kan nollställa bildkoden i lärarvyn (Vuxen → Den här datorn).
   ===================================================================== */
const LOCK_SET = ['sol','pyramid','vatten','oga','ankh','blomma','fisk','skepp','stjarna'];
const localLockOn = () => store.localLock !== false;
function lockHash(id, picks){
  let h = 2166136261; const s = `lokal|${id}|${picks.join(',')}|bikupan`;
  for(let i=0;i<s.length;i++){ h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return (h >>> 0).toString(36);
}
let lockWait = {};   // spärr efter för många fel: id → tid

/* Visar bildrutan. mode: 'set' = välj nya bilder, 'check' = skriv bilderna */
function picDialog({name, avatar, title, text, onPicks, onCancel}){
  let picks = [], busy = false;
  const ov = overlay(`${avatarSVG(avatar,90)}<h2>${title}</h2><p id="ptext" style="font-size:1.2rem;margin:4px 0 10px">${text}</p>
    <div class="picslots" id="slots"></div><div class="picgrid" id="pg">${LOCK_SET.map((g,i) => `<button data-i="${i}" aria-label="${GNAME1[g]}">${glyph(g,58)}</button>`).join('')}</div>
    <p class="msg" id="pmsg"></p><div class="btns"><button class="btn secondary small" id="cx">${onCancel ? 'Avbryt' : 'Det är inte jag'}</button><button class="btn secondary small" id="undo">Sudda</button></div>`);
  ov.querySelector('.dialog').classList.add('picdialog');
  const slots = ov.querySelector('#slots'), msg = ov.querySelector('#pmsg'), pg = ov.querySelector('#pg'), pt = ov.querySelector('#ptext');
  const draw = () => slots.innerHTML = repeat(3, i => `<span class="slot">${picks[i] != null ? glyph(LOCK_SET[picks[i]],44) : ''}</span>`).join('');
  const prev = keyHandler;
  const api = {
    close(){ ov.remove(); keyHandler = prev; },
    reset(t, bad){ picks = []; busy = false; draw(); msg.textContent = t || ''; msg.className = 'msg' + (bad ? '' : ' good');
      if(bad){ pg.classList.remove('shake'); void pg.offsetWidth; pg.classList.add('shake'); sfx.bad(); } },
    text(t){ pt.innerHTML = t; }
  };
  pg.querySelectorAll('button').forEach(b => b.onclick = () => {
    if(busy || picks.length >= 3) return;
    picks.push(+b.dataset.i); sfx.click(); draw(); msg.textContent = '';
    if(picks.length === 3){ busy = true; setTimeout(() => onPicks([...picks], api), 250); }
  });
  ov.querySelector('#undo').onclick = () => { if(!busy){ picks.pop(); draw(); } };
  ov.querySelector('#cx').onclick = () => { api.close(); if(onCancel) onCancel(); };
  keyHandler = e => {
    if(e.key === 'Escape'){ api.close(); if(onCancel) onCancel(); }
    else if(/^[1-9]$/.test(e.key)) pg.querySelectorAll('button')[+e.key-1].click();
    else if(e.key === 'Backspace'){ e.preventDefault(); ov.querySelector('#undo').click(); }
  };
  draw();
  return api;
}

/* Barnet väljer sina bilder: först en gång, sedan samma igen för att vara säker */
function chooseLock(p, done, onCancel){
  let first = null;
  picDialog({name:p.name, avatar:p.avatar, title:`Välj din hemliga bildkod, ${esc(p.name)}!`,
    text:'Tryck på <b>tre bilder</b>. Kom ihåg dem! Du behöver dem varje gång du ska spela.',
    onCancel,
    onPicks(picks, d){
      if(!first){ first = picks; d.text('Tryck på <b>samma tre bilder</b> en gång till.'); d.reset('Bra! En gång till.'); return; }
      if(first.join() !== picks.join()){ first = null; d.text('Tryck på <b>tre bilder</b>. Kom ihåg dem!'); d.reset('Bilderna var inte samma. Börja om.', true); return; }
      p.lock = lockHash(p.id, picks); d.close(); done();
    }});
}

/* Öppnar ett barns spelare på den här datorn */
function openLocalProfile(p){
  const enter = () => { player = p; player.last = Date.now(); saveStore(); sfx.ok(); showMap(curWorld(player).w); };
  if(!localLockOn()) return enter();
  if(!p.lock) return chooseLock(p, enter);
  let fails = 0;
  picDialog({name:p.name, avatar:p.avatar, title:`Hej ${esc(p.name)}!`, text:'Tryck på dina tre bilder i rätt ordning.',
    onPicks(picks, d){
      if(lockWait[p.id] && lockWait[p.id] > Date.now()){ d.reset('Vänta en liten stund och försök igen.', true); return; }
      if(lockHash(p.id, picks) === p.lock){ d.close(); enter(); return; }
      fails++;
      if(fails >= 5){ lockWait[p.id] = Date.now() + 60000; fails = 0; d.reset('För många försök. Vänta en minut eller be en vuxen om hjälp.', true); }
      else d.reset('Fel bilder. Försök igen!', true);
    }});
}
