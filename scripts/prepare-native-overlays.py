"""Combine native Figma raster exports with the original text-free SVG fills.

The native base selection contains only the card's background mask and prize
photo/shadow. Capsule, circle and sparkle layers remain the original SVG nodes;
their UI text was removed by extract-artwork.py and is rendered as HTML.
"""
from pathlib import Path
import base64
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
NS = '{http://www.w3.org/2000/svg}'
ET.register_namespace('', NS[1:-1])
for base in (ROOT / 'design/exports/figma-png/base').glob('*.png'):
    source = ROOT / 'design/artwork' / (base.stem + '.svg')
    root = ET.parse(source).getroot()
    x, y, w, h = root.get('viewBox').split()
    card = next(e for e in root if e.tag == NS + 'g')
    for child in list(card):
        if child.get('id', '').startswith(('Mask group', 'приз')):
            card.remove(child)
    image = ET.Element(NS + 'image', {
        'x': x, 'y': y, 'width': w, 'height': h,
        'preserveAspectRatio': 'none',
        'href': 'data:image/png;base64,' + base64.b64encode(base.read_bytes()).decode(),
    })
    card.insert(0, image)
    target = source.with_stem(source.stem + '-native')
    ET.ElementTree(root).write(target, encoding='utf-8', xml_declaration=True)
    print(target.name)
