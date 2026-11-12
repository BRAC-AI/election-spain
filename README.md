# Guía de voto 29N (election-spain)

Independent voter-alignment guide for the Spanish general election of 29 November 2026. Built by BRACAI. Not affiliated with any party.

**Status: unreviewed preview. Party positions are not coded yet. Do not share publicly.**

- `index.html`, `styles.css`, `app.js`: static app, no build step, no tracking, no AI at runtime.
- `scoring.js`: deterministic scoring. `npm test` runs 13 unit and sensitivity tests.
- `data/questions.json`: 20 draft statements, 12 categories, 10 topic bubbles.
- `data/parties.json`: 13 candidacies, province scope, programme registry.
- `data/stances.json`: empty on purpose until a human approves each cell.
- `data/demo.json`: fictional parties. Open `/?demo=1` to try the full journey.
- `docs/`: scrutiny and spec v3, build plan, evidence review sheet.

Run locally: `npm start`, then open http://localhost:8080.
