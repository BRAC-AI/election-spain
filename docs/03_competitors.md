# What exists and where the gap is

Checked 12 November 2026 from each site's public pages. I did not complete each quiz, so answer scales and result screens are partly unseen.

| Tool | Type | What it does well | What a voter misses |
|---|---|---|---|
| Afinidad Política | Quiz, 59 statements (about 10 min; a quick version at 7) | 15 parties, four languages, sources per position, topic weighting | Long. No province filter. Uses votes and statements too, some positions "estimated". Stores answers 12 months. Ads on site |
| aquepartidovoto.es | Quiz, 30 or 60 statements | Province filter, in-browser, sources linked | Busy home page with games and several entry points. Name promises an answer |
| DatosClaros | Comparator plus vote table | Shows the source type of every claim | Reading, not a quiz. Mixes press and statements |
| Politicheck | Comparator, 9 topics | Literal quotes with page numbers | Reading, not a quiz. Nine parties |
| 29nov.es | Comparator, 21 topics | 2,204 proposals with quote and page | No quiz, no province filter, heavy |
| VotoClaro | Comparator plus AI chat | Links open the PDF page highlighted. Province ballot | No quiz. Chat is partly paid |
| tupapeleta.es, papeletaclara.es | Quizzes and party pages | Evidence level per stance | Found late, not examined |

## The gap

Nobody is short, pretty and honest at the same time. The quizzes are long or cluttered. The careful ones are reading tools. None shows how sure the result is while you answer.

So this tool is: one screen to start, 20 taps, a result that sharpens in front of you, and a "why" behind every row. Three minutes on a phone.

## NRK and Altinget (Norway)

NRK's own pages did not come up in search today, so the NRK points are from memory and need a look. The Altinget points are from their method pages.

| Borrow | From | In this build |
|---|---|---|
| Four answers, hidden middle, skip allowed | Altinget (stated), NRK (memory) | Yes |
| Short neutral explainer on every statement | NRK (memory) | Yes, "¿Qué significa?" |
| Published, simple distance formula | NRK publishes its algorithm as an npm package | Yes, `scoring.js` and tests |
| Parties in parliament only, rule stated up front | Altinget | Yes, plus a 3 % poll rule |
| "This is a guide, not an answer key" | Altinget | Yes, on results and footer |
| Statements dropped if they do not split parties | Altinget | To do once all parties are coded |
| Mark statements as extra important | Altinget | No. Adds a step and a weighting debate |
| Party's own short reason per statement | NRK (memory) | No. Needs party cooperation. We show a summary and the page instead |

## From the Berlin planner

Kept: one decision per screen, big touch targets, quiet separators, compact cards, short motion with a reduced-motion fallback, tested at 390 x 844 with no sideways scroll, room for illustration without adding height. Dropped: the dark club palette. Colours here are BRACAI white, deep blue gray, teal and soft blue gray.
