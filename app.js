import { scoreParty, rankResults, orderQuestions, eligibleParties, confidence, display, ANSWERS, CONFIG } from './scoring.js';

const app = document.querySelector('#app');
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const load = (p) => fetch(p).then((r) => { if (!r.ok) throw new Error(p); return r.json(); });
const DEMO = new URLSearchParams(location.search).get('demo') === '1';
const BATCH = CONFIG.step, MAX_BUBBLES = 3;
const REPO = 'https://github.com/BRAC-AI/election-spain';
const OPTS = [['sd', 'Muy en contra'], ['d', 'En contra'], ['a', 'A favor'], ['sa', 'Muy a favor']];
const LABELS = Object.fromEntries(OPTS);
const STANCE = { support: 'A favor', oppose: 'En contra', conditional: 'Con matices', insufficient_evidence: 'No lo dice' };
const SRC = { programa_29N: 'programa del 29N', programa_anterior: 'programa anterior', web: 'web del partido' };
const LEVELS = ['Sin datos', 'Primera pista', 'Va tomando forma', 'Bastante fiable', 'Máxima'];
const BANDS = { near: 'Cerca de ti', mid: 'A media distancia', far: 'Lejos de ti' };

let Q, P, S; // questions, parties, stances
let st = { screen: 'start', bubbles: [], province: '', idx: 0, answers: {}, party: null };

// Answers stay on this device, in this tab only.
const save = () => { try { sessionStorage.setItem('guia29n', JSON.stringify(st)); } catch { /* storage unavailable */ } };
const restore = () => { try { const v = JSON.parse(sessionStorage.getItem('guia29n')); if (v && v.screen) st = v; } catch { /* ignore */ } };

const order = () => orderQuestions(Q.questions, Q.bubbles.filter((b) => st.bubbles.includes(b.id)).flatMap((b) => b.categories));
const answered = () => Object.values(st.answers).filter((a) => a in ANSWERS).length;
const parties = () => eligibleParties(P.parties, st.province);
const stancesOf = (p) => S[p.stancesFrom || p.id] || {};
const results = () => rankResults(parties().map((p) => ({ id: p.id, name: p.name, programme: p.programme, ...scoreParty(st.answers, stancesOf(p)) })));

function go(patch, animate = false) {
  const apply = () => { Object.assign(st, patch); save(); render(); window.scrollTo(0, 0); };
  const cur = app.querySelector('.screen');
  if (animate && cur && !matchMedia('(prefers-reduced-motion: reduce)').matches) { cur.classList.add('out'); setTimeout(apply, 150); } else apply();
}

// Confidence meter: four segments, one per block of five answers.
function meter(popLevel = 0) {
  const n = answered(), lvl = confidence(n);
  const segs = [0, 1, 2, 3].map((i) => {
    const fill = Math.max(0, Math.min(BATCH, n - i * BATCH));
    return `<span class="seg${popLevel === i + 1 ? ' pop' : ''}"><i class="w${fill}"></i></span>`;
  }).join('');
  return `<div class="meter" role="img" aria-label="Fiabilidad del resultado: ${LEVELS[lvl]}. ${n} respuestas de ${Q.questions.length}.">
    <div class="segs">${segs}</div>
    <div class="cap"><span>Fiabilidad: <b>${LEVELS[lvl]}</b></span><span>${n}/${Q.questions.length}</span></div></div>`;
}

function start() {
  const provs = Object.entries(P.provinces).sort((a, b) => a[1].localeCompare(b[1], 'es'));
  return `
    <p class="eyebrow">Elecciones generales · 29 de noviembre</p>
    <h1 tabindex="-1">¿Qué partido piensa como tú?</h1>
    <div class="bubbles${st.bubbles.length >= MAX_BUBBLES ? ' full' : ''}" role="group" aria-label="Temas">
      ${Q.bubbles.map((b) => `<button type="button" class="bubble" data-bubble="${esc(b.id)}" aria-pressed="${st.bubbles.includes(b.id)}">${esc(b.label)}</button>`).join('')}
    </div>
    <p class="count" id="count">${countText()}</p>
    <label for="prov">¿Dónde votas?</label>
    <select id="prov"><option value="">Toda España</option>${provs.map(([c, n]) => `<option value="${c}" ${st.province === c ? 'selected' : ''}>${esc(n)}</option>`).join('')}</select>
    <button type="button" class="cta" data-act="begin">Empezar</button>
    <p class="muted">${Q.questions.length} preguntas · 3 minutos · anónimo</p>`;
}
const countText = () => (st.bubbles.length ? `${st.bubbles.length} de ${MAX_BUBBLES}` : 'Elige hasta 3 temas, o ninguno.');

