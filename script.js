/* ============================================================
   Our Little Universe — behavior
   Data is saved to the browser's localStorage.
   ============================================================ */

const KEY = 'olu_simple_v1';

let DATA = load();

function load(){
  try{
    const raw = localStorage.getItem(KEY);
    if(raw){
      const parsed = JSON.parse(raw);
      if(!parsed.gallery) parsed.gallery = [];
      if(!parsed.yesDate) parsed.yesDate = '';
      return parsed;
    }
  }catch(e){}
  return {
    names:{a:'You', b:'Me'},
    startDate: new Date().toISOString().slice(0,10),
    yesDate: '',
    msg:"Every love story is beautiful, but ours is my favorite.",
    photos:{a:null, b:null},
    gallery:[],
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
function ordinal(n){
  const s = ['th','st','nd','rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
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

/* ---------- render hero ---------- */
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

/* ---------- ANNIVERSARY LOGIC ---------- */
function renderAnniversaries(){
  const grid = document.getElementById('anniversaryGrid');
  const line = document.getElementById('yesDateLine');
  if(!grid) return;

  if(!DATA.yesDate){
    line.textContent = 'Set the date she said YES in "Our Details" below.';
    grid.innerHTML = `<div class="empty" style="grid-column:1/-1;">💍 No date set yet.<br>Scroll down and fill "The day she said YES".</div>`;
    return;
  }

  const yes = new Date(DATA.yesDate + 'T00:00:00');
  const now = new Date();
  now.setHours(0,0,0,0);

  line.innerHTML = `💍 She said YES on <b>${fmtDate(DATA.yesDate)}</b>`;

  /* ----- MONTHLY ANNIVERSARY ----- */
  const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  // total months since yesDate
  let totalMonths = (now.getFullYear() - yes.getFullYear()) * 12 + (now.getMonth() - yes.getMonth());
  if(now.getDate() < yes.getDate()) totalMonths--;

  // next monthly anniversary
  let nextMonthDate = new Date(yes);
  nextMonthDate.setMonth(yes.getMonth() + totalMonths + 1);

  // if that day doesn't exist in the month (e.g. 31st), clamp to last day
  const daysInNextMonth = new Date(nextMonthDate.getFullYear(), nextMonthDate.getMonth()+1, 0).getDate();
  if(nextMonthDate.getDate() > daysInNextMonth){
    nextMonthDate.setDate(daysInNextMonth);
  }

  // is today the monthly anniversary?
  const isMonthlyToday = (now.getDate() === yes.getDate() ||
    (yes.getDate() > 28 && now.getDate() === new Date(now.getFullYear(), now.getMonth()+1, 0).getDate()));

  let monthlyDays;
  if(isMonthlyToday){
    monthlyDays = 0;
  } else {
    monthlyDays = Math.ceil((nextMonthDate - now) / 86400000);
  }
  const nextMonthLabel = monthNames[nextMonthDate.getMonth()] + ' ' + nextMonthDate.getDate();

  /* ----- YEARLY ANNIVERSARY ----- */
  const yearsSince = now.getFullYear() - yes.getFullYear();
  const thisYearAnniv = new Date(now.getFullYear(), yes.getMonth(), yes.getDate());
  const nextYearAnniv = thisYearAnniv >= now
    ? thisYearAnniv
    : new Date(now.getFullYear()+1, yes.getMonth(), yes.getDate());

  const isYearlyToday = thisYearAnniv.getTime() === now.getTime();
  let yearlyDays = isYearlyToday ? 0 : Math.ceil((nextYearAnniv - now) / 86400000);
  const nextYearLabel = fmtDate(nextYearAnniv);

  /* ----- RENDER MONTHLY BOX ----- */
  const monthlyBox = isMonthlyToday ? 'today' : '';
  const monthlySub = isMonthlyToday
    ? '🎉 Today is our monthly anniversary!'
    : `Next: ${nextMonthLabel}`;

  const totalMonthsLabel = totalMonths < 0 ? 0 : totalMonths;

  /* ----- RENDER YEARLY BOX ----- */
  const yearlyBox = isYearlyToday ? 'today' : '';
  const yearlySub = isYearlyToday
    ? '🎉 Happy Anniversary!'
    : `Next: ${nextYearLabel}`;

  grid.innerHTML = `
    <div class="ann-box ${monthlyBox}">
      <span class="ann-icon">🌙</span>
      <div class="ann-label">Monthly</div>
      <div class="ann-num">${monthlyDays}</div>
      <div class="ann-unit">day${monthlyDays === 1 ? '' : 's'} to go</div>
      <div class="ann-sub">${monthlySub}</div>
    </div>
    <div class="ann-box ${yearlyBox}">
      <span class="ann-icon">💍</span>
      <div class="ann-label">Yearly</div>
      <div class="ann-num">${yearlyDays}</div>
      <div class="ann-unit">day${yearlyDays === 1 ? '' : 's'} to go</div>
      <div class="ann-sub">${yearlySub}</div>
    </div>
    <div class="ann-box" style="grid-column:1/-1;">
      <span class="ann-icon">💕</span>
      <div class="ann-label">Months Together</div>
      <div class="ann-num">${totalMonthsLabel}</div>
      <div class="ann-unit">month${totalMonthsLabel === 1 ? '' : 's'} since she said yes</div>
      <div class="ann-sub">${ordinal(totalMonthsLabel)} month together ❤️</div>
    </div>
  `;

  /* ----- CELEBRATION IF TODAY ----- */
  if(isMonthlyToday || isYearlyToday){
    if(!sessionStorage.getItem('annivCelebrated_' + now.toDateString())){
      sessionStorage.setItem('annivCelebrated_' + now.toDateString(), '1');
      setTimeout(()=>{
        burst(window.innerWidth/2, window.innerHeight/2, '🎉', 40);
        burst(window.innerWidth/2, 200, '💖', 20);
        toast(isYearlyToday
          ? '💍 Happy Anniversary, my love!'
          : '🎉 Happy monthly anniversary!');
      }, 800);
    }
  }
}

/* ---------- render notes ---------- */
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

/* ---------- avatar photos ---------- */
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
      try { save(); } catch(err){ toast('Storage full 💔'); return; }
      if(who==='a') $('#avaA').src = data; else $('#avaB').src = data;
      toast('Photo saved ❤️');
      burst(window.innerWidth/2, 200, '💖', 14);
    };
    img.src = reader.result;
  };
  reader.readAsDataURL(f);
  e.target.value = '';
}

/* ---------- notes actions ---------- */
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
  try { save(); } catch(err){ toast('Storage full 💔'); return; }
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

/* ---------- settings ---------- */
function saveSettings(){
  DATA.names.a   = $('#inA').value.trim() || 'You';
  DATA.names.b   = $('#inB').value.trim() || 'Me';
  DATA.startDate = $('#inDate').value || DATA.startDate;
  DATA.yesDate   = $('#inYesDate').value || '';
  DATA.msg       = $('#inMsg').value.trim();
  save();
  renderHero();
  renderAnniversaries();
  tickCounter();
  toast('Saved ❤️');
  burst(window.innerWidth/2, 200, '❤️', 10);
}

function fillSettings(){
  $('#inA').value       = DATA.names.a;
  $('#inB').value       = DATA.names.b;
  $('#inDate').value    = DATA.startDate;
  $('#inYesDate').value = DATA.yesDate || '';
  $('#inMsg').value     = DATA.msg;
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

/* ============================================================
   PHOTO GALLERY
   ============================================================ */

let viewerList = [];
let viewerIdx = 0;

function addGalleryPhotos(e){
  const files = [...e.target.files];
  if(!files.length) return;

  files.forEach(file => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const maxDim = 800;
        let {width: w, height: h} = img;
        if(w > h && w > maxDim){ h = Math.round(h * maxDim / w); w = maxDim; }
        else if(h > maxDim){ w = Math.round(w * maxDim / h); h = maxDim; }

        const canvas = document.createElement('canvas');
        canvas.width = w; canvas.height = h;
        canvas.getContext('2d').drawImage(img, 0, 0, w, h);

        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);

        const photo = {
          id: Math.random().toString(36).slice(2,10),
          src: dataUrl,
          caption: '',
          date: new Date().toISOString().slice(0,10),
          fav: false
        };

        DATA.gallery.unshift(photo);
        try { save(); } catch(err){
          DATA.gallery.shift();
          toast('Storage full — try smaller photos 💔');
          return;
        }

        renderGallery();
        burst(window.innerWidth/2, 200, '📸', 10);
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });

  e.target.value = '';
  toast('Photos added ❤️');
}

