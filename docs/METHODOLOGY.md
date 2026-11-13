# How this guide works

Short version of the whole method. Read this first if you want to improve it.
Last update: 13 November 2026. Everything here is a draft until a person has reviewed the party positions.

## 1. The idea

A voter answers statements. We compare each answer with what the party has written. We show how close they are. We never tell anyone how to vote.

## 2. Which parties

- Every party that had a seat in the Congress dissolved on 5 October 2026.
- Plus two newcomers we chose: SALF and Democracia 21.
- A voter only sees the parties on the ballot in their province.

Why two hand-picked ones: both are new, both are in the news, and adding only one would look biased. This is a judgment call. Say so if you disagree.

## 3. Where a party's position comes from

Use the first level that says something. Write the level on every position.

| Level | Source | Use it when |
|---|---|---|
| 1 | The party's official programme for 29 November 2026 | Always first |
| 2 | The party's own previous general-election programme | Only for what level 1 does not mention |
| 3 | The party's official website or official 2026 documents | Only if the party has no programme of its own |
| 4 | Said in public in 2026 by the candidate, leader or a named spokesperson, as a direct quote with a link | Only for what levels 1 to 3 do not mention |

Level 4 rules: the words must be the party's own (not the journalist's, not a rival's). Keep the quote, who said it, the date and the link. If two quotes clash, use the newest one from the most senior person. The app shows these as "Lo dijo ...", so the voter sees it is weaker than a programme.

Level 4 was added on 13 November 2026 because programmes left too many gaps. The quotes were found by two AI research tools (ChatGPT and Gemini deep research) with the prompt in `docs/research/`. Their raw output is in `docs/research/2026-11-13_citas/`. Where the two tools disagreed, Claude chose and wrote why in the commit.

Never use: other comparison sites, a journalist's summary, or "everyone knows they think this". Since the second research run (13 November 2026, `docs/research/prompt_huecos_v2.md`, raw output in `docs/research/2026-11-13_citas/pruebas_v2.csv`):

| Level | Source | Counts in the score |
|---|---|---|
| 5 | How the party voted in Congress, the Senate or its regional parliament (2023 to 2026), on a text about exactly that | Yes. An abstention is "a medias" |
| 6 | "Pista": the closest evidence found, when nothing is exact (a joint vote, a regional programme, a nearby topic) | No. It is shown on the party page with its link, in `stances.json` under `hints` |

Changed later on 13 November 2026 (BRACAI decision, to fill gaps): approximate evidence with medium confidence now counts. It is marked `approx: true` in `stances.json` and shown as "Parecido, no exacto" with its link. Approximate evidence with low confidence stays a hint and does not count.

Any material published by the party itself is a valid source, including videos. A video is cited with the minute. Transcripts used are in `docs/research/transcripts/`.

All programme PDFs were searched a second time on 13 November for every open pair. That found two missed lines (SALF) and one approximate one (Coalición Canaria).

Which provinces a party runs in comes from the BOE list of proclaimed candidacies (BOE-A-2026-23103, 3 November 2026), in `data/ballots_boe.csv`. An AI extracted it. It matches the app's province lists for all 15 parties. The 7 November correction is not included.

If no source says anything, the position is "no lo dice". It is left out of the score. It is never counted as against or as neutral.

## 4. How to read a source

1. Get the official PDF or page. Save the link.
2. Search the text for each statement's topic. Use several words, in the language of the document.
3. Read the whole passage, not only the matching line.
4. Decide: **a favor**, **en contra**, **a medias** (says yes with conditions, or only part), or **no lo dice**.
5. Write one line in your own words, the page number, and who decided.
6. A second reader checks it against the page and pastes the exact quote. Only then is it "reviewed".

Rules of thumb:
- A goal without a measure ("we will defend families") is "no lo dice".
- Boasting about a law the party passed counts as supporting it.
- A measure for one region only is "a medias" for a statement about all of Spain.
- If two passages disagree, it is "a medias". Note both pages.
- When in doubt, "no lo dice". A blank is better than a guess.

Who read what so far: an AI (Claude) read 15 programme PDFs on 12 and 13 November 2026 with keyword search plus reading the passage. For three parties without a PDF, Finn ran one deep research each on 13 November 2026 (see `docs/research/`). No position has had the second check yet.

## 5. How to choose statements

A good statement:
- Is one decision. No "and".
- Is something a 12-year-old can read. Short words. No jargon.
- Has no reason inside it ("because", "to reduce").
- Does not use one side's slogan.
- Splits the parties. If nearly all agree, drop it.
- Is answered by most parties in their programmes. If most are silent, drop it.

The set as a whole:
- Covers the main topics: housing, taxes, work, pensions and benefits, health, education, energy, immigration, defence, rights, territory, EU and foreign policy.
- Is balanced in direction: about half are things the right tends to propose and half the left or regional parties. Otherwise people who agree with everything lean one way.
- Each statement has a one-line "what does it mean" in neutral words.

Today: 20 statements in the app, 20 more candidates in `data/questions_candidates.json`. The plan is to keep the best 30.

## 6. How the score works

For each statement both the voter and the party have answered:

| Voter vs party | Points |
|---|---|
| Same side, same strength | 100 |
| Same side, voter less sure | 75 |
| Opposite side, voter less sure | 25 |
| Opposite side, voter sure | 0 |
| Party is "a medias", voter mild (a favor / en contra) | 75 |
| Party is "a medias", voter strong (muy a favor / muy en contra) | 50 |

The percent is the average. All statements weigh the same. Picking topics at the start only changes the order.

A party gets a percent only with at least 3 comparable answers that cover at least a quarter of the voter's answers. Otherwise it goes under "Sin datos suficientes".

The winner card shows only when at least half of the voter's parties have a percent. A small year tag next to a party means it is scored on an old programme.

The bar at the top fills as the voter answers: 5, 10, 15, 20. It tells the voter how much to trust the result.

## 7. Known weak points

- Parties with blunt programmes can still score higher than parties that hedge. Since 13 Nov a mild answer matches a hedged party better (75) than a strong one (50), which reduces this but does not remove it.
- Some parties are scored on old text: PSOE, Vox, Junts and EH Bildu on 2023, Podemos on 2019.
- Small and regional parties say little on national topics, so they often show "–".
- Frente Amplio, Democracia 21 and Compromís-Front Valencià have published very little. They have 1 to 3 positions each.
- Page numbers are PDF pages, found by an AI. Check them.

See `docs/05_feedback.md` for the full list from testing.

## 8. How to change something

| To change | Edit | Then |
|---|---|---|
| A statement | `data/questions.json` | Re-check every party's position on it |
| A party position | `data/stances.json` | Add page, summary, source, your name |
| A source document | `data/sources.json` | |
| A party or its provinces | `data/parties.json` | |
| The scoring | `scoring.js` | Run `npm test` |

Then run `python3 tools/build_evidence.py` to rebuild the review sheet, and `python3 tools/e2e.py` and `python3 tools/personas.py` to test the app. Found an error? Open an issue with the party, the statement and the page.

## 9. Privacy and licence

No sign-up, no cookies, no tracking. Answers stay in the browser tab and vanish when it closes.
Code: MIT. Data and texts: CC BY 4.0. Credit "Guía de voto 29N, BRACAI (bracai.eu)".
