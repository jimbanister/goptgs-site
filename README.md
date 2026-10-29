# goptgs.com — PTGS LLC

Static marketing site for **PTGS LLC** (Player & Tournament Golf Solutions). Production host: **Netlify** from this repo. Domain: **goptgs.com**.

## Local preview (static)

Open `index.html` in a browser, or from this folder:

```bash
python3 -m http.server 4173
# or: npx --yes serve .
```

## Local copy editing

For the `?edit=1` in-browser editor (writes `js/content.js`):

```bash
python3 edit-server.py
```

Then open http://127.0.0.1:4173/?edit=1 — leave the process running while you edit. Production on Netlify does **not** need `edit-server.py`.

## Production (Netlify)

1. Connect this GitHub repo to Netlify (publish directory = site root; no build command required — see `netlify.toml`).
2. Point `goptgs.com` DNS at Netlify (nameservers or the A/CNAME records Netlify shows).
3. Enable HTTPS in Netlify after DNS propagates.

Optional later: add a Git-backed CMS (Tina, Decap, etc.) for WYSIWYG editing.

## Stack

- Plain HTML / CSS / JS
- Font: Outfit (Google Fonts)
- Wordmark: `assets/ptgs-wordmark-nav.png`
- Copy: `js/content.js` (home headline uses `[[S]]` for the rotating S-word)

## Pages

- `index.html` — homepage
- `about.html` — About / engagement types

Contact: `jim@goptgs.com`, `925 725 9930`
