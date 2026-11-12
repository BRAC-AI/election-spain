// Deterministic scoring. No network, no AI, no randomness. See docs/01_spec_v3.md §5.
export const ANSWERS = { sa: 2, a: 1, d: -1, sd: -2 }; // skip = not stored
export const CONFIG = { minCompared: 5, minCoverage: 0.6, tieBand: 3 };

// Agreement on one question, 0..1, or null when it cannot be compared.
export function agreement(answer, stance) {
  if (!(answer in ANSWERS)) return null;
  if (stance === 'conditional') return 0.5;
  if (stance !== 'support' && stance !== 'oppose') return null; // missing is never zero
  const p = stance === 'support' ? 2 : -2;
  return 1 - Math.abs(ANSWERS[answer] - p) / 4;
}

export function scoreParty(answers, partyStances = {}, cfg = CONFIG) {
  const answeredIds = Object.keys(answers).filter((q) => answers[q] in ANSWERS).sort();
  const perQuestion = [];
  let sum = 0;
  for (const q of answeredIds) {
    const stance = partyStances[q]?.stance ?? 'insufficient_evidence';
    const a = agreement(answers[q], stance);
    if (a !== null) { sum += a; perQuestion.push({ q, stance, agreement: a }); }
  }
  const answered = answeredIds.length;
  const compared = perQuestion.length;
  const coverage = answered ? compared / answered : 0;
  const conclusive = compared >= cfg.minCompared && coverage >= cfg.minCoverage;
  return {
    answered, compared, coverage, conclusive, perQuestion,
    alignment: conclusive ? Math.round((sum / compared) * 100) : null,
  };
}

// Conclusive parties first by alignment, ties broken by name. Parties within
// tieBand points of the group leader share a rank ("empate").
export function rankResults(rows, cfg = CONFIG) {
  const byName = (a, b) => a.name.localeCompare(b.name, 'es');
  const yes = rows.filter((r) => r.conclusive).sort((a, b) => b.alignment - a.alignment || byName(a, b));
  const no = rows.filter((r) => !r.conclusive).sort(byName);
  let rank = 0, lead = null;
  for (const r of yes) {
    if (lead === null || lead - r.alignment > cfg.tieBand) { rank += 1; lead = r.alignment; }
    r.rank = rank;
  }
  for (const r of yes) r.tied = yes.filter((x) => x.rank === r.rank).length > 1;
  return [...yes, ...no.map((r) => ({ ...r, rank: null, tied: false }))];
}

// Topic choice changes ORDER only. Same bank for everyone.
export function orderQuestions(questions, priorityCategories = []) {
  const pri = new Set(priorityCategories);
  return [...questions.filter((q) => pri.has(q.category)), ...questions.filter((q) => !pri.has(q.category))];
}

export function eligibleParties(parties, province) {
  if (!province) return parties;
  return parties.filter((p) => (p.scope.only ? p.scope.only.includes(province) : !(p.scope.except || []).includes(province)));
}
