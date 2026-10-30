import "./styles.css";
import "./refinements.css";
import "./layout.css";
import motion from "./motion-data.json";

// HTML is already present in index.html. JavaScript only enhances interactions.
const menuButton = document.querySelector(".menu-toggle");
const navigation = document.querySelector(".navigation");
function setMenu(open) {
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

function fillMissing(sequence, key) {
  return sequence.map((frame, index) => {
    if (frame.particles[key])
      return { ...frame.particles[key], time: frame.time };
    const previous = sequence
      .slice(0, index)
      .reverse()
      .find((f) => f.particles[key]);
    const next = sequence.slice(index + 1).find((f) => f.particles[key]);
    const consecutive = index > 0 && !sequence[index - 1].particles[key];
    const geometry =
      (consecutive && next
        ? next.particles[key]
        : previous?.particles[key] || next?.particles[key]) || motion.base[key];
    return { ...geometry, time: frame.time, opacity: 0 };
  });
}
function keyframes(sequence, key, area) {
  const base = motion.base[key];
  const length = sequence.at(-1).time;
  const vertical = area === "prizes" ? 0.65 : 1;
  return fillMissing(sequence, key).map((point) => ({
    offset: point.time / length,
    transform: `translate(calc(${point.x - base.x} * var(--u) * var(--motion-x-scale)),calc(${(point.y - base.y) * vertical} * var(--u) * var(--motion-y-scale))) scale(${point.w / base.w},${point.h / base.h})`,
    opacity: point.opacity,
  }));
}
function animateSnow() {
  for (const player of players) player.cancel();
  players.length = 0;
  if (query.get("motion") === "off" || reducedMotion.matches) return;
  const elapsed =
    sourceTime === null ? performance.now() - clockStart : sourceTime;
  for (const element of document.querySelectorAll(".snow-particle")) {
    if (!element.getClientRects().length) continue;
    const key = element.dataset.motionKey;
    const area = element.dataset.area;
    const loop = () => {
      const player = element.animate(keyframes(motion.loop, key, area), {
        duration: motion.loopDuration,
        iterations: Infinity,
        easing: "linear",
        fill: "both",
      });
      element.style.transformOrigin = "0 0";
      if (elapsed >= motion.introDuration)
        player.currentTime =
          (elapsed - motion.introDuration) % motion.loopDuration;
      if (sourceTime !== null) player.pause();
      players.push(player);
    };
    if (elapsed < motion.introDuration) {
      const player = element.animate(keyframes(motion.intro, key, area), {
        duration: motion.introDuration,
        easing: "linear",
        fill: "both",
      });
      player.currentTime = elapsed;
      element.style.transformOrigin = "0 0";
      if (sourceTime !== null) player.pause();
      else player.finished.then(loop).catch(() => {});
      players.push(player);
    } else loop();
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
