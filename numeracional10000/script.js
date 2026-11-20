'use strict';
/* ============ Utilidades ============ */
const $ = s => document.querySelector(s);
const R = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const sh = a => a.map(x => [Math.random(), x]).sort((p, q) => p[0] - q[0]).map(x => x[1]);
const fmt = n => n.toLocaleString('es-AR');
const norm = s => String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, ' ').trim();

/* Número -> palabras (0 a 10000) */
const U = ['cero','uno','dos','tres','cuatro','cinco','seis','siete','ocho','nueve','diez','once','doce','trece','catorce','quince','dieciséis','diecisiete','dieciocho','diecinueve','veinte','veintiuno','veintidós','veintitrés','veinticuatro','veinticinco','veintiséis','veintisiete','veintiocho','veintinueve'];
const D = ['','','','treinta','cuarenta','cincuenta','sesenta','setenta','ochenta','noventa'];
const C = ['','ciento','doscientos','trescientos','cuatrocientos','quinientos','seiscientos','setecientos','ochocientos','novecientos'];
function w(n) {
  if (n === 10000) return 'diez mil';
  if (n < 30) return U[n];
  if (n < 100) return D[(n / 10) | 0] + (n % 10 ? ' y ' + U[n % 10] : '');
  if (n === 100) return 'cien';
  if (n < 1000) return C[(n / 100) | 0] + (n % 100 ? ' ' + w(n % 100) : '');
  const m = (n / 1000) | 0, r = n % 1000;
  return (m === 1 ? 'mil' : U[m] + ' mil') + (r ? ' ' + w(r) : '');
}

/* ============ Las 30 actividades ============ */
// [tipo, parámetro 1, parámetro 2]
const S = [
  ['ap','ant',1000], ['ap','pos',1000], ['ap','ap',10000],
  ['seq',10,1], ['seq',10,-1], ['seq',100,1], ['seq',100,-1], ['seq',1000,1], ['seq',1000,-1],
  ['start',10,1], ['start',10,-1], ['start',100,1], ['start',100,-1], ['start',1000,1], ['start',1000,-1],
  ['drag',10,1], ['drag',10,-1], ['drag',100,1], ['drag',1000,-1],
  ['w2n',1000], ['w2n',10000], ['n2w',1000], ['n2w',10000],
  ['ord',1000,1], ['ord',1000,-1], ['ord',10000,1], ['ord',10000,-1],
  ['mat',1000], ['mat',10000],
  ['seq',0,0]
];
const ICON = {ap:'↔️', seq:'🔢', start:'🚀', drag:'🧲', w2n:'🔤', n2w:'✍️', ord:'📶', mat:'🔗'};
const NAME = {ap:'Anterior y posterior', seq:'Completar secuencia', start:'Secuencia desde…', drag:'Arrastrar y completar', w2n:'Palabras → cifras', n2w:'Cifras → palabras', ord:'Ordenar', mat:'Unir'};

/* Serie de `len` términos con paso st (0 = al azar) y dirección d (0 = al azar) */
function terms(st, d, len) {
  st = st || [10, 100, 1000][R(0, 2)];
  d = d || (R(0, 1) ? 1 : -1);
  const L = R(0, 10000 - st * (len - 1));
  const a = Array.from({length: len}, (_, i) => L + i * st);
  return {a: d > 0 ? a : a.reverse(), st, d};
}
const sense = (st, d) => `de ${fmt(st)} en ${fmt(st)} hacia ${d > 0 ? 'adelante' : 'atrás'}`;
const inp = (a, t) => `<input class="in${t ? ' w' : ''}" data-a="${a}"${t ? ' data-t="1"' : ' inputmode="numeric"'} autocomplete="off">`;
const chip = (v, s) => `<span class="chip" draggable="true" data-v="${v}"${s ? ` data-s="${s}"` : ''}>${s === 'r' ? w(v) : fmt(v)}</span>`;

