"""Prepare temporary static font instances for original SVG artwork rendering."""
from pathlib import Path
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont

ROOT=Path(__file__).resolve().parents[1]
output=ROOT/'design/fonts'
output.mkdir(parents=True,exist_ok=True)
for family in ('roboto','manrope','montserrat'):
    for subset in ('latin','cyrillic'):
        source=ROOT/'node_modules'/f'@fontsource-variable/{family}/files/{family}-{subset}-wght-normal.woff2'
        for weight in (400,500,600,700,800,900):
            font=instantiateVariableFont(TTFont(source),{'wght':weight})
            font.flavor=None
            font.save(output/f'{family}-{subset}-{weight}.ttf')
