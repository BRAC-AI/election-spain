"""Two typical voters walk the whole tool on a phone. Run: python3 tools/personas.py [base_url]"""
import sys, json
from playwright.sync_api import sync_playwright
BASE = sys.argv[1] if len(sys.argv) > 1 else 'http://localhost:8080/'
K = ['tope al precio', 'comprar casa', 'muy ricas', 'menos impuestos', 'menos horas', 'sueldo mínimo', 'ayuda por cada hijo', 'sin papeles deben poder usar',
     'hospitales privados', 'concertados', 'castellano', 'nucleares', 'dar papeles', 'españoles deben ir primero', 'ejército', 'informe médico', 'aborto',
     'separarse', 'cobrar todos sus impuestos', 'armas a Ucrania']
P = {
 'pp_voter': dict(who='Carlos, 54, autónomo en Madrid, vota PP', bubbles=['Impuestos', 'Inmigración', 'Territorio'], prov='28',
                  ans='d d sd sa d d a d a sa sa a d a a a d sd sd a'.split()),
 'psoe_voter': dict(who='Marta, 46, enfermera en Madrid, vota PSOE', bubbles=['Sanidad', 'Vivienda', 'Derechos'], prov='28',
                    ans='a skip a d a sa a sa sd d d d a sd skip d sa d d a'.split()),
}
out = {}
with sync_playwright() as p:
    b = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox'])
    for name, per in P.items():
        pg = b.new_page(viewport={'width': 390, 'height': 664}, reduced_motion='reduce')
        pg.goto(BASE); pg.wait_for_selector('.bubbles'); pg.evaluate('sessionStorage.clear()'); pg.reload(); pg.wait_for_selector('.bubbles')
        for t in per['bubbles']: pg.click(f'.bubble:has-text("{t}")')
        pg.click('[data-act=towhere]'); pg.wait_for_selector('.map'); pg.select_option('#reg', '13'); pg.click('[data-act=begin]'); pg.wait_for_selector('.statement')
        ans = dict(zip(K, per['ans'])); n = 0; steps = []
        while True:
            if pg.locator('.statement').count():
                text = pg.inner_text('.statement'); pg.click(f".opt[data-ans={ans[next(k for k in K if k in text)]}]"); n += 1; pg.wait_for_timeout(40)
            else:
                pg.wait_for_selector('.party')
                rows = [(r.locator('.name').inner_text().replace('\n', ' '), r.locator('.val').inner_text() if r.locator('.val').count() else '–') for r in pg.locator('.party').all()]
                steps.append({'after': n, 'meter': pg.inner_text('.cap b'), 'hero': pg.inner_text('.heroname') if pg.locator('.heroname').count() else None, 'rows': rows})
                pg.screenshot(path=f'/tmp/shots/{name}_r{n}.png')
                if not pg.locator('[data-act=more]').count(): break
                pg.click('[data-act=more]'); pg.wait_for_selector('.statement')
        pg.locator('.party').first.click(); pg.wait_for_selector('.head'); pg.screenshot(path=f'/tmp/shots/{name}_why.png')
        tags = pg.locator('.item').all_inner_texts()
        out[name] = {'who': per['who'], 'steps': steps, 'why_first_party_items': len(tags), 'no_lo_dice': sum('No lo dice' in t for t in tags)}
        pg.close()
    b.close()
print(json.dumps(out, ensure_ascii=False, indent=1))