/* ============ Constructores: devuelven {p: consigna, h: html, m: modo, c: verificar} ============ */
const B = {
  ap(k, max) {
    let h = '';
    for (let i = 0; i < 4; i++) {
      const n = R(2, max - 2);
      h += `<div class="line">${k !== 'pos' ? inp(n - 1) + ' ‹ ' : ''}<b class="num">${fmt(n)}</b>${k !== 'ant' ? ' › ' + inp(n + 1) : ''}</div>`;
    }
    const q = {ant: 'el número anterior', pos: 'el número posterior', ap: 'el anterior y el posterior'}[k];
    return {p: `Escribí ${q} de cada número.`, h, c: chkInputs};
  },
  seq(st, d) {
    const t = terms(st, d, 7), idx = sh([1, 2, 3, 4, 5, 6]).slice(0, 3);
    const h = `<div class="line">${t.a.map((v, i) => idx.includes(i) ? inp(v) : `<b class="num">${fmt(v)}</b>`).join(' ')}</div>`;
    return {p: `Completá la secuencia ${sense(t.st, t.d)}.`, h, c: chkInputs};
  },
  start(st, d) {
    const t = terms(st, d, 6);
    const h = `<div class="line"><b class="num">${fmt(t.a[0])}</b> ${t.a.slice(1).map(v => inp(v)).join(' ')}</div>`;
    return {p: `La secuencia empieza en ${fmt(t.a[0])}. Seguila ${sense(t.st, t.d)}.`, h, c: chkInputs};
  },
  drag(st, d) {
    const t = terms(st, d, 6), idx = sh([1, 2, 3, 4, 5]).slice(0, 3), ans = idx.map(i => t.a[i]);
    const chips = new Set(ans);
    while (chips.size < 5) {
      const x = Math.abs(t.a[R(0, 5)] + (R(0, 1) ? 1 : -1) * t.st * R(7, 9)) % 10001;
      if (!t.a.includes(x)) chips.add(x);
    }
    const line = t.a.map((v, i) => idx.includes(i) ? `<span class="slot" data-a="${v}"></span>` : `<b class="num">${fmt(v)}</b>`).join(' ');
    const h = `<div class="line">${line}</div><div class="pool">${sh([...chips]).map(v => chip(v)).join('')}</div>`;
    return {p: `Arrastrá (o tocá) cada número a su lugar. Secuencia ${sense(t.st, t.d)}.`, h, m: 'drag',
      c: () => mark('.slot', s => s.firstChild && s.firstChild.dataset.v === s.dataset.a)};
  },
  w2n(max) {
    let h = '';
    for (let i = 0; i < 3; i++) { const n = R(11, max); h += `<div class="line"><span class="words">${w(n)}</span> = ${inp(n)}</div>`; }
    return {p: 'Escribí en cifras cada número.', h, c: chkInputs};
  },
  n2w(max) {
    let h = '';
    for (let i = 0; i < 2; i++) { const n = R(11, max - 1); h += `<div class="line"><b class="num">${fmt(n)}</b> = ${inp(w(n), 1)}</div>`; }
    return {p: 'Escribí con palabras cada número (sin olvidar la “y”).', h, c: chkInputs};
  },
  ord(max, d) {
    const set = new Set();
    while (set.size < 5) set.add(R(1, max));
    const h = `<div class="row">${[...set].map(v => chip(v)).join('')}</div>`;
    return {p: `Ordená de ${d > 0 ? 'menor a mayor' : 'mayor a menor'}. Arrastrá las tarjetas o tocá dos para intercambiarlas.`, h, m: 'ord',
      c: () => {
        const cs = [...document.querySelectorAll('.chip')], v = cs.map(c => +c.dataset.v);
        const good = [...v].sort((a, b) => d > 0 ? a - b : b - a);
        let ok = true;
        cs.forEach((c, i) => { const g = v[i] === good[i]; c.classList.toggle('ok', g); c.classList.toggle('bad', !g); ok = ok && g; });
        return ok;
      }};
  },
  mat(max) {
    const set = new Set();
    while (set.size < 4) set.add(R(11, max));
    const ns = [...set];
    const h = `<div class="cols"><div>${ns.map(v => chip(v, 'l')).join('')}</div><div>${sh(ns).map(v => chip(v, 'r')).join('')}</div></div>`;
    return {p: 'Uní cada cifra con su nombre: tocá una tarjeta y luego la que le corresponde.', h, m: 'mat',
      c: () => {
        let ok = true;
        document.querySelectorAll('.chip[data-s="l"]').forEach(c => {
          const g = !!c._r && c._r.dataset.v === c.dataset.v;
          c.classList.toggle('ok', g); c.classList.toggle('bad', !g); ok = ok && g;
        });
        return ok;
      }};
  }
};

