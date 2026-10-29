/* PTGS visual editor. Loads the page straight from GitHub, lets you type on it,
   and Save commits the change to GitHub (Netlify then republishes).
   Safety: refuses to save if the file changed on GitHub since you opened it,
   and re-reads the file after saving to confirm the commit landed. */
(function () {
  var OWNER = "jimbanister", REPO = "goptgs-site";
  var BRANCH = new URLSearchParams(location.search).get("branch") || "main";
  var API = "https://api.github.com/repos/" + OWNER + "/" + REPO + "/contents/";
  var KEY = "ptgs_gh_token";
  var $ = function (id) { return document.getElementById(id); };
  var state = { path: null, sha: null, text: null, dirty: false };

  function token() { return localStorage.getItem(KEY); }
  function status(msg) { $("status").textContent = msg; }
  function gh(url, opts) {
    opts = opts || {};
    opts.headers = Object.assign({ Authorization: "Bearer " + token(), Accept: "application/vnd.github+json" }, opts.headers || {});
    opts.cache = "no-store";
    return fetch(url, opts).then(function (r) {
      return r.json().then(function (j) { if (!r.ok) throw new Error((j && j.message) || r.status); return j; });
    });
  }
  function b64decode(b) { var bin = atob(b.replace(/\n/g, "")); var u = new Uint8Array(bin.length); for (var i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i); return new TextDecoder().decode(u); }
  function b64encode(s) { var u = new TextEncoder().encode(s), bin = ""; for (var i = 0; i < u.length; i++) bin += String.fromCharCode(u[i]); return btoa(bin); }
  function getFile(path) { return gh(API + path + "?ref=" + encodeURIComponent(BRANCH) + "&t=" + Date.now()); }

  function setDirty(d) { state.dirty = d; $("save").disabled = !d; if (d) status("Unsaved changes"); }
  window.addEventListener("beforeunload", function (e) { if (state.dirty) { e.preventDefault(); e.returnValue = ""; } });

  function load(path) {
    status("Loading " + path + " from GitHub…");
    return getFile(path).then(function (f) {
      state.path = path; state.sha = f.sha; state.text = b64decode(f.content);
      var html = state.text
        .replace(/<head>/i, '<head><base href="/">')
        .replace(/<script\b[^>]*src="js\/site\.js"[^>]*><\/script>/i, "");
      var frame = $("frame");
      frame.onload = function () {
        var doc = frame.contentDocument;
        var st = doc.createElement("style");
        st.textContent = "[data-editable]{outline:2px dashed #f2c94c;outline-offset:4px}[data-editable]:focus{outline:2px solid #f2994a}";
        doc.head.appendChild(st);
        doc.querySelectorAll('[data-editable="source"]').forEach(function (el) {
          el.setAttribute("contenteditable", "true");
          el.addEventListener("input", function () { setDirty(true); });
          el.addEventListener("paste", function (e) {
            e.preventDefault();
            doc.execCommand("insertText", false, (e.clipboardData || window.clipboardData).getData("text/plain"));
          });
        });
        doc.addEventListener("click", function (e) { if (e.target.closest("a")) e.preventDefault(); }, true);
        setDirty(false);
        status("Editing " + (path === "index.html" ? "Home" : "About") + " — click inside a dashed box and type. Then Save.");
      };
      frame.srcdoc = html;
    }).catch(function (e) { status("Could not load: " + e.message); });
  }

  function splice(src, key, inner) {
    var at = src.indexOf('data-key="' + key + '"');
    if (at < 0) throw new Error("Section " + key + " not found in file");
    var open = src.lastIndexOf("<section", at), gt = src.indexOf(">", at), close = src.indexOf("</section>", gt);
    if (open < 0 || gt < 0 || close < 0) throw new Error("Could not locate section " + key);
    return src.slice(0, gt + 1) + inner + src.slice(close);
  }

  function save() {
    var doc = $("frame").contentDocument, text = state.text;
    $("save").disabled = true;
    try {
      doc.querySelectorAll('[data-editable="source"]').forEach(function (el) {
        var clone = el.cloneNode(true);
        clone.querySelectorAll("[contenteditable]").forEach(function (n) { n.removeAttribute("contenteditable"); });
        text = splice(text, el.getAttribute("data-key"), clone.innerHTML);
      });
    } catch (e) { status("Not saved: " + e.message); $("save").disabled = false; return; }
    if (text === state.text) { setDirty(false); status("No changes to save."); return; }
    status("Checking GitHub for newer changes…");
    getFile(state.path).then(function (f) {
      if (f.sha !== state.sha) throw new Error("this page was changed elsewhere since you opened it. Copy your edits, reload, and re-apply.");
      status("Saving to GitHub…");
      return gh(API + state.path, { method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "Edit " + state.path + " via visual editor", content: b64encode(text), sha: state.sha, branch: BRANCH }) });
    }).then(function (res) {
      return getFile(state.path).then(function (f) {
        if (b64decode(f.content) !== text) throw new Error("saved, but GitHub returned different content — check before editing further");
        state.sha = f.sha; state.text = text; setDirty(false);
        status("Saved ✓ (commit " + res.commit.sha.slice(0, 7) + "). Live site updates in about a minute.");
      });
    }).catch(function (e) { status("Not saved: " + e.message); $("save").disabled = false; });
  }

  function start() {
    $("login").hidden = true; $("app").hidden = false;
    load($("page").value);
  }

  $("connect").onclick = function () {
    var t = $("token").value.trim(); if (!t) return;
    localStorage.setItem(KEY, t);
    gh("https://api.github.com/repos/" + OWNER + "/" + REPO).then(function (r) {
      if (!r.permissions || !r.permissions.push) throw new Error("token can't write to " + REPO);
      start();
    }).catch(function (e) { localStorage.removeItem(KEY); $("loginmsg").textContent = "Didn't work: " + e.message; });
  };
  $("page").onchange = function (e) {
    if (state.dirty && !confirm("Discard unsaved changes?")) { e.target.value = state.path; return; }
    load(e.target.value);
  };
  $("save").onclick = save;
  $("logout").onclick = function () { localStorage.removeItem(KEY); location.reload(); };

  if (token()) start(); else $("login").hidden = false;
})();
