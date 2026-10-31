// HTML is already present in index.html. JavaScript only enhances interactions.
const menuButton = document.querySelector(".menu-toggle");
const navigation = document.querySelector(".navigation");
function setMenu(open) {
  document.querySelector(".landing").classList.toggle("menu-open", open);
  document.documentElement.classList.toggle("menu-is-open", open);
  navigation.classList.toggle("is-open", open);
  menuButton.classList.toggle("is-open", open);
  menuButton.setAttribute("aria-expanded", String(open));
  menuButton.setAttribute("aria-label", open ? "Закрыть меню" : "Открыть меню");
}
menuButton.addEventListener("click", () =>
  setMenu(menuButton.getAttribute("aria-expanded") !== "true"),
);
navigation.addEventListener("click", (event) => {
  if (event.target.closest("a, [data-dialog]")) setMenu(false);
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") setMenu(false);
});
document.addEventListener("click", (event) => {
  const trigger = event.target.closest("[data-dialog]");
  if (trigger) {
    const dialog = document.getElementById(trigger.dataset.dialog);
    dialog.showModal();
  }
  if (event.target.closest("[data-close-dialog]"))
    event.target.closest("dialog").close();
});
for (const dialog of document.querySelectorAll("dialog")) {
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });
}

function visibleCards() {
  return matchMedia("(max-width:767px)").matches
    ? 1
    : matchMedia("(max-width:1199px)").matches
      ? 2
      : 3;
}
function describeCards(carousel) {
  [...carousel.querySelectorAll("[data-card]:not([data-clone])")].forEach((card, index) =>
    card.setAttribute("aria-hidden", String(index >= visibleCards())),
  );
}

// Move a full card in 320 ms. A temporary copy fills the incoming edge;
// after the move the original card takes its place, keeping the loop seamless.
const carouselMoves = new Map();
function rotateCarousel(carousel, direction) {
  if (carouselMoves.has(carousel)) return;
  const track = carousel.querySelector(".card-track");
  const card = direction > 0 ? track.firstElementChild : track.lastElementChild;
  const reorder = () => direction > 0 ? track.append(card) : track.prepend(card);
  if (matchMedia("(prefers-reduced-motion:reduce)").matches) {
    reorder();
    describeCards(carousel);
    return;
  }
  const step = card.getBoundingClientRect().width + parseFloat(getComputedStyle(track).columnGap);
  const copy = card.cloneNode(true);
  copy.dataset.clone = "";
  copy.setAttribute("aria-hidden", "true");
  copy.inert = true;
  if (direction > 0) track.append(copy);
  else track.prepend(copy);
  carousel.setAttribute("aria-busy", "true");
  const move = track.animate([
    { transform: `translateX(${direction > 0 ? 0 : -step}px)` },
    { transform: `translateX(${direction > 0 ? -step : 0}px)` },
  ], { duration: 320, easing: "ease", fill: "both" });
  const finish = () => {
    if (!carouselMoves.has(carousel)) return;
    reorder();
    copy.remove();
    move.cancel();
    carouselMoves.delete(carousel);
    carousel.removeAttribute("aria-busy");
    describeCards(carousel);
  };
  carouselMoves.set(carousel, finish);
  move.finished.then(finish).catch(() => {});
}
for (const carousel of document.querySelectorAll(".carousel")) {
  carousel.addEventListener("click", (event) => {
    const button = event.target.closest("[data-carousel-direction]");
    if (button) rotateCarousel(carousel, Number(button.dataset.carouselDirection));
  });
  let startX, startY;
  carousel.addEventListener("touchstart", (event) => {
    startX = event.changedTouches[0].clientX;
    startY = event.changedTouches[0].clientY;
  }, { passive: true });
  carousel.addEventListener("touchend", (event) => {
    const dx = event.changedTouches[0].clientX - startX;
    const dy = event.changedTouches[0].clientY - startY;
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy))
      rotateCarousel(carousel, dx < 0 ? 1 : -1);
  }, { passive: true });
  describeCards(carousel);
}

function setQuestion(item, open) {
  item.classList.toggle("is-open", open);
  item.querySelector(".faq-question").setAttribute("aria-expanded", String(open));
  const answer = item.querySelector(".faq-reveal");
  answer.setAttribute("aria-hidden", String(!open));
  answer.inert = !open;
}
for (const question of document.querySelectorAll(".faq-question")) {
  question.addEventListener("click", () => {
    const item = question.closest(".faq-item");
    const open = !item.classList.contains("is-open");
    for (const other of document.querySelectorAll(".faq-item.is-open"))
      if (other !== item) setQuestion(other, false);
    setQuestion(item, open);
  });
}

const query = new URLSearchParams(location.search);
const reducedMotion = matchMedia("(prefers-reduced-motion:reduce)");
const clockStart = performance.now();
const players = [];
const sourceTime = query.has("motion-time")
  ? Number(query.get("motion-time"))
  : null;
if (query.get("motion") === "off")
  document.documentElement.classList.add("motion-off");

