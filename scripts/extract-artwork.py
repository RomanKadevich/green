"""Extract original Figma artwork without rebuilding or approximating the artwork.

Run inspect-design.py first. Geometry below is measured in the exported frames.
UI copy is removed from cards so it remains accessible, selectable HTML.
"""
from pathlib import Path
import xml.etree.ElementTree as ET
import copy, re, json

ROOT=Path(__file__).resolve().parents[1]
NS='{http://www.w3.org/2000/svg}'
ET.register_namespace('',NS[1:-1])
ET.register_namespace('xlink','http://www.w3.org/1999/xlink')
OUT=ROOT/'design'/'artwork';OUT.mkdir(parents=True,exist_ok=True)
tasks=[]

def extract(label, name, ids, box, remove_text=False, remove_ids=(), vector=False):
    if name in ('hero','grand-prize'):
        filename={'desktop':'Landing 1920 px (1).svg','tablet':'Landing Tablet 1024 px (2).svg','mobile':'Landing Mobile 430 px (2).svg'}[label]
        source=ET.parse(ROOT/'design'/'exports'/f'{label}-outlined.svg').getroot()
        for e in source.iter():
            if e.get('id'):
                try:e.set('id',e.get('id').encode('latin1').decode('utf-8'))
                except UnicodeError:pass
    else:
        source=ET.parse(ROOT/'design'/'normalized'/f'{label}.svg').getroot()
    nodes={e.get('id'):e for e in source.iter() if e.get('id')}
    if name=='hero':
        remove_ids=tuple(remove_ids)+tuple(e.get('id') for id in ids for e in nodes[id] if e.get('id','').startswith('снежинка'))
    root=ET.Element(NS+'svg',{'width':str(box[2]),'height':str(box[3]),'viewBox':' '.join(map(str,box)),'fill':'none'})
    for id in ids: root.append(copy.deepcopy(nodes[id]))
    for parent in list(root.iter()):
        for child in list(parent):
            if child.get('id') in remove_ids or (remove_text and child.tag==NS+'text') or child.tag==NS+'foreignObject': parent.remove(child)
    defs=source.find(NS+'defs')
    definitions={e.get('id'):e for e in defs if e.get('id')}
    used=set()
    def collect(elements):
        for e in elements:
            for v in e.attrib.values():
                for ref in re.findall(r'url\(#([^)]+)\)',v):
                    if ref not in used and ref in definitions:
                        used.add(ref);collect(definitions[ref].iter())
                if v.startswith('#') and v[1:] in definitions and v[1:] not in used:
                    used.add(v[1:]);collect(definitions[v[1:]].iter())
    collect(root.iter())
    outdefs=ET.SubElement(root,NS+'defs')
    for e in defs:
        if e.get('id') in used: outdefs.append(copy.deepcopy(e))
    for e in root.iter():
        for k in list(e.attrib):
            if k.endswith('href') and e.get(k).startswith('/assets/'):
                path=ROOT/'design'/'source'/Path(e.get(k)).name
                import base64
                mime='image/jpeg' if path.suffix=='.jpg' else 'image/'+path.suffix[1:]
                e.set(k,'data:'+mime+';base64,'+base64.b64encode(path.read_bytes()).decode())
    path=OUT/f'{label}-{name}.svg'
    ET.ElementTree(root).write(path,encoding='utf-8',xml_declaration=True)
    tasks.append({'source':str(path),'output':f'{label}-{name}','vector':vector})

for label, y, height, rulebox, bannerbox, prizebox, productbox in [
    ('desktop',110,1418,(220,1146,1480,320),(220,1751,1480,525),(220,2296,480,400),(220,2926,480,484)),
    ('tablet',100,1016,(25,841,974,235),(25,1264,974,386),(25,1666,480,386),(25,2258,480,484)),
    ('mobile',100,971,(15,681,400,365),(15,1201,400,330),(15,1543,400,330),(15,2047,400,403)),
]:
    scene='главный экран_2' if label=='tablet' else 'главный экран'
    rule='правила участия в игре_2' if label=='tablet' else 'правила участия в игре'
    date='16.11.2026 — 10.01.2027_2' if label=='tablet' else ('16.11.2026 — 10.01.2027' if label=='mobile' else '20.11.2026 — 14.01.2027')
    width={'desktop':1920,'tablet':1024,'mobile':430}[label]
    scene_ids=['главный экран',scene] if label=='tablet' else [scene]
    removed=(rule,date,'правила участия в игре','16.11.2026 — 10.01.2027') if label=='tablet' else (rule,date)
    extract(label,'hero',scene_ids,(0,y,width,height+(10 if label=='tablet' else 0)),remove_ids=removed)
    bg='Frame 1987300270_2' if label=='tablet' else 'Frame 1987300270'
    extract(label,'rules',[bg],rulebox,remove_text=True,vector=True)
    extract(label,'grand-prize',['главный приз'],bannerbox)
    extract(label,'prize-milka',['карточка товара 1'],prizebox,remove_text=True)
    extract(label,'product-milka',['MILKA'],productbox,remove_text=True)

