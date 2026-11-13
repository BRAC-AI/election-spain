# Guía de voto 29N

A simple voting guide for the Spanish general election of 29 November 2026. You answer 30 statements and see which party thinks most like you, with a source for every party position.

**Live:** https://guia-voto-29n.netlify.app

## Who made it

[BRACAI](https://bracai.eu), an AI consultancy in Barcelona. It is a personal, pro bono project by BRACAI's founder, made for his partner Núria, who wanted help finding her way in this election. It has no commercial aim and works for no party.

## How it works

1. The voter answers 30 statements.
2. We used AI to find what each party thinks about each one: programmes, votes and public statements. Every position has a link.
3. The tool compares both and shows a match in percent.

The full method, in plain words: [docs/METHODOLOGY.md](docs/METHODOLOGY.md). Rule changes: [docs/CHANGELOG.md](docs/CHANGELOG.md).

It can contain errors. The positions were coded by AI and not all were reviewed by a person. Corrections are welcome: open an issue with the party, the statement and a link.

## What is in this repository

| Path | What it is |
|---|---|
| `index.html`, `styles.css`, `app.js` | The app. Static files, no build step, no tracking |
| `scoring.js` | How the percent is calculated |
| `data/questions.json` | The 30 statements |
| `data/parties.json` | Parties and where each one runs |
| `data/stances.json` | Each party's position on each statement |
| `data/sources.json` | The source behind every position |
| `data/ballots_boe.csv` | Official candidacies by province (BOE) |
| `data/questions_candidates.json`, `data/stances_candidates.json` | 15 reserve statements and their positions |
| `data/map.json` | Map of Spain used to choose where you vote |
| `tests/` | Tests for the scoring and the data |
| `tools/` | Browser tests and the map builder |

## Run it

```
python3 -m http.server 8080      # then open http://localhost:8080
npm test                         # scoring and data tests
python3 tools/e2e.py             # full journey in a browser, needs Playwright and a local server
```

## Use and credit

Code: MIT. Data and texts: CC BY 4.0. Party logos belong to the parties. Map shapes: es-atlas (MIT), from Instituto Geográfico Nacional data. See [LICENSE](LICENSE).

If you use it, please credit:

> Guía de voto 29N. BRACAI, 2026. https://github.com/BRAC-AI/election-spain
