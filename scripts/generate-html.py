"""One-time source authoring helper: emit editable, semantic, framework-free HTML."""
from pathlib import Path
import json, html, re

ROOT=Path(__file__).resolve().parents[1]
layouts=json.loads((ROOT/'design/layouts.json').read_text(encoding='utf-8'))
copy=json.loads((ROOT/'src/design-text.json').read_text(encoding='utf-8'))
for value in copy.values():
    for node in value['date']:
        for span in node['spans']: span['text']=span['text'].replace('16.11.2026','20.11.2026')
(ROOT/'src/design-text.json').write_text(json.dumps(copy,ensure_ascii=False,indent=2),encoding='utf-8')
esc=lambda s:html.escape(str(s),quote=True)
px=lambda n:f'calc({n:g} * var(--u))'
def image(name,alt='',ext='webp',attrs=''):
    return f'<img src="/assets/{name}.{ext}" alt="{esc(alt)}" {attrs}>'
def picture(name,alt='',ext='webp',cls=''):
    return f'<picture class="{cls}"><source media="(max-width: 767px)" srcset="/assets/mobile-{name}.{ext}"><source media="(max-width: 1199px)" srcset="/assets/tablet-{name}.{ext}">{image("desktop-"+name,alt,ext)}</picture>'
def positioned(group):
    output=[]
    for label,l in layouts.items():
        origin=l['header'] if group in ('rules','date') else l['footerY']
        nodes=[]
        for node in copy[label][group]:
            baseline={'Roboto':.841796875,'Manrope':.883,'Montserrat':.8585}[node['font']]
            for span in node['spans']:
                text=span['text'].replace('\n','')
                tag='span';attr=''
                if text.startswith('+375'):tag='a';attr=' href="tel:+375296585050"'
                elif text=='ПОЛНЫЕ ПРАВИЛА':tag='button';attr=' type="button" data-dialog="rules-dialog"'
                elif text in ['Положение о конфиденциальности','Условия использования','Политика cookie']:
                    tag='button';attr=' type="button" data-dialog="legal-dialog"'
                style=f"left:{px(span['x'])};top:{px(span['y']-origin-node['size']*baseline)};font-family:'{node['font']} Variable',sans-serif;font-size:{px(node['size'])};font-weight:{node['weight']};color:{node['color']};letter-spacing:{node.get('spacing','0em')}"
                if node['underline']:style+=';text-decoration:underline'
                nodes.append(f'<{tag} class="original-copy" style="{esc(style)}"{attr}>{esc(text)}</{tag}>')
        output.append(f'<div class="copy-{label}">'+''.join(nodes)+'</div>')
    return '\n'.join(output)
def snow(area):
    output=[]
    for label,l in layouts.items():
        if area=='hero':
            particles=copy[label]['snow'];origin=l['header']
        elif label=='desktop':
            particles=[dict(x=x,y=y,w=w,h=h,kind='snowflake') for x,y,w,h in [(31,37,80,77),(25,209,55,53),(101,369,42,40),(1711,37,80,77),(1838,209,55,53),(1782,369,42,40)]];origin=0
        else:
            particles=[dict(x=10,y=40,w=28,h=27,kind='snowflake'),dict(x=l['width']-44,y=82,w=34,h=33,kind='snowflake')];origin=0
        children=[]
        # Exported desktop order follows the original frame's layer order.
        desktop_keys=['снежинка 8','снежинка луч 7','снежинка 6','снежинка луч 5','снежинка луч 4','снежинка 3','снежинка 2','снежинка луч 1']
        mobile_keys=['снежинка 8','снежинка 6','снежинка луч 7','снежинка 3','снежинка 2','снежинка луч 1']
        for i,p in enumerate(particles):
            if area=='prizes':key=['снежинка 3','снежинка 2','снежинка 8','снежинка 6'][i%4]
            else:key=(mobile_keys if label=='mobile' else desktop_keys)[i]
            kind='desktop-sparkle' if 'луч' in key else 'desktop-snow-'+key.split()[-1]
            style=f"left:{px(p['x'])};top:{px(p['y']-origin)};width:{px(p['w'])};height:{px(p['h'])}"
            children.append(image(kind,'','webp',f'class="snow-particle" data-motion-key="{key}" data-area="{area}" style="{style}"'))
        output.append(f'<div class="copy-{label}">'+''.join(children)+'</div>')
    return f'<div class="snow-layer {"snow-layer--prizes" if area=="prizes" else ""}" aria-hidden="true">'+''.join(output)+'</div>'