extract('desktop','prize-100',['карточка товара 2'],(720,2296,480,400),remove_text=True)
extract('desktop','prize-50',['карточка товара 3'],(1220,2296,480,400),remove_text=True)
extract('tablet','prize-100',['карточка товара 2'],(519,1666,480,386),remove_text=True)
extract('desktop','product-alpen',['alpen gold'],(720,2926,480,484),remove_text=True)
extract('desktop','product-barni',['барни'],(1220,2926,480,484),remove_text=True)
extract('tablet','product-alpen',['alpen gold'],(525,2258,480,484),remove_text=True)
extract('desktop','snow-left',['снежинки слева'],(0,1528,220,450))
extract('desktop','snow-right',['снежинки справа'],(1700,1528,220,450))
extract('desktop','logo',['logo'],(220,4928,150,48.15),vector=True)
extract('desktop','profile',['profile'],(1507,46,14,18),vector=True)
extract('desktop','arrow',['стрелка влево'],(174,3166,12,21),vector=True)
extract('desktop','caret',['CaretDown_2'],(1621,3835,17,11),vector=True)
extract('desktop','app-store',['Link'],(220,5140.57,205,63.7778))
extract('desktop','google-play',['Link_2'],(220,5215.74,205,63.7778))
extract('desktop','winner-stars',['Frame 1987300239'],(703,4652,57,32),vector=True)
extract('desktop','snowflake',['снежинка 6'],(1431,205,80,77))
extract('desktop','sparkle',['снежинка луч 7'],(1612,121,117,112))
extract('desktop','snow-2',['снежинка 2'],(329,301,59,56.7308))
extract('desktop','snow-3',['снежинка 3'],(481,149,80,76.9231))
extract('desktop','snow-6',['снежинка 6'],(1431,205,80,76.9231))
extract('desktop','snow-8',['снежинка 8'],(1735,298,59,56.7308))
extract('mobile','menu',['Feather icons / menu'],(387,39,28,22),vector=True)
(OUT/'tasks.json').write_text(json.dumps(tasks,ensure_ascii=False,indent=2),encoding='utf-8')
print('extracted',len(tasks),'original artwork fragments')

# Export UI text as data, retaining baseline positions, typography and line breaks.
textdata={}
for label in ('desktop','tablet','mobile'):
    root=ET.parse(ROOT/'design'/'normalized'/f'{label}.svg').getroot()
    nodes={e.get('id'):e for e in root.iter() if e.get('id')}
    result={}
    rule='правила участия в игре_2' if label=='tablet' else 'правила участия в игре'
    date='16.11.2026 — 10.01.2027_2' if label=='tablet' else ('16.11.2026 — 10.01.2027' if label=='mobile' else '20.11.2026 — 14.01.2027')
    for group,id in [('rules',rule),('footer','Footer'),('date',date)]:
        texts=[]
        for el in nodes[id].iter():
            if el.tag!=NS+'text':continue
            spans=[{'x':float(t.get('x','0')),'y':float(t.get('y','0')),'text':t.text or ''} for t in el]
            texts.append({'id':el.get('id',''),'font':el.get('font-family','Roboto'),'size':float(el.get('font-size','16')),'weight':el.get('font-weight','400'),'color':el.get('fill','white'),'spacing':el.get('letter-spacing','0em'),'underline':el.get('text-decoration')=='underline','spans':spans})
        result[group]=texts
    textdata[label]=result
    scene=nodes['главный экран_2' if label=='tablet' else 'главный экран']
    snow=[]
    for element in scene:
        if not element.get('id','').startswith('снежинка'):continue
        rects=[e for e in element.iter() if e.tag==NS+'rect' and e.get('x')]
        x=min(float(e.get('x')) for e in rects);y=min(float(e.get('y')) for e in rects)
        right=max(float(e.get('x'))+float(e.get('width')) for e in rects)
        bottom=max(float(e.get('y'))+float(e.get('height')) for e in rects)
        snow.append({'x':x,'y':y,'w':right-x,'h':bottom-y,'kind':'sparkle' if element.tag==NS+'rect' else 'snowflake'})
    result['snow']=snow
(ROOT/'src'/'design-text.json').write_text(json.dumps(textdata,ensure_ascii=False,indent=2),encoding='utf-8')
