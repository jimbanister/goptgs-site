# goptgs.com — PTGS site

Plain static HTML/CSS/JS. GitHub `main` is the single source of truth; Netlify
publishes every push to `main` automatically (about 1 minute).

## Editing copy (visual editor, free)
1. Open https://goptgs.com/edit.html (first time only: paste a GitHub token, see below).
2. Pick Home or About, click inside a dashed yellow box, type.
3. Click **Save & publish**. That makes a commit on GitHub `main`; the live site updates in about a minute.

The editor always loads the page fresh from GitHub, refuses to save if the file
changed elsewhere since you opened it, and re-reads GitHub after saving to confirm.
Every save is a git commit, so any earlier version can be restored.

### One-time token
GitHub → Settings → Developer settings → Fine-grained tokens → Generate new token:
repository access *Only select repositories* → `goptgs-site`; permission
*Contents: Read and write*. Paste it into the editor once; it is stored only in that browser.
