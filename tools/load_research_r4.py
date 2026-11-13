import json,csv,re,collections,sys
from urllib.parse import urlparse
D='docs/research/2026-11-13_citas/'
PID={'PP':'pp','PSOE':'psoe','Vox':'vox','Frente Amplio':'fa','Podemos':'podemos','ERC':'erc','Junts':'junts','EAJ-PNV':'pnv','EH Bildu':'bildu','BNG':'bng','Coalición Canaria':'cc','Compromís-Front Valencià':'compromis','Democracia 21':'d21','SALF':'salf'}
ST={'a favor':'support','en contra':'oppose','a medias':'conditional'}
MES='ene feb mar abr may jun jul ago sep oct nov dic'.split()
MED={'congreso.es':'Congreso','europapress.es':'Europa Press','elpais.com':'El País','servimedia.es':'Servimedia','20minutos.es':'20minutos','eldiario.es':'elDiario.es','rtve.es':'RTVE','efe.com':'EFE','lavanguardia.com':'La Vanguardia','newtral.es':'Newtral','lasexta.com':'laSexta','cadenaser.com':'Cadena SER','elnacional.cat':'El Nacional','voxespana.es':'Vox','bng.gal':'BNG','eaj-pnv.eus':'EAJ-PNV','primerocanarias.com':'Coalición Canaria','seacabolafiesta.com':'SALF','democracia21.es':'Democracia 21','img.beteve.cat':'copia en betevé','github.com':'transcripción en GitHub','static.esquerra.cat':'ERC','static.abc.es':'copia en ABC','eur-lex.europa.eu':'Diario Oficial de la UE','redmapl3.europarl.europa.eu':'Parlamento Europeo','eppgroup.eu':'Grupo PPE','antena3.com':'Antena 3','elconfidencial.com':'El Confidencial','ondavasca.com':'Onda Vasca','coalicioncanaria.org':'Coalición Canaria','redaccionmedica.com':'Redacción Médica','notimerica.com':'Europa Press','articulo14.es':'Artículo 14','t.me':'Telegram','ondacero.es':'Onda Cero','beteve.cat':'betevé','frontvalencia.org':'Front Valencià'}
def when(f):
    m=re.search(r'(\d{4})(?:-(\d\d)(?:-(\d\d))?)?(?!\d)',f or '')
    if not m: return '',2026
    y,mo,d=m.groups()
    if mo and not 1<=int(mo)<=12: mo=d=None
    return (f'{int(d)} {MES[int(mo)-1]} {y}' if d else f'{MES[int(mo)-1]} {y}' if mo else y), int(y)
def rows():
    for fn in ('r4_A_q21_q33.csv','r4_B_q34_q45.csv','r4_C_huecos.csv'):
        for r in csv.DictReader(open(D+fn,encoding='utf-8-sig')):
            g=lambda k: next((v for kk,v in r.items() if kk.startswith(k)),'') or ''
            yield dict(pid=PID[r['partido']],q=r['id_pregunta'],st=ST.get(r['postura']),lvl=int(g('nivel') or 0),summ=r['resumen_en_una_frase'],tit=r['cita_o_titulo'],who=r['quién'],date=r['fecha'],url=r['url'],page=g('página'),opened=g('abierto').strip().startswith('s'),notes=r['notas'],conf=g('confianza').strip())
def build(r):
    host=urlparse(r['url']).netloc.replace('www.','').replace('amp.',''); med=MED.get(host,host); d,y=when(r['date']); L=r['lvl']; who=re.split(r'[,;(/]',r['who'])[0].strip()
    lvl={1:1,2:5,3:4,4:5,5:2,6:6,7:6,8:6}[L]
    title={1:f"{r['tit'] or 'Programa 29N'}"+('' if host in('pp.es','voxespana.es','bng.gal','eaj-pnv.eus','primerocanarias.com','seacabolafiesta.com','democracia21.es') else f' ({med})'),
           2:('Congreso' if host=='congreso.es' else f'votación recogida por {med}')+(f', {d}' if d else ''),3:f'{who}, {med}'+(f', {d}' if d else ''),4:f'{who} ({med})'+(f', {d}' if d else ''),
           5:f"{r['tit']}"+(f' ({med})' if med not in r['tit'] else ''),6:med+(f', {d}' if d else ''),7:f'{who} ({med})'+(f', {d}' if d else ''),8:med+(f', {d}' if d else '')}[L]
    pm=re.match(r'\s*(?:p+\.?\s*)?(\d+)',r['page'] or ''); page=pm.group(1) if (pm and L in(1,5)) else 'web'
    src={'level':lvl,'title':title,'year':y,'url':r['url']}
    cell={'stance':r['st'],'page':page,'summary':r['summ'],'coder':'IA (deep research v4, 13-11-2026)','status':'ai_coded_unreviewed','research_level':L,'confidence':r['conf']}
    if L==3 and r['tit'] and len(r['tit'])<160: cell['quote']=r['tit'].strip('«»"')
    if r['notes']: cell['note']=r['notes'][:400]
    kind='count' if (L<=4 and r['conf']!='baja') else 'approx' if (L in(5,6) and r['conf']!='baja') else 'hint'
    if kind!='hint' and not r['opened']: kind='hint'; cell['note']=('Enlace no abierto por la herramienta. '+cell.get('note',''))[:400]
    if kind=='approx': cell['approx']=True
    if kind=='hint': cell['why_approx']=(r['notes'] or '')[:300]
    return kind,cell,src
if __name__=='__main__':
    cov=collections.Counter(); hint=collections.Counter(); bylvl=collections.Counter()
    for r in rows():
        if not r['st']: continue
        k,c,s=build(r); bylvl[(r['lvl'],k)]+=1
        (cov if k!='hint' else hint)[r['q']]+=1
    print(sorted(bylvl.items()))
    for q in sorted(set(cov)|set(hint)): print(q,'cuenta',cov[q],'pista',hint[q])
