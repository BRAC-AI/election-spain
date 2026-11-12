# Spec v3: scrutiny of the handoff and what changed

Date: 12 November 2026. Replaces the ChatGPT handoff v2. Status: draft for Finn's approval.

## 1. Ground truth, checked today

| Claim in handoff | Result | Source |
|---|---|---|
| Election on 29 Nov 2026 | Confirmed | BOE-A-2026-20742, Real Decreto 806/2026 |
| Campaign dates | 13 to 27 Nov. Reflection day 28 Nov | Same decree, art. 4 |
| Candidacies proclaimed | 2 Nov, in BOE of 3 Nov (not opened yet) | Third-party trackers |
| "PP has a 2026 programme" | Likely true: published 10 Nov, 82 pages | Politicheck. PDF not opened yet |
| Other 2026 programmes | Reported: ERC (5 Nov), BNG (3 Nov), PNV (about 9 Nov). PSOE, Frente Amplio, Podemos, Junts, Bildu, CC: not published. Vox: sources disagree | DatosClaros, Politicheck, 29nov.es |
| CIS and Eurobarometer figures | Not rechecked. Not used anywhere in the build | n/a |

Sumar no longer runs under that name. Its successor is the coalition Frente Amplio. Podemos runs alone in most provinces.

## 2. The five problems that matter

1. **The clock.** 17 days to the vote. The handoff plans like there are months. Every gate that needs a second human must fit in days or be cut.
2. **The evidence rule cannot be met today.** The spec says "official programme for this election". PSOE and Frente Amplio have none yet. Podemos has no comparable older one either. A guide that scores PP on 2026 text and PSOE on 2023 text is lopsided. Rule added: show the programme year on every row, and re-code a party within 48 hours of a new programme.
3. **The field is crowded.** At least six Spanish tools already do this for the 29N (Afinidad Política, aquepartidovoto, DatosClaros, Politicheck, 29nov.es, VotoClaro). The handoff never asks why a seventh. Proposed answer: the only one that refuses to guess, shows coverage next to every score, and is open source. If that is not enough, stop here.
4. **"Result after five questions" fights "no false precision".** With a 5-comparison minimum, one skip or one gap makes the first result "not conclusive". Tested and confirmed. Options: accept it (current build), or show question-by-question matches after five and a percentage only from ten.
5. **Who codes the positions.** The handoff bans model guesses and demands two reviewers. Reality: one AI reader and one human approver. That is weaker. The build enforces the minimum: a test fails if any real-party cell lacks a named reviewer, a date and a page.

## 3. Smaller fixes

- Section 18 appeared twice in the handoff. Merged.
- 12 bubbles with constant floating motion on a 390 px screen was too much. Now 10 bubbles, 4 px drift, off under reduced motion.
- "Topic choice only reorders" hides a bias: people who stop early are scored on different questions. Now disclosed on the result screen ("topics seen / not seen").
- EU and foreign policy had no bubble. Now under "Defensa y exterior". Every category maps to exactly one bubble (tested).
- Watercolour illustrations: cut from v1. They cost days and add neutrality risk.
- Province was missing from the journey. Now an optional select on screen 1.
- Legal: answers are political opinions, a special category under GDPR art. 9. v1 stores nothing on a server, uses no analytics and no cookies. Answers live in the tab's session storage only. Still needs a human legal look before public launch.
- Electoral law: publishing polls is banned 24 to 28 Nov (LOREG art. 69.7). This tool is not a poll, but it must never publish aggregate user results. It cannot: it collects none.
- Licence and project name: still open. Not decided here.

## 4. Scope of v1 (lean launch)

- Spanish only. 20 statements in four blocks of five. Same bank for everyone.
- Parties: candidacies with a seat in the dissolved Congress, or their direct successor. 13 entries. SALF, Adelante Andalucía, UPC and Aliança Catalana fall outside the rule. That is a judgment call Finn should confirm, because SALF runs almost everywhere.
- Province filter from third-party data. Must be checked against the BOE of 3 Nov.

## 5. Scoring (proposed, tested, not yet approved)

- Answers: strongly agree +2, agree +1, disagree -1, strongly disagree -2. Skip is not stored.
- Party stance: support +2, oppose -2. Agreement on a question = 1 - |answer - stance| / 4. So 1.0, 0.75, 0.25 or 0.
- Conditional or mixed stance = 0.5 flat.
- No stance in the programme = left out. Never zero, never midpoint.
- Alignment = mean agreement over compared questions, as a whole percent.
- Coverage = compared / answered. Shown on every row.
- A percentage needs at least 5 compared questions and 60 % coverage. Otherwise "No concluyente".
- Parties within 3 points share a rank and get an "empate" tag. Ties sort by name.
- No weights. Topic choice changes order only.

## 6. Question bank v0.1 (draft)

See `data/questions.json`. Design rules: one decision per statement, no causal claims, no "because". Direction is mixed on purpose so that agreeing with everything favours nobody: 8 of 20 statements are ones the right has tended to propose, 10 the left or the regional parties, 2 cut across. That count is my judgment and needs review.

Known weak spots: Q02 and Q14 use hard words ("prohibirse", "prioridad"). Q11 and Q18 matter far more in some regions. No statement yet on pensions, climate targets, justice, rural policy or transport.

## 7. Open decisions for Finn

1. Is "refuses to guess, shows coverage, open source" enough reason to launch a seventh tool?
2. Include SALF despite the seat rule?
3. Frente Amplio: is the Sumar 2023 programme a fair fallback?
4. UPN-PP in Navarra: PP programme, UPN programme, or both?
5. First result after five: keep "not conclusive" or switch to question-by-question?
6. Licence, name, domain.
