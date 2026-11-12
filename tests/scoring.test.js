import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { agreement, scoreParty, rankResults, orderQuestions, eligibleParties } from '../scoring.js';

const J = (f) => JSON.parse(readFileSync(new URL(`../data/${f}`, import.meta.url)));
const Q = J('questions.json'), P = J('parties.json'), S = J('stances.json');
const st = (o) => Object.fromEntries(Object.entries(o).map(([k, v]) => [k, { stance: v }]));
const five = { Q01: 'sa', Q02: 'a', Q03: 'd', Q04: 'sd', Q05: 'a' };

test('agreement table', () => {
  assert.equal(agreement('sa', 'support'), 1);
  assert.equal(agreement('a', 'support'), 0.75);
  assert.equal(agreement('d', 'support'), 0.25);
  assert.equal(agreement('sd', 'support'), 0);
  assert.equal(agreement('sd', 'oppose'), 1);
  assert.equal(agreement('sa', 'conditional'), 0.5);
  assert.equal(agreement('sa', 'insufficient_evidence'), null);
  assert.equal(agreement('skip', 'support'), null);
});
test('normal case: 5 answered, 5 coded, full coverage', () => {
  const r = scoreParty(five, st({ Q01: 'support', Q02: 'support', Q03: 'oppose', Q04: 'oppose', Q05: 'support' }));
  assert.equal(r.coverage, 1); assert.equal(r.conclusive, true); assert.equal(r.alignment, 85);
});
test('sparse evidence 2/5 is inconclusive, never a percentage', () => {
  const r = scoreParty(five, st({ Q01: 'support', Q02: 'support' }));
  assert.equal(r.coverage, 0.4); assert.equal(r.conclusive, false); assert.equal(r.alignment, null);
});
test('all skipped gives no score', () => {
  const r = scoreParty({}, st({ Q01: 'support' }));
  assert.equal(r.answered, 0); assert.equal(r.alignment, null);
});
test('missing stance is not zero: adding insufficient rows leaves the score unchanged', () => {
  const ans = { ...five, Q06: 'sa', Q07: 'sa' };
  const base = st({ Q01: 'support', Q02: 'support', Q03: 'oppose', Q04: 'oppose', Q05: 'support' });
  const a = scoreParty(ans, base), b = scoreParty(ans, { ...base, ...st({ Q06: 'insufficient_evidence' }) });
  assert.equal(a.alignment, b.alignment); assert.equal(a.compared, 5);
});
test('conditional is its own state, worth 0.5', () => {
  const r = scoreParty(five, st({ Q01: 'conditional', Q02: 'conditional', Q03: 'conditional', Q04: 'conditional', Q05: 'conditional' }));
  assert.equal(r.alignment, 50);
});
test('symmetry: flipping every answer mirrors the score', () => {
  const flip = { sa: 'sd', a: 'd', d: 'a', sd: 'sa' };
  const party = st({ Q01: 'support', Q02: 'oppose', Q03: 'oppose', Q04: 'support', Q05: 'support' });
  const a = scoreParty(five, party).alignment;
  const b = scoreParty(Object.fromEntries(Object.entries(five).map(([k, v]) => [k, flip[v]])), party).alignment;
  assert.equal(a + b, 100);
});
test('sensitivity: reversing one of five answers moves the score at most 20 points', () => {
  const party = st({ Q01: 'support', Q02: 'support', Q03: 'oppose', Q04: 'oppose', Q05: 'support' });
  const a = scoreParty(five, party).alignment, b = scoreParty({ ...five, Q01: 'sd' }, party).alignment;
  assert.ok(Math.abs(a - b) <= 20);
});
test('answer order does not change the score', () => {
  const party = st({ Q01: 'support', Q02: 'oppose', Q03: 'oppose', Q04: 'support', Q05: 'support' });
  const rev = Object.fromEntries(Object.entries(five).reverse());
  assert.equal(scoreParty(five, party).alignment, scoreParty(rev, party).alignment);
});
test('topic choice reorders only: same set of questions, housing first', () => {
  const o = orderQuestions(Q.questions, ['territory']);
  assert.equal(o.length, Q.questions.length);
  assert.deepEqual([...o].map((q) => q.id).sort(), Q.questions.map((q) => q.id).sort());
  assert.equal(o[0].category, 'territory');
});
test('ranking: ties within 3 points share a rank, inconclusive go last', () => {
  const r = rankResults([
    { name: 'B', conclusive: true, alignment: 70 }, { name: 'A', conclusive: true, alignment: 72 },
    { name: 'C', conclusive: true, alignment: 60 }, { name: 'D', conclusive: false, alignment: null }]);
  assert.deepEqual(r.map((x) => x.name), ['A', 'B', 'C', 'D']);
  assert.deepEqual(r.map((x) => x.rank), [1, 1, 2, null]);
  assert.equal(r[0].tied, true); assert.equal(r[2].tied, false);
});
test('province filter', () => {
  const ids = (c) => eligibleParties(P.parties, c).map((p) => p.id);
  assert.ok(ids('08').includes('erc') && !ids('08').includes('pnv') && !ids('08').includes('podemos'));
  assert.ok(ids('31').includes('upn-pp') && !ids('31').includes('pp') && ids('31').includes('bildu'));
  assert.ok(!ids('44').includes('fa') && ids('28').includes('fa'));
  assert.equal(eligibleParties(P.parties, '').length, P.parties.length);
});
test('data integrity', () => {
  assert.equal(Q.questions.length, 20);
  assert.equal(new Set(Q.questions.map((q) => q.id)).size, 20);
  for (const q of Q.questions) assert.ok(Q.categories[q.category], q.id);
  const bubbleCats = Q.bubbles.flatMap((b) => b.categories);
  assert.deepEqual([...bubbleCats].sort(), Object.keys(Q.categories).sort()); // every category has exactly one bubble
  assert.equal(Object.keys(P.provinces).length, 52);
  for (const p of P.parties) for (const c of [...(p.scope.only || []), ...(p.scope.except || [])]) assert.ok(P.provinces[c], p.id);
  for (const [pid, cells] of Object.entries(S.stances)) { // no real-party stance without a named human reviewer
    assert.ok(P.parties.some((p) => p.id === pid));
    for (const c of Object.values(cells)) assert.ok(c.reviewer && c.verified_on && c.page, pid);
  }
});
