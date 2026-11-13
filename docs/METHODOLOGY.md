# Method

This is the method the tool uses today. Earlier rules are in [CHANGELOG.md](CHANGELOG.md).

## 1. What it is

A voter answers 30 statements. The tool compares the answers with what each party thinks and shows a match in percent. It is for the Spanish general election of 29 November 2026.

It does not tell anyone how to vote. It does not try to change anyone's view. It stores nothing: no account, no cookies, no tracking.

## 2. Parties

- Every party that had seats in the Congress dissolved in October 2026.
- Two new parties chosen by us: SALF and Democracia 21. Both are new and in the news; adding only one would look biased.
- UPN-PP (Navarra) uses PP's positions.

A voter only sees the parties on the ballot where they vote. The province lists come from the official list of proclaimed candidacies (BOE-A-2026-23103, 3 November 2026), in `data/ballots_boe.csv`. An AI extracted it. The correction of 7 November is not included.

## 3. Statements

30 statements in `data/questions.json`. Each one:

- is one idea, in words a 12-year-old understands;
- splits the parties (if all agree, it is useless);
- can be answered for or against.

15 more are kept in reserve in `data/questions_candidates.json`, with their positions in `data/stances_candidates.json`.

## 4. Where a party's position comes from

Every position has a link. The app shows which kind of evidence it is.

| Evidence | Shown in the app as | Counts | Positions today |
|---|---|---|---|
| The party's programme for 29 November 2026 | Programme and page | Yes | 68 |
| The party's own earlier programme | "(programa anterior)" | Yes | 58 |
| The party's official website or documents | Link | Yes | 10 |
| A vote in Congress, the Senate, a regional parliament or the European Parliament | "Votó: ..." | Yes. An abstention is "a medias" | 160 |
| A direct quote from the candidate, leader or a named spokesperson, including video | "Lo dijo ..." | Yes | 40 |
| Close but not exact: a nearby measure with a clear direction, or a serious outlet describing the position | "Parecido, no exacto" | Yes | 34 |
| The record of a member or predecessor of a new coalition (Sumar, IU, Comuns for Frente Amplio) | "De un socio o antecesor del partido" | Yes | 16 |
| The record of a different party (Ciudadanos for Democracia 21) | "Pista" | No | |
| Evidence about a different measure that only allows "a medias" | "Pista" | No | |
| Nothing found | "No hemos encontrado nada" | No | |

Never used: other voting-advice sites, a rival's opinion, or guessing from ideology.

386 of 420 party-statement pairs have a position that counts.

## 5. Who did the work

- Claude (Anthropic) read the programme PDFs and coded positions, 12 and 13 November 2026.
- ChatGPT and Gemini deep research searched votes, quotes and other evidence on 13 November 2026.
- No person has reviewed every position. Links the research tools could not open are shown as "Pista" and do not count.

Each position in `data/stances.json` records who coded it and from which source (`data/sources.json`).

## 6. How the percent is calculated

Code: `scoring.js`. It is plain arithmetic, the same for everyone.

- Answers: muy a favor (+2), a favor (+1), en contra (-1), muy en contra (-2). "No lo sé" is skipped.
- Party positions: a favor (+2), a medias (0), en contra (-2).
- Agreement on one statement = 1 minus the distance divided by 4. Same side and same strength is 100 %. Opposite ends is 0 %.
- The percent is the average over the statements where both the voter and the party have a position.
- A statement marked with the star counts double.
- A statement where the party has no position is left out. It never counts as disagreement.
- Choosing topics at the start only changes the order of the statements. It does not change their weight.
- Statements that most parties have a position on are asked first.

## 7. When a result is shown

- A party gets a percent from 2 comparable answers.
- With fewer than 4 comparable answers, or when fewer than 8 of the party's 30 positions are known, the party is listed apart under "Con pocos datos" with how many answers were compared. It cannot be the winner. Today this applies to Democracia 21 (5 positions).
- Parties within 3 points of each other are shown as a tie.
- Until the voter has gone through all 30 statements the winner card says "Resultado provisional".

## 8. Known limits

- AI-coded, not fully human-reviewed.
- Votes are read from one research run. The vote records were not opened one by one by us.
- Some parties are judged partly on older material because their 29N programme was not available or did not cover a topic.
- Frente Amplio is a new coalition: 16 of its 30 positions come from Sumar's record.
- 30 statements cannot cover everything a party stands for.

## 9. How to correct something

Use the form on the "Cómo funciona" page, or open an issue or pull request. Say which party, which statement, and give a link to the source.