function question() {
  const qs = order(), q = qs[st.idx];
  return `
    ${meter()}
    <div class="card">
      ${q.image ? `<img src="img/${esc(q.image)}" alt="" width="1200" height="900">` : ''}
      <p class="eyebrow">${esc(Q.categories[q.category])} · ${st.idx + 1} de ${qs.length}</p>
      <p class="statement" tabindex="-1">${esc(q.text)}</p>
      <details><summary>¿Qué significa?</summary><p>${esc(q.info)}</p></details>
    </div>
    <div class="scale" role="group" aria-label="Tu respuesta">
      ${OPTS.map(([k, l], i) => `<button type="button" class="opt" data-ans="${k}" aria-pressed="${st.answers[q.id] === k}" aria-keyshortcuts="${i + 1}"><span class="dot"></span>${l}</button>`).join('')}
    </div>
    <div class="row">
      <button type="button" class="link" data-act="back">${st.idx === 0 ? '← Temas' : '← Atrás'}</button>
      <button type="button" class="link" data-ans="skip">No lo sé, saltar →</button>
    </div>`;
}

function valueHtml(r, lvl) {
  if (!r.conclusive) return '<span class="chip far">Sin datos aún</span>';
  const d = display(r.alignment, lvl);
  if (d.kind === 'band') return `<span class="chip ${d.band}">${BANDS[d.band]}</span>`;
  if (d.kind === 'approx') return `<span class="val">≈ ${d.value} %</span>`;
  if (d.kind === 'exact') return `<span class="val">${d.value} %${r.tied ? ' <span class="tag">empate</span>' : ''}</span>`;
  return '';
}
function barHtml(r, lvl) {
  if (!r.conclusive || lvl < 2) return '';
  return `<div class="bar${lvl === 2 ? ' fuzzy' : ''}" aria-hidden="true"><i class="p${Math.round(r.alignment / 10) * 10}"></i></div>`;
}

function result() {
  const qs = order(), left = qs.length - st.idx, rows = results(), n = answered(), lvl = confidence(n);
    const coded = rows.filter((r) => r.compared > 0).length;
  const title = !n ? 'Aún no hay nada que comparar' : ['Sigue un poco más', 'Tu primera pista', 'Esto va tomando forma', 'Ya se ve bastante claro', 'Tu resultado completo'][lvl];
  const hint = !n ? 'Responde alguna pregunta para ver a quién te acercas.' : lvl === 1 ? 'Aún es pronto: solo cerca o lejos.' : lvl === 2 ? 'Cifras aproximadas.' : '';
  return `
    ${meter(st.justLevel || 0)}
    <h1 tabindex="-1">${title}</h1>
    ${hint ? `<p class="muted">${hint}</p>` : ''}
    ${DEMO ? '<p class="notice"><b>Modo demo.</b> Partidos ficticios, solo para probar la herramienta.</p>' : ''}
    ${!DEMO && coded < rows.length ? `<p class="notice"><b>Beta.</b> Leídos ${coded} de ${rows.length} programas. <a href="?demo=1">Ver demo</a></p>` : ''}
    <div>${rows.map((r) => `
      <button type="button" class="party" data-party="${esc(r.id)}">
        <span class="row"><span class="name">${esc(r.name)}</span>${valueHtml(r, lvl)}</span>
        ${barHtml(r, lvl)}
        <span class="muted">${r.compared ? `${r.compared} de ${r.answered} comparadas · ver por qué →` : 'Programa sin leer'}</span>
      </button>`).join('')}</div>
    ${left > 0 ? `<button type="button" class="cta" data-act="more">Afinar con ${Math.min(BATCH, left)} más</button>` : `<button type="button" class="cta" data-act="share">Compartir la guía</button>`}
    <button type="button" class="cta alt" data-act="restart">Empezar de nuevo</button>
    <p class="muted">No es una recomendación de voto. <button type="button" class="ghost" data-act="about">Cómo funciona</button></p>
    ${left === 0 ? feedbackHtml() : ''}`;
}

