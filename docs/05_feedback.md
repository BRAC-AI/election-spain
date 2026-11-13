# Test round 1: two typical voters

Date: 13 November 2026. Build v0.8. Phone 390 x 664, province Madrid. Run with `python3 tools/personas.py`.
Automated checks first: 16 scoring tests pass. The full journey passes at 390 x 664, 360 x 600 and 1440 x 900 with no page scroll and no console errors.

## What happened

| Voter | After 5 | After 10 | After 15 | After 20 |
|---|---|---|---|---|
| Carlos, 54, self-employed, votes PP | PP 69 % | PP 75 % | PP 78 % | PP 75 % |
| Marta, 46, nurse, votes PSOE | nothing | PP 33 % | PP 31 % | PP 44 % |

Every other party in Madrid (PSOE, Vox, Frente Amplio, Podemos, SALF, Democracia 21) showed "–" for both, because their programmes are not coded.

## Verdict

It works for Carlos by luck: his party is the one we have read. It fails Marta. She is told "Más cerca de ti: PP" with a big ring, when the truth is "PP is the only party we can compare". Do not share the link until the first two fixes are in.

## Must fix before anyone outside tests it

1. **A winner with no rivals is not a winner.** The dark card crowns the top party even when it is the only one with data. Rule to add: show the winner card only when at least half of the voter's parties have a score. Otherwise say "Solo podemos comparar con 1 de 7 partidos".
2. **Code the missing programmes.** PSOE, Vox, Frente Amplio, Podemos, SALF, Democracia 21, Junts, PNV, EH Bildu, BNG, CC. Without PSOE and Vox the tool is not usable in any province.
3. **The bar says "Muy fiable" when 6 of 7 parties are blank.** It counts the voter's answers, not our data. Either rename it ("Tus respuestas: 20/20") or make it drop when parties are missing.

## Should fix

4. **A loyal PP voter tops out at 75 %.** Seven of his 20 answers hit "No lo dice" and four hit "A medias", worth half. A voter will read 75 % as "I only three-quarters agree". Options: show "13 de 20 comparadas" next to the percent, or look for those seven topics on the party's website, as the source rule already allows.
5. **"Partido: No lo dice" reads like a dodge.** On the wealth tax, PP's programme is silent, but everyone knows where PP stands. The voter will think the tool is wrong. Add one line on the party page: "No lo dice en su programa. No cuenta."
6. **Marta saw nothing at all after her first five answers.** Four answered, one skipped, PP had under three comparable. First impression is an empty screen. Once more parties are coded this mostly goes away; check again then.
7. **Wide logos are unreadable at 38 px.** SALF, Democracia 21, Podemos, Frente Amplio and PSOE shrink to a smudge. Crop to the symbol or give the logo a wider box.
8. **"–" is easy to miss.** The legend sits in small grey text at the bottom. Put "sin datos" in the row itself.
9. **Party order among blanks is alphabetical**, so Democracia 21 sits second for everyone in Madrid and Barcelona. Looks like a ranking. Grey those rows out or move them under a "Sin datos todavía" divider.
10. **"A medias" needs the reason on the result screen**, not only inside the party page. Carlos said "muy a favor" of lower income tax and got half marks from PP without knowing why.

## Worked well

- Both finished 20 statements in under three minutes of taps. No dead ends.
- The statements read clearly. Neither persona needed "¿Qué significa?" more than twice.
- The party page with the page number is the strongest part. It is what the other Spanish tools lack in a quiz.
- Nothing scrolls. Back keeps the answer. Reload keeps the session.

## Not tested

- The live Netlify site. The project is not linked to the repository yet.
- Real phones. This was Chrome emulation.
- Real people. These are two scripted personas written by the same AI that built the tool, so treat the verdict as a floor, not a ceiling.
- UPN-PP logo: the file is two logos put together, not an official joint mark (see `img/logos/SOURCES.txt`).

# Test round 2: same two voters, 12 parties coded

Date: 13 November 2026. Build v0.9. 125 of 300 party-statement cells coded from 15 official PDFs and 3 official websites.

| Voter | After 5 | After 20 |
|---|---|---|
| Carlos, votes PP | Vox 90, SALF 81, PP 75, PSOE 50, Podemos 25 | Vox 85, SALF 84, PP 75, PSOE 46, Podemos 27 |
| Marta, votes PSOE | Podemos 88, PSOE 88, Vox 13 | Podemos 68, PSOE 63, PP 43, SALF 36, Vox 25 |

The order of blocs is right for both. The winner inside each bloc is not what the voter expects.

## New findings

11. **Parties with blunt programmes beat parties with careful ones.** PP has 5 "a medias" answers worth half; Vox has none. So a PP voter scores higher with Vox. This is the scoring, not the data. Options: score "a medias" by how close the voter is to the middle (a mild "a favor" matches a hedged party better than "muy a favor"), or show it as its own colour and leave it out of the percent.
12. **Carlos's answers were written by me as "typical PP".** Several are harder than PP's own programme (against regularisation, for national priority). Real PP voters need to test this before we change the formula.
13. **Podemos is scored on a 2019 programme.** It tops Marta's list on seven-year-old text. Needs a visible "programa de 2019" tag in the result row, not only inside the party page.
14. **Coverage is uneven: 15 statements for PP and Vox, 2 for Coalición Canaria, 4 for PNV.** Short regional programmes say little about national topics. With under 3 comparable answers the party shows "–". That is honest but will look broken in Canarias and Euskadi.
15. **Frente Amplio, Democracia 21 and Compromís-Front Valencià have 1 or 2 coded statements.** Their websites carry few concrete positions. They show "–" for everyone.
16. **PNV 2023 PDF extracts badly** (keyword search finds almost nothing in 52 pages). Needs OCR or a manual read.

Fixes 1, 3, 8, 9 and 10 from round 1 are still open. Fix 2 is mostly done. Fix 5 is done (the party page now says "No está en lo que hemos leído. No cuenta.").


# Round 3: fixes applied (v0.11, 13 Nov)

| # | Finding | Status |
|---|---|---|
| 1 | Winner with no rivals | Fixed. No winner card unless half of the voter's parties have a percent |
| 2 | Missing programmes | Mostly done. 126 of 300 positions coded |
| 3 | Bar says "Muy fiable" with blank parties | Open. Less visible now that most parties have data |
| 4 | Loyal PP voter tops out at 75 | Improved to 82 by the new "a medias" rule |
| 5 | "No lo dice" reads like a dodge | Fixed. The party page says it does not count |
| 7 | Wide logos unreadable | Open. Needs cropped logo files |
| 8, 9 | Blank rows look ranked | Fixed. They sit greyed under "Sin datos suficientes" |
| 10 | "A medias" not explained on the result | Open |
| 11 | Blunt programmes beat careful ones | Reduced. "A medias" now gives 75 to a mild answer and 50 to a strong one |
| 13 | Podemos scored on 2019 text | Fixed. Year tag next to the name |
| 14, 15, 16 | Thin coverage for regional and new parties, PNV 2023 PDF | Open. Needs published programmes or a manual read |

Same two voters after the fixes:

| Voter | After 20 |
|---|---|
| Carlos, votes PP | SALF 91, Vox 85, PP 82, PSOE 54, Podemos 32 |
| Marta, votes PSOE | Podemos 73, PSOE 73 (tie), PP 46, SALF 36, Vox 25 |

PP is still third for the scripted PP voter. His answers are harder than PP's programme on immigration and benefits, so this may be the persona and not the tool. It needs real PP voters before any further change to the formula.
