/* ============================================================
   Our Little Universe — behavior
   Data is saved to the browser's localStorage.
   ============================================================ */

const KEY = 'olu_simple_v1';

let DATA = load();

function load(){
  try{
    const raw = localStorage.getItem(KEY);
    if(raw) return JSON.parse(raw);
  }catch(e){}
  return {
    names:{a:'You', b:'Me'},
    startDate: new Date().toISOString().slice(0,10),
    msg:"Every love story is beautiful, but ours is my favorite.",
    photos:{a:null, b:null},
    notes:{her:[], him:[]},
    theme:'pink',
    activeTab:'her'
  };
}
function save(){ localStorage.setItem(KEY, JSON.stringify(DATA)); }

const $ = s => document.querySelector(s);

/* ---------- helpers ---------- */
function toast(msg){
  const t = $('#toast'); t.textContent = msg; t.classList.add('on');
  clearTimeout(t._t); t._t = setTimeout(()=>t.classList.remove('on'), 2200);
}
function esc(s){
  return (s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
function fmtDate(iso){
  if(!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString(undefined,{month:'short', day:'numeric', year:'numeric'});
}

/* ---------- floating particles ---------- */
(function initParticles(){
  const box = $('#particles');
  const icons = ['❤️','💗','💕','✨','🌸','💖','💫'];
  for(let i=0;i<20;i++){
    const s = document.createElement('span');
    s.textContent = icons[Math.floor(Math.random()*icons.length)];
    s.style.left = Math.random()*100 + '%';
    s.style.animationDuration = (14 + Math.random()*16) + 's';
    s.style.animationDelay = (Math.random()*14) + 's';
    s.style.fontSize = (11 + Math.random()*14) + 'px';
    box.appendChild(s);
  }
})();

/* ---------- heart trail on pointer move ---------- */
(function heartTrail(){
  let last = 0;
  window.addEventListener('pointermove', e=>{
    const now = performance.now();
    if(now - last < 110) return;
    last = now;
    const h = document.createElement('div');
    h.textContent = '❤';
    h.style.cssText = `
      position:fixed;left:${e.clientX}px;top:${e.clientY}px;
      pointer-events:none;font-size:13px;color:#ff5c8a;
      opacity:.75;z-index:9999;
      transition:transform 1s ease-out,opacity 1s ease-out;
    `;
    document.body.appendChild(h);
    requestAnimationFrame(()=>{
      h.style.transform = 'translateY(-44px) scale(.25)';
      h.style.opacity = '0';
    });
    setTimeout(()=>h.remove(), 1100);
  });
})();

/* ---------- counter ---------- */
function tickCounter(){
  const start = new Date(DATA.startDate + 'T00:00:00').getTime();
  const s = Math.max(0, Math.floor((Date.now() - start)/1000));

  const Y  = Math.floor(s / 31536000);
  const M  = Math.floor((s % 31536000) / 2592000);
  const D  = Math.floor((s % 2592000) / 86400);
  const h  = Math.floor((s % 86400) / 3600);
  const m  = Math.floor((s % 3600) / 60);
  const sc = s % 60;

  const items = [
    ['Years', Y], ['Months', M], ['Days', D],
    ['Hours', h], ['Minutes', m], ['Seconds', sc]
  ];
  const box = $('#counter');
  if(box.children.length !== items.length){
    box.innerHTML = '';
    items.forEach(([lbl])=>{
      const b = document.createElement('div');
      b.className = 'count-box';
      b.innerHTML = `<div class="count-num">0</div><div class="count-lbl">${lbl}</div>`;
      box.appendChild(b);
    });
  }
  items.forEach(([_, v], i)=>{
    box.children[i].querySelector('.count-num').textContent = v;
  });
}

/* ---------- render ---------- */
function renderHero(){
  $('#brand').textContent = 'Our Little Universe ❤️';
  $('#heroNames').textContent = `${DATA.names.a} & ${DATA.names.b}`;
  $('#heroMsg').textContent = DATA.msg || '';
  $('#sinceLine').textContent = DATA.startDate
    ? `Together since ${fmtDate(DATA.startDate)}`
    : 'Together since —';
  if(DATA.photos.a) $('#avaA').src = DATA.photos.a;
  if(DATA.photos.b) $('#avaB').src = DATA.photos.b;
}

function renderNotes(){
  const list = DATA.notes[DATA.activeTab] || [];
  const box = $('#notesList');
  box.innerHTML = '';
  if(!list.length){
    box.innerHTML = `<div class="empty">
      No notes yet.<br>
      ${DATA.activeTab==='her' ? 'Write something sweet for her 💗' : 'Write a note for yourself 💙'}
    </div>`;
    return;
  }
  list.slice().reverse().forEach(n=>{
    const d = document.createElement('div');
    d.className = 'note ' + DATA.activeTab;
    d.innerHTML = `
      <button class="del" title="delete" onclick="delNote('${n.id}')">✕</button>
      <div class="head">
        <div class="who">${DATA.activeTab==='her' ? '💗 For Her' : '💙 For Me'}</div>
        <div class="when">${fmtDate(n.date)}</div>
      </div>
      <div class="body">${esc(n.text)}</div>
    `;
    box.appendChild(d);
  });
}

/* ---------- actions ---------- */
function uploadPhoto(e, who){
  const f = e.target.files[0]; if(!f) return;
  const reader = new FileReader();
  reader.onload = () => {
    const img = new Image();
    img.onload = () => {
      const maxDim = 500;
      let {width:w, height:h} = img;
      if(w > h && w > maxDim){ h = h * maxDim / w; w = maxDim; }
      else if(h > maxDim){ w = w * maxDim / h; h = maxDim; }
      const c = document.createElement('canvas');
      c.width = w; c.height = h;
      c.getContext('2d').drawImage(img, 0, 0, w, h);
      const data = c.toDataURL('image/jpeg', 0.85);
      DATA.photos[who] = data;
      save();
      if(who==='a') $('#avaA').src = data; else $('#avaB').src = data;
      toast('Photo saved ❤️');
      burst(window.innerWidth/2, 200, '💖', 14);
    };
    img.src = reader.result;
  };
  reader.readAsDataURL(f);
  e.target.value = '';
}

function switchTab(which){
  DATA.activeTab = which;
  save();
  $('#tabHer').classList.toggle('on', which==='her');
  $('#tabHim').classList.toggle('on', which==='him');
  $('#noteInput').placeholder = which==='her'
    ? 'Write something sweet for her…'
    : 'A note to your own heart…';
  renderNotes();
}

function addNote(){
  const txt = $('#noteInput').value.trim();
  if(!txt){ toast('Write something first 💕'); return; }
  DATA.notes[DATA.activeTab].push({
    id: Math.random().toString(36).slice(2,10),
    text: txt,
    date: new Date().toISOString()
  });
  save();
  $('#noteInput').value = '';
  renderNotes();
  toast('Note saved 💌');
  burst(window.innerWidth/2, window.innerHeight - 200, '💗', 12);
}

function delNote(id){
  if(!confirm('Delete this note?')) return;
  DATA.notes[DATA.activeTab] = DATA.notes[DATA.activeTab].filter(n=>n.id!==id);
  save();
  renderNotes();
}

function saveSettings(){
  DATA.names.a   = $('#inA').value.trim() || 'You';
  DATA.names.b   = $('#inB').value.trim() || 'Me';
  DATA.startDate = $('#inDate').value || DATA.startDate;
  DATA.msg       = $('#inMsg').value.trim();
  save();
  renderHero();
  tickCounter();
  toast('Saved ❤️');
  burst(window.innerWidth/2, 200, '❤️', 10);
}

function fillSettings(){
  $('#inA').value    = DATA.names.a;
  $('#inB').value    = DATA.names.b;
  $('#inDate').value = DATA.startDate;
  $('#inMsg').value  = DATA.msg;
}

/* ---------- themes ---------- */
document.querySelectorAll('#themePick .dot').forEach(dot=>{
  dot.onclick = () => {
    const t = dot.dataset.t;
    document.body.dataset.theme = t;
    DATA.theme = t;
    save();
    document.querySelectorAll('#themePick .dot').forEach(d=>d.classList.toggle('on', d===dot));
  };
});

/* ---------- burst animation ---------- */
function burst(x, y, icon='❤️', count=14){
  for(let i=0;i<count;i++){
    const c = document.createElement('div');
    c.className = 'confetti';
    c.textContent = icon;
    c.style.left = x + 'px';
    c.style.top  = y + 'px';
    c.style.fontSize = (12 + Math.random()*16) + 'px';
    const dx = (Math.random() - 0.5) * 380;
    const dy = -Math.random() * 260;
    document.body.appendChild(c);
    c.animate([
      {transform:'translate(0,0) rotate(0)', opacity:1},
      {transform:`translate(${dx}px, ${dy + 380}px) rotate(${(Math.random()-0.5)*720}deg)`, opacity:0}
    ], {duration: 1400 + Math.random()*800, easing:'cubic-bezier(.2,.7,.3,1)'});
    setTimeout(()=>c.remove(), 2200);
  }
}

/* ---------- easter eggs ---------- */
document.addEventListener('dblclick', e=>{
  if(e.target.id === 'brand'){
    toast('💖 Secret found: I love you more than words can say. 💖');
    burst(e.clientX, e.clientY, '💖', 24);
  }
});

let heartTaps = 0, heartTimer;
$('#secretHeart').onclick = (e)=>{
  heartTaps++;
  clearTimeout(heartTimer);
  heartTimer = setTimeout(()=>{ heartTaps = 0; }, 1200);
  if(heartTaps >= 3){
    heartTaps = 0;
    toast('🌹 You are my favorite person, always.');
    burst(e.clientX, e.clientY, '🌹', 20);
  } else {
    burst(e.clientX, e.clientY, '💗', 4);
  }
};

/* ---------- boot ---------- */
(function boot(){
  if(DATA.theme && DATA.theme !== 'pink'){
    document.body.dataset.theme = DATA.theme;
    document.querySelectorAll('#themePick .dot').forEach(d=>{
      d.classList.toggle('on', d.dataset.t === DATA.theme);
    });
  }
  renderHero();
  fillSettings();
  switchTab(DATA.activeTab || 'her');
  tickCounter();
  setInterval(tickCounter, 1000);
})();