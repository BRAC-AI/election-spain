"""Journey test as a real voter. Needs: npm start (port 8080), playwright, Chrome. Run: python3 tools/e2e.py"""
import sys
from playwright.sync_api import sync_playwright
BASE = sys.argv[1] if len(sys.argv) > 1 else 'http://localhost:8080/'
# Persona: Laia, 31, rents a flat in Barcelona, works in a shop. Cares about housing and work.
ANS = {'tope al precio': 'sa', 'comprar casa': 'a', 'muy ricas': 'a', 'menos impuestos': 'a', 'menos horas': 'sa', 'sueldo mínimo': 'sa',
       'ayuda por cada hijo': 'a', 'sin papeles deben poder usar': 'a', 'hospitales privados': 'd', 'concertados': 'skip', 'castellano': 'd',
       'nucleares': 'skip', 'dar papeles': 'a', 'españoles deben ir primero': 'd', 'ejército': 'd', 'informe médico': 'd', 'aborto': 'sa',
       'separarse': 'a', 'cobrar todos sus impuestos': 'a', 'armas a Ucrania': 'skip'}
errs, log = [], []
def fits(pg, name):
    m = pg.evaluate("""() => { const d=document.documentElement, c=document.querySelector('.card'), s=document.querySelector('.screen');
      const last=[...s.children].filter(e=>!e.hidden).pop().getBoundingClientRect();
      return {sh:d.scrollHeight, ih:innerHeight, sw:d.scrollWidth, iw:innerWidth, bottom:Math.round(last.bottom), card:c?c.scrollHeight-c.clientHeight:0}; }""")
    ok = m['sh'] <= m['ih'] and m['sw'] <= m['iw'] and m['bottom'] <= m['ih'] and m['card'] <= 1
    if not ok: errs.append(f'{name} does not fit: {m}')
    return ok
with sync_playwright() as p:
    b = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox'])
    for vp in [(390, 664), (360, 600), (1440, 900)]:
        tag = f'{vp[0]}x{vp[1]}'
        pg = b.new_page(viewport={'width': vp[0], 'height': vp[1]}, reduced_motion='reduce')
        pg.on('console', lambda m: errs.append(m.text) if m.type == 'error' else None)
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.goto(BASE); pg.wait_for_selector('.bubbles'); pg.evaluate('sessionStorage.clear()'); pg.reload(); pg.wait_for_selector('.bubbles')
        for t in ['Vivienda', 'Trabajo y ayudas', 'Sanidad', 'Defensa']: pg.click(f'.bubble:has-text("{t}")')
        assert pg.locator('.bubble[aria-pressed=true]').count() == 3
        pg.select_option('#prov', '08'); fits(pg, f'{tag} start'); pg.screenshot(path=f'/tmp/shots/{tag}_start.png')
        pg.click('[data-act=begin]'); pg.wait_for_selector('.statement')
        assert 'Vivienda' in pg.inner_text('.card .eyebrow')
        n = 0
        while True:
            if pg.locator('.statement').count():
                text = pg.inner_text('.statement'); key = next(k for k in ANS if k in text)
                if n == 0:
                    pg.click('[data-act=info]'); pg.wait_for_selector('.info'); fits(pg, f'{tag} question+info'); pg.screenshot(path=f'/tmp/shots/{tag}_q.png')
                if n == 6:  # change of mind: answer, go back, see it remembered
                    pg.click('.opt[data-ans=d]'); pg.wait_for_selector('.statement'); pg.click('[data-act=back]')
                    assert pg.locator('.opt[data-ans=d][aria-pressed=true]').count() == 1
                fits(pg, f'{tag} question {n + 1}')
                pg.click(f'.opt[data-ans={ANS[key]}]'); n += 1; pg.wait_for_timeout(40)
            else:
                pg.wait_for_selector('.party'); fits(pg, f'{tag} result {n}')
                rows = [x.replace('\n', ' ') for x in pg.locator('.party').all_inner_texts()]
                if vp[0] == 390: log.append(f'after {n}: ' + pg.inner_text('.cap') .replace('\n', ' ') + ' | ' + ' ; '.join(rows))
                pg.screenshot(path=f'/tmp/shots/{tag}_r{n}.png')
                if not pg.locator('[data-act=more]').count(): break
                pg.click('[data-act=more]'); pg.wait_for_selector('.statement')
        assert n == 20
        vals = [int(v.replace(' %', '')) for v in pg.locator('.party .val').all_inner_texts()]
        assert vals == sorted(vals, reverse=True) and all(0 <= v <= 100 for v in vals), vals
        pg.locator('.party').first.click(); pg.wait_for_selector('.item'); fits(pg, f'{tag} why'); pg.screenshot(path=f'/tmp/shots/{tag}_why.png')
        links = pg.locator('.links a').evaluate_all('els => els.map(e => e.href)'); assert all(l.startswith('https://') for l in links) and links, links
        pg.click('[data-act=toresult]'); pg.wait_for_selector('.party')
        pg.click('header [data-act=about]'); pg.wait_for_selector('#fb'); fits(pg, f'{tag} about'); pg.screenshot(path=f'/tmp/shots/{tag}_about.png')
        pg.route('**/*', lambda r: r.fulfill(status=200, body='ok') if r.request.method == 'POST' else r.continue_())
        pg.click('[data-star="4"]'); pg.fill('#fbm', 'prueba'); pg.click('#fb button[type=submit]'); pg.wait_for_selector('text=Gracias'); pg.unroute('**/*')
        pg.click('[data-act=closeabout]'); pg.wait_for_selector('.party')
        pg.reload(); pg.wait_for_selector('.party')  # state survives reload
        if vp[0] == 390: names = pg.locator('.party').all_inner_texts(); assert any('Democracia 21' in x for x in names) and any('SALF' in x for x in names)
        pg.click('[data-act=restart]'); pg.wait_for_selector('.bubbles'); assert pg.locator('.bubble[aria-pressed=true]').count() == 0
        pg.close()
    b.close()
print('\n'.join(log)); print('errors:', errs); sys.exit(1 if errs else 0)
