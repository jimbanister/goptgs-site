(function () {
  var C = window.PTGS_COPY;
  if (!C) return;

  var S_WORDS = [
    "solutions",
    "services",
    "systems",
    "strategies"
  ];

  function text(sel, value) {
    var el = document.querySelector(sel);
    if (el && value != null) el.textContent = value;
  }
  function html(sel, value) {
    var el = document.querySelector(sel);
    if (el && value != null) el.innerHTML = value;
  }
  function attr(sel, name, value) {
    var el = document.querySelector(sel);
    if (el && value != null) el.setAttribute(name, value);
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  /** Turn [[S]] into the rotating red span; otherwise leave plain text. */
  function headlineWithRotate(raw) {
    var src = raw == null ? "" : String(raw);
    var parts = src.split("[[S]]");
    if (parts.length === 1) {
      // Fallback: first "solutions" (any case) becomes the slot
      var m = src.match(/\b(solutions|services|systems|strategies)\b/i);
      if (m) {
        var i = m.index;
        parts = [src.slice(0, i), src.slice(i + m[0].length)];
      } else {
        return escapeHtml(src);
      }
    }
    var before = escapeHtml(parts[0]);
    var after = escapeHtml(parts.slice(1).join("[[S]]"));
    return (
      before +
      '<span class="s-rotate" aria-live="polite">' +
        '<span class="s-word">' + escapeHtml(S_WORDS[0]) + "</span>" +
      "</span>" +
      after
    );
  }

  function startSRotate(root) {
    var wrap = (root || document).querySelector(".s-rotate .s-word");
    if (!wrap || wrap.dataset.rotateBound) return;
    wrap.dataset.rotateBound = "1";
    var idx = 0;
    setInterval(function () {
      idx = (idx + 1) % S_WORDS.length;
      wrap.classList.add("is-out");
      setTimeout(function () {
        wrap.textContent = S_WORDS[idx];
        wrap.classList.remove("is-out");
      }, 180);
    }, 2500);
  }

  var page = document.body.getAttribute("data-page") || "home";
  var year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());

  // Shared mailto / tel
  document.querySelectorAll("[data-mailto]").forEach(function (a) {
    a.setAttribute("href", "mailto:" + C.email + "?subject=PTGS%20enquiry");
  });
  document.querySelectorAll("[data-tel]").forEach(function (a) {
    a.setAttribute("href", "tel:" + C.phoneTel);
  });
  document.querySelectorAll("[data-email-text]").forEach(function (el) {
    el.textContent = C.email;
  });
  document.querySelectorAll("[data-phone-text]").forEach(function (el) {
    el.textContent = C.phoneDisplay;
  });

  if (page === "home") {
    var H = C.home;
    text("[data-copy=eyebrow]", H.eyebrow);
    var headlineEl = document.querySelector("[data-copy=headline]");
    if (headlineEl) {
      headlineEl.innerHTML = headlineWithRotate(H.headline);
      startSRotate(headlineEl);
    }
    text("[data-copy=lead]", H.lead);
    text("[data-copy=aside-title]", H.asideTitle);
    text("[data-copy=aside-body]", H.asideBody);
    text("[data-copy=lanes-heading]", H.lanesHeading);
    // Rich field: allow <strong> (and convert newlines to <br>)
    (function () {
      var el = document.querySelector("[data-copy=lanes-intro]");
      if (el && H.lanesIntro != null) {
        var html = String(H.lanesIntro).replace(/\n/g, "<br>");
        el.innerHTML = html;
      }
    })();
    text("[data-copy=approach-heading]", H.approachHeading);
    text("[data-copy=approach-intro]", H.approachIntro);
    text("[data-copy=contact-heading]", H.contactHeading);
    text("[data-copy=contact-body]", H.contactBody);

    // Preserve newlines in multiline copy blocks
    document.querySelectorAll(
      "[data-copy=lanes-intro], [data-copy=lead], [data-copy=aside-body], [data-copy=approach-intro], [data-copy=contact-body]"
    ).forEach(function (el) {
      el.style.whiteSpace = "pre-wrap";
    });

    var grid = document.querySelector("[data-lanes]");
    if (grid) {
      grid.innerHTML = H.lanes.map(function (lane) {
        var icon = lane.icon || "";
        if (icon && icon.indexOf("?") === -1) icon += "?v=24";
        return (
          '<article class="plank">' +
            '<div class="plank-icon" aria-hidden="true">' +
              '<img src="' + icon + '" alt="" width="120" height="120" decoding="async" />' +
            "</div>" +
            "<h3>" + lane.title + "</h3>" +
            '<p class="plank-blurb">' + lane.blurb + "</p>" +
            '<ul class="plank-ex">' +
              '<li><span class="lane">Learn-forward</span><span class="ex">' + lane.learn + "</span></li>" +
              '<li><span class="lane exp">Experience-led</span><span class="ex">' + lane.experience + "</span></li>" +
            "</ul>" +
          "</article>"
        );
      }).join("");
    }

    var steps = document.querySelector("[data-approach]");
    if (steps) {
      steps.innerHTML = H.approach.map(function (s) {
        return (
          "<li><span class=\"step\">" + s.step + "</span><div>" +
          "<strong>" + s.title + "</strong><span>" + s.detail + "</span></div></li>"
        );
      }).join("");
    }
  }

  if (page === "about") {
    var A = C.about;
    text("[data-copy=eyebrow]", A.eyebrow);
    text("[data-copy=headline]", A.headline);
    text("[data-copy=lead]", A.lead);
    var prose = document.querySelector("[data-about-prose]");
    if (prose) {
      prose.innerHTML = A.paragraphs.map(function (p) {
        return String(p).split(/\n\s*\n/).filter(Boolean).map(function (chunk) {
          return "<p>" + chunk.replace(/\n/g, "<br>") + "</p>";
        }).join("");
      }).join("");
    }
    text("[data-copy=dual-heading]", A.dualHeading);
    text("[data-copy=dual-intro]", A.dualIntro);
    text("[data-copy=learn-title]", A.learnTitle);
    text("[data-copy=learn-body]", A.learnBody);
    text("[data-copy=exp-title]", A.expTitle);
    text("[data-copy=exp-body]", A.expBody);
    text("[data-copy=contact-heading]", A.contactHeading);
    text("[data-copy=contact-body]", A.contactBody);
    attr("[data-linkedin]", "href", C.linkedin);

    document.querySelectorAll(
      "[data-copy=lead], [data-copy=dual-intro], [data-copy=learn-body], [data-copy=exp-body], [data-copy=contact-body]"
    ).forEach(function (el) {
      el.style.whiteSpace = "pre-wrap";
    });
  }

  // Mobile nav
  var btn = document.getElementById("menu-btn");
  var menu = document.getElementById("nav-menu");
  if (btn && menu) {
    btn.addEventListener("click", function () {
      var open = menu.classList.toggle("open");
      btn.setAttribute("aria-expanded", open ? "true" : "false");
    });
    menu.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        menu.classList.remove("open");
        btn.setAttribute("aria-expanded", "false");
      });
    });
  }
})();
