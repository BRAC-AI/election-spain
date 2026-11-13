import { scoreParty, enoughData, rankResults, orderQuestions, eligibleParties, confidence, ANSWERS, CONFIG } from './scoring.js';

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
const FRESH = { screen: 'start', bubbles: [], region: '', province: '', idx: 0, answers: {}, stars: {}, party: null, info: false };

let Q, P, S, SV, SO, M, HI = {}; // questions, parties, stances, stances version, sources, map
let st = { ...FRESH };

// Answers stay on this device, in this tab only.
const save = () => { try { sessionStorage.setItem('guia29n', JSON.stringify(st)); } catch { /* storage unavailable */ } };
const restore = () => { try { const v = JSON.parse(sessionStorage.getItem('guia29n')); if (v && v.screen) st = { ...FRESH, ...v }; } catch { /* ignore */ } };

const order = () => orderQuestions(Q.questions, Q.bubbles.filter((b) => st.bubbles.includes(b.id)).flatMap((b) => b.categories));
const answered = () => Object.values(st.answers).filter((a) => a in ANSWERS).length;
const parties = () => eligibleParties(P.parties, st.province);
const stancesOf = (p) => S[p.stancesFrom || p.id] || {};
const scoreOf = (p) => { const c = stancesOf(p), r = scoreParty(st.answers, c, undefined, st.stars || {}), ok = enoughData(c); return { ...r, enough: ok, conclusive: r.conclusive && ok, alignment: ok ? r.alignment : null }; };
const results = () => rankResults(parties().map((p) => ({ ...p, ...scoreOf(p) })));
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
  return `
    <h1 tabindex="-1">¿Qué temas son los más importantes para ti?</h1>
    <p class="muted" id="count">${countText()}</p>
    <div class="bubbles grow${st.bubbles.length >= MAX_BUBBLES ? ' full' : ''}" role="group" aria-label="Temas">
      ${Q.bubbles.map((b) => `<button type="button" class="bubble" data-bubble="${esc(b.id)}" aria-pressed="${st.bubbles.includes(b.id)}">${esc(b.label)}</button>`).join('')}
    </div>
    <div class="btns"><button type="button" class="cta" data-act="towhere">Siguiente</button></div>
    <p class="note">${Q.questions.length} preguntas · 3 minutos · anónimo</p>`;
}

// A region needs a second tap only when its provinces have different ballots.
const regionById = (id) => [...M.regions, ...M.extra].find((r) => r.id === id);
const ballot = (prov) => eligibleParties(P.parties, prov).map((p) => p.id).join();
const needsProvince = (r) => new Set(r.provinces.map(ballot)).size > 1;
function where() {
  const all = [...M.regions, ...M.extra].sort((a, b) => a.name.localeCompare(b.name, 'es'));
  const r = st.region ? regionById(st.region) : null, need = r && needsProvince(r), ready = !r || !need || st.province;
  const [ix, iy, iw, ih] = M.inset;
  return `
    <button type="button" class="link" data-act="tostart">← Temas</button>
    <h1 tabindex="-1">¿Dónde votas?</h1>
    <svg class="map grow" viewBox="${M.viewBox}" role="group" aria-label="Mapa de España. Toca tu comunidad.">
      <rect class="inset" x="${ix}" y="${iy}" width="${iw}" height="${ih}" rx="4" data-region="05"/>
      ${M.regions.map((g) => `<path class="reg${g.id === st.region ? ' sel' : ''}" d="${g.d}" data-region="${g.id}" tabindex="0" role="button" aria-pressed="${g.id === st.region}" aria-label="${esc(g.name)}"><title>${esc(g.name)}</title></path>`).join('')}
    </svg>
    <select id="reg" aria-label="O elige tu comunidad en la lista"><option value="">…o elige en la lista</option>${all.map((g) => `<option value="${g.id}" ${g.id === st.region ? 'selected' : ''}>${esc(g.name)}</option>`).join('')}</select>
    ${need ? `<div class="chips" role="group" aria-label="Provincia">${r.provinces.map((c) => `<button type="button" class="chip" data-prov="${c}" aria-pressed="${st.province === c}">${esc(P.provinces[c])}</button>`).join('')}</div>` : ''}
    <div class="btns"><button type="button" class="cta" data-act="begin" ${ready ? '' : 'disabled'}>${r ? (ready ? 'Empezar' : 'Elige tu provincia') : 'Empezar sin elegir'}</button></div>
    <p class="note">${r ? esc(r.name) + (st.province && need ? ' · ' + esc(P.provinces[st.province]) : '') : 'Así ves solo los partidos que puedes votar'}</p>`;
}
const pickRegion = (id) => { const r = regionById(id); go({ region: r ? id : '', province: r && !needsProvince(r) ? r.provinces[0] : '' }); };

