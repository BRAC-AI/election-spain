"""Build data/evidence.csv and data/evidence.xlsx from the JSON data. Run from the repo root.
Layout follows the compact table profile: pale header, white rows, thin borders, fixed row heights, clipped text."""
import csv, json
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter
from openpyxl.worksheet.datavalidation import DataValidation

Q = json.load(open('data/questions.json')); P = json.load(open('data/parties.json')); S = json.load(open('data/stances.json')); SO = json.load(open('data/sources.json'))
N = len(Q['questions'])
LEVEL = {'programa_29N': '1 Programa 29N', 'programa_anterior': '2 Programa anterior', 'web': '3 Web oficial'}
LV = {1: '1 Programa 29N', 2: '2 Programa anterior', 3: '3 Web oficial', 4: '4 Dicho en público', 5: '5 Voto', 6: '6 Pista (no cuenta)'}
# Fallback (level 2) per party: the last general-election programme of its own, if one exists.
PREV = {'pp': 'Programa PP 2023', 'upn-pp': 'Programa PP 2023', 'psoe': 'Programa PSOE 2023', 'vox': 'Programa Vox 2023', 'erc': 'Programa ERC 2023',
        'junts': 'Programa Junts 2023', 'pnv': 'Programa PNV 2023', 'bildu': 'Compromiso EH Bildu 2023', 'bng': 'Programa BNG 2023', 'cc': 'Programa CC 2023',
        'fa': 'No existe (coalición nueva; Sumar 2023 descartado)', 'podemos': 'No existe propio desde 2019 (en 2023 fue en Sumar)',
        'salf': 'No existe (no se presentó en 2023)', 'd21': 'No existe (partido de 2026)', 'compromis': 'No existe propio (en 2023 fue en Sumar)'}
READ29 = {'pp', 'upn-pp', 'erc'}                      # 29N programme already read
PUB29 = {'pp', 'upn-pp', 'erc', 'bng', 'pnv', 'cc'}   # 29N programme published and located

head = ['Partido', 'ID', 'Afirmación', 'Posición', 'Página', 'Resumen (nuestras palabras)', 'Cita literal', 'Nivel de fuente', 'Documento', 'Año', 'Enlace',
        'Codificado por', 'Estado', 'Revisor', 'Fecha revisión', 'Notas']
rows, gaps = [], []
for p in P['parties']:
    key = p.get('stancesFrom') or p['id']; cells = S['stances'].get(key, {}); pr = p['programme']
    for q in Q['questions']:
        c = cells.get(q['id'], {})
        state = c.get('status') or ('no encontrado en lo leído' if cells else 'sin leer')
        d = SO.get(c.get('src'), {})
        rows.append([p['name'], q['id'], q['text'], c.get('stance', ''), c.get('page', ''), c.get('summary', ''), c.get('quote', ''),
                     LV.get(d.get('level'), ''), d.get('title', ''), d.get('year', ''), d.get('url', ''),
                     c.get('coder', ''), state, c.get('reviewer', ''), c.get('verified_on', ''), ''])
    missing = [q['id'] for q in Q['questions'] if q['id'] not in cells]
    used = sorted({SO[c['src']]['title'] + ' (' + str(SO[c['src']]['year']) + ')' for c in cells.values()})
    lv = sorted({SO[c['src']]['level'] for c in cells.values()})
    step = ('Deep research sobre fuentes oficiales; después verificar' if p['id'] in ('fa', 'd21', 'compromis') else
            'Buscar programa 29N; el de 2019 es muy antiguo' if p['id'] == 'podemos' else
            'Sustituir por el programa 29N cuando salga' if lv and min(lv) == 2 else 'Segunda pasada y revisión humana')
    gaps.append([p['name'], len(cells), N - len(cells), ', '.join(missing), '; '.join(used), ', '.join(str(x) for x in lv), step, 'Pendiente'])
with open('data/evidence.csv', 'w', newline='', encoding='utf-8') as f:
    w = csv.writer(f); w.writerow(head); w.writerows(rows)

INK, HEAD, LINE = '2D3945', 'E6EDF3', 'D9D9D9'
side = Side(style='thin', color=LINE); border = Border(left=side, right=side, top=side, bottom=side)
def sheet(ws, header, data, widths, spare=10, freeze='B2'):
    ws.append(header); [ws.append(r) for r in data]; [ws.append([None] * len(header)) for _ in range(spare)]
    for c in ws[1]:
        c.font = Font(name='Arial', size=9, bold=True, color=INK); c.fill = PatternFill('solid', fgColor=HEAD)
        c.alignment = Alignment(horizontal='center', vertical='center', wrap_text=True); c.border = border
    ws.row_dimensions[1].height = 27  # 36 px
    for i, row in enumerate(ws.iter_rows(min_row=2), start=2):
        ws.row_dimensions[i].height = 15.75  # 21 px
        for c in row:
            c.font = Font(name='Arial', size=10, color=INK); c.alignment = Alignment(vertical='center', wrap_text=False); c.border = border
            c.fill = PatternFill('solid', fgColor='FFFFFF')
    for i, wdt in enumerate(widths): ws.column_dimensions[get_column_letter(i + 1)].width = wdt
    ws.freeze_panes = freeze; ws.auto_filter.ref = f"A1:{get_column_letter(len(header))}{len(data) + 1 + spare}"