function why() {
  const p = parties().find((x) => x.id === st.party);
  if (!p) { st.screen = 'result'; return result(); }
  const cells = stancesOf(p), r = scoreParty(st.answers, cells), lvl = confidence(answered());
  const qs = order().filter((q) => st.answers[q.id] in ANSWERS);
  const pr = p.programme || {};
  return `
    <button type="button" class="link" data-act="toresult">← Volver</button>
    <h1 tabindex="-1">${esc(p.name)}</h1>
    <p>${valueHtml({ ...r, tied: false }, lvl)} <span class="muted">${r.compared} de ${r.answered} comparadas</span></p>
    ${p.programme ? `<p class="muted">Fuente: ${esc(pr.title || 'sin documento')}${pr.year ? ' (' + pr.year + ')' : ''} · ${esc(SRC[pr.type] || '')}${pr.url ? ` · <a href="${esc(pr.url)}" rel="noopener noreferrer" target="_blank">abrir</a>` : ''}</p>` : ''}
    ${pr.type === 'programa_anterior' ? '<p class="notice">Aún sin programa para el 29N. Usamos el anterior.</p>' : ''}
    ${p.stancesFrom ? `<p class="notice">${esc(pr.note)}</p>` : ''}
    ${qs.map((q) => { const c = cells[q.id] || {}; const s = c.stance || 'insufficient_evidence'; return `
      <div class="item"><p><b>${esc(q.text)}</b></p>
      <p><span class="tag">Tú: ${LABELS[st.answers[q.id]]}</span><span class="tag">Partido: ${STANCE[s]}</span></p>
      ${c.summary ? `<p>${esc(c.summary)}</p>` : ''}${c.quote ? `<p>«${esc(c.quote)}»</p>` : ''}
      ${c.page ? `<p class="muted">Página ${esc(c.page)}${c.status === 'reviewed' ? '' : ' · sin revisar'}</p>` : ''}</div>`; }).join('') || '<p class="muted">No has respondido ninguna afirmación.</p>'}`;
}

function feedbackHtml() {
  return `<h2>¿Qué te ha parecido?</h2>
    <form id="fb" novalidate>
      <div class="stars" role="group" aria-label="Valoración de 1 a 5">${[1, 2, 3, 4, 5].map((n) => `<button type="button" data-star="${n}" aria-pressed="false">${n}</button>`).join('')}</div>
      <label for="fbm">¿Qué cambiarías?</label>
      <textarea id="fbm" rows="3" maxlength="1000"></textarea>
      <button type="submit" class="cta alt">Enviar opinión</button>
      <p class="muted" id="fbs" role="status"></p>
    </form>`;
}

function about() {
  return `
    <button type="button" class="link" data-act="closeabout">← Volver</button>
    <h1 tabindex="-1">Cómo funciona</h1>
    <p>Respondes a ${Q.questions.length} afirmaciones. Comparamos cada respuesta con lo que el partido ha escrito. Nada más.</p>
    <h2>De dónde salen las posiciones</h2>
    <p>Por este orden: el programa para el 29N; si no existe, el último programa de unas generales; si tampoco, la web oficial del partido. Siempre decimos cuál usamos y enlazamos el documento. Si un partido no dice nada sobre un tema, no cuenta ni a favor ni en contra.</p>
    <p>Una IA lee los programas y otra revisa. Después lo comprueba una persona. Lo que aún no está revisado lo indicamos.</p>
    <h2>Cómo se calcula</h2>
    <p>Coincidir del todo vale 1 punto; casi, 0,75; poco, 0,25; nada, 0. Una posición con matices vale 0,5. El porcentaje es la media. Ningún tema pesa más que otro: elegir temas solo cambia el orden.</p>
    <h2>Por qué la fiabilidad sube</h2>
    <p>Con 5 respuestas solo decimos «cerca» o «lejos». Con 10, cifras redondeadas. Con 15 o más, cifras exactas. Menos respuestas, menos precisión.</p>
    <h2>Qué partidos salen</h2>
    <p>${esc(P.inclusion_rule)}</p>
    <h2>Privacidad</h2>
    <p>Sin registro, sin cookies, sin analítica. Tus respuestas se quedan en esta pestaña y se borran al cerrarla.</p>
    <h2>Código abierto</h2>
    <p>Hecho por BRACAI. Código con licencia MIT y datos con CC BY 4.0: puedes reutilizarlo citando la fuente. <a href="${REPO}" rel="noopener noreferrer" target="_blank">Ver en GitHub</a>. ¿Un error? Dínoslo aquí abajo.</p>
    ${feedbackHtml()}`;
}

const SCREENS = { start, question, result, why, about };
function render() {
  app.innerHTML = `<div class="screen">${SCREENS[st.screen]()}</div>`;
  st.justLevel = 0;
  app.querySelector('h1,.statement')?.focus({ preventScroll: true });
}

function answer(val) {
  const qs = order(), q = qs[st.idx], before = confidence(answered()), answers = { ...st.answers };
  if (val === 'skip') delete answers[q.id]; else answers[q.id] = val;
  const idx = st.idx + 1, done = idx % BATCH === 0 || idx >= qs.length;
  st.answers = answers;
  const after = confidence(answered());
  go({ idx, screen: done ? 'result' : 'question', justLevel: done && after > before ? after : 0 }, true);
}

