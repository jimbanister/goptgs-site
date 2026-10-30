/* Site behaviour only. All copy lives directly in index.html / about.html
   and is edited visually in CloudCannon. */
(function () {
  var year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());

  // Rotating headline word (home page)
  var WORDS = ["solutions", "services", "systems", "strategies"];
  var word = document.querySelector(".s-rotate .s-word");
  if (word) {
    var idx = 0;
    setInterval(function () {
      idx = (idx + 1) % WORDS.length;
      word.classList.add("is-out");
      setTimeout(function () {
        word.textContent = WORDS[idx];
        word.classList.remove("is-out");
      }, 180);
    }, 2500);
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

/* Contact modal (Netlify Forms). Without JS the CTA falls back to mailto
   and the form still posts natively to /thanks.html. */
(function () {
  var modal = document.getElementById("contact-modal");
  if (!modal) return;
  var form = modal.querySelector("form");
  var wrap = modal.querySelector("[data-contact-formwrap]");
  var done = modal.querySelector("[data-contact-done]");
  var err = modal.querySelector("[data-contact-error]");
  var lastFocus;

  function open(e) {
    if (e) e.preventDefault();
    lastFocus = document.activeElement;
    modal.hidden = false;
    document.body.classList.add("cmodal-open");
    var first = form.querySelector('input[name="name"]');
    if (first && !wrap.hidden) first.focus();
  }
  function close() {
    modal.hidden = true;
    document.body.classList.remove("cmodal-open");
    if (!done.hidden) { form.reset(); done.hidden = true; wrap.hidden = false; }
    if (lastFocus) lastFocus.focus();
  }
  document.querySelectorAll("[data-contact-open]").forEach(function (a) { a.addEventListener("click", open); });
  modal.querySelectorAll("[data-contact-close]").forEach(function (b) { b.addEventListener("click", close); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !modal.hidden) close(); });
  // Overlay clicks deliberately do NOT close the form (avoids losing typing).

  function showError(msg) { err.textContent = msg; err.hidden = false; }
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    err.hidden = true;
    var bad = [];
    form.querySelectorAll("[required]").forEach(function (f) {
      var ok = f.value.trim() !== "" && (f.type !== "email" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.value.trim()));
      f.classList.toggle("invalid", !ok);
      if (!ok) bad.push(f);
    });
    if (bad.length) { showError("Please fill in your name, a valid email address, and a short description."); bad[0].focus(); return; }
    var btn = form.querySelector('button[type="submit"]');
    btn.disabled = true; btn.textContent = "Sending…";
    fetch("/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams(new FormData(form)).toString()
    }).then(function (r) {
      if (!r.ok) throw new Error(r.status);
      wrap.hidden = true; done.hidden = false;
    }).catch(function () {
      showError("Sorry, that didn't send. Please try again, or email jim@goptgs.com directly.");
    }).then(function () { btn.disabled = false; btn.textContent = "Send"; });
  });
})();

/* In-page photo lightbox */
(function () {
  if (location.pathname.indexOf("edit") >= 0) return;
  var box, img, cap, last;
  function build() {
    box = document.createElement("div");
    box.className = "lightbox"; box.hidden = true;
    box.setAttribute("role", "dialog"); box.setAttribute("aria-modal", "true"); box.setAttribute("aria-label", "Enlarged photo");
    box.innerHTML = '<button type="button" aria-label="Close">&times;</button><img alt=""><p></p>';
    img = box.querySelector("img"); cap = box.querySelector("p");
    box.addEventListener("click", close);
    document.body.appendChild(box);
  }
  function close() { box.hidden = true; document.body.style.overflow = ""; if (last) last.focus(); }
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest("a[data-lightbox]");
    if (!a) return;
    e.preventDefault(); if (!box) build(); last = a;
    var t = a.querySelector("img"), fc = a.closest("figure") && a.closest("figure").querySelector("figcaption");
    img.src = a.getAttribute("href"); img.alt = t ? t.alt : "";
    cap.textContent = fc ? fc.textContent : "";
    box.hidden = false; document.body.style.overflow = "hidden"; box.querySelector("button").focus();
  });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && box && !box.hidden) close(); });
})();

/* Pull the lanes photo up so its top lines up with the hero buttons (wide screens only) */
(function () {
  var ph = document.querySelector(".lanes-photo"), btns = document.querySelector(".hero-btns");
  if (!ph || !btns) return;
  function place() {
    ph.style.marginTop = "0px";
    if (window.innerWidth < 720) return;
    var d = btns.getBoundingClientRect().top - ph.getBoundingClientRect().top;
    ph.style.marginTop = Math.min(0, d) + "px";
  }
  window.addEventListener("load", place); window.addEventListener("resize", place); place();
})();
