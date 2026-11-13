from playwright.sync_api import sync_playwright
import json
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--no-sandbox']); bad=[]
    for vp in ({'width':360,'height':600},{'width':390,'height':664}):
        pg=b.new_page(viewport=vp); pg.emulate_media(reduced_motion='reduce'); pg.goto('http://localhost:8080/'); pg.click('[data-act=towhere]'); pg.click('[data-act=begin]'); pg.click('[data-act=go]')
        for i in range(30):
            pg.wait_for_selector('.statement'); pg.click('[data-act=info]')
            m=pg.evaluate("()=>{const c=document.querySelector('.card');return [c.scrollHeight-c.clientHeight, document.documentElement.scrollHeight-innerHeight, document.querySelector('.statement').innerText.slice(0,50)]}")
            if m[0]>1 or m[1]>0: bad.append((vp['height'],m))
            pg.click('.opt[data-ans=skip]'); pg.wait_for_timeout(40)
            if pg.locator('.party, .empty').count() and not pg.locator('.statement').count():
                if pg.locator('[data-act=more]').count(): pg.click('[data-act=more]')
                else: break
    print(len(bad)); [print(x) for x in bad]; b.close()
