import { scoreParty, rankResults, orderQuestions, eligibleParties, ANSWERS } from './scoring.js';

const app = document.querySelector('#app');
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const load = (p) => fetch(p).then((r) => { if (!r.ok) throw new Error(p); return r.json(); });
const DEMO = new URLSearchParams(location.search).get('demo') === '1';
const BATCH = 5, MAX_BUBBLES = 3;
const LABELS = { sa: 'Muy de acuerdo', a: 'De acuerdo', d: 'En desacuerdo', sd: 'Muy en desacuerdo' };
const STANCE = { support: 'A favor', oppose: 'En contra', conditional: 'Con condiciones', insufficient_evidence: 'Sin datos suficientes' };
const PROG = { current_election_official: 'programa del 29N', fallback_older_programme: 'programa anterior', verification_pending: 'fuente por verificar', not_found: 'programa no localizado' };

let Q, P, S; // questions, parties, stances
let st = { screen: 'start', bubbles: [], province: '', idx: 0, answers: {}, seen: [], party: null };

// Answers stay on this device, for this tab only.
const save = () => { try { sessionStorage.setItem('guia29n', JSON.stringify(st)); } catch { /* storage unavailable */ } };
const restore = () => { try { const v = JSON.parse(sessionStorage.getItem('guia29n')); if (v && v.screen) st = v; } catch { /* ignore */ } };

const order = () => {
  const cats = Q.bubbles.filter((b) => st.bubbles.includes(b.id)).flatMap((b) => b.categories);
  return orderQuestions(Q.questions, cats);
};
const go = (patch) => { Object.assign(st, patch); save(); render(); window.scrollTo(0, 0); app.querySelector('h1,h2,.statement')?.focus?.(); };

function start() {
  const provs = Object.entries(P.provinces).sort((a, b) => a[1].localeCompare(b[1], 'es'));
  app.innerHTML = `
    <p class="eyebrow">Elecciones generales · 29 de noviembre de 2026</p>
    <h1 tabindex="-1">¿Qué te importa más?</h1>
    <p>Elige hasta tres temas y los verás primero. No cambian la puntuación. También puedes empezar sin elegir.</p>
    <div class="bubbles" role="group" aria-label="Temas">
      ${Q.bubbles.map((b) => `<button type="button" data-bubble="${esc(b.id)}" aria-pressed="${st.bubbles.includes(b.id)}">${esc(b.label)}</button>`).join('')}
    </div>
    <label for="prov">¿En qué provincia votas? (opcional)</label>
    <select id="prov"><option value="">Toda España</option>${provs.map(([c, n]) => `<option value="${c}" ${st.province === c ? 'selected' : ''}>${esc(n)}</option>`).join('')}</select>
    <div class="stack"><button type="button" class="primary" data-act="begin">${st.bubbles.length ? 'Empezar' : 'Empezar sin elegir'}</button></div>
    <p class="muted">${Q.questions.length} afirmaciones en bloques de cinco. Puedes parar cuando quieras.</p>`;
}

function question() {
  const qs = order(), q = qs[st.idx];
  const inBatch = (st.idx % BATCH) + 1, batchSize = Math.min(BATCH, qs.length - (st.idx - (st.idx % BATCH)));
  app.innerHTML = `
    <div class="row"><p class="eyebrow">${esc(Q.categories[q.category])}</p><p class="muted">${inBatch} de ${batchSize} · ${st.idx + 1}/${qs.length}</p></div>
    <progress max="${batchSize}" value="${inBatch}" aria-label="Progreso del bloque"></progress>
    <p class="statement" tabindex="-1">${esc(q.text)}</p>
    <div class="stack" role="group" aria-label="Tu respuesta">
      ${Object.keys(LABELS).map((k) => `<button type="button" data-ans="${k}" aria-pressed="${st.answers[q.id] === k}">${LABELS[k]}</button>`).join('')}
    </div>
    <div class="row">
      <button type="button" class="link" data-act="back">${st.idx === 0 ? 'Volver a los temas' : 'Atrás'}</button>
      <button type="button" class="link" data-ans="skip">No lo sé / saltar</button>
    </div>`;
}

