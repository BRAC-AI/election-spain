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

// Order is random for every new run. The voter's chosen topics still come first.
const shuffle = (ids) => { const a = [...ids]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const order = () => orderQuestions((st.seq && st.seq.length === Q.questions.length ? st.seq.map((id) => Q.questions.find((q) => q.id === id)).filter(Boolean) : Q.questions), Q.bubbles.filter((b) => st.bubbles.includes(b.id)).flatMap((b) => b.categories));
const answered = () => Object.values(st.answers).filter((a) => a in ANSWERS).length;
const parties = () => eligibleParties(P.parties, st.province);
const stancesOf = (p) => S[p.stancesFrom || p.id] || {};
const scoreOf = (p) => { const c = stancesOf(p), r = scoreParty(st.answers, c, undefined, st.stars || {}), ok = enoughData(c); return { ...r, enough: ok, thin: r.thin || (r.conclusive && !ok) }; }; // a party we know little about is shown, never crowned
const results = () => rankResults(parties().map((p) => ({ ...p, ...scoreOf(p) })));
const badge = (p) => `<span class="badge">${p.logo ? `<img src="img/logos/${esc(p.logo)}" alt="" width="256" height="256" loading="lazy">` : esc(p.abbr)}</span>`;

function go(patch, animate = false) {
  const apply = () => { Object.assign(st, patch); save(); render(); };
  const cur = app.querySelector('.screen');
  if (animate && cur && !matchMedia('(prefers-reduced-motion: reduce)').matches) { cur.classList.add('out'); setTimeout(apply, 140); } else apply();
}

// Confidence meter: four segments, one per block of five answers.
function meter(popLevel = 0) {
  const n = answered(), total = Q.questions.length, lvl = n === 0 ? 0 : Math.min(4, 1 + Math.floor((3 * n) / total)); // label follows the share answered
  const segs = Array.from({ length: Math.ceil(total / BATCH) }, (_, i) => i).map((i) => `<span class="seg${popLevel === i + 1 ? ' pop' : ''}"><i class="w${Math.max(0, Math.min(BATCH, n - i * BATCH))}"></i></span>`).join('');
  return `<div class="meter" role="img" aria-label="${LEVELS[lvl]}. ${n} de ${Q.questions.length} respuestas.">
    <div class="segs">${segs}</div><div class="cap"><span><b>${LEVELS[lvl]}</b>${lvl === 1 ? ` (solo ${n} preguntas. Haz más para estar más seguro)` : lvl === 2 ? ` (${n} preguntas. Sigue para afinar)` : ''}</span><span>${n}/${Q.questions.length}</span></div></div>`;
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
    <p class="note">Los temas que elijas salen primero. No valen más: para eso está la ★.</p>`;
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
      <p class="statement${q.text.length > 80 ? ' long' : ''}" tabindex="-1">${esc(q.text)}</p>
      ${st.info ? `<p class="info">${esc(q.info)}</p>` : `<button type="button" class="infobtn" data-act="info">¿Qué significa?</button>`}
    </div>
    <div class="scale" role="group" aria-label="Tu respuesta">
      ${OPTS.map(([k, l], i) => `<button type="button" class="opt" data-ans="${k}" aria-pressed="${st.answers[q.id] === k}" aria-keyshortcuts="${i + 1}"><span class="dot"></span><span>${l}</span><span class="go" aria-hidden="true">→</span></button>`).join('')}
      <button type="button" class="opt skip" data-ans="skip"><span class="dot"></span><span>No lo sé</span><span class="go" aria-hidden="true">→</span></button>
    </div>
    <button type="button" class="link" data-act="back">← ${st.idx === 0 ? 'Temas' : 'Atrás'}</button>`;
}

function hero(rows) {
  const top = rows.filter((r) => r.rank === 1), scored = rows.filter((r) => r.conclusive && !r.thin).length;
  if (top.length && scored * 2 < rows.length) return `<p class="empty">Solo podemos comparar con ${scored} de ${rows.length} partidos. Aún no hay ganador.</p>`;
  if (!top.length) return `<p class="empty">${answered() ? 'Aún no podemos comparar. Sigue un poco más.' : 'Responde alguna pregunta para ver tu resultado.'}</p>`;
  const r = top[0];
  return `<button type="button" class="hero" data-party="${esc(r.id)}">
    <span class="ringwrap"><svg class="ring" viewBox="0 0 120 120" aria-hidden="true">
      <circle class="track" cx="60" cy="60" r="52"/><circle class="arc" cx="60" cy="60" r="52" pathLength="100" stroke-dasharray="${r.alignment} 100" transform="rotate(-90 60 60)"/></svg>
      <span class="num">${r.alignment}<small>%</small></span></span>
    <span class="herotext"><span class="eyebrow">${st.idx < Q.questions.length ? 'Resultado provisional · ' : ''}${top.length > 1 ? 'Empate' : 'Más cerca de ti'}</span>
      <span class="heroname">${top.map((x) => esc(x.name)).join(' · ')}</span>
      <span class="muted">Toca para ver por qué</span></span></button>`;
}

const oldTag = () => ''; // positions now mix programmes, votes and quotes, so one year tag would mislead
const row = (r) => `
      <button type="button" class="party${r.conclusive ? (r.thin ? ' thin' : '') : ' blank'}" data-party="${esc(r.id)}" aria-label="${esc(r.name)}: ${r.conclusive ? r.alignment + ' por ciento' : 'aún sin porcentaje, sigue respondiendo'}">
        ${badge(r)}<span class="name">${esc(r.name)}</span>
        <span class="bar" aria-hidden="true"><i class="p${r.conclusive ? Math.round(r.alignment / 5) * 5 : 0}"></i></span><span class="val">${r.conclusive ? r.alignment + ' %' : '–'}</span>
      </button>`;

function result() {
  const left = order().length - st.idx, rows = results();
  return `
    ${meter(st.justLevel || 0)}
    ${hero(rows)}
    <div class="list grow scroll">${rows.filter((r) => r.conclusive).sort((x, y) => y.alignment - x.alignment || x.name.localeCompare(y.name, 'es')).map(row).join('')}
      ${rows.filter((r) => !r.conclusive).map(row).join('')}</div>
    <div class="btns">
      ${left > 0 ? `<button type="button" class="cta" data-act="more">${Math.min(BATCH, left)} preguntas más</button>` : `<button type="button" class="cta" data-act="share">Compartir</button>`}
      <button type="button" class="cta alt" data-act="restart" aria-label="Empezar de nuevo">↺</button>
    </div>
`;
}

function why() {
  const p = parties().find((x) => x.id === st.party);
  if (!p) { st.screen = 'result'; return result(); }
  const cells = stancesOf(p), r = scoreOf(p), pr = p.programme || {};
  const qs = order().filter((q) => st.answers[q.id] in ANSWERS);
  const agr = Object.fromEntries(r.perQuestion.map((x) => [x.q, x.agreement]));
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
    ${r.enough ? '' : `<div class="item"><p><b>Aún no sabemos lo suficiente de este partido.</b></p><p>Solo hemos encontrado ${Object.keys(cells).length} posiciones de ${Q.questions.length}. Por eso su porcentaje es poco fiable.</p>${p.priorities ? `<p>Sus prioridades, en su web: ${p.priorities.map(([t, u]) => `<a href="${esc(u)}" rel="noopener noreferrer" target="_blank">${esc(t)}</a>`).join(' · ')}</p>` : ''}</div>`}
    ${qs.map((q) => { const c = cells[q.id] || {}; const s = c.stance || 'insufficient_evidence'; const h = (HI[p.stancesFrom || p.id] || {})[q.id]; return `
      <div class="item"><p><b>${esc(q.text)}</b></p>
      <p>${verdict(agr[q.id])}${(st.stars || {})[q.id] ? '<span class="tag star">★ Vale el doble</span>' : ''}</p>
      <p class="pair">Tú: <b>${LABELS[st.answers[q.id]]}</b> · Partido: <b>${STANCE[s]}</b></p>
      ${c.summary ? `<p>${esc(c.summary)}</p>` : ''}${c.quote ? `<p>«${esc(c.quote)}»</p>` : ''}
      ${c.src ? `<p class="muted">${c.research_level === 7 ? 'De un socio o antecesor del partido: ' : c.approx ? 'Parecido, no exacto: ' : ''}${srcLink(c)}</p>` : h ? `<p class="muted">Lo más cercano que hemos encontrado: ${esc(h.summary)} ${srcLink(h)}</p>` : s === 'insufficient_evidence' ? '<p class="muted">No hemos encontrado nada. No cuenta.</p>' : ''}</div>`; }).join('') || '<p class="muted">Aún no has respondido nada.</p>'}
    </div>`;
}

// One plain verdict per statement, so nobody has to compare two labels in their head.
function verdict(a) {
  const [cls, txt] = a === undefined ? ['none', 'No lo sabemos'] : a >= 1 ? ['yes', '✓ Pensáis igual'] : a >= 0.75 ? ['yes', '✓ Casi igual'] : a >= 0.5 ? ['mid', '≈ A medias'] : a > 0 ? ['no', '✗ Casi al revés'] : ['no', '✗ Al revés'];
  return `<span class="verdict ${cls}">${txt}</span>`;
}

function srcLink(c) {
  const d = SO[c.src] || {}, where = c.page === 'web' ? '' : `, pág. ${esc(c.page)}`;
  const label = `${d.level === 4 ? 'Lo dijo ' : d.level === 5 ? 'Votó: ' : ''}${esc(d.title || 'Fuente')}${d.level === 2 ? ' (programa anterior)' : ''}${where}`;
  return d.url ? `<a href="${esc(d.url)}" rel="noopener noreferrer" target="_blank">${label}</a>` : label;
}

function about() {
  const KIND = (c) => { const d = SO[c.src] || {}; return c.research_level === 7 ? 'de un socio o antecesor' : c.approx || d.level === 6 ? 'parecidas' : { 1: 'de su programa 29N', 2: 'de un programa anterior', 3: 'de su web', 4: 'dichas en público', 5: 'votadas' }[d.level] || 'otras'; };
  const rows = P.parties.map((p) => { const cells = Object.entries(stancesOf(p)).filter(([q]) => Q.questions.some((x) => x.id === q)).map(([, c]) => c), by = {};
    cells.forEach((c) => { const k = KIND(c); by[k] = (by[k] || 0) + 1; });
    return `<div class="item"><b>${esc(p.name)}</b> · ${cells.length} de ${Q.questions.length} posiciones<br><span class="muted">${Object.entries(by).sort((x, y) => y[1] - x[1]).map(([k, n]) => `${n} ${k}`).join(' · ')}${p.stancesFrom ? ' (las del PP)' : ''}</span></div>`; }).join('');
  return `
    <button type="button" class="link" data-act="closeabout">← Volver</button>
    <h1 tabindex="-1">Cómo funciona</h1>
    <div class="grow scroll about">
      <h2>Para qué sirve</h2>
      <p>Para ayudarte a ver qué partido piensa más como tú en estas elecciones.</p>
      <h2>Cómo funciona</h2>
      <p><b>1.</b> Tú respondes a ${Q.questions.length} frases.</p>
      <p><b>2.</b> Antes, con ayuda de inteligencia artificial, hemos buscado qué piensa cada partido sobre cada frase: en su programa, en lo que ha votado y en lo que han dicho sus líderes.</p>
      <p><b>3.</b> Comparamos tus respuestas con las de cada partido y te decimos cuánto os parecéis. Si marcas una frase con ★, vale el doble.</p>
      <p>Toca cualquier partido y verás, frase a frase, qué piensa y de dónde lo hemos sacado, con su enlace.</p>
      <h2>Lo que no es</h2>
      <p>No quiere cambiar lo que piensas. No te dice a quién votar. Solo te ayuda a orientarte.</p>
      <p>No guarda nada: sin registro, sin cookies, sin rastreo.</p>
      <h2>Puede haber errores</h2>
      <p>Hemos buscado las mejores fuentes que hemos podido. Pero la búsqueda la hizo una IA y una persona no lo ha revisado todo.</p>
      <p>A veces no hay una fuente exacta. Entonces usamos la más cercana y lo decimos: «Parecido, no exacto» o «De un socio o antecesor del partido».</p>
      <h2>Quién lo hace</h2>
      <p>Lo hicimos en <a href="https://bracai.eu" rel="noopener noreferrer" target="_blank">BRACAI</a> para Núria, que quería saber a quién votar. Es gratis y no hay ningún partido detrás.</p>
      <p>Todo es abierto: <a href="${REPO}" rel="noopener noreferrer" target="_blank">el código y los datos</a> y <a href="${REPO}/blob/main/docs/METHODOLOGY.md" rel="noopener noreferrer" target="_blank">el método completo</a>.</p>
      <h2>¿Ves algo mal?</h2>
      <p>Si no estás de acuerdo con algo, o crees que una fuente está mal o es antigua, dínoslo. Tu opinión es muy bienvenida.</p>
      <form id="fb" novalidate>
        <div class="stars" role="group" aria-label="Nota de 1 a 5">${[1, 2, 3, 4, 5].map((n) => `<button type="button" data-star="${n}" aria-pressed="false">${n}</button>`).join('')}</div>
        <textarea id="fbm" rows="3" maxlength="1000" aria-label="Tu opinión" placeholder="¿Qué partido, qué frase y qué cambiarías?"></textarea>
        <div class="btns"><button type="submit" class="cta">Enviar</button></div>
        <p class="muted" id="fbs" role="status"></p>
      </form>
      <details class="more"><summary>Fuentes de cada partido</summary>
        <p class="muted">${esc(P.inclusion_rule)} Según donde votes ves solo los que puedes votar.</p>
        <p class="muted">Aquí ves cuántas posiciones tenemos de cada partido y de dónde salen. El enlace de cada una está en la página del partido, tras responder.</p>
        ${rows}
      </details>
    </div>`;
}

function how() {
  return `
    <button type="button" class="link" data-act="towhere">← Atrás</button>
    <h1 tabindex="-1">Así funciona</h1>
    <ol class="steps grow">
      <li><b>1</b><div><p>Lee ${Q.questions.length} frases y di qué piensas.</p>
        <div class="mini" aria-hidden="true"><span class="pill on">A favor</span><span class="pill">En contra</span></div></div></li>
      <li><b>2</b><div><p>¿Una te importa mucho? Márcala y <strong>vale el doble</strong>. Pruébalo:</p>
        <div class="mini"><button type="button" class="starbtn" data-act="demostar" aria-pressed="false"><span aria-hidden="true">★</span> <span class="lbl">Muy importante</span></button><span class="x2" aria-hidden="true">×2</span></div></div></li>
      <li><b>3</b><div><p>Mira qué partido piensa más como tú.</p>
        <div class="mini bars" aria-hidden="true"><i class="b1"></i><i class="b2"></i><i class="b3"></i></div></div></li>
    </ol>
    <div class="btns"><button type="button" class="cta" data-act="go">Empezar</button></div>
    <p class="note">5 minutos · anónimo · ves el resultado cada 5 frases</p>`;
}
const SCREENS = { start, where, how, question, result, why, about };
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
  go({ idx, info: false, screen: done ? 'result' : 'question', justLevel: done ? Math.ceil(answered() / BATCH) : 0 }, true);
}

async function share() {
  const data = { title: 'Guía de voto 29N', text: '¿Qué partido piensa como tú? 20 preguntas, 5 minutos.', url: location.origin + location.pathname };
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
    case 'demostar': { const on = b.getAttribute('aria-pressed') !== 'true'; b.setAttribute('aria-pressed', String(on)); b.querySelector('.lbl').textContent = on ? 'Vale el doble' : 'Muy importante'; b.parentElement.classList.toggle('on', on); return; }
    case 'towhere': return go({ screen: 'where' }, true);
    case 'tostart': return go({ screen: 'start' });
    case 'begin': return go({ screen: 'how', idx: 0, answers: {}, stars: {}, info: false, seq: shuffle(Q.questions.map((q) => q.id)) }, true);
    case 'go': return go({ screen: 'question' }, true);
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