function question() {
  const qs = order(), q = qs[st.idx];
  return `
    ${meter()}
    <div class="card grow">
      ${q.image ? `<img src="img/${esc(q.image)}" alt="">` : ''}
      <div class="cardtop"><p class="eyebrow">${esc(Q.categories[q.category])}</p><button type="button" class="starbtn" data-act="star" aria-pressed="${!!(st.stars || {})[q.id]}" aria-label="Muy importante para mí: vale el doble"><span aria-hidden="true">★</span> <span class="lbl">${(st.stars || {})[q.id] ? 'Vale el doble' : 'Muy importante'}</span></button></div>
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
  const top = rows.filter((r) => r.rank === 1), scored = rows.filter((r) => r.conclusive).length;
  if (top.length && scored * 2 < rows.length) return `<p class="empty">Solo podemos comparar con ${scored} de ${rows.length} partidos. Aún no hay ganador.</p>`;
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

const oldTag = () => ''; // positions now mix programmes, votes and quotes, so one year tag would mislead
const row = (r) => `
      <button type="button" class="party${r.conclusive ? '' : ' blank'}" data-party="${esc(r.id)}" aria-label="${esc(r.name)}: ${r.conclusive ? r.alignment + ' por ciento' : 'sin datos'}">
        ${badge(r)}<span class="name">${esc(r.name)}${oldTag(r)}</span>
        ${r.conclusive ? `<span class="bar" aria-hidden="true"><i class="p${Math.round(r.alignment / 5) * 5}"></i></span><span class="val">${r.alignment} %</span>` : ''}
      </button>`;

function result() {
  const left = order().length - st.idx, rows = results();
  return `
    ${meter(st.justLevel || 0)}
    ${hero(rows)}
    <div class="list grow scroll">${rows.filter((r) => r.conclusive).map(row).join('')}
      ${rows.some((r) => !r.conclusive) ? `<p class="divider">Sin datos suficientes</p>${rows.filter((r) => !r.conclusive).map(row).join('')}` : ''}</div>
    <div class="btns">
      ${left > 0 ? `<button type="button" class="cta" data-act="more">${Math.min(BATCH, left)} preguntas más</button>` : `<button type="button" class="cta" data-act="share">Compartir</button>`}
      <button type="button" class="cta alt" data-act="restart" aria-label="Empezar de nuevo">↺</button>
    </div>
    <p class="note">No es un consejo de voto</p>`;
}

function why() {
  const p = parties().find((x) => x.id === st.party);
  if (!p) { st.screen = 'result'; return result(); }
  const cells = stancesOf(p), r = scoreOf(p), pr = p.programme || {};
  const qs = order().filter((q) => st.answers[q.id] in ANSWERS);
  const same = (q, s) => (s === 'support' && ANSWERS[st.answers[q.id]] > 0) || (s === 'oppose' && ANSWERS[st.answers[q.id]] < 0);
  return `
    <button type="button" class="link" data-act="toresult">← Volver</button>
    <div class="head">${badge(p)}<h1 tabindex="-1">${esc(p.name)}</h1><span class="val">${r.conclusive ? r.alignment + ' %' : '–'}</span></div>
    <div class="links">
      ${p.site ? `<a href="${esc(p.site)}" rel="noopener noreferrer" target="_blank">Su web</a>` : ''}
      ${pr.url ? `<a href="${esc(pr.url)}" rel="noopener noreferrer" target="_blank">${esc(SRC[pr.type] || 'Fuente')}${pr.year ? ' ' + pr.year : ''}</a>` : `<span class="muted">${pr.title ? esc(pr.title) + (pr.year ? ' (' + pr.year + ')' : '') : 'Sin programa todavía'}</span>`}
      <span class="muted">${r.compared} de ${r.answered} comparadas</span>
    </div>
    <div class="grow scroll">
    ${r.enough ? '' : `<div class="item"><p><b>Aún no sabemos lo suficiente de este partido.</b></p><p>Solo hemos encontrado ${Object.keys(cells).length} posiciones de ${Q.questions.length}. Por eso no le damos un porcentaje.</p>${p.priorities ? `<p>Sus prioridades, en su web: ${p.priorities.map(([t, u]) => `<a href="${esc(u)}" rel="noopener noreferrer" target="_blank">${esc(t)}</a>`).join(' · ')}</p>` : ''}</div>`}
    ${qs.map((q) => { const c = cells[q.id] || {}; const s = c.stance || 'insufficient_evidence'; const h = (HI[p.stancesFrom || p.id] || {})[q.id]; return `
      <div class="item"><p><b>${esc(q.text)}</b></p>
      <p>${(st.stars || {})[q.id] ? '<span class="tag same">★ Vale el doble</span>' : ''}<span class="tag">Tú: ${LABELS[st.answers[q.id]]}</span><span class="tag${same(q, s) ? ' same' : ''}">Partido: ${STANCE[s]}</span></p>
      ${c.summary ? `<p>${esc(c.summary)}</p>` : ''}${c.quote ? `<p>«${esc(c.quote)}»</p>` : ''}
      ${c.src ? `<p class="muted">${c.approx ? 'Parecido, no exacto: ' : ''}${srcLink(c)}</p>` : h ? `<p class="muted">Pista, no cuenta: ${esc(h.summary)} ${srcLink(h)}</p>` : s === 'insufficient_evidence' ? '<p class="muted">No hemos encontrado nada. No cuenta.</p>' : ''}</div>`; }).join('') || '<p class="muted">Aún no has respondido nada.</p>'}
    </div>`;
}

function srcLink(c) {
  const d = SO[c.src] || {}, where = c.page === 'web' ? '' : `, pág. ${esc(c.page)}`;
  const label = `${d.level === 4 ? 'Lo dijo ' : d.level === 5 ? 'Votó: ' : ''}${esc(d.title || 'Fuente')}${d.level === 2 ? ' (programa anterior)' : ''}${where}`;
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
      <p>Por cada pregunta: pensáis igual, 100 puntos. Casi igual, 75. Casi al revés, 25. Al revés, 0. Si el partido dice «a medias», 75 si tu respuesta es suave y 50 si es rotunda. El porcentaje es la media.</p>
      <p>Todas las preguntas valen lo mismo, salvo las que marques con ★: esas valen el doble. Elegir temas solo cambia el orden.</p>
      <p>Un partido solo recibe porcentaje si conocemos al menos 8 de sus posiciones.</p>
      <h2>La barra de arriba</h2>
      <p>Con 5 respuestas el resultado es una pista. Con 20 es mucho más fiable. La barra te lo recuerda.</p>
      <p>Para dar un porcentaje hacen falta al menos 3 respuestas que se puedan comparar, y al menos una de cada cuatro de las tuyas.</p>
      <h2>Quién lo lee</h2>
      <p>Una IA (Claude, de Anthropic) buscó cada tema en el texto de los programas y apuntó la página, el 12 y 13 de noviembre de 2026. Tres partidos no tienen programa en PDF (Frente Amplio, Democracia 21 y Compromís-Front Valencià): para ellos se buscó en sus webs oficiales el 13 de noviembre. Si el programa no dice nada, usamos lo que un candidato o portavoz ha dicho en público en 2026, con enlace: lo verás como «Lo dijo…». Si tampoco, miramos qué votó en el Congreso o en su parlamento: «Votó…». A veces solo hay algo parecido, no exacto: lo verás como «Parecido» y sí cuenta. Si es muy dudoso, lo verás como «Pista» y no cuenta. Lo buscaron otras IA (ChatGPT y Gemini) el 13 de noviembre. Ninguna posición la ha revisado aún una persona. Si ves un error, dínoslo abajo.</p>
      <h2>Qué partidos salen</h2>
      <p>${esc(P.inclusion_rule)} Según tu provincia ves solo los que puedes votar.</p>
      <h2>Fuentes, partido a partido</h2>
      ${rows}
      <h2>Lo que no hace</h2>
      <p>No te dice a quién votar. No cubre todos los temas. No guarda nada: sin registro, sin cookies, sin rastreo. Tus respuestas se borran al cerrar la pestaña.</p>
      <h2>Quién lo hace</h2>
      <p>BRACAI, una empresa de Barcelona. No trabaja para ningún partido. Todo es abierto: <a href="${REPO}" rel="noopener noreferrer" target="_blank">código y datos</a>, y <a href="${REPO}/blob/main/docs/METHODOLOGY.md" rel="noopener noreferrer" target="_blank">el método completo</a>. Puedes copiarlo si dices de dónde viene.</p>
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

const SCREENS = { start, where, question, result, why, about };
function render() {
  const html = SCREENS[st.screen](); // may change st.screen
  app.innerHTML = `<div class="screen s-${st.screen}">${html}</div>`;
  st.justLevel = 0;
  (st.screen === 'where' && st.region && app.querySelector('.reg.sel') || app.querySelector('h1,.statement'))?.focus({ preventScroll: true });
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
  if (!Q) return;
  const reg = e.target.closest('[data-region]'); if (reg) return pickRegion(reg.dataset.region);
  const b = e.target.closest('button'); if (!b) return;
  if (b.dataset.prov) return go({ province: b.dataset.prov });
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
    case 'star': { const q = order()[st.idx]; st.stars = { ...(st.stars || {}) }; if (st.stars[q.id]) delete st.stars[q.id]; else st.stars[q.id] = true;
      b.setAttribute('aria-pressed', String(!!st.stars[q.id])); b.querySelector('.lbl').textContent = st.stars[q.id] ? 'Vale el doble' : 'Muy importante'; return save(); }
    case 'towhere': return go({ screen: 'where' }, true);
    case 'tostart': return go({ screen: 'start' });
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
document.addEventListener('change', (e) => { if (e.target.id === 'reg') pickRegion(e.target.value); });
document.addEventListener('keydown', (e) => {
  const reg = e.target.closest?.('[data-region]');
  if (reg && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); return pickRegion(reg.dataset.region); }
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

Promise.all([load('data/questions.json'), load('data/parties.json'), load('data/stances.json'), load('data/sources.json'), load('data/map.json')])
  .then(([q, p, s, so, m]) => {
    Q = q; P = p; S = s.stances; HI = s.hints || {}; SV = s.version; SO = so; M = m;
    restore();
    if (!SCREENS[st.screen] || st.idx > q.questions.length || (st.screen === 'question' && st.idx >= q.questions.length)) st = { ...FRESH };
    render();
  })
  .catch(() => { app.innerHTML = '<p>No se han podido cargar los datos. Recarga la página.</p>'; });