function parties() { return eligibleParties(P.parties, st.province); }
function results() {
  return rankResults(parties().map((p) => ({ id: p.id, name: p.name, programme: p.programme, ...scoreParty(st.answers, S[p.id]) })));
}

function result() {
  const qs = order(), left = qs.length - st.idx, rows = results();
  const answered = Object.values(st.answers).filter((a) => a in ANSWERS).length;
  const cats = [...new Set(qs.slice(0, st.idx).map((q) => Q.categories[q.category]))];
  const missing = [...new Set(qs.slice(st.idx).map((q) => Q.categories[q.category]))].filter((c) => !cats.includes(c));
  const anyCoded = rows.some((r) => r.compared > 0);
  app.innerHTML = `
    <p class="eyebrow">Resultado provisional · ${st.idx} de ${qs.length} afirmaciones</p>
    <h1 tabindex="-1">${answered ? 'Así coinciden tus respuestas' : 'Aún no hay nada que comparar'}</h1>
    ${DEMO ? '<p class="notice"><strong>Modo demo.</strong> Los partidos son ficticios. Sirve solo para probar la herramienta.</p>' : ''}
    ${!anyCoded && !DEMO ? '<p class="notice"><strong>Las posiciones de los partidos aún no están revisadas.</strong> Por eso no mostramos coincidencias. <a href="?demo=1">Ver la herramienta con partidos ficticios</a>.</p>' : ''}
    ${answered && answered < 10 ? '<p class="muted">Con pocas respuestas el resultado cambia mucho. Tómalo como una pista, no como un veredicto.</p>' : ''}
    ${!answered ? '<p>Has saltado todas las afirmaciones. Responde alguna para ver una comparación.</p>' : ''}
    <div>${rows.map((r) => `
      <div class="party"><button type="button" data-party="${esc(r.id)}" aria-label="Ver por qué: ${esc(r.name)}">
        <div class="row"><span class="name">${esc(r.name)}${r.tied ? ' <span class="tag">empate</span>' : ''}</span>
        <span class="pct">${r.conclusive ? r.alignment + ' %' : 'No concluyente'}</span></div>
        ${r.conclusive ? `<progress max="100" value="${r.alignment}" aria-hidden="true"></progress>` : ''}
        <span class="muted">Comparado en ${r.compared} de ${r.answered} respuestas${r.programme ? ' · ' + esc(PROG[r.programme.status] || '') + (r.programme.year ? ' ' + r.programme.year : '') : ''}</span>
      </button></div>`).join('')}</div>
    <div class="stack">
      ${left > 0 ? `<button type="button" class="primary" data-act="more">Responder ${Math.min(BATCH, left)} más</button>` : ''}
      <button type="button" data-act="restart">Empezar de nuevo</button>
    </div>
    <h2>Qué cubre este resultado</h2>
    <p class="muted">Temas vistos: ${esc(cats.join(', ') || 'ninguno')}.${missing.length ? ' Sin ver: ' + esc(missing.join(', ')) + '.' : ''} Esta guía no cubre todos los temas ni sustituye a leer los programas.</p>
    <p class="muted">Cómo se calcula: cada respuesta se compara con la posición del partido en su programa. Lo que no está en el programa no cuenta, ni a favor ni en contra. Hace falta comparar al menos 5 respuestas y el 60 % de las tuyas para dar un porcentaje. Diferencias de 3 puntos o menos se muestran como empate.</p>`;
}