function chkInputs() {
  let ok = true;
  document.querySelectorAll('#area .in').forEach(e => {
    const g = e.dataset.t ? norm(e.value) === norm(e.dataset.a) : e.value.replace(/\D/g, '') === e.dataset.a;
    e.classList.toggle('ok', g); e.classList.toggle('bad', !g); ok = ok && g;
  });
  return ok;
}
function mark(sel, fn) {
  let ok = true;
  document.querySelectorAll(sel).forEach(e => { const g = !!fn(e); e.classList.toggle('ok', g); e.classList.toggle('bad', !g); ok = ok && g; });
  return ok;
}

/* ============ Interacciones: tocar / arrastrar ============ */
const area = $('#area');
let pick = null, drag = null, pc = 0;
const clr = () => { if (pick) pick.classList.remove('sel'); pick = null; };
const place = (c, sl) => { if (sl.firstChild && sl.firstChild !== c) $('.pool').appendChild(sl.firstChild); sl.appendChild(c); };
function swap(a, b) { const t = document.createElement('i'); a.before(t); b.before(a); t.replaceWith(b); }
function unpair(c) { if (c._r) { c._r.style.borderColor = ''; c._r._l = null; } c.style.borderColor = ''; c._r = null; }
function pair(l, r) {
  unpair(l); if (r._l) unpair(r._l);
  l._r = r; r._l = l;
  l.style.borderColor = r.style.borderColor = `hsl(${(++pc * 67) % 360} 80% 60%)`;
}
function link(a, b) { if (a.dataset.s !== b.dataset.s) a.dataset.s === 'l' ? pair(a, b) : pair(b, a); }

area.onclick = e => {
  const m = area.dataset.mode, c = e.target.closest('.chip'), sl = e.target.closest('.slot');
  if (m === 'drag') {
    const tgt = sl || (c && c.parentNode.classList.contains('slot') ? c.parentNode : null);
    if (pick && tgt) { place(pick, tgt); clr(); }
    else if (pick && !c && e.target.closest('.pool')) { $('.pool').appendChild(pick); clr(); }
    else if (c) { clr(); pick = c; c.classList.add('sel'); }
  } else if (c && m === 'ord') {
    if (pick && pick !== c) { swap(pick, c); clr(); } else if (pick === c) clr(); else { pick = c; c.classList.add('sel'); }
  } else if (c && m === 'mat') {
    if (pick && pick.dataset.s !== c.dataset.s) { link(pick, c); clr(); }
    else { clr(); pick = c; c.classList.add('sel'); }
  }
};
area.ondragstart = e => { drag = e.target.closest('.chip'); };
area.ondragover = e => e.preventDefault();
area.ondrop = e => {
  e.preventDefault();
  const m = area.dataset.mode, c = e.target.closest('.chip'), sl = e.target.closest('.slot');
  if (!drag) return;
  if (m === 'drag') { if (sl) place(drag, sl); else if (e.target.closest('.pool')) $('.pool').appendChild(drag); }
  else if (m === 'ord' && c && c !== drag) swap(drag, c);
  else if (m === 'mat' && c) link(drag, c);
  drag = null;
};

/* ============ Recompensas y progreso ============ */
const KEY = 'mq-numeracion-10000';
let save = {};
try { save = JSON.parse(localStorage.getItem(KEY) || '{}'); } catch (e) { save = {}; }
const persist = () => { try { localStorage.setItem(KEY, JSON.stringify(save)); } catch (e) {} };
const RANKS = [['Cadete 🧑‍🚀', 0], ['Astronauta 🚀', 10], ['Piloto ✈️', 30], ['Capitán 🛰️', 50], ['Comandante 🌟', 70], ['Leyenda galáctica 👑', 85]];
const STICKERS = ['🌙', '🪐', '☄️', '🛸', '👽', '🌍'];
const total = () => Object.values(save).reduce((a, b) => a + b, 0);

