function slideshow() {
  const section = document.getElementById("work");
  const list = section.querySelector(".slides");
  const dots = section.querySelector(".dots");
  let index = 0;
  fetch("featured.json").then(r => r.json()).then(items => {
    const total = String(items.length).padStart(2, "0");
    list.innerHTML = items.map((p, i) => `<li><img src="${p.image}" alt="${p.name}">
      <div class="slide-meta"><span class="slide-count">${String(i + 1).padStart(2, "0")} / ${total}</span>
      <span class="slide-name">${p.name}</span>
      <span class="slide-links">${p.links.map(l => `<a href="${l.href}">${l.label} ↗</a>`).join("")}</span></div></li>`).join("");
    dots.innerHTML = items.map((_, i) => `<button aria-label="Slide ${i + 1}"></button>`).join("");
    dots.querySelectorAll("button").forEach((b, i) => b.addEventListener("click", () => goTo(i)));
    section.querySelector(".prev").addEventListener("click", () => goTo((index + items.length - 1) % items.length));
    section.querySelector(".next").addEventListener("click", () => goTo((index + 1) % items.length));
    updateDots();
    if (!matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setInterval(() => {
        if (section.matches(":hover") || section.contains(document.activeElement)) return;
        goTo((index + 1) % items.length);
      }, 6000);
    }
  });
  function goTo(i) {
    index = i;
    list.scrollTo({ left: index * list.clientWidth, behavior: "smooth" });
  }
  function updateDots() {
    dots.querySelectorAll("button").forEach((b, i) => b.classList.toggle("active", i === index));
  }
  list.addEventListener("scroll", () => {
    index = Math.round(list.scrollLeft / list.clientWidth);
    updateDots();
  });
  section.addEventListener("keydown", e => {
    if (e.key === "ArrowLeft") goTo(Math.max(0, index - 1));
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
    list.innerHTML = rows.map(r => `<li><a class="repo-name" href="${r.html_url}">${r.name}</a>
      <span class="repo-desc">${r.description || ""}</span>
      ${r.homepage ? `<a class="repo-live" href="${r.homepage}">Live ↗</a>` : ""}</li>`).join("");
  }).catch(() => {
    list.innerHTML = `<li><a href="https://github.com/RepousiosJim">See all projects on GitHub</a></li>`;
  });
}

slideshow();
loadProjects();