function renderGallery(){
  const grid = document.getElementById('galleryGrid');
  if(!grid) return;

  const list = DATA.gallery || [];
  grid.innerHTML = '';

  if(!list.length){
    grid.innerHTML = '<div class="empty" style="grid-column:1/-1;">No photos yet. Tap "+ Add Photos" to start 💕</div>';
    return;
  }

  list.forEach(p => {
    const item = document.createElement('div');
    item.className = 'gal-item';
    item.innerHTML = `
      <img src="${p.src}" loading="lazy" alt="">
      ${p.fav ? '<div class="gal-fav">❤️</div>' : ''}
      <button class="gal-del" title="delete">✕</button>
      ${p.caption ? `<div class="gal-cap">${esc(p.caption)}</div>` : ''}
    `;

    item.querySelector('img').onclick = (e) => {
      e.stopPropagation();
      openViewer(list, list.indexOf(p));
    };

    item.ondblclick = (e) => {
      e.stopPropagation();
      p.fav = !p.fav;
      save();
      renderGallery();
      burst(e.clientX, e.clientY, p.fav ? '❤️' : '💔', 8);
    };

    item.querySelector('.gal-del').onclick = (e) => {
      e.stopPropagation();
      if(!confirm('Delete this photo?')) return;
      DATA.gallery = DATA.gallery.filter(x => x.id !== p.id);
      save();
      renderGallery();
    };

    item.oncontextmenu = (e) => {
      e.preventDefault();
      editPhotoCaption(p.id);
    };

    grid.appendChild(item);
  });
}

