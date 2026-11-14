import CA from './ca.js';
import { scoreParty, enoughData, rankResults, orderQuestions, eligibleParties, confidence, ANSWERS, CONFIG } from './scoring.js';

const app = document.querySelector('#app');
// Language: ?lang=ca wins, then the saved choice, then the browser. Spanish text is the key; ca.js holds the Catalan.
const LANG = (() => { let v = new URLSearchParams(location.search).get('lang'); try { if (v) localStorage.setItem('guia29n-lang', v); else v = localStorage.getItem('guia29n-lang'); } catch { /* storage unavailable */ } return (v || navigator.language || '').toLowerCase().startsWith('ca') ? 'ca' : 'es'; })();
const t = (s) => (LANG === 'ca' && CA[s]) || s;
const tx = (o, k) => (LANG === 'ca' && o[k + '_ca']) || o[k];
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const load = (p) => fetch(p).then((r) => { if (!r.ok) throw new Error(p); return r.json(); });
const BATCH = CONFIG.step, MAX_BUBBLES = 3;
const REPO = 'https://github.com/BRAC-AI/election-spain';
const OPTS = [['sa', t('Muy a favor')], ['a', t('A favor')], ['d', t('En contra')], ['sd', t('Muy en contra')]];
const LABELS = Object.fromEntries(OPTS);
const STANCE = { support: t('A favor'), oppose: t('En contra'), conditional: t('A medias'), insufficient_evidence: t('No lo dice') };
const SRC = { programa_29N: t('Programa 29N'), programa_anterior: t('Programa anterior'), web: t('Web') };
const LEVELS = [t('Aún nada'), t('Poco fiable'), t('Algo fiable'), t('Bastante fiable'), t('Muy fiable')];
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
  return `<div class="meter" role="img" aria-label="${LEVELS[lvl]}. ${n} de ${Q.questions.length}${t(' respuestas.')}">
    <div class="segs">${segs}</div><div class="cap"><span><b>${LEVELS[lvl]}</b>${lvl === 1 ? `${t(' (solo ')}${n}${t(' preguntas. Haz más para estar más seguro)')}` : lvl === 2 ? ` (${n}${t(' preguntas. Sigue para afinar)')}` : ''}</span><span>${n}/${Q.questions.length}</span></div></div>`;
}