nav=''.join(f'<a href="#{id}">{text}</a>' for id,text in [('rules','Правила'),('prizes','Призы'),('products','Игровые товары'),('faq','Вопрос-ответ'),('winners','Победители')])
prize_data=[('milka','ПОДАРОЧНЫЙ НАБОР «MILKA»',300),('100','СЕРТИФИКАТ МАГАЗИНА «GREEN»',40),('50','СЕРТИФИКАТ МАГАЗИНА «GREEN»',64)]
prizes=[]
for id,title,count in prize_data:
    pic=picture('prize-milka','Подарочный набор Milka') if id=='milka' else (f'<picture><source media="(min-width:768px) and (max-width:1199px)" srcset="/assets/tablet-prize-100.webp">{image("desktop-prize-100","Сертификат GREEN на 100 рублей")}</picture>' if id=='100' else image('desktop-prize-50','Сертификат GREEN на 50 рублей'))
    prizes.append(f'<article class="prize-card prize-card--{id}" data-card>{pic}<h3>{title}</h3><span class="prize-count"><small>х</small>{count}</span></article>')
products=[]
for id,brand in [('milka','Milka'),('alpen','Alpen Gold'),('barni','Медвежонок Барни')]:
    pic=picture('product-milka','Игровые товары Milka') if id=='milka' else (f'<picture><source media="(min-width:768px) and (max-width:1199px)" srcset="/assets/tablet-product-alpen.webp">{image("desktop-product-alpen","Игровые товары Alpen Gold")}</picture>' if id=='alpen' else image('desktop-product-barni','Игровые товары Медвежонок Барни'))
    products.append(f'<article class="product-card" data-card>{pic}<h3>Продукция<br>«{brand}»<br>в ассортименте</h3></article>')
def arrows(name):
    return ''.join(f'<button type="button" class="carousel-arrow carousel-arrow--{direction}" data-carousel-direction="{delta}" aria-label="{label} {name}">{image("desktop-arrow","","svg")}</button>' for direction,delta,label in [('prev',-1,'Предыдущие'),('next',1,'Следующие')])
questions=['Кто может принять участие в рекламной игре?','Когда проходит Рекламная игра?','Как стать участником Рекламной игры?','Что делать, если игровые коды не начислены в Личном кабинете?','Какие товары необходимо приобрести для участия в Рекламной игре?','Когда проходят розыгрыши призов?','Как узнать о результатах розыгрыша?','Где и когда можно получить приз?']
answers=['К участию в Рекламной игре приглашаются все граждане Республики Беларусь, а также иностранные граждане и лица без гражданства.','Начало рекламной игры — 20 ноября 2026 года.','Подтвердите согласие на участие в личном кабинете, покупайте игровые товары с картой «GREENКАРТА» и участвуйте в розыгрыше.','Обратитесь на горячую линию: +375 (29) 658 50 50.','В игре участвует продукция Milka, Alpen Gold и «Медвежонок Барни», представленная в разделе «Игровые товары».','Информация о датах розыгрышей будет опубликована организатором.','Результаты будут опубликованы в разделе «Победители».','Порядок получения призов уточняйте на горячей линии: +375 (29) 658 50 50.']
faq=''.join(f'<details class="faq-item" {"open" if i==0 else ""}><summary class="faq-question"><span>{q}</span>{image("desktop-caret","","svg")}</summary><div class="faq-answer">{answers[i]}</div></details>' for i,q in enumerate(questions))
dialogs=[]
for id,title,body in [('account','Личный кабинет','Личный кабинет пока недоступен.'),('winners','Победители','Результаты розыгрышей пока не опубликованы.'),('rules','Правила участия','Подтвердите согласие на участие в личном кабинете, приобретайте игровые товары и участвуйте в розыгрыше призов. 1 игровой код за каждые 2 рубля стоимости игровых товаров в чеке. Полное положение об игре можно уточнить на горячей линии +375 (29) 658 50 50.'),('legal','Документ','Документ будет доступен после предоставления организатором.')]:
    dialogs.append(f'<dialog id="{id}-dialog" class="modal" aria-labelledby="{id}-title"><div class="modal-inner"><button class="modal-close" type="button" data-close-dialog>Закрыть</button><h2 id="{id}-title">{title}</h2><p>{body}</p></div></dialog>')