function editPhotoCaption(id){
  const p = DATA.gallery.find(x => x.id === id);
  if(!p) return;

  const newCap = prompt('Caption for this photo:', p.caption || '');
  if(newCap === null) return;
  p.caption = newCap.trim();

  const newDate = prompt('Date (YYYY-MM-DD):', p.date || '');
  if(newDate !== null && newDate.trim()){
    p.date = newDate.trim();
  }

  save();
  renderGallery();
  toast('Saved ❤️');
}

function openViewer(list, idx){
  viewerList = list;
  viewerIdx = idx;
  showViewer();
  document.getElementById('viewer').classList.add('on');
  document.body.style.overflow = 'hidden';
}

function showViewer(){
  const p = viewerList[viewerIdx];
  if(!p) return;
  const v = document.getElementById('viewer');
  v.innerHTML = `
    <button class="v-close" onclick="closeViewer()">✕</button>
    <button class="v-nav v-prev" onclick="viewerMove(-1)">‹</button>
    <button class="v-nav v-next" onclick="viewerMove(1)">›</button>
    <img src="${p.src}" alt="">
    <div class="v-cap">${esc(p.caption || '')} ${p.date ? '· ' + p.date : ''}</div>
  `;
}

function viewerMove(d){
  viewerIdx = (viewerIdx + d + viewerList.length) % viewerList.length;
  showViewer();
}

function closeViewer(){
  document.getElementById('viewer').classList.remove('on');
  document.body.style.overflow = '';
}

document.addEventListener('keydown', e => {
  const v = document.getElementById('viewer');
  if(!v || !v.classList.contains('on')) return;
  if(e.key === 'Escape') closeViewer();
  if(e.key === 'ArrowLeft') viewerMove(-1);
  if(e.key === 'ArrowRight') viewerMove(1);
});

(function viewerSwipe(){
  let startX = 0;
  document.addEventListener('touchstart', e => {
    const v = document.getElementById('viewer');
    if(!v || !v.classList.contains('on')) return;
    startX = e.touches[0].clientX;
  });
  document.addEventListener('touchend', e => {
    const v = document.getElementById('viewer');
    if(!v || !v.classList.contains('on')) return;
    const dx = e.changedTouches[0].clientX - startX;
    if(Math.abs(dx) > 50){
      viewerMove(dx > 0 ? -1 : 1);
    }
  });
})();

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
  renderGallery();
  renderAnniversaries();
  tickCounter();
  setInterval(tickCounter, 1000);
  setInterval(renderAnniversaries, 60000); // refresh every minute
})();