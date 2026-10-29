# Editing the PTGS site draft

## In-page copy edit (recommended)

From the `goptgs-site` folder:

```bash
python3 edit-server.py
```

Open **http://127.0.0.1:4173/?edit=1** (or About: http://127.0.0.1:4173/about.html?edit=1).

- Outlined text is editable — click and type.
- **Save** writes `js/content.js` on disk.
- Use this server (not double-clicking `index.html`) so Save can work.

Without `?edit=1` you get the normal clickable prototype.

## Edit the copy file directly

Open `js/content.js`, change strings, save, refresh.

## Netlify

Drag the folder onto https://app.netlify.com/drop when ready (leave `edit-server.py` out of production or ignore it — Netlify won’t run it).
