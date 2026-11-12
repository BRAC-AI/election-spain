# Spec v4

Date: 12 November 2026. Replaces v3. Decisions by Finn on 12 Nov are marked **decided**.

## Goal

A very simple, friendly tool that tells a voter in Spain which parties sit closest to their views. Ship in days. Election: 29 November 2026 (Real Decreto 806/2026, checked in the BOE).

## Decided

- **Sources, in this order:** 29N programme, else the latest general-election programme, else the party's official website. Always say which one and link it.
- **Frente Amplio:** the Sumar 2023 programme is not used. Look for the new programme, else the website.
- **Parties:** seat in the dissolved Congress, or 3 % or more in a national poll average. SALF sits at 2.2 % (Demócrata average, 7 Nov) and stays out. Recheck on 20 Nov.
- **Navarra:** PP does not run alone there. The ballot says UPN-PP. UPN is a Navarrese conservative party that has run with PP on and off for decades. The tool shows "UPN-PP" in Navarra and uses the PP national programme until the joint list publishes its own.
- **Questions:** 20 now, 30 later.
- **Process:** AI codes positions, a second AI pass reviews, then Finn reviews by hand. The tool is built in full before review starts.
- **Confidence:** a four-segment bar that fills as you answer. Precision grows with it (see below).
- **Images:** Finn makes them from `docs/04_image_brief.md`.
- **Licence:** code MIT, data CC BY 4.0, copyright BRACAI. Reuse is free with credit.
- **Hosting:** Netlify, later a BRACAI subdomain. Feedback form in the app.

## The journey

1. Start: pick up to three topics, pick a province, go. One screen.
2. Statement card: one statement, a "what does this mean?" line, four big answers, skip. Auto-advance. Keys 1 to 4 work.
3. After every five: result screen. Continue or stop.
4. Tap a party: every statement, your answer, their stance, the page and the source.
5. End: share, feedback.

## Confidence and precision

| Answers | Bar | What the voter sees |
|---|---|---|
| under 5 | empty | nothing |
| 5 to 9 | 1 of 4 | three bands: near, middle, far. No numbers |
| 10 to 14 | 2 of 4 | rounded to the nearest 10, blurred bar |
| 15 to 19 | 3 of 4 | exact percent |
| 20 | 4 of 4 | exact percent, share and feedback |

A party needs at least 3 compared answers and half of the voter's answers covered, else "sin datos aún".

## Scoring

Same as v3. Answers +2, +1, -1, -2. Stance support +2, oppose -2. Agreement = 1 - |answer - stance| / 4. Conditional = 0.5. Silence is left out, never zero. No weights. Ties within 3 points are tagged. 15 tests pass.

## Why four answers and no "neutral"

- Altinget's valgomat uses a five-step scale with the middle hidden, so voters get four choices. Their reasoning: nobody knows what a middle answer means, and four choices still spread parties well.
- VAA research finds that people over-pick neutral and "no opinion" when a statement is hard, and that about one statement in five causes comprehension trouble. So: no neutral, a clear skip, and a plain explainer on every card.
- Wording shifts answers. "Forbid" gets less support than "not allow" for the same policy. Q02 was reworded to avoid "prohibirse".
- Statement choice changes results more than the formula does (Walgrave et al. 2009). So the bank mixes directions: 8 statements the right tends to propose, 10 the left or regional parties, 2 that cut across.
- Number of statements: most VAAs use about 30. Twenty in blocks of five trades depth for completion. Thirty is the next step.

## Still open

1. Programmes for 12 of 13 candidacies are not read yet (see `docs/02_plan.md`).
2. PP page numbers come from an AI read of the PDF text. Check against the PDF.
3. Province lists come from a third-party site. Check against the BOE of 3 Nov.
4. The Valencian joint list (Compromís and others): name and members not confirmed.
5. Privacy and electoral-law look by a human before a public push.