// Measured from the supplied Figma recording: four straight falling tracks,
// staggered entrances, and a fade during the final part of each descent.
// Each flake owns its repeat: later flakes never wait for the whole group.
const snowTracks = {
  "снежинка 2": { entrance: 1001, points: [[0,57,0],[100,62.8,1],[2001,173,1],[4002,293,1],[6003,381,1],[8004,461,0.6],[10005,541,0]] },
  "снежинка 6": { entrance: 1001, points: [[0,41,0],[100,46.2,1],[2001,145,1],[4002,215,1],[6003,325,1],[8004,465,0.5],[10005,605,0]] },
  "снежинка 8": { entrance: 3002, points: [[0,58,0],[100,61.45,1],[2001,127,1],[4002,242,1],[6003,362,1],[8004,492,0.5],[10005,622,0]] },
  "снежинка 3": { entrance: 5003, x: -30, points: [[0,35,0],[100,42.7,1],[2001,189,1],[4002,358,1],[6003,426,0.5],[8004,494,0]] },
};

// The recording also has two large glints. Keep their original geometry
// transitions separate from the revised, independently repeating snow.
function animateGlint(element, key, elapsed) {
  const left = key.endsWith("1");
  const base = left ? [147, 121, 107.434, 103] : [1612, 121, 116.821, 112];
  const frame = (offset, x, y, width, height) => ({
    offset,
    transform: `translate(calc(${x - base[0]} * var(--u) * var(--motion-x-scale)),calc(${y - base[1]} * var(--u) * var(--motion-y-scale))) scale(${width / base[2]},${height / base[3]})`,
  });
  const small = (offset, width = 90, height = 86) => frame(offset, left ? 177 : 1632, left ? 151 : 141, width, height);
  const large = (offset) => frame(offset, left ? 167 : 1632, 141, 107, 103);
  element.style.transformOrigin = "0 0";
  const repeat = (time = 0) => {
    const player = element.animate([
      small(0), small(2002 / 12107), large(4002 / 12107),
      large(12007 / 12107), small(1),
    ], { duration: 12107, iterations: Infinity, easing: "linear", fill: "both" });
    player.currentTime = time;
    if (sourceTime !== null) player.pause();
    players.push(player);
  };
  if (elapsed >= 3000) repeat(elapsed - 3000);
  else {
    const player = element.animate(left ? [small(0), small(1)] : [small(0, 70, 67), small(1 / 3, 80, 77), small(1)], {
      duration: 3000, easing: "linear", fill: "both",
    });
    player.currentTime = elapsed;
    if (sourceTime !== null) player.pause();
    else player.finished.then(() => repeat()).catch(() => {});
    players.push(player);
  }
}

function animateSnow() {
  for (const player of players) player.cancel();
  players.length = 0;
  if (query.get("motion") === "off" || reducedMotion.matches) return;
  const elapsed = sourceTime === null ? performance.now() - clockStart : sourceTime;
  const landing = document.querySelector(".landing");
  const designWidth = visibleCards() === 1 ? 430 : visibleCards() === 2 ? 1024 : 1920;
  const unit = landing.getBoundingClientRect().width / designWidth;
  const verticalScale = Number(getComputedStyle(landing).getPropertyValue("--motion-y-scale"));
  const occurrences = new Map();
  for (const element of document.querySelectorAll(".snow-particle")) {
    if (!element.getClientRects().length) continue;
    const key = element.dataset.motionKey;
    const area = element.dataset.area;
    const track = snowTracks[key];
    let player;
    if (track) {
      const style = getComputedStyle(element);
      const top = parseFloat(style.top);
      const height = parseFloat(style.height);
      const duration = track.points.at(-1)[0];
      const firstY = track.points[0][1];
      const frame = ([time, y, opacity]) => {
        let target = area === "prizes"
          ? -height + (y - firstY) * unit * verticalScale * 0.65
          : (y - 110) * unit * verticalScale;
        if (time === 0) target = Math.min(target, -height);
        return {
          offset: time / duration,
          transform: `translate(calc(${track.x || 0} * var(--u) * var(--motion-x-scale)),${target - top}px)`,
          opacity,
        };
      };
      const occurrence = occurrences.get(area + key) || 0;
      occurrences.set(area + key, occurrence + 1);
      player = element.animate(track.points.map(frame), {
        duration,
        delay: track.entrance + occurrence * duration / 2,
        iterations: Infinity,
        easing: "linear",
        fill: "both",
      });
    } else {
      if (key.endsWith("1") || key.endsWith("7")) animateGlint(element, key, elapsed);
      continue;
    }
    player.currentTime = elapsed;
    if (sourceTime !== null) player.pause();
    players.push(player);
  }
  for (const element of document.querySelectorAll(".hero .campaign-date, .hero .win-badge")) {
    const player = element.animate([{ opacity: 0 }, { opacity: 1 }], {
      duration: 1000, easing: "linear", fill: "both",
    });
    player.currentTime = elapsed;
    if (sourceTime !== null) player.pause();
    players.push(player);
  }
}
reducedMotion.addEventListener("change", animateSnow);
let resizeFrame;
window.addEventListener("resize", () => {
  cancelAnimationFrame(resizeFrame);
  resizeFrame = requestAnimationFrame(() => {
    for (const finish of [...carouselMoves.values()]) finish();
    for (const c of document.querySelectorAll(".carousel")) describeCards(c);
    if (visibleCards() === 3) setMenu(false);
    animateSnow();
  });
});
animateSnow();
