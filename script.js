function esc(s) {
  return String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
}

function slideshow() {
  const section = document.getElementById("work");
  const list = section.querySelector(".slides");
  const dots = section.querySelector(".dots");
  const pause = section.querySelector(".pause");
  let index = 0;
  let count = 0;
  let paused = false;
  fetch("featured.json").then(r => {
    if (!r.ok) throw new Error("bad response");
    return r.json();
  }).then(items => {
    count = items.length;
    const total = String(count).padStart(2, "0");
    list.innerHTML = items.map((p, i) => `<li role="group" aria-roledescription="slide" aria-label="${i + 1} of ${count}">
      <img src="${esc(p.image)}" alt="${esc(p.name)}" width="1440" height="900"${i ? ' loading="lazy"' : ""}>
      <div class="slide-meta"><span class="slide-count">${String(i + 1).padStart(2, "0")} / ${total}</span>
      <span class="slide-name">${esc(p.name)}</span>
      <span class="slide-links">${p.links.map(l => `<a href="${esc(l.href)}">${esc(l.label)} ↗</a>`).join("")}</span></div></li>`).join("");
    dots.innerHTML = items.map((_, i) => `<button aria-label="Slide ${i + 1}"></button>`).join("");
    dots.querySelectorAll("button").forEach((b, i) => b.addEventListener("click", () => goTo(i)));
    section.querySelector(".prev").addEventListener("click", () => goTo(index - 1));
    section.querySelector(".next").addEventListener("click", () => goTo(index + 1));
    update();
    if (!matchMedia("(prefers-reduced-motion: reduce)").matches) {
      pause.hidden = false;
      pause.addEventListener("click", () => { paused = !paused; update(); });
      setInterval(() => {
        if (paused || section.matches(":hover") || section.contains(document.activeElement)) return;
        goTo(index + 1);
      }, 6000);
    } else {
      paused = true;
      update();
    }
  }).catch(() => {
    section.querySelectorAll(".arrow, .controls").forEach(el => el.remove());
    list.innerHTML = `<li><a href="https://github.com/RepousiosJim">See our work on GitHub</a></li>`;
  });
  function goTo(i) {
    index = (i + count) % count;
    list.scrollTo({ left: index * list.clientWidth, behavior: "smooth" });
  }
  function update() {
    dots.querySelectorAll("button").forEach((b, i) => {
      b.classList.toggle("active", i === index);
      if (i === index) b.setAttribute("aria-current", "true");
      else b.removeAttribute("aria-current");
    });
    list.querySelectorAll("li").forEach((li, i) => { li.inert = i !== index; });
    list.setAttribute("aria-live", paused ? "polite" : "off");
    pause.classList.toggle("paused", paused);
    pause.setAttribute("aria-label", paused ? "Play slideshow" : "Pause slideshow");
  }
  list.addEventListener("scroll", () => {
    const i = Math.round(list.scrollLeft / list.clientWidth);
    if (i !== index) { index = i; update(); }
  });
  section.addEventListener("keydown", e => {
    if (!count) return;
    if (e.key === "ArrowLeft") goTo(index - 1);
    if (e.key === "ArrowRight") goTo(index + 1);
  });
}

function loadProjects() {
  const list = document.querySelector(".repos");
  fetch("https://api.github.com/users/RepousiosJim/repos?per_page=100&sort=updated").then(r => {
    if (!r.ok) throw new Error("bad response");
    return r.json();
  }).then(repos => {
    const rows = repos
      .filter(r => r.topics && r.topics.includes("portfolio") && !r.fork && !r.archived)
      .sort((a, b) => new Date(b.pushed_at) - new Date(a.pushed_at));
    if (!rows.length) throw new Error("no projects");
    list.innerHTML = rows.map(r => `<li><a class="repo-name" href="${esc(r.html_url)}">${esc(r.name)}</a>
      <span class="repo-desc">${esc(r.description || "")}</span>
      ${r.homepage ? `<a class="repo-live" href="${esc(r.homepage)}">Live ↗</a>` : ""}</li>`).join("");
  }).catch(() => {
    list.innerHTML = `<li><a href="https://github.com/RepousiosJim">See all projects on GitHub</a></li>`;
  });
}

document.querySelector("footer .year").textContent = new Date().getFullYear();
slideshow();
loadProjects();
