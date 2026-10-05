/* Shared behaviour. Accessibility helpers only. */
(function () {
  "use strict";
  var store = {
    get: function (k) { try { return window.localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { window.localStorage.setItem(k, v); } catch (e) {} }
  };

  /* ---- Text size control (A / A+ / A++) ---- */
  var SIZES = { "1": "", "2": "ts-2", "3": "ts-3" };
  function applySize(n) {
    var root = document.documentElement;
    root.classList.remove("ts-2", "ts-3");
    if (SIZES[n]) root.classList.add(SIZES[n]);
    var btns = document.querySelectorAll("[data-textsize]");
    for (var i = 0; i < btns.length; i++) {
      btns[i].setAttribute("aria-pressed", btns[i].getAttribute("data-textsize") === n ? "true" : "false");
    }
  }
  var saved = store.get("textsize") || "1";
  applySize(saved);
  document.addEventListener("click", function (e) {
    var b = e.target.closest ? e.target.closest("[data-textsize]") : null;
    if (!b) return;
    var n = b.getAttribute("data-textsize");
    applySize(n);
    store.set("textsize", n);
  });

  /* ---- Mobile menu toggle ---- */
  var toggle = document.querySelector("[data-menu-toggle]");
  var menu = document.querySelector("[data-menu]");
  if (toggle && menu) {
    toggle.addEventListener("click", function () {
      var open = menu.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  /* ---- Cookie / storage notice bar ---- */
  var bar = document.getElementById("cookieNotice");
  var ok = document.getElementById("cookieOk");
  if (bar && store.get("noticeDismissed") !== "1") { bar.hidden = false; }
  if (ok && bar) {
    ok.addEventListener("click", function () { bar.hidden = true; store.set("noticeDismissed", "1"); });
  }
})();
