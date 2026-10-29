(function () {
  var params = new URLSearchParams(window.location.search);
  var enabled = params.get("edit") === "1" || params.get("edit") === "true";
  if (!enabled) return;

  var C = window.PTGS_COPY;
  if (!C) return;

  document.documentElement.classList.add("edit-mode");

  /** Keep ?edit=1 on same-site navigations (About, Home, logo, hash links). */
  function preserveEditOnLinks() {
    var anchors = document.querySelectorAll("a[href]");
    anchors.forEach(function (a) {
      var href = a.getAttribute("href");
      if (!href || href.charAt(0) === "#" || href.indexOf("mailto:") === 0 || href.indexOf("tel:") === 0) {
        return;
      }
      if (/^https?:/i.test(href)) return; // external
      try {
        var url = new URL(href, window.location.href);
        if (url.origin !== window.location.origin) return;
        // Only rewrite our html pages / relative site paths
        var path = url.pathname;
        var isSite =
          /(?:^|\/)(index|about)\.html$/i.test(path) ||
          path.endsWith("/") ||
          /\/goptgs-site\/?$/i.test(path) ||
          path === "/" ||
          path === window.location.pathname;
        // Also any relative .html in this folder
        if (!/\.html$/i.test(path) && path.indexOf(".") !== -1) return;
        url.searchParams.set("edit", "1");
        var next = url.pathname.split("/").pop() || "index.html";
        // Prefer relative form matching original style
        if (/^(index|about)\.html$/i.test(href.split("#")[0].split("?")[0]) || href.indexOf("./") === 0 || !href.match(/^https?:/)) {
          var base = href.split("#")[0].split("?")[0];
          if (!base) base = "index.html";
          var hash = url.hash || "";
          a.setAttribute("href", base + "?edit=1" + hash);
        } else {
          a.setAttribute("href", url.pathname + "?edit=1" + (url.hash || ""));
        }
      } catch (e) {
        /* ignore */
      }
    });
  }
  preserveEditOnLinks();

  var bar = document.createElement("div");
  bar.className = "edit-bar";
  bar.innerHTML =
    '<div class="edit-bar-inner">' +
      "<strong>Edit copy</strong>" +
      "<span class=\"edit-hint\">Click outlined text to edit. Save writes <code>js/content.js</code>. Use <code>[[S]]</code> in the home headline for the rotating word. Lanes intro keeps <code>&lt;strong&gt;</code> labels.</span>" +
      '<span class="edit-status" id="edit-status"></span>' +
      '<button type="button" class="btn btn-secondary" id="edit-reload">Reload copy</button>' +
      '<button type="button" class="btn btn-primary" id="edit-save">Save</button>' +
    "</div>";
  document.body.appendChild(bar);

  var statusEl = document.getElementById("edit-status");
  function setStatus(msg, kind) {
    statusEl.textContent = msg || "";
    statusEl.dataset.kind = kind || "";
  }

  function makeEditable(el, path) {
    if (!el || el.dataset.editBound) return;
    el.dataset.editBound = "1";
    el.dataset.path = path;
    el.contentEditable = "true";
    el.spellcheck = true;
    el.classList.add("is-editable");
    el.addEventListener("keydown", function (e) {
      // Shift+Enter keeps a newline for multiline fields; Enter alone blurs
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        el.blur();
      }
    });
  }

  function setByPath(obj, path, value) {
    var parts = path.split(".");
    var cur = obj;
    for (var j = 0; j < parts.length - 1; j++) {
      var p = parts[j];
      var n = parts[j + 1];
      if (/^\d+$/.test(p)) {
        p = Number(p);
      }
      if (/^\d+$/.test(String(n)) && !Array.isArray(cur[p])) cur[p] = [];
      if (cur[p] == null) cur[p] = /^\d+$/.test(String(n)) ? [] : {};
      cur = cur[p];
    }
    var last = parts[parts.length - 1];
    if (/^\d+$/.test(last)) last = Number(last);
    cur[last] = value;
  }

  function bindPage() {
    var page = document.body.getAttribute("data-page") || "home";
    if (page === "home") {
      makeEditable(document.querySelector('[data-copy="eyebrow"]'), "home.eyebrow");
      // Keep live [[S]] rotate; protect rotating span; serialize back to [[S]] on save
      var headline = document.querySelector('[data-copy="headline"]');
      if (headline) {
        headline.dataset.path = "home.headline";
        headline.dataset.headlineRotate = "1";
        headline.classList.add("is-editable");
        headline.contentEditable = "true";
        headline.spellcheck = true;
        headline.dataset.editBound = "1";
        var rot = headline.querySelector(".s-rotate");
        if (rot) rot.contentEditable = "false";
        headline.addEventListener("keydown", function (e) {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            headline.blur();
          }
        });
      }
      makeEditable(document.querySelector('[data-copy="lead"]'), "home.lead");
      makeEditable(document.querySelector('[data-copy="aside-title"]'), "home.asideTitle");
      makeEditable(document.querySelector('[data-copy="aside-body"]'), "home.asideBody");
      makeEditable(document.querySelector('[data-copy="lanes-heading"]'), "home.lanesHeading");
      (function () {
        var intro = document.querySelector('[data-copy="lanes-intro"]');
        makeEditable(intro, "home.lanesIntro");
        if (intro) intro.dataset.rich = "html";
      })();
      makeEditable(document.querySelector('[data-copy="approach-heading"]'), "home.approachHeading");
      makeEditable(document.querySelector('[data-copy="approach-intro"]'), "home.approachIntro");
      makeEditable(document.querySelector('[data-copy="contact-heading"]'), "home.contactHeading");
      makeEditable(document.querySelector('[data-copy="contact-body"]'), "home.contactBody");

      document.querySelectorAll("[data-lanes] .plank").forEach(function (card, i) {
        makeEditable(card.querySelector("h3"), "home.lanes." + i + ".title");
        makeEditable(card.querySelector(".plank-blurb"), "home.lanes." + i + ".blurb");
        var ex = card.querySelectorAll(".plank-ex .ex");
        if (ex[0]) makeEditable(ex[0], "home.lanes." + i + ".learn");
        if (ex[1]) makeEditable(ex[1], "home.lanes." + i + ".experience");
      });

      document.querySelectorAll("[data-approach] li").forEach(function (li, i) {
        makeEditable(li.querySelector("strong"), "home.approach." + i + ".title");
        makeEditable(li.querySelector("span:not(.step)"), "home.approach." + i + ".detail");
      });
    }

    if (page === "about") {
      makeEditable(document.querySelector('[data-copy="eyebrow"]'), "about.eyebrow");
      makeEditable(document.querySelector('[data-copy="headline"]'), "about.headline");
      makeEditable(document.querySelector('[data-copy="lead"]'), "about.lead");
      document.querySelectorAll("[data-about-prose] p").forEach(function (p, i) {
        makeEditable(p, "about.paragraphs." + i);
      });
      makeEditable(document.querySelector('[data-copy="dual-heading"]'), "about.dualHeading");
      makeEditable(document.querySelector('[data-copy="dual-intro"]'), "about.dualIntro");
      makeEditable(document.querySelector('[data-copy="learn-title"]'), "about.learnTitle");
      makeEditable(document.querySelector('[data-copy="learn-body"]'), "about.learnBody");
      makeEditable(document.querySelector('[data-copy="exp-title"]'), "about.expTitle");
      makeEditable(document.querySelector('[data-copy="exp-body"]'), "about.expBody");
      makeEditable(document.querySelector('[data-copy="contact-heading"]'), "about.contactHeading");
      makeEditable(document.querySelector('[data-copy="contact-body"]'), "about.contactBody");
    }

    // Multiline fields keep newlines visible while editing
    document.querySelectorAll(".is-editable").forEach(function (el) {
      el.style.whiteSpace = "pre-wrap";
    });
  }

  function collect() {
    var next = JSON.parse(JSON.stringify(C));
    document.querySelectorAll(".is-editable[data-path]").forEach(function (el) {
      var value;
      if (el.dataset.headlineRotate === "1") {
        var rotEl = el.querySelector(".s-rotate");
        if (rotEl) {
          var before = "", after = "", hit = false;
          Array.prototype.forEach.call(el.childNodes, function (n) {
            if (n.nodeType === 1 && (n === rotEl || (n.contains && n.contains(rotEl)))) {
              hit = true;
              return;
            }
            var tx = n.textContent || "";
            if (!hit) before += tx;
            else after += tx;
          });
          value = (before + "[[S]]" + after).replace(/\u00a0/g, " ").replace(/^\s+|\s+$/g, "");
        } else {
          value = el.innerText.replace(/\u00a0/g, " ").replace(/^\s+|\s+$/g, "")
            .replace(/\b(solutions|services|systems|strategies)\b/i, "[[S]]");
        }
      } else if (el.dataset.rich === "html") {
        // Preserve <strong> etc.; normalise <br> / block breaks to \n
        var html = el.innerHTML
          .replace(/<br\s*\/?>/gi, "\n")
          .replace(/<\/div>/gi, "\n")
          .replace(/<\/p>/gi, "\n");
        var tmp = document.createElement("div");
        tmp.innerHTML = html;
        // Keep only strong/b + text
        var walk = function (node, out) {
          if (node.nodeType === 3) {
            out.push(node.nodeValue);
            return;
          }
          if (node.nodeType !== 1) return;
          var tag = node.tagName.toLowerCase();
          if (tag === "strong" || tag === "b") {
            out.push("<strong>");
            Array.prototype.forEach.call(node.childNodes, function (c) { walk(c, out); });
            out.push("</strong>");
            return;
          }
          if (tag === "br") { out.push("\n"); return; }
          Array.prototype.forEach.call(node.childNodes, function (c) { walk(c, out); });
        };
        var parts = [];
        Array.prototype.forEach.call(tmp.childNodes, function (c) { walk(c, parts); });
        value = parts.join("").replace(/\u00a0/g, " ").replace(/\n{3,}/g, "\n\n").replace(/^\s+|\s+$/g, "");
      } else {
        value = el.innerText.replace(/\u00a0/g, " ");
        value = value.replace(/^\s+|\s+$/g, "");
      }
      setByPath(next, el.dataset.path, value);
    });
    return next;
  }

  async function save() {
    setStatus("Saving…");
    try {
      var payload = collect();
      var res = await fetch("/api/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      var data = await res.json();
      if (!res.ok || !data.ok) throw new Error((data && data.error) || res.statusText);
      window.PTGS_COPY = payload;
      C = payload;
      setStatus("Saved to js/content.js — still in edit mode", "ok");
      // Stay on ?edit=1; do not navigate away
      if (!new URLSearchParams(window.location.search).get("edit")) {
        var u = new URL(window.location.href);
        u.searchParams.set("edit", "1");
        history.replaceState(null, "", u.toString());
      }
    } catch (err) {
      setStatus("Save failed — use edit-server.py (not plain file open). " + err.message, "err");
    }
  }

  async function reloadCopy() {
    setStatus("Reloading…");
    try {
      var res = await fetch("/api/content");
      var data = await res.json();
      window.PTGS_COPY = data;
      // Reload keeping edit=1
      var u = new URL(window.location.href);
      u.searchParams.set("edit", "1");
      location.href = u.toString();
    } catch (err) {
      setStatus("Reload failed: " + err.message, "err");
    }
  }

  document.getElementById("edit-save").addEventListener("click", save);
  document.getElementById("edit-reload").addEventListener("click", reloadCopy);

  // apply-copy runs first; bind after a tick
  setTimeout(bindPage, 0);
})();