markup=f'''<!doctype html>
<html lang="ru"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>GREEN — Сладкий сезон больших подарков</title><meta name="description" content="Рекламная игра GREEN. Сладкий сезон больших подарков: GEELY EX2, подарочные наборы Milka и сертификаты GREEN."></head>
<body><div class="landing">
<header class="site-header"><a class="header-logo" href="#top" aria-label="GREEN — на главную">{image('desktop-logo','Green','svg')}</a><nav class="navigation" id="main-navigation" aria-label="Основная навигация">{nav}<button type="button" class="account-link mobile-only" data-dialog="account-dialog">Личный кабинет</button></nav><button type="button" class="account-link desktop-account" data-dialog="account-dialog">{image('desktop-profile','','svg')}Личный кабинет</button><button type="button" class="menu-toggle" aria-label="Открыть меню" aria-controls="main-navigation" aria-expanded="false">{image('mobile-menu','','svg')}</button></header>
<main id="top"><section class="hero" aria-labelledby="campaign-title"><h1 id="campaign-title" class="sr-only">Сладкий сезон больших подарков — рекламная игра GREEN</h1>{picture('hero','Выиграй GEELY EX2 и сотни других призов',cls='hero-art')}{snow('hero')}{positioned('date')}<span id="rules" class="rules-anchor"></span><div class="rules-copy">{picture('rules',ext='svg',cls='rules-art')}{positioned('rules')}</div></section>
<section class="prizes-section" id="prizes" aria-labelledby="prizes-title">{snow('prizes')}<h2 id="prizes-title" class="section-heading">ПРИЗЫ</h2>{picture('grand-prize','Главный приз — автомобиль GEELY EX2',cls='grand-prize')}<div class="carousel prize-carousel" aria-roledescription="карусель" aria-label="Призы"><div class="card-track" aria-live="polite">{''.join(prizes)}</div>{arrows('призы')}</div></section>
<section class="products-section" id="products" aria-labelledby="products-title"><h2 id="products-title" class="section-heading">ИГРОВЫЕ ТОВАРЫ</h2><div class="carousel product-carousel" aria-roledescription="карусель" aria-label="Игровые товары"><div class="card-track" aria-live="polite">{''.join(products)}</div>{arrows('товары')}</div></section>
<section class="faq-section" id="faq" aria-labelledby="faq-title"><h2 id="faq-title" class="section-heading">ВОПРОС-ОТВЕТ</h2><div class="faq-list">{faq}</div></section>
<section class="winners-section" id="winners"><button type="button" class="winners-button" data-dialog="winners-dialog">{image('desktop-winner-stars','','svg')}<span>ПОБЕДИТЕЛИ</span>{image('desktop-winner-stars','','svg')}</button></section></main>
<footer class="site-footer">{image('desktop-logo','Green','svg','class="footer-logo"')}{positioned('footer')}<div class="store-badges"><a href="https://apps.apple.com/search?term=GREEN" target="_blank" rel="noreferrer" aria-label="Найти приложение GREEN в App Store">{image('desktop-app-store','Download on the App Store')}</a><a href="https://play.google.com/store/search?q=GREEN&amp;c=apps" target="_blank" rel="noreferrer" aria-label="Найти приложение GREEN в Google Play">{image('desktop-google-play','Download on Google Play')}</a></div></footer>
{''.join(dialogs)}</div><script type="module" src="/src/main.js"></script></body></html>'''
(ROOT/'index.html').write_text(markup,encoding='utf-8')

