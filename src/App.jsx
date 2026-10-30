import { useEffect, useRef, useState } from "react";
import designText from "./design-text.json";

const asset = (name, ext = "webp") => `/assets/${name}.${ext}`;
const navigation = [
  ["rules", "Правила"],
  ["prizes", "Призы"],
  ["products", "Игровые товары"],
  ["faq", "Вопрос-ответ"],
  ["winners", "Победители"],
];
const layouts = {
  desktop: {
    width: 1920,
    header: 110,
    hero: 1418,
    prizes: 1170,
    products: 714,
    faq: 1080,
    winners: 356,
    footer: 571,
    prizeTop: 223,
    prizeHeight: 525,
    cardsTop: 768,
    cardHeight: 400,
    cardWidth: 480,
    productTop: 228,
    productHeight: 484,
    productWidth: 480,
    faqTop: 228,
    faqWidth: 1480,
    footerY: 4848,
    rulesY: 1146,
    rulesX: 220,
    rulesW: 1480,
    rulesH: 320,
    headingPrize: 1660,
    headingProduct: 2831,
    headingFaq: 3545,
    winnerY: 4608,
    winnerH: 120,
    winnerW: 660,
  },
  tablet: {
    width: 1024,
    header: 100,
    hero: 1016,
    prizes: 982,
    products: 691,
    faq: 1000,
    winners: 248,
    footer: 552,
    prizeTop: 148,
    prizeHeight: 386,
    cardsTop: 550,
    cardHeight: 386,
    cardWidth: 480,
    productTop: 160,
    productHeight: 484,
    productWidth: 480,
    faqTop: 102,
    faqWidth: 974,
    footerY: 4037,
    rulesY: 841,
    rulesX: 25,
    rulesW: 974,
    rulesH: 235,
    headingPrize: 1200.77,
    headingProduct: 2183,
    headingFaq: 2874,
    winnerY: 3856,
    winnerH: 102,
    winnerW: 602,
  },
  mobile: {
    width: 430,
    header: 100,
    hero: 971,
    prizes: 846,
    products: 650,
    faq: 936,
    winners: 198,
    footer: 938,
    prizeTop: 130,
    prizeHeight: 330,
    cardsTop: 472,
    cardHeight: 330,
    cardWidth: 400,
    productTop: 130,
    productHeight: 403,
    productWidth: 400,
    faqTop: 77,
    faqWidth: 400,
    footerY: 3701,
    rulesY: 681,
    rulesX: 15,
    rulesW: 400,
    rulesH: 365,
    headingPrize: 1144,
    headingProduct: 1990,
    headingFaq: 2571,
    winnerY: 3551,
    winnerH: 70,
    winnerW: 360,
  },
};
const questions = [
  "Кто может принять участие в рекламной игре?",
  "Когда проходит Рекламная игра?",
  "Как стать участником Рекламной игры?",
  "Что делать, если игровые коды не начислены в Личном кабинете?",
  "Какие товары необходимо приобрести для участия в Рекламной игре?",
  "Когда проходят розыгрыши призов?",
  "Как узнать о результатах розыгрыша?",
  "Где и когда можно получить приз?",
];
const initialAnswer =
  "К участию в Рекламной игре приглашаются все граждане Республики Беларусь, а также иностранные граждане и лица без гражданства.";
const prizes = [
  {
    id: "milka",
    title: "ПОДАРОЧНЫЙ НАБОР «MILKA»",
    count: 300,
    alt: "Подарочный набор сладостей Milka",
  },
  {
    id: "100",
    title: "СЕРТИФИКАТ МАГАЗИНА «GREEN»",
    count: 40,
    alt: "Подарочный сертификат GREEN на 100 рублей",
  },
  {
    id: "50",
    title: "СЕРТИФИКАТ МАГАЗИНА «GREEN»",
    count: 64,
    alt: "Подарочный сертификат GREEN на 50 рублей",
  },
];
const products = [
  { id: "milka", brand: "Milka" },
  { id: "alpen", brand: "Alpen Gold" },
  { id: "barni", brand: "Медвежонок Барни" },
];

