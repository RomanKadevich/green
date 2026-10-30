"""Translate exported Figma storyboard geometry and UI transition measurements."""
from pathlib import Path
import json,re,xml.etree.ElementTree as ET
ROOT=Path(__file__).resolve().parents[1]
root=ET.parse(ROOT/'design/exports/animation-editable.svg').getroot()
for e in root.iter():
    if e.get('id'):
        try:e.set('id',e.get('id').encode('latin1').decode('utf-8'))
        except UnicodeError:pass
frames={}
for frame in root[0]:
    name=frame.get('id','')
    if not name.startswith('Landing 1920 px'):continue
    tx,ty=map(float,re.search(r'translate\(([^)]+)\)',frame[0].get('transform')).group(1).split())
    hero=next(e for e in frame if e.get('id','').startswith('главный экран'))
    particles={}
    for e in hero:
        match=re.match(r'^(снежинка (?:луч )?\d+)',e.get('id',''))
        if not match:continue
        rects=[r for r in e.iter() if r.tag.endswith('rect') and r.get('x')]
        x=min(float(r.get('x')) for r in rects);y=min(float(r.get('y')) for r in rects)
        right=max(float(r.get('x'))+float(r.get('width')) for r in rects)
        bottom=max(float(r.get('y'))+float(r.get('height')) for r in rects)
        particles[match[1]]=dict(x=round(x-tx,4),y=round(y-ty,4),w=round(right-x,4),h=round(bottom-y,4),opacity=float(e.get('opacity','1')))
    frames[name]=particles
ui=json.loads((ROOT/'design/measurements/figma-motion-ui.json').read_text(encoding='utf-8'))
edges={}
for frame in ui:
    values='\n'.join(frame['details'])
    target=re.search(r'Copy Navigate to: ([^\n]+)',values)
    if not target:continue
    duration=int(re.search(r'Copy Duration: (\d+)ms',values)[1]);delay=int(re.search(r'Copy Delay: (\d+)ms',values)[1])
    assert 'Copy Easing: Linear' in values
    edges[frame['name']]={'target':target[1],'duration':duration,'delay':delay}
def sequence(start,stop):
    result=[{'time':0,'name':start,'particles':frames[start]}];now=0;current=start
    while True:
        edge=edges[current]
        now+=edge['delay']
        result.append({'time':now,'name':current,'particles':frames[current]})
        now+=edge['duration'];current=edge['target']
        result.append({'time':now,'name':current,'particles':frames[current]})
        if current==stop:break
        assert len(result)<50
    return result
intro=sequence('Landing 1920 px 1','Landing 1920 px 2.2')
loop=sequence('Landing 1920 px 2.2','Landing 1920 px 2.2')
copy=json.loads((ROOT/'src/design-text.json').read_text(encoding='utf-8'))
keys=['снежинка 8','снежинка луч 7','снежинка 6','снежинка луч 5','снежинка луч 4','снежинка 3','снежинка 2','снежинка луч 1']
base={key:value for key,value in zip(keys,copy['desktop']['snow'])}
data={'introDuration':intro[-1]['time'],'loopDuration':loop[-1]['time'],'intro':intro,'loop':loop,'base':base}
(ROOT/'src/motion-data.json').write_text(json.dumps(data,ensure_ascii=False,indent=2),encoding='utf-8')
print('Figma intro:',data['introDuration'],'ms; loop:',data['loopDuration'],'ms; tracks:',len(keys))
