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
    if (trigger.dataset.dialog === "legal-dialog")
      dialog.querySelector("h2").textContent = trigger.textContent.trim();
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
  [...carousel.querySelectorAll("[data-card]")].forEach((card, index) =>
    card.setAttribute("aria-hidden", String(index >= visibleCards())),
  );
}
function rotateCarousel(carousel, direction) {
  const track = carousel.querySelector(".card-track");
  if (direction > 0) track.append(track.firstElementChild);
  else track.prepend(track.lastElementChild);
  describeCards(carousel);
}
for (const carousel of document.querySelectorAll(".carousel")) {
  carousel.addEventListener("click", (event) => {
    const button = event.target.closest("[data-carousel-direction]");
    if (button)
      rotateCarousel(carousel, Number(button.dataset.carouselDirection));
  });
  let startX;
  carousel.addEventListener(
    "touchstart",
    (event) => {
      startX = event.changedTouches[0].clientX;
    },
    { passive: true },
  );
  carousel.addEventListener(
    "touchend",
    (event) => {
      const distance = event.changedTouches[0].clientX - startX;
      if (Math.abs(distance) > 45)
        rotateCarousel(carousel, distance < 0 ? 1 : -1);
    },
    { passive: true },
  );
  describeCards(carousel);
}
for (const detail of document.querySelectorAll(".faq-item")) {
  detail.addEventListener("toggle", () => {
    if (detail.open)
      for (const other of document.querySelectorAll(".faq-item[open]"))
        if (other !== detail) other.open = false;
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
  "снежинка 2": { duration: 10000, entrance: 1100 },
  "снежинка 6": { duration: 11000, entrance: 1100 },
  "снежинка 8": { duration: 10800, entrance: 3500 },
  "снежинка 3": { duration: 10200, entrance: 5200 },
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
      const distance = (area === "prizes" ? 430 : 600) * unit * verticalScale + height;
      const start = -top - height;
      // Position is linear throughout, including the opacity fade. No hold frame.
      const at = (fraction, opacity) => ({
        offset: fraction,
        transform: `translateY(${start + distance * fraction}px)`,
        opacity,
      });
      const occurrence = occurrences.get(area + key) || 0;
      occurrences.set(area + key, occurrence + 1);
      player = element.animate([
        at(0, 0), at(0.12, 1), at(0.68, 1), at(1, 0),
      ], {
        duration: track.duration,
        delay: track.entrance + occurrence * track.duration / 2,
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
    for (const c of document.querySelectorAll(".carousel")) describeCards(c);
    if (visibleCards() === 3) setMenu(false);
    animateSnow();
  });
});
animateSnow();
