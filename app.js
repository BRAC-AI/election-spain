import { scoreParty, rankResults, orderQuestions, eligibleParties, confidence, ANSWERS, CONFIG } from './scoring.js';

const app = document.querySelector('#app');
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const load = (p) => fetch(p).then((r) => { if (!r.ok) throw new Error(p); return r.json(); });
const BATCH = CONFIG.step, MAX_BUBBLES = 3;
const REPO = 'https://github.com/BRAC-AI/election-spain';
const OPTS = [['sa', 'Muy a favor'], ['a', 'A favor'], ['d', 'En contra'], ['sd', 'Muy en contra']];
const LABELS = Object.fromEntries(OPTS);
const STANCE = { support: 'A favor', oppose: 'En contra', conditional: 'A medias', insufficient_evidence: 'No lo dice' };
const SRC = { programa_29N: 'Programa 29N', programa_anterior: 'Programa anterior', web: 'Web' };
const LEVELS = ['Aún nada', 'Poco fiable', 'Algo fiable', 'Bastante fiable', 'Muy fiable'];
const FRESH = { screen: 'start', bubbles: [], province: '', idx: 0, answers: {}, party: null, info: false };

let Q, P, S, SV, SO; // questions, parties, stances, stances version, sources
let st = { ...FRESH };

// Answers stay on this device, in this tab only.
const save = () => { try { sessionStorage.setItem('guia29n', JSON.stringify(st)); } catch { /* storage unavailable */ } };
const restore = () => { try { const v = JSON.parse(sessionStorage.getItem('guia29n')); if (v && v.screen) st = { ...FRESH, ...v }; } catch { /* ignore */ } };

const order = () => orderQuestions(Q.questions, Q.bubbles.filter((b) => st.bubbles.includes(b.id)).flatMap((b) => b.categories));
const answered = () => Object.values(st.answers).filter((a) => a in ANSWERS).length;
const parties = () => eligibleParties(P.parties, st.province);
const stancesOf = (p) => S[p.stancesFrom || p.id] || {};
const results = () => rankResults(parties().map((p) => ({ ...p, ...scoreParty(st.answers, stancesOf(p)) })));
const badge = (p) => `<span class="badge">${p.logo ? `<img src="img/logos/${esc(p.logo)}" alt="" width="256" height="256" loading="lazy">` : esc(p.abbr)}</span>`;

function go(patch, animate = false) {
  const apply = () => { Object.assign(st, patch); save(); render(); };
  const cur = app.querySelector('.screen');
  if (animate && cur && !matchMedia('(prefers-reduced-motion: reduce)').matches) { cur.classList.add('out'); setTimeout(apply, 140); } else apply();
}

// Confidence meter: four segments, one per block of five answers.
function meter(popLevel = 0) {
  const n = answered(), lvl = confidence(n);
  const segs = [0, 1, 2, 3].map((i) => `<span class="seg${popLevel === i + 1 ? ' pop' : ''}"><i class="w${Math.max(0, Math.min(BATCH, n - i * BATCH))}"></i></span>`).join('');
  return `<div class="meter" role="img" aria-label="${LEVELS[lvl]}. ${n} de ${Q.questions.length} respuestas.">
    <div class="segs">${segs}</div><div class="cap"><b>${LEVELS[lvl]}</b><span>${n}/${Q.questions.length}</span></div></div>`;
}

const countText = () => `Elige hasta 3 temas${st.bubbles.length ? ` · ${st.bubbles.length}/3` : ''}`;
function start() {
  const provs = Object.entries(P.provinces).sort((a, b) => a[1].localeCompare(b[1], 'es'));
  return `
    <h1 tabindex="-1">¿Qué partido piensa como tú?</h1>
    <p class="muted" id="count">${countText()}</p>
    <div class="bubbles grow${st.bubbles.length >= MAX_BUBBLES ? ' full' : ''}" role="group" aria-label="Temas">
      ${Q.bubbles.map((b) => `<button type="button" class="bubble" data-bubble="${esc(b.id)}" aria-pressed="${st.bubbles.includes(b.id)}">${esc(b.label)}</button>`).join('')}
    </div>
    <select id="prov" aria-label="¿Dónde votas?"><option value="">¿Dónde votas?</option>${provs.map(([c, n]) => `<option value="${c}" ${st.province === c ? 'selected' : ''}>${esc(n)}</option>`).join('')}</select>
    <div class="btns"><button type="button" class="cta" data-act="begin">Empezar</button></div>
    <p class="note">${Q.questions.length} preguntas · 3 minutos · anónimo</p>`;
}