function why() {
  const p = [...parties()].find((x) => x.id === st.party);
  if (!p) return go({ screen: 'result' });
  const r = scoreParty(st.answers, S[p.id]);
  const qs = order().filter((q) => st.answers[q.id] in ANSWERS);
  const pr = p.programme || {};
  app.innerHTML = `
    <button type="button" class="link" data-act="toresult">← Volver al resultado</button>
    <h1 tabindex="-1">${esc(p.name)}</h1>
    <p class="muted" ${p.programme ? '' : 'hidden'}>Fuente: ${esc(pr.title || 'sin programa localizado')}${pr.year ? ' (' + pr.year + ')' : ''} · ${esc(PROG[pr.status] || '')}${pr.verified ? '' : ' · sin verificar'}
      ${pr.url ? `· <a href="${esc(pr.url)}" rel="noopener noreferrer" target="_blank">abrir documento</a>` : ''}</p>
    ${pr.status === 'fallback_older_programme' ? '<p class="notice">Este partido aún no ha publicado programa para el 29N. Se usa el anterior. Puede no reflejar su posición actual.</p>' : ''}
    <p>${r.conclusive ? `Coincidencia: <strong>${r.alignment} %</strong> en ${r.compared} respuestas comparadas.` : `No concluyente: solo ${r.compared} de ${r.answered} respuestas se pueden comparar.`}</p>
    ${qs.map((q) => { const c = (S[p.id] || {})[q.id] || {}; const s = c.stance || 'insufficient_evidence'; return `
      <div class="item"><p><strong>${esc(q.text)}</strong></p>
      <p><span class="tag">Tú: ${LABELS[st.answers[q.id]]}</span><span class="tag">Partido: ${STANCE[s]}</span></p>
      ${c.summary ? `<p>${esc(c.summary)}</p>` : ''}${c.quote ? `<p>«${esc(c.quote)}»</p>` : ''}
      ${c.page ? `<p class="muted">Página ${esc(c.page)}</p>` : ''}</div>`; }).join('') || '<p class="muted">No has respondido ninguna afirmación.</p>'}`;
}

function render() { ({ start, question, result, why })[st.screen](); }

app.addEventListener('click', (e) => {
  const b = e.target.closest('button'); if (!b) return;
  const qs = order();
  if (b.dataset.bubble) {
    const id = b.dataset.bubble, on = st.bubbles.includes(id);
    if (!on && st.bubbles.length >= MAX_BUBBLES) return;
    st.bubbles = on ? st.bubbles.filter((x) => x !== id) : [...st.bubbles, id];
    b.setAttribute('aria-pressed', String(!on)); // update in place: keep focus and scroll
    app.querySelector('[data-act=begin]').textContent = st.bubbles.length ? 'Empezar' : 'Empezar sin elegir';
    return save();
  }
  if (b.dataset.ans) {
    const q = qs[st.idx], answers = { ...st.answers };
    if (b.dataset.ans === 'skip') delete answers[q.id]; else answers[q.id] = b.dataset.ans;
    const idx = st.idx + 1;
    return go({ answers, idx, screen: idx % BATCH === 0 || idx >= qs.length ? 'result' : 'question' });
  }
  if (b.dataset.party) return go({ screen: 'why', party: b.dataset.party });
  switch (b.dataset.act) {
    case 'begin': return go({ screen: 'question', idx: 0, answers: {} });
    case 'back': return st.idx === 0 ? go({ screen: 'start' }) : go({ idx: st.idx - 1 });
    case 'more': return go({ screen: 'question' });
    case 'toresult': return go({ screen: 'result' });
    case 'restart': return go({ screen: 'start', bubbles: [], idx: 0, answers: {}, party: null });
  }
});
app.addEventListener('change', (e) => { if (e.target.id === 'prov') { st.province = e.target.value; save(); } });

Promise.all([load('data/questions.json'), load('data/parties.json'), load('data/stances.json'), DEMO ? load('data/demo.json') : null])
  .then(([q, p, s, d]) => {
    Q = q; P = p; S = s.stances;
    if (d) {
      const map = { S: 'support', O: 'oppose', C: 'conditional' };
      P = { ...p, parties: d.parties.map((x) => ({ ...x, programme: null })) };
      S = Object.fromEntries(d.parties.map((x) => [x.id, Object.fromEntries(q.questions.map((qq, i) => [qq.id, { stance: map[x.pattern[i]] || 'insufficient_evidence' }]))]));
    }
    document.querySelector('#versions').textContent = `Preguntas ${q.version} · Posiciones ${s.version}${DEMO ? ' · DEMO' : ''}`;
    restore(); render();
  })
  .catch(() => { app.innerHTML = '<p>No se han podido cargar los datos. Recarga la página.</p>'; });
