"""Build data/map.json (SVG paths of Spain's regions) from es-atlas (MIT, data: Instituto Geográfico Nacional).
Run from the repo root: python3 tools/build_map.py"""
import json, math
T = json.load(open('tools/vendor/es-atlas-autonomous_regions.json'))
sx, sy = T['transform']['scale']; tx, ty = T['transform']['translate']
arcs = []
for a in T['arcs']:
    x = y = 0; pts = []
    for dx, dy in a:
        x += dx; y += dy; pts.append((x * sx + tx, y * sy + ty))
    arcs.append(pts)
PROV = {'01': ['04','11','14','18','21','23','29','41'], '02': ['22','44','50'], '03': ['33'], '04': ['07'], '05': ['35','38'], '06': ['39'],
        '07': ['05','09','24','34','37','40','42','47','49'], '08': ['02','13','16','19','45'], '09': ['08','17','25','43'], '10': ['03','12','46'],
        '11': ['06','10'], '12': ['15','27','32','36'], '13': ['28'], '14': ['30'], '15': ['31'], '16': ['01','20','48'], '17': ['26'], '18': ['51'], '19': ['52']}
NAME = {'01': 'Andalucía', '02': 'Aragón', '03': 'Asturias', '04': 'Illes Balears', '05': 'Canarias', '06': 'Cantabria', '07': 'Castilla y León', '08': 'Castilla-La Mancha',
        '09': 'Cataluña', '10': 'Comunitat Valenciana', '11': 'Extremadura', '12': 'Galicia', '13': 'Madrid', '14': 'Murcia', '15': 'Navarra', '16': 'País Vasco',
        '17': 'La Rioja', '18': 'Ceuta', '19': 'Melilla'}
K, LON0, LAT0, C = 30.0, -9.6, 43.95, math.cos(math.radians(40))
def proj(lon, lat, canary):
    if canary: lon += 8.6; lat += 6.1   # inset: move the islands next to the mainland
    return round((lon - LON0) * C * K, 1), round((LAT0 - lat) * K, 1)
def ring(idx, canary):
    pts = []
    for i in idx:
        a = arcs[i] if i >= 0 else arcs[~i][::-1]
        pts += a if not pts else a[1:]
    out = []
    for p in (proj(lo, la, canary) for lo, la in pts):
        if not out or p != out[-1]: out.append(p)
    return out
def area(r): return abs(sum(r[i][0] * r[(i + 1) % len(r)][1] - r[(i + 1) % len(r)][0] * r[i][1] for i in range(len(r)))) / 2
regions = []
for g in T['objects']['autonomous_regions']['geometries']:
    rid = g['id']
    if rid not in NAME or rid in ('18', '19'): continue   # Ceuta and Melilla are too small to tap: shown as buttons
    polys = g['arcs'] if g['type'] == 'MultiPolygon' else [g['arcs']]
    d = ''
    for poly in polys:
        r = ring(poly[0], rid == '05')
        if len(r) < 4 or area(r) < 1.2: continue   # drop specks
        d += 'M' + ' '.join(f'{x},{y}' for x, y in r) + 'Z'
    regions.append({'id': rid, 'name': NAME[rid], 'provinces': PROV[rid], 'd': d})
xs = [float(v.split(',')[0]) for r in regions for v in r['d'].replace('M', ' ').replace('Z', ' ').split()]
ys = [float(v.split(',')[1]) for r in regions for v in r['d'].replace('M', ' ').replace('Z', ' ').split()]
vb = [math.floor(min(xs)) - 2, math.floor(min(ys)) - 2, math.ceil(max(xs) - min(xs)) + 4, math.ceil(max(ys) - min(ys)) + 4]
c = next(r for r in regions if r['id'] == '05'); cx = [float(v.split(',')[0]) for v in c['d'].replace('M', ' ').replace('Z', ' ').split()]; cy = [float(v.split(',')[1]) for v in c['d'].replace('M', ' ').replace('Z', ' ').split()]
out = {'source': 'es-atlas 0.6.0 (MIT). Datos: Instituto Geográfico Nacional. Canarias desplazadas.', 'viewBox': ' '.join(map(str, vb)),
       'inset': [round(min(cx) - 3, 1), round(min(cy) - 3, 1), round(max(cx) - min(cx) + 6, 1), round(max(cy) - min(cy) + 6, 1)],
       'regions': sorted(regions, key=lambda r: r['id']), 'extra': [{'id': '18', 'name': 'Ceuta', 'provinces': ['51']}, {'id': '19', 'name': 'Melilla', 'provinces': ['52']}]}
json.dump(out, open('data/map.json', 'w'), ensure_ascii=False, separators=(',', ':'))
print(len(regions), 'regions', out['viewBox'], 'inset', out['inset'], round(len(json.dumps(out)) / 1024), 'KB')