function tone(ok) {
  try {
    const ac = new (window.AudioContext || window.webkitAudioContext)(), o = ac.createOscillator(), g = ac.createGain();
    o.type = 'triangle'; o.frequency.value = ok ? 660 : 220;
    o.frequency.linearRampToValueAtTime(ok ? 990 : 180, ac.currentTime + .25);
    g.gain.setValueAtTime(.15, ac.currentTime); g.gain.exponentialRampToValueAtTime(.001, ac.currentTime + .35);
    o.connect(g); g.connect(ac.destination); o.start(); o.stop(ac.currentTime + .4);
  } catch (e) {}
}
function confetti() {
  for (let i = 0; i < 28; i++) {
    const s = document.createElement('span');
    s.className = 'confetti'; s.textContent = ['⭐', '✨', '🌟', '🎉'][R(0, 3)];
    s.style.left = R(0, 95) + 'vw'; s.style.animationDelay = (R(0, 60) / 100) + 's';
    document.body.appendChild(s); setTimeout(() => s.remove(), 2400);
  }
}

/* ============ Pantallas ============ */
const show = id => document.querySelectorAll('.screen').forEach(s => s.classList.toggle('active', s.id === id));

function renderMap() {
  const t = total(), done = Object.keys(save).length;
  $('#total').textContent = $('#total2').textContent = t;
  $('#rank').textContent = RANKS.filter(r => t >= r[1]).pop()[0];
  const got = Math.floor(done / 5);
  $('#collection').innerHTML = 'Colección: ' + STICKERS.map((s, i) => `<span class="${i < got ? '' : 'off'}">${s}</span>`).join('') + ` <small>(1 figurita cada 5 actividades)</small>`;
  $('#grid').innerHTML = S.map((s, i) => {
    const st = save[i] || 0;
    return `<button class="tile${st ? ' done' : ''}" data-i="${i}" title="${NAME[s[0]]}"><span class="ic">${ICON[s[0]]}</span><span class="n">${i + 1}</span><span class="st">${'★'.repeat(st)}${'☆'.repeat(3 - st)}</span></button>`;
  }).join('');
  show('map');
}

let idx = 0, tries = 0, cur = null;
function openAct(i) {
  idx = i; tries = 0; pick = null;
  const s = S[i];
  cur = B[s[0]](s[1], s[2]);
  area.dataset.mode = cur.m || '';
  $('#title').textContent = `${i + 1}. ${NAME[s[0]]}`;
  $('#prompt').textContent = cur.p;
  area.innerHTML = cur.h;
  $('#msg').textContent = ''; $('#skip').hidden = true;
  show('game');
  const f = area.querySelector('.in'); if (f) f.focus();
}

function verify() {
  tries++;
  if (cur.c()) return win();
  tone(false);
  $('#msg').textContent = tries >= 3 ? 'Casi… podés seguir con otra actividad y volver a intentarlo.' : '¡Casi! Revisá lo que está en rojo e intentá de nuevo.';
  if (tries >= 3) $('#skip').hidden = false;
}

function win() {
  const stars = Math.max(1, 4 - tries);
  if (stars > (save[idx] || 0)) save[idx] = stars;
  persist(); tone(true); confetti();
  $('#wstars').textContent = '★'.repeat(stars) + '☆'.repeat(3 - stars);
  const done = Object.keys(save).length;
  $('#wtxt').textContent = stars === 3 ? '¡A la primera! 3 estrellas.' : `Ganaste ${stars} ${stars === 1 ? 'estrella' : 'estrellas'}.`;
  if (done % 5 === 0 && stars === save[idx] && done <= 30) $('#wtxt').textContent += ` ¡Nueva figurita ${STICKERS[done / 5 - 1] || ''}!`;
  $('#wnext').hidden = idx >= S.length - 1;
  $('#win').hidden = false;
}

$('#ok').onclick = verify;
$('#skip').onclick = () => { renderMap(); };
$('#back').onclick = renderMap;
$('#wmap').onclick = () => { $('#win').hidden = true; renderMap(); };
$('#wnext').onclick = () => { $('#win').hidden = true; openAct(idx + 1); };
$('#grid').onclick = e => { const t = e.target.closest('.tile'); if (t) openAct(+t.dataset.i); };
document.addEventListener('keydown', e => { if (e.key === 'Enter' && $('#game').classList.contains('active') && $('#win').hidden) verify(); });

renderMap();