function question() {
  const qs = order(), q = qs[st.idx];
  return `
    ${meter()}
    <div class="card grow">
      ${q.image ? `<img src="img/${esc(q.image)}" alt="">` : ''}
      <p class="eyebrow">${esc(Q.categories[q.category])}</p>
      <p class="statement" tabindex="-1">${esc(q.text)}</p>
      ${st.info ? `<p class="info">${esc(q.info)}</p>` : `<button type="button" class="infobtn" data-act="info">¿Qué significa?</button>`}
    </div>
    <div class="scale" role="group" aria-label="Tu respuesta">
      ${OPTS.map(([k, l], i) => `<button type="button" class="opt" data-ans="${k}" aria-pressed="${st.answers[q.id] === k}" aria-keyshortcuts="${i + 1}"><span class="dot"></span><span>${l}</span><span class="go" aria-hidden="true">→</span></button>`).join('')}
      <button type="button" class="opt skip" data-ans="skip"><span class="dot"></span><span>No lo sé</span><span class="go" aria-hidden="true">→</span></button>
    </div>
    <button type="button" class="link" data-act="back">← ${st.idx === 0 ? 'Temas' : 'Atrás'}</button>`;
}

function hero(rows) {
  const top = rows.filter((r) => r.rank === 1);
  if (!top.length) return `<p class="empty">${answered() ? 'Aún no podemos comparar. Sigue un poco más.' : 'Responde alguna pregunta para ver tu resultado.'}</p>`;
  const r = top[0];
  return `<button type="button" class="hero" data-party="${esc(r.id)}">
    <span class="ringwrap"><svg class="ring" viewBox="0 0 120 120" aria-hidden="true">
      <circle class="track" cx="60" cy="60" r="52"/><circle class="arc" cx="60" cy="60" r="52" pathLength="100" stroke-dasharray="${r.alignment} 100" transform="rotate(-90 60 60)"/></svg>
      <span class="num">${r.alignment}<small>%</small></span></span>
    <span class="herotext"><span class="eyebrow">${top.length > 1 ? 'Empate' : 'Más cerca de ti'}</span>
      <span class="heroname">${top.map((x) => esc(x.name)).join(' · ')}</span>
      <span class="muted">Toca para ver por qué</span></span></button>`;
}

function result() {
  const left = order().length - st.idx, rows = results();
  return `
    ${meter(st.justLevel || 0)}
    ${hero(rows)}
    <div class="list grow scroll">${rows.map((r) => `
      <button type="button" class="party" data-party="${esc(r.id)}" aria-label="${esc(r.name)}: ${r.conclusive ? r.alignment + ' por ciento' : 'sin datos'}">
        ${badge(r)}<span class="name">${esc(r.name)}</span>
        <span class="bar" aria-hidden="true"><i class="p${r.conclusive ? Math.round(r.alignment / 5) * 5 : 0}"></i></span>
        <span class="val${r.conclusive ? '' : ' none'}">${r.conclusive ? r.alignment + ' %' : '–'}</span>
      </button>`).join('')}</div>
    <div class="btns">
      ${left > 0 ? `<button type="button" class="cta" data-act="more">${Math.min(BATCH, left)} preguntas más</button>` : `<button type="button" class="cta" data-act="share">Compartir</button>`}
      <button type="button" class="cta alt" data-act="restart" aria-label="Empezar de nuevo">↺</button>
    </div>
    <p class="note">No es un consejo de voto · – = sin datos todavía</p>`;
}

function why() {
  const p = parties().find((x) => x.id === st.party);
  if (!p) { st.screen = 'result'; return result(); }
  const cells = stancesOf(p), r = scoreParty(st.answers, cells), pr = p.programme || {};
  const qs = order().filter((q) => st.answers[q.id] in ANSWERS);
  const same = (q, s) => (s === 'support' && ANSWERS[st.answers[q.id]] > 0) || (s === 'oppose' && ANSWERS[st.answers[q.id]] < 0);
  return `
    <button type="button" class="link" data-act="toresult">← Volver</button>
    <div class="head">${badge(p)}<h1 tabindex="-1">${esc(p.name)}</h1><span class="val">${r.conclusive ? r.alignment + ' %' : '–'}</span></div>
    <div class="links">
      ${p.site ? `<a href="${esc(p.site)}" rel="noopener noreferrer" target="_blank">Su web</a>` : ''}
      ${pr.url ? `<a href="${esc(pr.url)}" rel="noopener noreferrer" target="_blank">${esc(SRC[pr.type] || 'Fuente')}${pr.year ? ' ' + pr.year : ''}</a>` : '<span class="muted">Sin programa todavía</span>'}
      <span class="muted">${r.compared} de ${r.answered} comparadas</span>
    </div>
    <div class="grow scroll">
    ${qs.map((q) => { const c = cells[q.id] || {}; const s = c.stance || 'insufficient_evidence'; return `
      <div class="item"><p><b>${esc(q.text)}</b></p>
      <p><span class="tag">Tú: ${LABELS[st.answers[q.id]]}</span><span class="tag${same(q, s) ? ' same' : ''}">Partido: ${STANCE[s]}</span></p>
      ${c.summary ? `<p>${esc(c.summary)}</p>` : ''}${c.quote ? `<p>«${esc(c.quote)}»</p>` : ''}
      ${c.src ? `<p class="muted">${srcLink(c)}${c.status === 'reviewed' ? '' : ' · sin revisar'}</p>` : s === 'insufficient_evidence' ? '<p class="muted">No está en lo que hemos leído. No cuenta.</p>' : ''}</div>`; }).join('') || '<p class="muted">Aún no has respondido nada.</p>'}
    </div>`;
}

