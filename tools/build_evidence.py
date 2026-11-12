"""Build data/evidence.csv and data/evidence.xlsx from the JSON data. Run from the repo root."""
import csv, json
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment
from openpyxl.worksheet.datavalidation import DataValidation

Q = json.load(open('data/questions.json')); P = json.load(open('data/parties.json')); S = json.load(open('data/stances.json'))
SRC = {'programa_29N': 'Programa 29N', 'programa_anterior': 'Programa anterior', 'web': 'Web del partido'}
head = ['Partido', 'ID', 'Afirmación', 'Posición', 'Página', 'Resumen (nuestras palabras)', 'Cita literal (rellena el revisor)',
        'Tipo de fuente', 'Documento', 'Año', 'Enlace', 'Codificado por', 'Estado', 'Revisor', 'Fecha revisión', 'Notas']
rows = []
for p in P['parties']:
    cells = S['stances'].get(p.get('stancesFrom') or p['id'], {}); pr = p['programme']
    for q in Q['questions']:
        c = cells.get(q['id'], {})
        rows.append([p['name'], q['id'], q['text'], c.get('stance', ''), c.get('page', ''), c.get('summary', ''), c.get('quote', ''),
                     SRC.get(pr.get('type'), ''), pr.get('title', ''), pr.get('year') or '', pr.get('url', ''),
                     c.get('coder', ''), c.get('status', 'sin leer' if not cells else 'no encontrado en el documento'),
                     c.get('reviewer', ''), c.get('verified_on', ''), ''])
with open('data/evidence.csv', 'w', newline='', encoding='utf-8') as f:
    w = csv.writer(f); w.writerow(head); w.writerows(rows)

wb = Workbook(); font = Font(name='Arial', size=10); bold = Font(name='Arial', size=10, bold=True, color='FFFFFF')
fill = PatternFill('solid', fgColor='2D3945'); edit = PatternFill('solid', fgColor='FFFF00')
def sheet(ws, header, data, widths, editable=()):
    ws.append(header); [ws.append(r) for r in data]
    for c in ws[1]: c.font = bold; c.fill = fill; c.alignment = Alignment(wrap_text=True, vertical='top')
    for row in ws.iter_rows(min_row=2):
        for c in row: c.font = font; c.alignment = Alignment(wrap_text=True, vertical='top')
    for i, wdt in enumerate(widths): ws.column_dimensions[chr(65 + i)].width = wdt
    for col in editable: ws.cell(row=1, column=col).fill = edit; ws.cell(row=1, column=col).font = Font(name='Arial', size=10, bold=True)
    ws.freeze_panes = 'C2'; ws.auto_filter.ref = ws.dimensions

ws = wb.active; ws.title = 'Posiciones'
sheet(ws, head, rows, [15, 6, 46, 14, 8, 50, 40, 16, 28, 6, 30, 12, 22, 12, 12, 24], editable=(4, 5, 7, 13, 14, 15, 16))
dv = DataValidation(type='list', formula1='"support,oppose,conditional,insufficient_evidence"', allow_blank=True); ws.add_data_validation(dv); dv.add(f'D2:D{len(rows) + 1}')
dv2 = DataValidation(type='list', formula1='"ai_coded_unreviewed,ai_reviewed,reviewed,sin leer,no encontrado en el documento"', allow_blank=True); ws.add_data_validation(dv2); dv2.add(f'M2:M{len(rows) + 1}')

ws2 = wb.create_sheet('Fuentes')
sheet(ws2, ['Partido', 'Tipo de fuente', 'Documento', 'Año', 'Enlace', 'Estado', 'Notas', 'Afirmaciones codificadas', 'De un total de'],
      [[p['name'], SRC.get(p['programme'].get('type'), ''), p['programme'].get('title', ''), p['programme'].get('year') or '', p['programme'].get('url', ''),
        p['programme']['status'], p['programme'].get('note', ''),
        f'=COUNTIFS(Posiciones!$A:$A,A{i + 2},Posiciones!$D:$D,"<>")', f'=COUNTIF(Posiciones!$A:$A,A{i + 2})'] for i, p in enumerate(P['parties'])],
      [16, 16, 34, 6, 44, 26, 60, 12, 10])

ws3 = wb.create_sheet('Preguntas')
sheet(ws3, ['ID', 'Categoría', 'Afirmación', 'Explicación en la app'], [[q['id'], Q['categories'][q['category']], q['text'], q['info']] for q in Q['questions']], [6, 28, 60, 70])

ws4 = wb.create_sheet('Leeme')
sheet(ws4, ['Cómo usar esta hoja'], [
    ['Una fila por partido y afirmación. Las columnas con cabecera amarilla son las que edita el revisor.'],
    ['Posición: support (a favor), oppose (en contra), conditional (con matices), insufficient_evidence (el documento no lo dice).'],
    ['Abre el enlace, ve a la página, comprueba el resumen y pega la cita literal. Pon tu nombre, la fecha y cambia Estado a reviewed.'],
    ['Si el documento no dice nada, deja Posición vacía o pon insufficient_evidence. Nunca deduzcas una posición por la ideología del partido.'],
    ['Ejemplo de fila revisada: PP | Q12 | support | 71 | «cita exacta del programa» | reviewed | Finn | 2026-11-13.'],
    ['Esta hoja se genera desde data/stances.json con tools/build_evidence.py. Los cambios hechos aquí hay que devolverlos a ese archivo.'],
    [f"Generada con preguntas {Q['version']} y posiciones {S['version']}."]], [140])
wb.save('data/evidence.xlsx'); print(len(rows), 'rows')
