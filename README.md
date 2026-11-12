# Guía de voto 29N

Independent, open-source voter guide for the Spanish general election of 29 November 2026. Built by BRACAI. No party affiliation. It does not tell anyone how to vote.

**Status: beta. Two programmes are coded so far (PP, ERC), both unreviewed.**

## What is here

- `index.html`, `styles.css`, `app.js`: static app. No build step, no tracking, no AI at runtime.
- `scoring.js`: deterministic scoring. `npm test` runs 15 tests.
- `data/questions.json`: 20 statements with plain explainers.
- `data/parties.json`: 13 candidacies, province scope, source per party.
- `data/stances.json`: party positions with page, summary, coder and review status.
- `data/evidence.xlsx` and `data/evidence.csv`: the same positions as a review sheet. Built by `tools/build_evidence.py`.
- `tools/e2e.py`: a full voter journey at three screen sizes, with no-scroll checks.
- `img/logos/`: drop official party logos here and set `logo` in `data/parties.json`. Until then the app shows initials.
- `docs/`: spec, plan, competitor review, image brief.

Run: `npm start`, open http://localhost:8080.

## Licence

Code: MIT. Data and texts: CC BY 4.0. Credit "Guía de voto 29N, BRACAI (bracai.eu)" and link this repository. See `LICENSE`.

## Found an error?

Open an issue with the party, the statement and the page of the programme.
