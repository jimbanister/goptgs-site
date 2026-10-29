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