wb = Workbook(); ws = wb.active; ws.title = 'Huecos'
sheet(ws, ['Partido', 'Codificadas', 'Faltan', 'Qué afirmaciones faltan', 'Documentos leídos', 'Niveles usados', 'Siguiente paso', 'Estado'],
      gaps, [22, 11, 8, 60, 70, 10, 50, 12], spare=0)
for i in range(2, len(gaps) + 2):
    ws.cell(row=i, column=2, value=f'=COUNTIFS(Posiciones!$A:$A,A{i},Posiciones!$D:$D,"<>")'); ws.cell(row=i, column=3, value=f'={N}-B{i}')
dv0 = DataValidation(type='list', formula1='"Pendiente,En curso,Hecho,Bloqueado"', allow_blank=True); ws.add_data_validation(dv0); dv0.add(f'H2:H{len(gaps) + 1}')

ws1 = wb.create_sheet('Posiciones'); sheet(ws1, head, rows, [15, 6, 46, 14, 8, 50, 40, 18, 28, 6, 30, 12, 24, 12, 12, 24], spare=0, freeze='C2')
dv = DataValidation(type='list', formula1='"support,oppose,conditional,insufficient_evidence"', allow_blank=True); ws1.add_data_validation(dv); dv.add(f'D2:D{len(rows) + 1}')
dv1 = DataValidation(type='list', formula1='"1 Programa 29N,2 Programa anterior,3 Web oficial"', allow_blank=True); ws1.add_data_validation(dv1); dv1.add(f'H2:H{len(rows) + 1}')
dv2 = DataValidation(type='list', formula1='"sin leer,no encontrado en lo leído,ai_coded_unreviewed,ai_reviewed,reviewed"', allow_blank=True); ws1.add_data_validation(dv2); dv2.add(f'M2:M{len(rows) + 1}')

ws2 = wb.create_sheet('Fuentes')
sheet(ws2, ['Partido', 'Nivel', 'Documento', 'Año', 'Enlace', 'Web del partido', 'Notas'],
      [[p['name'], LEVEL.get(p['programme'].get('type'), ''), p['programme'].get('title', ''), p['programme'].get('year') or '', p['programme'].get('url', ''), p.get('site', ''),
        p['programme'].get('note', '')] for p in P['parties']], [16, 18, 40, 6, 50, 30, 90], spare=0)
ws3 = wb.create_sheet('Preguntas')
sheet(ws3, ['ID', 'Categoría', 'Afirmación', 'Explicación en la app'], [[q['id'], Q['categories'][q['category']], q['text'], q['info']] for q in Q['questions']], [6, 28, 62, 80], spare=0)
ws4 = wb.create_sheet('Leeme')
sheet(ws4, ['Cómo usar esta hoja'], [
    ['Huecos: qué falta por partido y el siguiente paso. Posiciones: una fila por partido y afirmación. Fuentes: el documento de cada partido.'],
    ['Niveles de fuente: 1 = programa oficial del 29N. 2 = último programa propio de unas generales, solo para lo que el nivel 1 no dice. 3 = web oficial (por decidir).'],
    ['Posición: support (a favor), oppose (en contra), conditional (a medias), insufficient_evidence (ningún documento lo dice).'],
    ['Para revisar: abre el enlace, ve a la página, comprueba el resumen, pega la cita literal, pon tu nombre y la fecha, y cambia Estado a reviewed.'],
    ['Nunca se deduce una posición por la ideología del partido ni por la prensa.'],
    ['La hoja se genera desde data/stances.json del repositorio con tools/build_evidence.py. Lo que cambies aquí hay que pasarlo a ese archivo.'],
    [f"Generada el 13-11-2026 con preguntas {Q['version']} y posiciones {S['version']}."]], [160], spare=0, freeze='A2')
wb.save('data/evidence.xlsx'); print(len(rows), 'rows;', sum(g[1] for g in gaps), 'coded cells')
for g in gaps: print(f"{g[0]:<26}{g[1]:>3}/{N}  niveles {g[5]:<5} {g[6]}")