function srcLink(c) {
  const d = SO[c.src] || {}, where = c.page === 'web' ? '' : `, pág. ${esc(c.page)}`;
  const label = `${esc(d.title || 'Fuente')}${d.level === 2 ? ' (programa anterior)' : d.level === 3 ? '' : ''}${where}`;
  return d.url ? `<a href="${esc(d.url)}" rel="noopener noreferrer" target="_blank">${label}</a>` : label;
}

function about() {
  const rows = P.parties.map((p) => `<div class="item">${esc(p.name)} · ${p.programme.url ? `<a href="${esc(p.programme.url)}" rel="noopener noreferrer" target="_blank">${esc(SRC[p.programme.type] || 'Fuente')}${p.programme.year ? ' ' + p.programme.year : ''}</a>` : 'sin documento todavía'} · ${Object.keys(stancesOf(p)).length} de ${Q.questions.length} leídas</div>`).join('');
  return `
    <button type="button" class="link" data-act="closeabout">← Volver</button>
    <h1 tabindex="-1">Cómo funciona</h1>
    <div class="grow scroll about">
      <h2>La idea</h2>
      <p>Tú dices qué piensas. Nosotros miramos qué ha escrito cada partido. Te enseñamos cuánto os parecéis.</p>
      <h2>De dónde sale lo que piensa cada partido</h2>
      <p>Primero, su programa para estas elecciones. Lo que ahí no sale, lo buscamos en su último programa propio. Si no tiene ninguno, en su web oficial. Nunca en la prensa ni en lo que «se supone».</p>
      <p>En cada respuesta ves de qué documento sale y en qué página.</p>
      <p>Si un partido no dice nada sobre un tema, ese tema no cuenta para él.</p>
      <h2>Cómo sale el porcentaje</h2>
      <p>Por cada pregunta: pensáis igual, 100 puntos. Casi igual, 75. Casi al revés, 25. Al revés, 0. Si el partido dice «depende», 50. El porcentaje es la media.</p>
      <p>Todas las preguntas valen lo mismo. Elegir temas solo cambia el orden.</p>
      <h2>La barra de arriba</h2>
      <p>Con 5 respuestas el resultado es una pista. Con 20 es mucho más fiable. La barra te lo recuerda.</p>
      <p>Para dar un porcentaje hacen falta al menos 3 respuestas que se puedan comparar, y al menos una de cada cuatro de las tuyas.</p>
      <h2>Quién lo lee</h2>
      <p>Una IA (Claude, de Anthropic) buscó cada tema en el texto de los programas y apuntó la página, el 12 y 13 de noviembre de 2026. Después lo revisa una persona. Lo que pone «sin revisar» aún no ha pasado ese control.</p>
      <h2>Qué partidos salen</h2>
      <p>${esc(P.inclusion_rule)} Según tu provincia ves solo los que puedes votar.</p>
      <h2>Fuentes, partido a partido</h2>
      ${rows}
      <h2>Lo que no hace</h2>
      <p>No te dice a quién votar. No cubre todos los temas. No guarda nada: sin registro, sin cookies, sin rastreo. Tus respuestas se borran al cerrar la pestaña.</p>
      <h2>Quién lo hace</h2>
      <p>BRACAI, una empresa de Barcelona. No trabaja para ningún partido. Todo es abierto: <a href="${REPO}" rel="noopener noreferrer" target="_blank">código y datos</a>. Puedes copiarlo si dices de dónde viene.</p>
      <h2>¿Qué te parece?</h2>
      <form id="fb" novalidate>
        <div class="stars" role="group" aria-label="Nota de 1 a 5">${[1, 2, 3, 4, 5].map((n) => `<button type="button" data-star="${n}" aria-pressed="false">${n}</button>`).join('')}</div>
        <textarea id="fbm" rows="3" maxlength="1000" aria-label="Tu opinión" placeholder="¿Algo que cambiar o un error?"></textarea>
        <div class="btns"><button type="submit" class="cta">Enviar</button></div>
        <p class="muted" id="fbs" role="status"></p>
      </form>
      <p class="muted">Preguntas ${esc(Q.version)} · Posiciones ${esc(SV)}</p>
    </div>`;
}