css=[]
for label,l in layouts.items():
    hero_end=l['header']+l['hero'];products_y=hero_end+l['prizes'];faq_y=products_y+l['products']
    values={**l,'headingPrizeTop':l['headingPrize']-hero_end,'headingProductTop':l['headingProduct']-products_y,'headingFaqTop':l['headingFaq']-faq_y,'winnerTop':l['winnerY']-(faq_y+l['faq']),'rulesTop':l['rulesY']-l['header'],'ruleAnchorTop':{'desktop':1049,'tablet':773,'mobile':603}[label]-l['header']}
    props=''.join(f'--{key}:{px(value)};' for key,value in values.items() if key!='width')
    scale={'desktop':1,'tablet':.7,'mobile':.54}[label]
    props=f'--u:calc(min(100vw,1920px) / {l["width"]});--motion-x-scale:{scale};--motion-y-scale:{scale};'+props
    rule=f'.landing{{{props}}}'
    if label=='tablet':rule='@media(min-width:768px) and (max-width:1199px){'+rule+'}'
    elif label=='mobile':rule='@media(max-width:767px){'+rule+'}'
    css.append(rule)
css.append('''
.site-header{height:var(--header)}.hero{height:var(--hero)}.prizes-section{height:var(--prizes)}.products-section{height:var(--products)}.faq-section{min-height:var(--faq)}.winners-section{height:var(--winners)}.site-footer{height:var(--footer)}
.rules-anchor{top:var(--ruleAnchorTop)}.rules-art{left:var(--rulesX);top:var(--rulesTop);width:var(--rulesW);height:var(--rulesH)}
#prizes-title{top:var(--headingPrizeTop)}#products-title{top:var(--headingProductTop)}#faq-title{top:var(--headingFaqTop)}
.grand-prize{top:var(--prizeTop);height:var(--prizeHeight)}.prize-carousel{top:var(--cardsTop);height:var(--cardHeight)}.prize-card{width:var(--cardWidth);height:var(--cardHeight)}.product-carousel{top:var(--productTop);height:var(--productHeight)}.product-card{width:var(--productWidth);height:var(--productHeight)}.faq-list{width:var(--faqWidth);margin-top:var(--faqTop)}.winners-button{width:var(--winnerW);height:var(--winnerH);top:var(--winnerTop)}
.hero-art>img,.rules-art>img,.grand-prize>img,.prize-card>picture,.product-card>picture,.prize-card>picture>img,.product-card>picture>img{display:block;width:100%;height:100%;max-width:none}.copy-desktop{display:contents}.copy-tablet,.copy-mobile{display:none}.mobile-only,.menu-toggle{display:none}summary{list-style:none}summary::-webkit-details-marker{display:none}.faq-answer[hidden]{display:none}
@media(min-width:768px) and (max-width:1199px){.copy-desktop{display:none}.copy-tablet{display:contents}}
@media(max-width:767px){.copy-desktop{display:none}.copy-mobile{display:contents}.desktop-account{display:none}.mobile-only{display:flex}}
@media(max-width:1199px){.menu-toggle{display:flex}}
''')
(ROOT/'src/layout.css').write_text('\n'.join(css),encoding='utf-8')
print('Generated editable HTML and CSS; no client-side renderer.')