async function share() {
  const data = { title: 'Guía de voto 29N', text: '¿Qué partido piensa como tú? 20 preguntas, 3 minutos.', url: location.origin + location.pathname };
  try { if (navigator.share) await navigator.share(data); else { await navigator.clipboard.writeText(data.url); app.querySelector('[data-act=share]').textContent = 'Enlace copiado'; } } catch { /* cancelled */ }
}

document.addEventListener('click', (e) => {
  const b = e.target.closest('button'); if (!b) return;
  if (b.dataset.bubble) {
    const id = b.dataset.bubble, on = st.bubbles.includes(id);
    if (!on && st.bubbles.length >= MAX_BUBBLES) return;
    st.bubbles = on ? st.bubbles.filter((x) => x !== id) : [...st.bubbles, id];
    b.setAttribute('aria-pressed', String(!on)); // update in place: keep focus and scroll
    b.parentElement.classList.toggle('full', st.bubbles.length >= MAX_BUBBLES);
    app.querySelector('#count').textContent = countText();
    return save();
  }
  if (b.dataset.ans) { b.setAttribute('aria-pressed', 'true'); return answer(b.dataset.ans); }
  if (b.dataset.party) return go({ screen: 'why', party: b.dataset.party });
  if (b.dataset.star) { b.parentElement.querySelectorAll('button').forEach((x) => x.setAttribute('aria-pressed', String(x === b))); return; }
  switch (b.dataset.act) {
    case 'begin': return go({ screen: 'question', idx: 0, answers: {} }, true);
    case 'back': return st.idx === 0 ? go({ screen: 'start' }) : go({ idx: st.idx - 1 });
    case 'more': return go({ screen: 'question' }, true);
    case 'toresult': return go({ screen: 'result' });
    case 'closeabout': return go({ screen: st.prev || 'start' });
    case 'about': return st.screen === 'about' ? null : go({ prev: st.screen === 'why' ? 'result' : st.screen, screen: 'about' });
    case 'home': return go({ screen: 'start' });
    case 'share': return share();
    case 'restart': return go({ screen: 'start', bubbles: [], idx: 0, answers: {}, party: null });
  }
});
document.addEventListener('change', (e) => { if (e.target.id === 'prov') { st.province = e.target.value; save(); } });
document.addEventListener('keydown', (e) => {
  if (st.screen !== 'question' || e.target.closest('textarea,select,summary') || e.metaKey || e.ctrlKey || e.altKey) return;
  const i = ['1', '2', '3', '4'].indexOf(e.key);
  if (i >= 0) answer(OPTS[i][0]);
});
document.addEventListener('submit', async (e) => {
  if (e.target.id !== 'fb') return;
  e.preventDefault();
  const f = e.target, status = f.querySelector('#fbs');
  const rating = f.querySelector('[data-star][aria-pressed=true]')?.dataset.star || '', message = f.querySelector('#fbm').value.trim();
  if (!rating && !message) { status.textContent = 'Elige una nota o escribe algo.'; return; }
  status.textContent = 'Enviando…';
  try {
    const r = await fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ 'form-name': 'feedback', rating, message }).toString() });
    if (!r.ok) throw new Error(String(r.status));
    f.innerHTML = '<p class="notice">Gracias. Lo leemos todo.</p>';
  } catch { status.textContent = 'No se ha podido enviar. Inténtalo más tarde.'; }
});

Promise.all([load('data/questions.json'), load('data/parties.json'), load('data/stances.json'), DEMO ? load('data/demo.json') : null])
  .then(([q, p, s, d]) => {
    Q = q; P = p; S = s.stances;
    if (d) {
      const map = { S: 'support', O: 'oppose', C: 'conditional' };
      P = { ...p, parties: d.parties.map((x) => ({ ...x, programme: null })) };
      S = Object.fromEntries(d.parties.map((x) => [x.id, Object.fromEntries(q.questions.map((qq, i) => [qq.id, { stance: map[x.pattern[i]] || 'insufficient_evidence' }]))]));
    }
    document.querySelector('#versions').textContent = `Preguntas ${q.version} · Posiciones ${s.version}${DEMO ? ' · DEMO' : ''}`;
    restore();
    if (!SCREENS[st.screen] || st.idx > q.questions.length) st = { screen: 'start', bubbles: [], province: '', idx: 0, answers: {}, party: null };
    render();
  })
  .catch(() => { app.innerHTML = '<p>No se han podido cargar los datos. Recarga la página.</p>'; });
