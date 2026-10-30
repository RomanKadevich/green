import xml.etree.ElementTree as ET
from pathlib import Path
import base64, hashlib, json, shutil

ROOT = Path(__file__).resolve().parents[1]
NS = '{http://www.w3.org/2000/svg}'
ET.register_namespace('', NS[1:-1])
ET.register_namespace('xlink', 'http://www.w3.org/1999/xlink')
downloads = Path.home() / 'Downloads'
qa = ROOT / 'design' / 'references'
qa.mkdir(parents=True, exist_ok=True)
public = ROOT / 'design' / 'normalized'
public.mkdir(parents=True, exist_ok=True)
assets = ROOT / 'design' / 'source'
assets.mkdir(parents=True, exist_ok=True)

def repair(value):
    try: return value.encode('latin1').decode('utf-8')
    except (UnicodeError, AttributeError): return value

for label, name in [('desktop', 'Landing 1920 px'), ('tablet', 'Landing Tablet 1024 px'), ('mobile', 'Landing Mobile 430 px')]:
    source = ROOT / 'design' / 'exports' / f'{label}-editable.svg'
    shutil.copy2(downloads / f'{name}.jpg', qa / f'{label}.jpg')
    root = ET.parse(source).getroot()
    for el in root.iter():
        if el.get('id'): el.set('id', repair(el.get('id')))
        for key in list(el.attrib):
            value = el.get(key)
            if value.startswith('data:image/'):
                header, data = value.split(',', 1)
                raw = base64.b64decode(data)
                extension = header.split('/')[1].split(';')[0].replace('jpeg', 'jpg')
                asset = hashlib.sha256(raw).hexdigest()[:16] + '.' + extension
                (assets / asset).write_bytes(raw)
                el.set(key, '/assets/source/' + asset)
    style = ET.Element(NS + 'style')
    style.text = "@font-face{font-family:Roboto;src:url('/node_modules/@fontsource-variable/roboto/files/roboto-cyrillic-wght-normal.woff2')}@font-face{font-family:Manrope;src:url('/node_modules/@fontsource-variable/manrope/files/manrope-cyrillic-wght-normal.woff2')}@font-face{font-family:Montserrat;src:url('/node_modules/@fontsource-variable/montserrat/files/montserrat-cyrillic-wght-normal.woff2')}"
    root.insert(0, style)
    ET.ElementTree(root).write(public / f'{label}.svg', encoding='utf-8', xml_declaration=True)
    lines=[]
    def walk(el, depth=0):
        tag=el.tag.split('}')[-1]
        if tag=='defs': return
        attrs={k:v for k,v in el.attrib.items() if k not in ['d', 'points', 'style'] and not k.endswith('href')}
        text=''.join(el.itertext()) if tag=='text' else ''
        lines.append('  '*depth + tag+' '+json.dumps(attrs,ensure_ascii=False)+((' TEXT '+text) if text else ''))
        for c in el: walk(c,depth+1)
    walk(root)
    (qa / f'{label}-layers.txt').write_text('\n'.join(lines),encoding='utf-8')
    print(label, root.attrib, 'layers', len(lines))
print('source images', len(list(assets.iterdir())))
