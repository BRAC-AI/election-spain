# Method

**In one sentence:** you answer 30 statements, and the tool shows which party thinks most like you, with a link behind every party position.

## In short

- It is for the Spanish general election of 29 November 2026.
- AI found what each party thinks. A person has not reviewed every position, so it can contain errors.
- It does not tell you how to vote.
- Your answers stay on your device. We only keep what you write in the feedback form.

## Key points

### 1. The percent

Code: `scoring.js`.

- You answer: muy a favor (+2), a favor (+1), en contra (-1), muy en contra (-2). "No lo sé" is skipped.
- A party is: a favor (+2), a medias (0), en contra (-2). An abstention in a vote is "a medias".
- Agreement on one statement = 1 minus the distance divided by 4. Same side and strength gives 100 %. Opposite ends give 0 %.
- The percent is the average over the statements where both you and the party have a position.
- A statement you mark with the star counts double.
- If a party has no position on a statement, that statement is left out. It never counts against the party.
- A party gets a percent once 2 statements can be compared. Parties within 3 points are a tie.
- The result is marked provisional until you have seen all 30 statements.

### 2. Where a position comes from

Every position has a link. 391 of 420 party-statement pairs have one.

| Evidence | Shown as | Positions |
|---|---|---|
| Vote in Congress, the Senate, a regional parliament or the European Parliament | "Votó: ..." | 160 |
| The party's programme for 29 November 2026 | Programme and page | 70 |
| The party's own earlier programme | "(programa anterior)" | 58 |
| Direct quote from its candidate, leader or spokesperson | "Lo dijo ..." | 41 |
| Close but not exact, with a clear direction | "Parecido, no exacto" | 36 |
| Record of a member or predecessor of a new coalition (Sumar, IU, Comuns for Frente Amplio) | "De un socio o antecesor del partido" | 16 |
| The party's website or official documents | Link | 10 |

Not used: another party's record (for example Ciudadanos for Democracia 21), other voting guides, a rival's opinion, or guesses from ideology.

### 3. Who did the work

- Claude (Anthropic) read the programme PDFs, 12 and 13 November 2026.
- ChatGPT and Gemini deep research searched votes and quotes, 13 November 2026.
- Each position in `data/stances.json` says who coded it. Its source is in `data/sources.json`.

### 4. Parties and statements

- Parties: all with seats in the Congress dissolved in October 2026, plus two new ones we chose, SALF and Democracia 21. UPN-PP (Navarra) uses PP's positions.
- You only see the parties on the ballot where you vote. Source: BOE-A-2026-23103 (3 November 2026), in `data/ballots_boe.csv`. The correction of 7 November is not included.
- Statements: one idea each, in words a 12-year-old understands, and chosen because the parties disagree.
- Order: random on every run. The topics you pick come first. Topics change the order, not the weight.

### 5. Limits

- AI-coded and not fully reviewed by a person.
- We did not open the vote records one by one. They come from one research run.
- Frente Amplio is a new coalition: 15 of its 30 positions come from Sumar's record.
- Democracia 21 has 10 positions and SALF has 22. The other parties have 29 or 30.
- Some positions come from older programmes.

### 6. Correct something

Use the form on the "Cómo funciona" page or open an issue. Say which party and statement, and give a link.
