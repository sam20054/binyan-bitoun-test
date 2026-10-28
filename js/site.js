/* Binyan Bitoun — JS vanilla léger (aucune dépendance)
   Header rétractable, menu mobile, apparitions au scroll, compteurs,
   sliders avant/après (souris, tactile, clavier), galerie filtrable + lightbox,
   FAQ animée, carte des villes, formulaire -> WhatsApp / e-mail. */
(function () {
  "use strict";
  var d = document, root = d.documentElement;
  root.classList.remove("no-js");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var rtl = root.dir === "rtl";
  var $ = function (s, c) { return (c || d).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || d).querySelectorAll(s)); };

  /* ---------- Header sticky qui se rétracte ---------- */
  var header = $(".site-header"), bar = $(".mobile-bar"), lastY = 0, ticking = false;
  function onScroll() {
    var y = window.scrollY;
    if (header) {
      header.classList.toggle("is-scrolled", y > 10);
      header.classList.toggle("is-hidden", y > 420 && y > lastY + 4 && !d.body.classList.contains("menu-open"));
      if (y < lastY - 4) header.classList.remove("is-hidden");
    }
    if (bar) bar.classList.toggle("show", y > 260);
    lastY = y; ticking = false;
  }
  window.addEventListener("scroll", function () { if (!ticking) { requestAnimationFrame(onScroll); ticking = true; } }, { passive: true });
  onScroll();

  /* ---------- Menu mobile ---------- */
  var burger = $(".burger"), menu = $("#mobile-menu");
  function setMenu(open) {
    if (!menu) return;
    menu.classList.toggle("open", open);
    menu.setAttribute("aria-hidden", open ? "false" : "true");
    burger.setAttribute("aria-expanded", open ? "true" : "false");
    d.body.classList.toggle("menu-open", open);
    if (open) { var f = $("a,button", menu); f && setTimeout(function () { f.focus(); }, 80); } else burger.focus();
  }
  if (burger) burger.addEventListener("click", function () { setMenu(!menu.classList.contains("open")); });
  $$(".mobile-close").forEach(function (b) { b.addEventListener("click", function () { setMenu(false); }); });
  d.addEventListener("keydown", function (e) { if (e.key === "Escape" && menu && menu.classList.contains("open")) setMenu(false); });
  $$(".nav-drop").forEach(function (b) {
    b.addEventListener("click", function () {
      var li = b.parentNode, o = !li.classList.contains("open");
      li.classList.toggle("open", o); b.setAttribute("aria-expanded", o);
    });
  });

  /* ---------- Micro-interaction boutons (halo qui suit la souris) ---------- */
  d.addEventListener("pointermove", function (e) {
    var b = e.target.closest && e.target.closest(".btn");
    if (!b) return;
    var r = b.getBoundingClientRect();
    b.style.setProperty("--mx", (e.clientX - r.left) + "px");
    b.style.setProperty("--my", (e.clientY - r.top) + "px");
  }, { passive: true });

  /* ---------- Titre animé mot à mot ---------- */
  $$(".h-anim").forEach(function (h) {
    if (reduce) return;
    var words = h.textContent.trim().split(/\s+/);
    h.setAttribute("aria-label", h.textContent.trim());
    h.innerHTML = words.map(function (w, i) { return '<span class="w" aria-hidden="true" style="--i:' + i + '">' + w + "</span>"; }).join(" ");
  });

  /* ---------- Apparitions au scroll + compteurs ---------- */
  function count(el) {
    var to = parseInt(el.getAttribute("data-count"), 10), suf = el.getAttribute("data-suffix") || "";
    if (reduce) { el.textContent = to + suf; return; }
    var t0 = null, dur = 1400;
    function step(t) {
      if (!t0) t0 = t;
      var p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(to * e) + suf;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target;
        el.classList.add("in");
        if (el.hasAttribute("data-count")) count(el);
        io.unobserve(el);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });
    $$(".reveal,[data-count],.phone-mock").forEach(function (el) { io.observe(el); });
  } else {
    $$(".reveal,.phone-mock").forEach(function (el) { el.classList.add("in"); });
    $$("[data-count]").forEach(function (el) { el.textContent = el.getAttribute("data-count") + (el.getAttribute("data-suffix") || ""); });
  }

  /* ---------- Sliders avant / après ---------- */
  $$(".ba").forEach(function (ba) {
    var range = $(".ba-range", ba), dragging = false, auto = ba.hasAttribute("data-auto") && !reduce, raf, start;
    function set(v) {
      v = Math.max(0, Math.min(100, v));
      ba.style.setProperty("--pos", v + "%");
      if (range) { range.value = Math.round(v); range.setAttribute("aria-valuetext", Math.round(v) + "%"); }
    }
    function fromX(x) { var r = ba.getBoundingClientRect(); return ((x - r.left) / r.width) * 100; }
    function stopAuto() { if (auto) { auto = false; cancelAnimationFrame(raf); } ba.classList.add("touched"); }
    ba.addEventListener("pointerdown", function (e) {
      if (e.button !== 0 && e.pointerType === "mouse") return;
      stopAuto(); dragging = true; ba.classList.add("dragging");
      ba.setPointerCapture && ba.setPointerCapture(e.pointerId);
      set(fromX(e.clientX));
    });
    ba.addEventListener("pointermove", function (e) { if (dragging) { set(fromX(e.clientX)); e.preventDefault(); } });
    function end() { dragging = false; ba.classList.remove("dragging"); }
    ba.addEventListener("pointerup", end); ba.addEventListener("pointercancel", end);
    if (range) {
      range.addEventListener("input", function () { stopAuto(); set(+range.value); });
      range.addEventListener("keydown", function (e) {
        var v = +range.value, s = e.shiftKey ? 10 : 2;
        if (e.key === "Home") { set(0); e.preventDefault(); }
        else if (e.key === "End") { set(100); e.preventDefault(); }
        else if (e.key === "ArrowLeft" || e.key === "ArrowDown") { set(v - s); e.preventDefault(); }
        else if (e.key === "ArrowRight" || e.key === "ArrowUp") { set(v + s); e.preventDefault(); }
        stopAuto();
      });
    }
    set(50);
    if (auto) {
      var visible = true;
      if ("IntersectionObserver" in window) new IntersectionObserver(function (en) { visible = en[0].isIntersecting; }).observe(ba);
      (function loop(t) {
        if (!auto) return;
        if (!start) start = t;
        if (visible) set(50 + Math.sin((t - start) / 1400) * 32);
        raf = requestAnimationFrame(loop);
      })(performance.now());
    }
  });

  /* ---------- Galerie filtrable ---------- */
  $$("[data-filters]").forEach(function (wrap) {
    var gal = d.getElementById(wrap.getAttribute("data-filters"));
    if (!gal) return;
    var items = $$(".g-item", gal);
    $$("button", wrap).forEach(function (b) {
      b.addEventListener("click", function () {
        var f = b.getAttribute("data-f");
        $$("button", wrap).forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
        items.forEach(function (it) {
          var show = f === "all" || (" " + it.getAttribute("data-cat") + " ").indexOf(" " + f + " ") > -1;
          if (show) {
            it.hidden = false;
            requestAnimationFrame(function () { it.classList.remove("is-out"); });
          } else {
            it.classList.add("is-out");
            setTimeout(function () { if (it.classList.contains("is-out")) it.hidden = true; }, reduce ? 0 : 320);
          }
        });
        var live = d.getElementById("gallery-live");
        if (live) setTimeout(function () { live.textContent = items.filter(function (i) { return !i.hidden; }).length + " " + (live.getAttribute("data-label") || ""); }, 360);
      });
    });
  });

  /* ---------- Lightbox (photos + vidéos) ---------- */
  var lb = $("#lightbox");
  if (lb) {
    var fig = $("figure", lb), list = [], idx = 0, lastFocus;
    function collect() { list = $$("[data-lb]").filter(function (el) { var it = el.closest(".g-item"); return !it || !it.hidden; }); }
    function show(i) {
      idx = (i + list.length) % list.length;
      var el = list[idx], src = el.getAttribute("data-lb"), cap = el.getAttribute("data-cap") || "", html;
      if (el.getAttribute("data-type") === "video") {
        html = '<video controls autoplay muted playsinline preload="metadata" poster="' + el.getAttribute("data-poster") + '">' +
          '<source src="' + src.replace(/\.mp4$/, ".webm") + '" type="video/webm"><source src="' + src + '" type="video/mp4"></video>';
      } else {
        html = '<img src="' + src + '" alt="' + cap.replace(/"/g, "&quot;") + '">';
      }
      fig.innerHTML = html + "<figcaption>" + cap + "</figcaption>";
    }
    function open(el) {
      collect(); lastFocus = el;
      show(list.indexOf(el));
      lb.classList.add("open"); lb.setAttribute("aria-hidden", "false"); d.body.classList.add("menu-open");
      $(".lb-close", lb).focus();
    }
    function close() {
      lb.classList.remove("open"); lb.setAttribute("aria-hidden", "true"); d.body.classList.remove("menu-open");
      setTimeout(function () { fig.innerHTML = ""; }, 300);
      lastFocus && lastFocus.focus();
    }
    d.addEventListener("click", function (e) {
      var t = e.target.closest("[data-lb]");
      if (t) { e.preventDefault(); open(t); }
    });
    $(".lb-close", lb).addEventListener("click", close);
    $(".lb-prev", lb).addEventListener("click", function () { show(idx + (rtl ? 1 : -1)); });
    $(".lb-next", lb).addEventListener("click", function () { show(idx + (rtl ? -1 : 1)); });
    lb.addEventListener("click", function (e) { if (e.target === lb) close(); });
    d.addEventListener("keydown", function (e) {
      if (!lb.classList.contains("open")) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") show(idx + 1);
      if (e.key === "ArrowLeft") show(idx - 1);
      if (e.key === "Tab") { // piège du focus dans la lightbox
        var f = $$("button,video", lb), first = f[0], last = f[f.length - 1];
        if (e.shiftKey && d.activeElement === first) { last.focus(); e.preventDefault(); }
        else if (!e.shiftKey && d.activeElement === last) { first.focus(); e.preventDefault(); }
      }
    });
  }

  /* ---------- FAQ en accordéon animé ---------- */
  $$(".faq details").forEach(function (det) {
    var sum = $("summary", det), body = $(".faq-a", det);
    sum.addEventListener("click", function (e) {
      if (reduce || !body.animate) return;
      e.preventDefault();
      if (det.open) {
        var h = body.offsetHeight;
        body.animate([{ height: h + "px", opacity: 1 }, { height: "0px", opacity: 0 }], { duration: 260, easing: "ease" }).onfinish = function () { det.open = false; };
      } else {
        det.open = true;
        var h2 = body.offsetHeight;
        body.animate([{ height: "0px", opacity: 0 }, { height: h2 + "px", opacity: 1 }], { duration: 320, easing: "cubic-bezier(.2,.7,.2,1)" });
      }
    });
  });

  /* ---------- Carte interactive des villes ---------- */
  $$("[data-map]").forEach(function (wrap) {
    var links = $$("[data-city]", wrap);
    function hl(id, on) { links.forEach(function (l) { if (l.getAttribute("data-city") === id) l.classList.toggle("active", on); }); }
    links.forEach(function (l) {
      var id = l.getAttribute("data-city");
      ["mouseenter", "focus"].forEach(function (ev) { l.addEventListener(ev, function () { hl(id, true); }); });
      ["mouseleave", "blur"].forEach(function (ev) { l.addEventListener(ev, function () { hl(id, false); }); });
    });
  });

  /* ---------- Formulaire de contact -> WhatsApp ou e-mail (aucun backend) ---------- */
  var form = $("#contact-form");
  if (form) {
    function msg() {
      var g = function (n) { var el = form.elements[n]; return el ? el.value.trim() : ""; };
      var L = form.dataset;
      var sep = root.lang === "fr" ? " : " : ": ";
      var lines = [L.hello, "", L.lname + sep + g("name"), L.lphone + sep + g("phone"), L.lcity + sep + g("city"), L.lservice + sep + g("service"), "", g("message")];
      return lines.join("\n");
    }
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.reportValidity()) return;
      var via = (e.submitter && e.submitter.value) || "wa";
      if (via === "mail") {
        location.href = "mailto:" + form.dataset.email + "?subject=" + encodeURIComponent(form.dataset.subject) + "&body=" + encodeURIComponent(msg());
      } else {
        window.open("https://wa.me/" + form.dataset.wa + "?text=" + encodeURIComponent(msg()), "_blank", "noopener");
      }
    });
  }

  /* ---------- Étapes du chantier : apparaissent une par une au défilement ---------- */
  $$(".timeline").forEach(function (tl) {
    var items = $$("li", tl), n = items.length, ticking = false;
    var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
    tl.classList.add("tl-js");
    function update() {
      ticking = false;
      var r = tl.getBoundingClientRect(), vh = window.innerHeight;
      // 0 quand le haut de la frise atteint 85 % de l'écran, 1 quand son bas atteint 55 %
      var startY = vh * 0.85, endY = vh * 0.55;
      var p = (startY - r.top) / Math.max(1, (startY - endY) + r.height);
      p = Math.max(0, Math.min(1, p));
      var active = reduce ? n : Math.min(n, Math.floor(p * (n + 0.6)));
      items.forEach(function (li, i) { li.classList.toggle("on", i < active); });
      tl.style.setProperty("--tp", n > 1 ? Math.max(0, (active - 1) / (n - 1)) : 1);
      // la ligne verticale (mobile) s’arrête au centre du dernier rond
      tl.style.setProperty("--tl-h", Math.max(0, items[n - 1].offsetTop) + "px");
    }
    function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", onScroll);
    update();
  });

  /* ---------- Année du footer ---------- */
  $$("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();