function useLayout() {
  const get = () =>
    window.innerWidth <= 767
      ? "mobile"
      : window.innerWidth <= 1199
        ? "tablet"
        : "desktop";
  const [layout, setLayout] = useState(get);
  useEffect(() => {
    const handler = () => setLayout(get());
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  return layout;
}
const px = (value) => `calc(${value} * var(--u))`;
function OriginalCopy({ nodes, origin = 0, onAction }) {
  return nodes.flatMap((node, i) =>
    node.spans.map((span, j) => {
      const content = span.text.replace(/\n/g, "");
      const baseline =
        { Roboto: 0.841796875, Manrope: 0.883, Montserrat: 0.8585 }[
          node.font
        ] || 0.841796875;
      const isRules = content === "ПОЛНЫЕ ПРАВИЛА";
      const isPhone = content.startsWith("+375");
      const isLegal =
        /Положение о конфиденциальности|Условия использования|Политика cookie/.test(
          content,
        );
      const Tag = isRules || isLegal ? "button" : isPhone ? "a" : "span";
      return (
        <Tag
          key={`${i}-${j}`}
          className="original-copy"
          href={isPhone ? "tel:+375296585050" : undefined}
          onClick={
            isRules || isLegal
              ? () => onAction(isRules ? "rules" : content)
              : undefined
          }
          style={{
            left: px(span.x),
            top: px(span.y - origin - node.size * baseline),
            fontFamily: `'${node.font} Variable', sans-serif`,
            fontSize: px(node.size),
            fontWeight: node.weight,
            letterSpacing: node.spacing,
            color: node.color,
            textDecoration: node.underline ? "underline" : undefined,
          }}
        >
          {content}
        </Tag>
      );
    }),
  );
}
function Snow({ items, origin = 0, second = false }) {
  return (
    <div
      className={`snow-layer ${second ? "snow-layer--prizes" : ""}`}
      aria-hidden="true"
    >
      {items.map((flake, i) => (
        <img
          key={i}
          className="snow-particle"
          src={asset(`desktop-${flake.kind}`)}
          alt=""
          style={{
            left: px(flake.x),
            top: px(flake.y - origin),
            width: px(flake.w),
            height: px(flake.h),
            "--fall": px(second ? 410 : 680),
            "--duration": `${8 + i * 0.6}s`,
            "--delay": `${i * 0.47}s`,
            "--drift": px((i % 2 ? 1 : -1) * (20 + i * 4)),
          }}
        />
      ))}
    </div>
  );
}
function Arrow({ direction, onClick, label }) {
  return (
    <button
      className={`carousel-arrow carousel-arrow--${direction}`}
      onClick={onClick}
      aria-label={label}
    >
      <img src={asset("desktop-arrow", "svg")} alt="" />
    </button>
  );
}
function AppDialog({ kind, onClose }) {
  const ref = useRef(null);
  useEffect(() => {
    const dialog = ref.current;
    dialog.showModal();
    return () => dialog.close();
  }, []);
  const title =
    kind === "account"
      ? "Личный кабинет"
      : kind === "winners"
        ? "Победители"
        : kind === "rules"
          ? "Полные правила"
          : kind;
  return (
    <dialog
      ref={ref}
      className="modal"
      onCancel={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
    >
      <div className="modal-inner">
        <button className="modal-close" aria-label="Закрыть" onClick={onClose}>
          Закрыть
        </button>
        <h2>{title}</h2>
        {kind === "winners" ? (
          <p>Результаты розыгрышей пока не опубликованы.</p>
        ) : kind === "account" ? (
          <p>Личный кабинет пока недоступен.</p>
        ) : kind === "rules" ? (
          <>
            <p>
              Подтвердите согласие на участие в личном кабинете, приобретайте
              игровые товары и участвуйте в розыгрыше призов.
            </p>
            <p>
              1 игровой код за каждые 2 рубля стоимости игровых товаров в чеке.
            </p>
            <p>
              Для получения полного положения об игре обратитесь на горячую
              линию: <a href="tel:+375296585050">+375 (29) 658 50 50</a>.
            </p>
          </>
        ) : (
          <p>Документ будет доступен после предоставления организатором.</p>
        )}
      </div>
    </dialog>
  );
}
export function App() {
  const layout = useLayout();
  const l = layouts[layout];
  const copy = designText[layout];
  const [menu, setMenu] = useState(false);
  const [dialog, setDialog] = useState(null);
  const [prizeIndex, setPrizeIndex] = useState(0);
  const [productIndex, setProductIndex] = useState(0);
  const [expanded, setExpanded] = useState(0);
  const visible = layout === "desktop" ? 3 : layout === "tablet" ? 2 : 1;
  const motionOff =
    new URLSearchParams(window.location.search).get("motion") === "off";
  const rotate = (set, index, direction) => set((index + direction + 3) % 3);
  const cardAsset = (type, id) => {
    const specific =
      type === "product"
        ? id === "milka" || (layout === "tablet" && id === "alpen")
        : id === "milka" || (layout === "tablet" && id === "100");
    return asset(`${specific ? layout : "desktop"}-${type}-${id}`);
  };
  const secondSnow =
    layout === "desktop"
      ? [
          { x: 31, y: 37, w: 80, h: 77, kind: "snowflake" },
          { x: 25, y: 209, w: 55, h: 53, kind: "snowflake" },
          { x: 101, y: 369, w: 42, h: 40, kind: "snowflake" },
          { x: 1711, y: 37, w: 80, h: 77, kind: "snowflake" },
          { x: 1838, y: 209, w: 55, h: 53, kind: "snowflake" },
          { x: 1782, y: 369, w: 42, h: 40, kind: "snowflake" },
        ]
      : [
          { x: 10, y: 40, w: 28, h: 27, kind: "snowflake" },
          { x: l.width - 44, y: 82, w: 34, h: 33, kind: "snowflake" },
        ];
  const answers = [
    initialAnswer,
    layout === "desktop"
      ? "Покупайте игровые товары с 20 ноября 2026 года по 14 января 2027 года."
      : "Покупайте игровые товары с 16 ноября 2026 года по 10 января 2027 года.",
    "Подтвердите согласие на участие в личном кабинете, покупайте игровые товары с картой «GREENКАРТА» и участвуйте в розыгрыше.",
    "Обратитесь на горячую линию: +375 (29) 658 50 50.",
    "В игре участвует продукция Milka, Alpen Gold и «Медвежонок Барни», представленная в разделе «Игровые товары».",
    "Информация о датах розыгрышей будет опубликована организатором.",
    "Результаты будут опубликованы в разделе «Победители».",
    "Порядок получения призов уточняйте на горячей линии: +375 (29) 658 50 50.",
  ];
  const heroEnd = l.header + l.hero,
    productsY = heroEnd + l.prizes,
    faqY = productsY + l.products;
  return (
    <div
      className={`landing layout-${layout} ${motionOff ? "motion-off" : ""}`}
      style={{ "--u": `calc(min(100vw, 1920px) / ${l.width})` }}
    >
      <header className="site-header" style={{ height: px(l.header) }}>
        <a className="header-logo" href="#top" aria-label="GREEN — на главную">
          <img src={asset("desktop-logo", "svg")} alt="Green" />
        </a>
        <nav
          className={menu ? "navigation is-open" : "navigation"}
          aria-label="Основная навигация"
        >
          {navigation.map(([id, title]) => (
            <a key={id} href={`#${id}`} onClick={() => setMenu(false)}>
              {title}
            </a>
          ))}
          {layout === "mobile" && (
            <button
              className="account-link"
              onClick={() => {
                setMenu(false);
                setDialog("account");
              }}
            >
              Личный кабинет
            </button>
          )}
        </nav>
        {layout !== "mobile" && (
          <button className="account-link" onClick={() => setDialog("account")}>
            <img src={asset("desktop-profile", "svg")} alt="" />
            Личный кабинет
          </button>
        )}
        {layout !== "desktop" && (
          <button
            className={`menu-toggle ${menu ? "is-open" : ""}`}
            aria-label={menu ? "Закрыть меню" : "Открыть меню"}
            aria-expanded={menu}
            onClick={() => setMenu(!menu)}
          >
            <img src={asset("mobile-menu", "svg")} alt="" />
          </button>
        )}
      </header>
      <main id="top">
        <section
          className="hero"
          aria-labelledby="campaign-title"
          style={{ height: px(l.hero) }}
        >
          <h1 id="campaign-title" className="sr-only">
            Сладкий сезон больших подарков — рекламная игра GREEN
          </h1>
          <img
            className="hero-art"
            src={asset(`${layout}-hero`)}
            alt="Выиграй GEELY EX2 и сотни других призов"
            fetchPriority="high"
          />
          <Snow items={copy.snow} origin={l.header} />
          <OriginalCopy nodes={copy.date} origin={l.header} />
          <span
            id="rules"
            className="rules-anchor"
            style={{
              top: px(
                { desktop: 1049, tablet: 773, mobile: 603 }[layout] - l.header,
              ),
            }}
          />
          <div className="rules-copy">
            <img
              className="rules-art"
              src={asset(`${layout}-rules`, "svg")}
              alt=""
              style={{
                left: px(l.rulesX),
                top: px(l.rulesY - l.header),
                width: px(l.rulesW),
                height: px(l.rulesH),
              }}
            />
            <OriginalCopy
              nodes={copy.rules}
              origin={l.header}
              onAction={setDialog}
            />
          </div>
        </section>
        <section
          id="prizes"
          className="prizes-section"
          aria-labelledby="prizes-title"
          style={{ height: px(l.prizes) }}
        >
          <Snow items={secondSnow} second />
          <h2
            id="prizes-title"
            className="section-heading"
            style={{ top: px(l.headingPrize - heroEnd) }}
          >
            ПРИЗЫ
          </h2>
          <img
            className="grand-prize"
            src={asset(`${layout}-grand-prize`)}
            alt="Главный приз — автомобиль GEELY EX2"
            style={{ top: px(l.prizeTop), height: px(l.prizeHeight) }}
          />
          <div
            className="carousel prize-carousel"
            style={{ top: px(l.cardsTop), height: px(l.cardHeight) }}
            aria-roledescription="карусель"
            aria-label="Призы"
          >
            <div className="card-track" aria-live="polite">
              {Array.from({ length: visible }, (_, offset) => {
                const p = prizes[(prizeIndex + offset) % 3];
                return (
                  <article
                    key={p.id}
                    className={`prize-card prize-card--${p.id}`}
                    style={{ width: px(l.cardWidth), height: px(l.cardHeight) }}
                  >
                    <img src={cardAsset("prize", p.id)} alt={p.alt} />
                    <h3>{p.title}</h3>
                    <span className="prize-count">
                      <small>х</small>
                      {p.count}
                    </span>
                  </article>
                );
              })}
            </div>
            <Arrow
              direction="prev"
              onClick={() => rotate(setPrizeIndex, prizeIndex, -1)}
              label="Предыдущие призы"
            />
            <Arrow
              direction="next"
              onClick={() => rotate(setPrizeIndex, prizeIndex, 1)}
              label="Следующие призы"
            />
          </div>
        </section>
        <section
          id="products"
          className="products-section"
          aria-labelledby="products-title"
          style={{ height: px(l.products) }}
        >
          <h2
            id="products-title"
            className="section-heading"
            style={{ top: px(l.headingProduct - productsY) }}
          >
            ИГРОВЫЕ ТОВАРЫ
          </h2>
          <div
            className="carousel product-carousel"
            style={{ top: px(l.productTop), height: px(l.productHeight) }}
            aria-roledescription="карусель"
            aria-label="Игровые товары"
          >
            <div className="card-track" aria-live="polite">
              {Array.from({ length: visible }, (_, offset) => {
                const p = products[(productIndex + offset) % 3];
                return (
                  <article
                    key={p.id}
                    className="product-card"
                    style={{
                      width: px(l.productWidth),
                      height: px(l.productHeight),
                    }}
                  >
                    <img
                      src={cardAsset("product", p.id)}
                      alt={`Игровые товары ${p.brand}`}
                    />
                    <h3>
                      Продукция
                      <br />«{p.brand}»<br />в ассортименте
                    </h3>
                  </article>
                );
              })}
            </div>
            <Arrow
              direction="prev"
              onClick={() => rotate(setProductIndex, productIndex, -1)}
              label="Предыдущие товары"
            />
            <Arrow
              direction="next"
              onClick={() => rotate(setProductIndex, productIndex, 1)}
              label="Следующие товары"
            />
          </div>
        </section>
        <section
          id="faq"
          className="faq-section"
          aria-labelledby="faq-title"
          style={{ minHeight: px(l.faq) }}
        >
          <h2
            id="faq-title"
            className="section-heading"
            style={{ top: px(l.headingFaq - faqY) }}
          >
            ВОПРОС-ОТВЕТ
          </h2>
          <div
            className="faq-list"
            style={{ width: px(l.faqWidth), marginTop: px(l.faqTop) }}
          >
            {questions.map((question, index) => (
              <div
                className={`faq-item ${expanded === index ? "is-expanded" : ""}`}
                key={question}
              >
                <button
                  className="faq-question"
                  aria-expanded={expanded === index}
                  aria-controls={`answer-${index}`}
                  onClick={() => setExpanded(expanded === index ? null : index)}
                >
                  <span>{question}</span>
                  <img src={asset("desktop-caret", "svg")} alt="" />
                </button>
                <div
                  id={`answer-${index}`}
                  className="faq-answer"
                  hidden={expanded !== index}
                >
                  {answers[index]}
                </div>
              </div>
            ))}
          </div>
        </section>
        <section
          id="winners"
          className="winners-section"
          style={{ height: px(l.winners) }}
        >
          <button
            className="winners-button"
            onClick={() => setDialog("winners")}
            style={{
              width: px(l.winnerW),
              height: px(l.winnerH),
              top: px(l.winnerY - (faqY + l.faq)),
            }}
          >
            <img src={asset("desktop-winner-stars", "svg")} alt="" />
            <span>ПОБЕДИТЕЛИ</span>
            <img src={asset("desktop-winner-stars", "svg")} alt="" />
          </button>
        </section>
      </main>
      <footer className="site-footer" style={{ height: px(l.footer) }}>
        <img
          className="footer-logo"
          src={asset("desktop-logo", "svg")}
          alt="Green"
        />
        <OriginalCopy
          nodes={copy.footer}
          origin={l.footerY}
          onAction={setDialog}
        />
        <div className="store-badges">
          <a
            href="https://apps.apple.com/search?term=GREEN%20%D0%BA%D0%B0%D1%80%D1%82%D0%B0"
            target="_blank"
            rel="noreferrer"
            aria-label="Найти приложение GREEN в App Store"
          >
            <img
              src={asset("desktop-app-store")}
              alt="Download on the App Store"
            />
          </a>
          <a
            href="https://play.google.com/store/search?q=GREEN%20%D0%BA%D0%B0%D1%80%D1%82%D0%B0&c=apps"
            target="_blank"
            rel="noreferrer"
            aria-label="Найти приложение GREEN в Google Play"
          >
            <img
              src={asset("desktop-google-play")}
              alt="Download on Google Play"
            />
          </a>
        </div>
      </footer>
      {dialog && <AppDialog kind={dialog} onClose={() => setDialog(null)} />}
    </div>
  );
}
