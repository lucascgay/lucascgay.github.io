# My GitHub Pages Website

This is a minimal, static site ready to be deployed with GitHub Pages.

## How to use

1) Edit `index.html` and `assets/css/styles.css` to customize content and styles.

2) Create a GitHub repository and push:

- If you want a personal site at `https://<username>.github.io`:
  - Name the repo exactly `<username>.github.io` (replace with your GitHub username).
  - Push the `main` branch to that repo. GitHub Pages will serve from root automatically.

- If you want to host under a regular repo name:
  - Create any repo name.
  - Push the `main` branch.
  - In the GitHub repo: Settings → Pages → Build and deployment → Source: `Deploy from a branch` → Branch: `main` / `/root`.

3) Visit the live site:

- Personal site repo → `https://<username>.github.io`
- Regular repo with Pages enabled → `https://<username>.github.io/<repo>`

## Local development
Just open `index.html` in a browser or use a simple static server, e.g. `python3 -m http.server`.

## Notes
- `.nojekyll` disables Jekyll processing so static files are served as-is.
- `404.html` provides a simple not-found page.
- Portfolio chart reads `data/weights.json` (percent-only). To generate it safely from private holdings, use `scripts/compute_weights.py`.
  - Private input: copy `data/holdings.private.json.example` to `data/holdings.private.json` and fill `ticker` + `shares`. Prices are optional if you run with `--fetch`.
  - Cash: either `{ "ticker": "CASH", "value": <cash dollars> }` (recommended) or `{ "ticker": "CASH", "shares": <cash dollars>, "price": 1 }`.
  - Fetch latest prices: `pip install yfinance` then run with `--fetch`.

## Personal links
- Put your resume at `assets/resume.pdf` (or update links in `index.html`, `about.html`, `contact.html`).
- Update LinkedIn and email placeholders in `index.html`, `about.html`, and `contact.html`.