const SCREENS = { start, question, result, why, about };
function render() {
  const html = SCREENS[st.screen](); // may change st.screen
  app.innerHTML = `<div class="screen s-${st.screen}">${html}</div>`;
  st.justLevel = 0;
  app.querySelector('h1,.statement')?.focus({ preventScroll: true });
}

function answer(val) {
  const qs = order(), q = qs[st.idx], before = confidence(answered()), answers = { ...st.answers };
  if (val === 'skip') delete answers[q.id]; else answers[q.id] = val;
  const idx = st.idx + 1, done = idx % BATCH === 0 || idx >= qs.length;
  st.answers = answers;
  const after = confidence(answered());
  go({ idx, info: false, screen: done ? 'result' : 'question', justLevel: done && after > before ? after : 0 }, true);
}

async function share() {
  const data = { title: 'Guía de voto 29N', text: '¿Qué partido piensa como tú? 20 preguntas, 3 minutos.', url: location.origin + location.pathname };
  try { if (navigator.share) await navigator.share(data); else { await navigator.clipboard.writeText(data.url); app.querySelector('[data-act=share]').textContent = 'Enlace copiado'; } } catch { /* cancelled */ }
}

document.addEventListener('click', (e) => {
  const b = e.target.closest('button'); if (!b || !Q) return;
  if (b.dataset.bubble) {
    const id = b.dataset.bubble, on = st.bubbles.includes(id);
    if (!on && st.bubbles.length >= MAX_BUBBLES) return;
    st.bubbles = on ? st.bubbles.filter((x) => x !== id) : [...st.bubbles, id];
    b.setAttribute('aria-pressed', String(!on)); // update in place: keep focus
    b.parentElement.classList.toggle('full', st.bubbles.length >= MAX_BUBBLES);
    app.querySelector('#count').textContent = countText();
    return save();
  }
  if (b.dataset.ans) { b.setAttribute('aria-pressed', 'true'); return answer(b.dataset.ans); }
  if (b.dataset.party) return go({ screen: 'why', party: b.dataset.party });
  if (b.dataset.star) { b.parentElement.querySelectorAll('button').forEach((x) => x.setAttribute('aria-pressed', String(x === b))); return; }
  switch (b.dataset.act) {
    case 'begin': return go({ screen: 'question', idx: 0, answers: {}, info: false }, true);
    case 'info': return go({ info: true });
    case 'back': return st.idx === 0 ? go({ screen: 'start' }) : go({ idx: st.idx - 1, info: false });
    case 'more': return go({ screen: 'question', info: false }, true);
    case 'toresult': return go({ screen: 'result' });
    case 'closeabout': return go({ screen: st.prev || 'start' });
    case 'about': return st.screen === 'about' ? null : go({ prev: st.screen === 'why' ? 'result' : st.screen, screen: 'about' });
    case 'home': return st.screen === 'about' || st.screen === 'why' ? go({ screen: st.idx ? 'result' : 'start' }) : null;
    case 'share': return share();
    case 'restart': return go({ ...FRESH });
  }
});
document.addEventListener('change', (e) => { if (e.target.id === 'prov') { st.province = e.target.value; save(); } });
document.addEventListener('keydown', (e) => {
  if (!Q || st.screen !== 'question' || e.target.closest('textarea,select') || e.metaKey || e.ctrlKey || e.altKey) return;
  const i = ['1', '2', '3', '4'].indexOf(e.key);
  if (i >= 0) answer(OPTS[i][0]);
});
document.addEventListener('submit', async (e) => {
  if (e.target.id !== 'fb') return;
  e.preventDefault();
  const f = e.target, status = f.querySelector('#fbs');
  const rating = f.querySelector('[data-star][aria-pressed=true]')?.dataset.star || '', message = f.querySelector('#fbm').value.trim();
  if (!rating && !message) { status.textContent = 'Pon una nota o escribe algo.'; return; }
  status.textContent = 'Enviando…';
  try {
    const r = await fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ 'form-name': 'feedback', rating, message }).toString() });
    if (!r.ok) throw new Error(String(r.status));
    f.innerHTML = '<p><b>¡Gracias!</b></p>';
  } catch { status.textContent = 'No se ha podido enviar. Prueba más tarde.'; }
});

Promise.all([load('data/questions.json'), load('data/parties.json'), load('data/stances.json'), load('data/sources.json')])
  .then(([q, p, s, so]) => {
    Q = q; P = p; S = s.stances; SV = s.version; SO = so;
    restore();
    if (!SCREENS[st.screen] || st.idx > q.questions.length || (st.screen === 'question' && st.idx >= q.questions.length)) st = { ...FRESH };
    render();
  })
  .catch(() => { app.innerHTML = '<p>No se han podido cargar los datos. Recarga la página.</p>'; });