const countText = () => `${t('Elige hasta 3 temas')}${st.bubbles.length ? ` · ${st.bubbles.length}/3` : ''}`;
function start() {
  return `
    <h1 tabindex="-1">${t('¿Qué temas son los más importantes para ti?')}</h1>
    <p class="muted" id="count">${countText()}</p>
    <div class="bubbles grow${st.bubbles.length >= MAX_BUBBLES ? ' full' : ''}" role="group" aria-label="${t('Temas')}">
      ${Q.bubbles.map((b) => `<button type="button" class="bubble" data-bubble="${esc(b.id)}" aria-pressed="${st.bubbles.includes(b.id)}">${esc(tx(b, 'label'))}</button>`).join('')}
    </div>
    <div class="btns"><button type="button" class="cta" data-act="towhere">${t('Siguiente')}</button></div>
    <p class="note">${t('Los temas que elijas salen primero. No valen más: para eso está la ★.')}</p>`;
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
    <button type="button" class="link" data-act="tostart">← ${t('Temas')}</button>
    <h1 tabindex="-1">${t('¿Dónde votas?')}</h1>
    <svg class="map grow" viewBox="${M.viewBox}" role="group" aria-label="${t('Mapa de España. Toca tu comunidad.')}">
      <rect class="inset" x="${ix}" y="${iy}" width="${iw}" height="${ih}" rx="4" data-region="05"/>
      ${M.regions.map((g) => `<path class="reg${g.id === st.region ? ' sel' : ''}" d="${g.d}" data-region="${g.id}" tabindex="0" role="button" aria-pressed="${g.id === st.region}" aria-label="${esc(t(g.name))}"><title>${esc(t(g.name))}</title></path>`).join('')}
    </svg>
    <select id="reg" aria-label="${t('O elige tu comunidad en la lista')}"><option value="">${t('…o elige en la lista')}</option>${all.map((g) => `<option value="${g.id}" ${g.id === st.region ? 'selected' : ''}>${esc(t(g.name))}</option>`).join('')}</select>
    ${need ? `<div class="chips" role="group" aria-label="${t('Provincia')}">${r.provinces.map((c) => `<button type="button" class="chip" data-prov="${c}" aria-pressed="${st.province === c}">${esc(P.provinces[c])}</button>`).join('')}</div>` : ''}
    <div class="btns"><button type="button" class="cta" data-act="begin" ${ready ? '' : 'disabled'}>${r ? (ready ? t('Empezar') : t('Elige tu provincia')) : t('Empezar sin elegir')}</button></div>
    <p class="note">${r ? esc(t(r.name)) + (st.province && need ? ' · ' + esc(P.provinces[st.province]) : '') : t('Así ves solo los partidos que puedes votar')}</p>`;
}
const pickRegion = (id) => { const r = regionById(id); go({ region: r ? id : '', province: r && !needsProvince(r) ? r.provinces[0] : '' }); };

function question() {
  const qs = order(), q = qs[st.idx];
  return `
    ${meter()}
    <div class="card grow">
      ${q.image ? `<img src="img/${esc(q.image)}" alt="">` : ''}
      <div class="cardtop"><p class="eyebrow">${esc(tx(Q, 'categories')[q.category])}</p><button type="button" class="starbtn" data-act="star" aria-pressed="${!!(st.stars || {})[q.id]}" aria-label="${t('Muy importante para mí: vale el doble')}"><span aria-hidden="true">★</span> <span class="lbl">${(st.stars || {})[q.id] ? t('Vale el doble') : t('Muy importante')}</span></button></div>
      <p class="statement${tx(q, 'text').length > 80 ? ' long' : ''}" tabindex="-1">${esc(tx(q, 'text'))}</p>
      ${st.info ? `<p class="info">${esc(tx(q, 'info'))}</p>` : `<button type="button" class="infobtn" data-act="info">${t('¿Qué significa?')}</button>`}
    </div>
    <div class="scale" role="group" aria-label="${t('Tu respuesta')}">
      ${OPTS.map(([k, l], i) => `<button type="button" class="opt" data-ans="${k}" aria-pressed="${st.answers[q.id] === k}" aria-keyshortcuts="${i + 1}"><span class="dot"></span><span>${l}</span><span class="go" aria-hidden="true">→</span></button>`).join('')}
      <button type="button" class="opt skip" data-ans="skip"><span class="dot"></span><span>${t('No lo sé')}</span><span class="go" aria-hidden="true">→</span></button>
    </div>
    <button type="button" class="link" data-act="back">← ${st.idx === 0 ? t('Temas') : t('Atrás')}</button>`;
}

function hero(rows) {
  const top = rows.filter((r) => r.rank === 1), scored = rows.filter((r) => r.conclusive && !r.thin).length;
  if (top.length && scored * 2 < rows.length) return `<p class="empty">${t('Solo podemos comparar con ')}${scored} de ${rows.length}${t(' partidos. Aún no hay ganador.')}</p>`;
  if (!top.length) return `<p class="empty">${answered() ? t('Aún no podemos comparar. Sigue un poco más.') : t('Responde alguna pregunta para ver tu resultado.')}</p>`;
  const r = top[0], left = order().length - st.idx;
  return `<button type="button" class="hero" data-party="${esc(r.id)}">
    <span class="ringwrap"><svg class="ring" viewBox="0 0 120 120" aria-hidden="true">
      <circle class="track" cx="60" cy="60" r="52"/><circle class="arc" cx="60" cy="60" r="52" pathLength="100" stroke-dasharray="${r.alignment} 100" transform="rotate(-90 60 60)"/></svg>
      <span class="num">${r.alignment}<small>%</small></span></span>
    <span class="herotext"><span class="eyebrow">${st.idx < Q.questions.length ? t('Resultado provisional · ') : ''}${top.length > 1 ? t('Empate') : t('Más cerca de ti')}</span>
      <span class="heroname">${top.map((x) => esc(x.name)).join(' · ')}</span>
      <span class="muted">${left > 0 ? `${t('Puede cambiar: te faltan ')}${left}${t(' preguntas')}` : t('Toca para ver por qué')}</span></span></button>`;
}

const oldTag = () => ''; // positions now mix programmes, votes and quotes, so one year tag would mislead
const row = (r) => `
      <button type="button" class="party${r.conclusive ? (r.thin ? ' thin' : '') : ' blank'}" data-party="${esc(r.id)}" aria-label="${esc(r.name)}: ${r.conclusive ? r.alignment + t(' por ciento') : t('aún sin porcentaje, sigue respondiendo')}">
        ${badge(r)}<span class="name">${esc(r.name)}</span>
        <span class="bar" aria-hidden="true"><i class="p${r.conclusive ? Math.round(r.alignment / 5) * 5 : 0}"></i></span><span class="val">${r.conclusive ? r.alignment + ' %' : '–'}</span>
      </button>`;

function result() {
  const left = order().length - st.idx, rows = results();
  return `
    ${meter(st.justLevel || 0)}
    ${hero(rows)}
    <div class="list grow scroll">${rows.filter((r) => r.conclusive).sort((x, y) => y.alignment - x.alignment || x.name.localeCompare(y.name, 'es')).map(row).join('')}
      ${rows.filter((r) => !r.conclusive).map(row).join('')}
      <p class="note">${t('Hay más listas. Estas tenían escaño, más dos nuevas.')}</p></div>
    <div class="btns">
      ${left > 0 ? `<button type="button" class="cta" data-act="more">${t('Seguir: te faltan ')}${left}</button>` : `<button type="button" class="cta" data-act="share">${t('Compartir')}</button>`}
      <button type="button" class="cta alt" data-act="restart" aria-label="${t('Empezar de nuevo')}">↺</button>
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
    <button type="button" class="link" data-act="toresult">← ${t('Volver')}</button>
    <div class="head">${badge(p)}<h1 tabindex="-1">${esc(p.name)}</h1><span class="val">${r.conclusive ? r.alignment + ' %' : '–'}</span></div>
    ${p.about ? `<p class="who">${esc(tx(p, 'about'))}</p>` : ''}
    <div class="links">
      ${p.site ? `<a href="${esc(p.site)}" rel="noopener noreferrer" target="_blank">${t('Su web')}</a>` : ''}
      ${pr.url ? `<a href="${esc(pr.url)}" rel="noopener noreferrer" target="_blank">${esc(SRC[pr.type] || t('Fuente'))}${pr.year ? ' ' + pr.year : ''}</a>` : `<span class="muted">${pr.title ? esc(pr.title) + (pr.year ? ' (' + pr.year + ')' : '') : t('Sin programa todavía')}</span>`}
      <span class="muted">${r.compared} de ${r.answered}${t(' comparadas')}</span>
    </div>
    <div class="grow scroll">
    ${r.enough ? '' : `<div class="item"><p><b>${t('Aún no sabemos lo suficiente de este partido.')}</b></p><p>${t('Solo hemos encontrado ')}${Object.keys(cells).length}${t(' posiciones')} de ${Q.questions.length}${t('. Por eso su porcentaje es poco fiable.')}</p>${p.priorities ? `<p>${t('Sus prioridades, en su web: ')}${p.priorities.map(([t, u]) => `<a href="${esc(u)}" rel="noopener noreferrer" target="_blank">${esc(t)}</a>`).join(' · ')}</p>` : ''}</div>`}
    ${qs.map((q) => { const c = cells[q.id] || {}; const s = c.stance || 'insufficient_evidence'; const h = (HI[p.stancesFrom || p.id] || {})[q.id]; return `
      <div class="item"><p><b>${esc(tx(q, 'text'))}</b></p>
      <p>${verdict(agr[q.id])}${(st.stars || {})[q.id] ? `<span class="tag star">★ ${t('Vale el doble')}</span>` : ''}</p>
      <p class="pair">${t('Tú: ')}<b>${LABELS[st.answers[q.id]]}</b>${t(' · Partido: ')}<b>${STANCE[s]}</b></p>
      ${c.summary ? `<p>${esc(c.summary)}</p>` : ''}${c.quote ? `<p>«${esc(c.quote)}»</p>` : ''}
      ${c.src ? `<p class="muted">${c.research_level === 7 ? t('De un socio o antecesor del partido: ') : c.approx ? t('Parecido, no exacto: ') : ''}${srcLink(c)}</p>` : h ? `<p class="muted">${t('Lo más cercano que hemos encontrado: ')}${esc(h.summary)} ${srcLink(h)}</p>` : s === 'insufficient_evidence' ? `<p class="muted">${t('No hemos encontrado nada. No cuenta.')}</p>` : ''}</div>`; }).join('') || `<p class="muted">${t('Aún no has respondido nada.')}</p>`}
    </div>`;
}

// One plain verdict per statement, so nobody has to compare two labels in their head.
function verdict(a) {
  const [cls, txt] = a === undefined ? ['none', t('No lo sabemos')] : a >= 1 ? ['yes', t('✓ Pensáis igual')] : a >= 0.75 ? ['yes', t('✓ Casi igual')] : a >= 0.5 ? ['mid', t('≈ A medias')] : a > 0 ? ['no', t('✗ Casi al revés')] : ['no', t('✗ Al revés')];
  return `<span class="verdict ${cls}">${txt}</span>`;
}

function srcLink(c) {
  const d = SO[c.src] || {}, where = c.page === 'web' ? '' : `${t(', pág. ')}${esc(c.page)}`;
  const label = `${d.level === 4 ? t('Lo dijo ') : d.level === 5 ? t('Votó: ') : ''}${esc(d.title || t('Fuente'))}${d.level === 2 ? t(' (programa anterior)') : ''}${where}`;
  return d.url ? `<a href="${esc(d.url)}" rel="noopener noreferrer" target="_blank">${label}</a>` : label;
}

function about() {
  const KIND = (c) => { const d = SO[c.src] || {}; return c.research_level === 7 ? t('de un socio o antecesor') : c.approx || d.level === 6 ? t('parecidas') : { 1: t('de su programa 29N'), 2: t('de un programa anterior'), 3: t('de su web'), 4: t('dichas en público'), 5: t('votadas') }[d.level] || t('otras'); };
  const rows = P.parties.map((p) => { const cells = Object.entries(stancesOf(p)).filter(([q]) => Q.questions.some((x) => x.id === q)).map(([, c]) => c), by = {};
    cells.forEach((c) => { const k = KIND(c); by[k] = (by[k] || 0) + 1; });
    return `<div class="item"><b>${esc(p.name)}</b> · ${cells.length} de ${Q.questions.length}${t(' posiciones')}<br><span class="muted">${Object.entries(by).sort((x, y) => y[1] - x[1]).map(([k, n]) => `${n} ${k}`).join(' · ')}${p.stancesFrom ? t(' (las del PP)') : ''}</span></div>`; }).join('');
  return `
    <button type="button" class="link" data-act="closeabout">← ${t('Volver')}</button>
    <h1 tabindex="-1">${t('Cómo funciona')}</h1>
    <div class="grow scroll about">
      <h2>${t('Para qué sirve')}</h2>
      <p>${t('Para ayudarte a ver qué partido piensa más como tú en estas elecciones.')}</p>
      <h2>${t('Cómo funciona')}</h2>
      <p><b>1.</b>${t(' Tú respondes a ')}${Q.questions.length}${t(' frases.')}</p>
      <p><b>2.</b>${t(' Antes, con ayuda de inteligencia artificial, hemos buscado qué piensa cada partido sobre cada frase: en su programa, en lo que ha votado y en lo que han dicho sus líderes.')}</p>
      <p><b>3.</b>${t(' Comparamos tus respuestas con las de cada partido y te decimos cuánto os parecéis. Si marcas una frase con ★, vale el doble.')}</p>
      <p>${t('Toca cualquier partido y verás, frase a frase, qué piensa y de dónde lo hemos sacado, con su enlace.')}</p>
      <h2>${t('Lo que no es')}</h2>
      <p>${t('No quiere cambiar lo que piensas. No te dice a quién votar. Solo te ayuda a orientarte.')}</p>
      <p>${t('Tus respuestas no salen de tu móvil. Solo guardamos lo que nos escribas en el formulario de abajo.')}</p>
      <h2>${t('Puede haber errores')}</h2>
      <p>${t('Una IA buscó las fuentes y una persona no lo ha revisado todo. Hemos usado las mejores que encontramos.')}</p>
      <p>${t('Si no hay una fuente exacta, usamos la más cercana y lo decimos: «Parecido, no exacto» o «De un socio o antecesor del partido».')}</p>
      <h2>${t('Quién lo hace')}</h2>
      <p>${t('Lo hicimos en ')}<a href="https://bracai.eu" rel="noopener noreferrer" target="_blank">BRACAI</a>${t(' para Núria, que quería saber a quién votar. Es gratis y no hay ningún partido detrás.')}</p>
      <p>${t('Todo es abierto: ')}<a href="${REPO}" rel="noopener noreferrer" target="_blank">${t('el código, los datos y el método')}</a>.</p>
      <h2>${t('¿Ves algo mal?')}</h2>
      <p>${t('Si no estás de acuerdo con algo, o crees que una fuente está mal o es antigua, dínoslo. Tu opinión es muy bienvenida.')}</p>
      <form id="fb" novalidate>
        <div class="stars" role="group" aria-label="${t('Nota de 1 a 5')}">${[1, 2, 3, 4, 5].map((n) => `<button type="button" data-star="${n}" aria-pressed="false">${n}</button>`).join('')}</div>
        <textarea id="fbm" rows="3" maxlength="1000" aria-label="${t('Tu opinión')}" placeholder="${t('¿Qué partido, qué frase y qué cambiarías?')}"></textarea>
        <div class="btns"><button type="submit" class="cta">${t('Enviar')}</button></div>
        <p class="muted" id="fbs" role="status"></p>
      </form>
      <details class="more"><summary>${t('Fuentes de cada partido')}</summary>
        <p class="muted">${esc(tx(P, 'inclusion_rule'))}${t(' Según donde votes ves solo los que puedes votar.')}</p>
        <p class="muted">${t('Aquí ves cuántas posiciones tenemos de cada partido y de dónde salen. El enlace de cada una está en la página del partido, tras responder.')}</p>
        ${rows}
      </details>
    </div>`;
}

function how() {
  return `
    <button type="button" class="link" data-act="towhere">← ${t('Atrás')}</button>
    <h1 tabindex="-1">${t('Así funciona')}</h1>
    <ol class="steps grow">
      <li><b>1</b><div><p>${t('Lee ')}${Q.questions.length}${t(' frases y di qué piensas.')}</p>
        <div class="mini" aria-hidden="true"><span class="pill on">${t('A favor')}</span><span class="pill">${t('En contra')}</span></div></div></li>
      <li><b>2</b><div><p>${t('¿Una te importa mucho? Márcala y <strong>vale el doble</strong>. Pruébalo:')}</p>
        <div class="mini"><button type="button" class="starbtn" data-act="demostar" aria-pressed="false"><span aria-hidden="true">★</span> <span class="lbl">${t('Muy importante')}</span></button><span class="x2" aria-hidden="true">×2</span></div></div></li>
      <li><b>3</b><div><p>${t('Mira qué partido piensa más como tú.')}</p>
        <div class="mini bars" aria-hidden="true"><i class="b1"></i><i class="b2"></i><i class="b3"></i></div></div></li>
    </ol>
    <div class="btns"><button type="button" class="cta" data-act="go">${t('Empezar')}</button></div>
    <p class="note">${t('5 minutos · anónimo · ves el resultado cada 5 frases')}</p>`;
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
  const data = { title: 'Guía de voto 29N', text: `${t('¿Qué partido piensa como tú? ')}${Q.questions.length}${t(' preguntas, 5 minutos.')}`, url: location.origin + location.pathname + (LANG === 'ca' ? '?lang=ca' : '') };
  try { if (navigator.share) await navigator.share(data); else { await navigator.clipboard.writeText(data.url); app.querySelector('[data-act=share]').textContent = t('Enlace copiado'); } } catch { /* cancelled */ }
}

document.documentElement.lang = LANG;
document.querySelector('[data-act=lang]').textContent = LANG === 'ca' ? 'ES' : 'CA';
document.querySelector('[data-act=lang]').setAttribute('aria-label', LANG === 'ca' ? 'Ver en castellano' : 'Veure en català');
if (LANG === 'ca') { document.title = 'Guia de vot 29N'; document.querySelector('[data-act=about]').textContent = t('Cómo funciona'); document.querySelector('.brand').firstChild.textContent = 'Guia de vot '; }
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
      b.setAttribute('aria-pressed', String(!!st.stars[q.id])); b.querySelector('.lbl').textContent = st.stars[q.id] ? t('Vale el doble') : t('Muy importante'); return save(); }
    case 'demostar': { const on = b.getAttribute('aria-pressed') !== 'true'; b.setAttribute('aria-pressed', String(on)); b.querySelector('.lbl').textContent = on ? t('Vale el doble') : t('Muy importante'); b.parentElement.classList.toggle('on', on); return; }
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
    case 'lang': try { localStorage.setItem('guia29n-lang', LANG === 'ca' ? 'es' : 'ca'); } catch { /* storage unavailable */ } return location.replace(location.pathname);
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
  if (!rating && !message) { status.textContent = t('Pon una nota o escribe algo.'); return; }
  status.textContent = t('Enviando…');
  try {
    const r = await fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ 'form-name': 'feedback', rating, message }).toString() });
    if (!r.ok) throw new Error(String(r.status));
    f.innerHTML = `<p><b>${t('¡Gracias!')}</b></p>`;
  } catch { status.textContent = t('No se ha podido enviar. Prueba más tarde.'); }
});

Promise.all([load('data/questions.json'), load('data/parties.json'), load('data/stances.json'), load('data/sources.json'), load('data/map.json')])
  .then(([q, p, s, so, m]) => {
    Q = q; P = p; S = s.stances; HI = s.hints || {}; SV = s.version; SO = so; M = m;
    restore();
    if (!SCREENS[st.screen] || st.idx > q.questions.length || (st.screen === 'question' && st.idx >= q.questions.length)) st = { ...FRESH };
    render();
  })
  .catch(() => { app.innerHTML = `<p>${t('No se han podido cargar los datos. Recarga la página.')}</p>`; });
