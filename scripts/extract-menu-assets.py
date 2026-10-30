"""Extract original menu vectors and measured geometry from Figma exports."""
from pathlib import Path
import copy
import json
import xml.etree.ElementTree as ET
from fontTools.pens.boundsPen import BoundsPen
from fontTools.svgLib.path.parser import parse_path

ROOT = Path(__file__).resolve().parents[1]
NS = '{http://www.w3.org/2000/svg}'
ET.register_namespace('', NS[1:-1])

def load(path):
    root = ET.parse(path).getroot()
    for el in root.iter():
        if el.get('id'):
            try:
                el.set('id', el.get('id').encode('latin1').decode('utf-8'))
            except UnicodeError:
                pass
    return root

def bounds(node):
    boxes = []
    for el in node.iter():
        stroke = float(el.get('stroke-width', '0')) / 2
        if el.tag == NS + 'path':
            pen = BoundsPen(None)
            parse_path(el.get('d'), pen)
            if pen.bounds:
                a,b,c,d = pen.bounds
                boxes.append((a-stroke,b-stroke,c+stroke,d+stroke))
        elif el.tag == NS + 'rect':
            x,y,w,h = (float(el.get(k,'0')) for k in ('x','y','width','height'))
            boxes.append((x-stroke,y-stroke,x+w+stroke,y+h+stroke))
    a=min(x[0] for x in boxes);b=min(x[1] for x in boxes)
    c=max(x[2] for x in boxes);d=max(x[3] for x in boxes)
    return dict(x=a,y=b,w=c-a,h=d-b)

def vector(node, filename, box=None, remove_text=False):
    node = copy.deepcopy(node)
    if remove_text:
        for parent in node.iter():
            for child in list(parent):
                if child.tag == NS + 'text':
                    parent.remove(child)
    box = box or bounds(node)
    root = ET.Element(NS+'svg', {
        'width':str(box['w']), 'height':str(box['h']),
        'viewBox':' '.join(str(box[k]) for k in ('x','y','w','h')),
        'fill':'none',
    })
    root.append(node)
    ET.ElementTree(root).write(ROOT/'public/assets'/filename, encoding='utf-8',xml_declaration=True)
    return box

links = [('rules','правила'),('prizes','призы'),('products','ИГРОВЫЕ ТОВАРЫ'),('faq','вопрос-ответ'),('winners','ПОБЕДИТЕЛИ')]
data = {}
for mode in ('tablet','mobile'):
    root = load(ROOT/f'design/exports/{mode}-menu-editable.svg')
    nodes = {e.get('id'):e for e in root.iter() if e.get('id')}
    offset = 50 if mode == 'mobile' else 0
    close = vector(nodes['icons / menu'],f'{mode}-menu-close.svg')
    close['y'] -= offset
    account = vector(nodes['button'],f'{mode}-menu-account.svg',remove_text=True)
    account['y'] -= offset
    header = nodes['header']
    logo_node=next(e for e in header.iter() if e.get('id')=='logo')
    logo = vector(logo_node,f'{mode}-menu-logo.svg')
    logo['y'] -= offset
    menu = nodes['menu']
    text = []
    for e in menu.iter():
        if e.tag == NS+'text':
            t=e[0]
            text.append(dict(text=''.join(e.itertext()),x=float(t.get('x')),baseline=float(t.get('y'))-offset,font=e.get('font-family'),size=float(e.get('font-size'))))
    snow=[]
    if mode=='mobile':
        sprite=ET.Element(NS+'svg',{'width':'430','height':'906','viewBox':'0 50 430 906'})
        sprite.append(copy.deepcopy(root.find(NS+'defs')))
        sprite.append(copy.deepcopy(nodes['снежинки']))
        ET.ElementTree(sprite).write(ROOT/'design/artwork/mobile-menu-snow.svg',encoding='utf-8',xml_declaration=True)
        for e in nodes['снежинки']:
            name=e.get('id','')
            if not name.startswith('снежинка'):
                continue
            rects=[r for r in e.iter() if r.tag==NS+'rect' and r.get('x')]
            if e.tag==NS+'rect' and e.get('x'):
                rects=[e]
            if not rects:
                continue
            x=min(float(r.get('x')) for r in rects);y=min(float(r.get('y')) for r in rects)
            right=max(float(r.get('x'))+float(r.get('width')) for r in rects)
            bottom=max(float(r.get('y'))+float(r.get('height')) for r in rects)
            snow.append(dict(key=name,x=x,y=y-offset,w=right-x,h=bottom-y))
    label=nodes['Личный кабинет'];t=label[0]
    data[mode]=dict(close=close,account=account,logo=logo,links=text,accountText=dict(x=float(t.get('x')),baseline=float(t.get('y'))-offset,size=float(label.get('font-size'))),snow=snow)

outlined=load(ROOT/'design/exports/mobile-menu-outlined.svg')
nodes={e.get('id'):e for e in outlined.iter() if e.get('id')}
for key,node_id in links+[('account','Личный кабинет')]:
    box=vector(nodes[node_id],f'mobile-menu-label-{key}.svg')
    box['y']-=50
    if key=='account':data['mobile']['accountLabel']=box
    else: data['mobile']['links'][[k for k,_ in links].index(key)]['outline']=box

# The closed icon uses its actual stroke bounds, avoiding the earlier clipped
# extraction and the uncentred 50px hit-area offset.
root=load(ROOT/'design/normalized/mobile.svg')
node=next(e for e in root.iter() if e.get('id')=='Feather icons / menu')
data['closedMobile']=vector(node,'mobile-menu.svg')

(ROOT/'src/menu-layout.json').write_text(json.dumps(data,ensure_ascii=False,indent=2),encoding='utf-8')
(ROOT/'design/measurements/figma-menu-layout.json').write_text(json.dumps(data,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps(data,ensure_ascii=False,indent=2))

# Keep the decorative menu snow in the standard lossless renderer pipeline.
tasks_path=ROOT/'design/artwork/tasks.json'
tasks=json.loads(tasks_path.read_text(encoding='utf-8'))
tasks=[t for t in tasks if t['output']!='mobile-menu-snow']
tasks.append(dict(output='mobile-menu-snow',source=str(ROOT/'design/artwork/mobile-menu-snow.svg'),vector=False,zoom=2))
tasks_path.write_text(json.dumps(tasks,ensure_ascii=False,indent=2),encoding='utf-8')
