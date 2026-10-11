Gemelon Studios' portfolio site, built by GitHub Pages with Jekyll.

## Add or edit a project
Each project is one file in `_projects/`, published at `/work/<file-name>/`.

```yaml
---
title: Project Name
order: 3                  # position in the index (lower comes first)
spotlight: true           # optional: the one project shown large on the home page
kind: [games, desktop]    # any of: games, desktop, web
status: Live              # Live / Free / In development / Prototype / anything else
code: true                # optional: open source (adds a Code badge and the Open source filter)
tagline: One sentence shown on cards and as the page's share description.
image: /assets/name.webp  # 1440x900 WebP; leave out for a text-only card
caption: Caption for the main image in the screenshot viewer
gallery:                  # optional extra screenshots (any 16:10 or 16:9 WebP)
  - { src: /assets/name-2.webp, caption: What this shows }
facts:
  - { label: Platform, value: Windows }
links:
  - { label: Play, href: "https://..." }
---
A short pitch in Markdown, shown on the project page.
```

## Preview locally
With Ruby: `gem install github-pages webrick`, then `jekyll serve` and open http://localhost:4000.
