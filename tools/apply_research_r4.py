import json,sys,collections
sys.path.insert(0,'/home/claude/work'); import load4
S=json.load(open('data/stances.json')); SO=json.load(open('data/sources.json')); Q=json.load(open('data/questions.json')); C=json.load(open('data/questions_candidates.json'))
PROMOTE=['Q42','Q41','Q43','Q39','Q44','Q45','Q37','Q24','Q26','Q23']
CAT={'Q42':'social','Q43':'eu','Q44':'economy','Q45':'territory'}
INFO={'Q23':'Hoy, al heredar de tus padres se paga un impuesto que cambia mucho según la comunidad. En algunas casi no se paga. Unos quieren quitarlo en toda España; otros, que paguen las herencias grandes.',
'Q24':'En 2022 se creó un impuesto especial para los bancos, porque ganaban mucho con la subida de los tipos de interés. Unos quieren mantenerlo; otros dicen que al final lo paga el cliente.',
'Q26':'Okupar es entrar a vivir en una casa sin permiso del dueño. Hoy echar a un okupa puede tardar meses. Unos piden hacerlo en 48 horas; otros avisan de que hay familias sin otro sitio adonde ir.',
'Q37':'La eutanasia es ayudar a morir a una persona con una enfermedad muy grave que lo pide. En España es legal desde 2021, con controles médicos.',
'Q39':'Por la guerra en Gaza, España aprobó en 2025 no vender ni comprar armas a Israel, con algunas excepciones. Unos quieren un veto total; otros, quitarlo.'}
have={q['id'] for q in Q['questions']}
for q in C['questions']:
    if q['id'] in PROMOTE and q['id'] not in have:
        Q['questions'].append({'id':q['id'],'category':q.get('category') or CAT[q['id']],'text':q['text'],'info':q.get('info') or INFO[q['id']],'image':None})
Q['questions'].sort(key=lambda q:q['id']); Q['version']='0.19.0-draft'
live={q['id'] for q in Q['questions']}; assert len(live)==30, len(live)
SC={'version':'r4','note':'Posiciones para frases de reserva (no están en la app). Misma estructura que stances.json.','stances':{},'hints':{}}
n=collections.Counter()
for r in load4.rows():
    if not r['st']: n['no encontrado']+=1; continue
    pid,q=r['pid'],r['q']
    if pid=='salf' and 'SALF_Contrato' in r['url'] and r['lvl']==1: r['opened']=True; r['notes']=('Comprobado en el PDF por IA (Claude). '+r['notes']).strip()
    if pid=='compromis' and r['lvl']==7 and 'Sumar' not in r['who']: r['lvl']=2 if 'voto' in r['summ'].lower() or 'Sí' in r['summ'] or 'No ' in r['summ'] else 3   # Compromís is the coalition's own main party
    kind,cell,src=load4.build(r); sid=f"r4-{pid}-{q.lower()}"
    tgt=S if q in live else SC
    if q in tgt['stances'].get(pid,{}): n['skip exists']+=1; continue
    SO[sid]=src; cell['src']=sid
    if kind=='hint':
        if q in tgt['hints'].get(pid,{}) : n['skip hint exists']+=1; continue
        tgt['hints'].setdefault(pid,{})[q]=cell
    else:
        tgt['stances'].setdefault(pid,{})[q]=cell; tgt['hints'].get(pid,{}).pop(q,None)
    n[('app ' if q in live else 'reserva ')+kind]+=1
S['version']='0.19.0-draft'
for f,o in (('data/stances.json',S),('data/sources.json',SO),('data/questions.json',Q),('data/stances_candidates.json',SC)): json.dump(o,open(f,'w'),ensure_ascii=False,indent=1)
print(dict(n))
P=[p for p in json.load(open('data/parties.json'))['parties'] if not p.get('stancesFrom')]
tot=0
for p in P:
    c=S['stances'][p['id']]; h=S['hints'].get(p['id'],{}); k=len([q for q in live if q in c]); tot+=k
    print(f"{p['name']:26} cuenta {k:2}/30  pista {len([q for q in live if q in h and q not in c]):2}")
print('total',tot,'/',30*len(P))
for q in sorted(live):
    m=[p['abbr'] for p in P if q not in S['stances'][p['id']]]
    if len(m)>=3: print(q,len(m),' '.join(m))
