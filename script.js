// Scenes run wide, pair, pair, wide...; a scene left alone in a pair row goes wide too.
function layout(visible) {
  visible.forEach((c, i) => {
    const slot = i % 3;
    c.classList.toggle("wide", slot === 0 || (slot === 1 && i === visible.length - 1));
  });
}

function filters() {
  const group = document.querySelector(".filters");
  if (!group) return;
  const buttons = group.querySelectorAll("button");
  const cards = [...document.querySelectorAll(".index .scene")];
  const status = document.querySelector(".index [role=status]");
  group.hidden = false;
  buttons.forEach(b => b.addEventListener("click", () => {
    const f = b.dataset.filter;
    buttons.forEach(x => x.setAttribute("aria-pressed", x === b));
    let shown = 0;
    cards.forEach(c => {
      // The spotlight project is already the feature at the top, so "All" leaves its scene out.
      const hit = f === "all" ? !("spotlight" in c.dataset) : c.dataset.kind.split(" ").includes(f);
      c.hidden = !hit;
      if (hit) shown++;
    });
    if (f === "all") shown = cards.length; // the spotlight counts: it is the feature at the top
    layout(cards.filter(c => !c.hidden));
    const name = b.firstChild.textContent.trim();
    status.textContent = `${name}: ${shown} ${shown === 1 ? "project" : "projects"} shown`;
  }));
}

function viewer() {
  const dialog = document.querySelector(".viewer");
  if (!dialog) return;
  const triggers = [...document.querySelectorAll("[data-shot]")];
  const shots = [];
  triggers.forEach(t => { shots[Number(t.dataset.shot)] = { src: t.dataset.src, caption: t.dataset.caption }; });
  const img = dialog.querySelector("img");
  let i = 0;
  const show = n => {
    i = (n + shots.length) % shots.length;
    img.src = shots[i].src;
    dialog.querySelector(".viewer-count").textContent = `${i + 1} / ${shots.length}`;
    dialog.querySelector(".viewer-caption").textContent = shots[i].caption;
  };
  triggers.forEach(t => t.addEventListener("click", e => {
    e.preventDefault();
    show(Number(t.dataset.shot));
    dialog.showModal();
  }));
  dialog.querySelector(".prev").addEventListener("click", () => show(i - 1));
  dialog.querySelector(".next").addEventListener("click", () => show(i + 1));
  dialog.querySelector(".viewer-close").addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", e => { if (e.target === dialog) dialog.close(); });
  dialog.addEventListener("keydown", e => {
    if (e.key === "ArrowLeft") show(i - 1);
    if (e.key === "ArrowRight") show(i + 1);
  });
  let startX = null;
  dialog.addEventListener("pointerdown", e => { startX = e.clientX; });
  dialog.addEventListener("pointercancel", () => { startX = null; });
  dialog.addEventListener("pointerup", e => {
    if (startX === null) return;
    const dx = e.clientX - startX;
    startX = null;
    if (Math.abs(dx) > 40) show(dx < 0 ? i + 1 : i - 1);
  });
}

filters();
viewer();

// Wide tables in posts scroll sideways on phones; make them reachable by keyboard.
document.querySelectorAll(".post-body table").forEach(t => {
  if (t.scrollWidth > t.clientWidth) t.tabIndex = 0;
});
