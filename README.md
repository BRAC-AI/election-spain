# Guía de voto 29N

Answer 30 statements and see which party thinks most like you, with a source for every party position. For the Spanish general election of 29 November 2026.

**Live:** https://guia-voto-29n.netlify.app

Made by [BRACAI](https://bracai.eu) for Núria, who wanted to know who to vote for. It is free and no party is behind it.

AI found the party positions and a person has not reviewed them all, so it can contain errors. To correct one, open an issue with the party, the statement and a link.

## Files

| Path | What it is |
|---|---|
| `index.html`, `styles.css`, `app.js` | The app. Static files, no build step |
| `scoring.js` | How the percent is calculated |
| `data/` | Statements, parties, positions, sources, ballots and the map |
| `docs/METHODOLOGY.md` | The method |
| `tests/`, `tools/` | Tests and the map builder |

## Run it

```
python3 -m http.server 8080   # open http://localhost:8080
npm test
```

## Credit

Code: MIT. Data and texts: CC BY 4.0. Party logos belong to the parties. See [LICENSE](LICENSE).

> Guía de voto 29N. BRACAI, 2026. https://github.com/BRAC-AI/election-spain
