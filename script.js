function filters() {
  const group = document.querySelector(".filters");
  if (!group) return;
  const buttons = group.querySelectorAll("button");
  const cards = document.querySelectorAll(".index .card");
  const status = document.querySelector(".index [role=status]");
  group.hidden = false;
  buttons.forEach(b => b.addEventListener("click", () => {
    const f = b.dataset.filter;
    buttons.forEach(x => x.setAttribute("aria-pressed", x === b));
    let shown = 0;
    cards.forEach(c => {
      const hit = f === "all" || c.dataset.kind.split(" ").includes(f);
      c.hidden = !hit;
      if (hit) shown++;
    });
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
