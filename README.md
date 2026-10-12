Gemelon Studios' portfolio site, built by GitHub Pages with Jekyll.

## Add or edit a project
Each project is one file in `_projects/`, published at `/work/<file-name>/`.

```yaml
---
title: Project Name
order: 3                  # position in every list (lower comes first); projects without it go last
spotlight: true           # optional: the one project shown large on the home page (needs an image)
kind: [games, desktop]    # any of: games, desktop, web (add new kinds under `kinds:` in _config.yml)
status: Live              # Live / Free / In development / Prototype / anything else
code: true                # optional: open source (adds a badge and the Open source filter)
tagline: One sentence shown on cards and as the page's share description.
started: 2026-05-01       # optional: shown as "Started May 2026" (only when you know it)
updated: 2026-10-11       # optional: shown on cards and the page as "Updated Oct 2026"
image: /assets/name.webp  # 1440x900 (16:10) WebP; leave out for a placeholder card
caption: Caption for the main image in the screenshot viewer
gallery:                  # optional extra screenshots (16:10 or 16:9 WebP)
  - { src: /assets/name-2.webp, caption: What this shows }
facts:
  - { label: Platform, value: Windows }
links:                    # the first link is the main (filled) button
  - { label: Play, href: "https://..." }
---
A short pitch in Markdown, shown on the project page.
```

Quote any value that contains a colon.

## Images
Put full-size WebPs in `assets/`. For faster cards and galleries, also add 480px and 800px wide
copies in `assets/sm/` named `<name>-480.webp` and `<name>-800.webp`. Pages use them automatically
when they exist and fall back to the full image when they don't. To make them:

```sh
python3 -c "
from PIL import Image; import glob, os
for f in glob.glob('assets/*.webp'):
    im = Image.open(f); n = os.path.basename(f)[:-5]
    for w in (480, 800):
        im.resize((w, round(im.height * w / im.width)), Image.LANCZOS).save(f'assets/sm/{n}-{w}.webp', quality=80, method=6)
"
```

## Private files
GitHub Pages publishes every `.md` file it finds. Notes, plans and agent files must be in a folder
or file name listed under `exclude:` in `_config.yml` (README.md, AGENTS.md, CLAUDE.md, docs/, plans/, tools/).

## Preview locally
With Ruby: `gem install github-pages webrick`, then `jekyll serve` and open http://localhost:4000.

## Devlog
Posts are Markdown files in `_posts/` named `YYYY-MM-DD-short-title.md`, published at `/devlog/YYYY/MM/short-title/`
and in the feed at `/devlog/feed.xml`.

```yaml
---
title: "Post title"
project: ashen-hunters     # optional: the project file name; links the post and lists it on that project's page
summary: One sentence shown in lists and share previews.
image: /assets/name.webp   # optional: share image
---
Post text in Markdown.
```

## Visitor stats (optional)
Create a free account at goatcounter.com and set `goatcounter:` in `_config.yml` to your code
(the part before `.goatcounter.com`). Leave it empty to load no tracking at all.

## Checks
Every pull request runs `.github/workflows/check.yml`: it checks the project files (`tools/check_projects.rb`),
builds the site with the GitHub Pages toolchain and checks every internal link and image.
