/* Groundwork Takeoff — site interactions
   Reveal-on-scroll, nav, pricing toggle, counters, scroll progress. */
(function () {
  "use strict";

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- Reveal on scroll ---- */
  var revealEls = document.querySelectorAll(".reveal, .hero-shot");
  if ("IntersectionObserver" in window && !reduced) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---- Stagger children marked with data-stagger ---- */
  document.querySelectorAll("[data-stagger]").forEach(function (parent) {
    Array.prototype.forEach.call(parent.children, function (child, i) {
      child.classList.add("reveal");
      child.style.setProperty("--d", (i * 0.08).toFixed(2) + "s");
      if (!reduced && "IntersectionObserver" in window) {
        var io2 = new IntersectionObserver(
          function (entries) {
            entries.forEach(function (e) {
              if (e.isIntersecting) {
                e.target.classList.add("in");
                io2.unobserve(e.target);
              }
            });
          },
          { threshold: 0.1 }
        );
        io2.observe(child);
      } else {
        child.classList.add("in");
      }
    });
  });

  /* ---- Scroll progress bar ---- */
  var bar = document.getElementById("scrollbar");
  if (bar) {
    var onScroll = function () {
      var h = document.documentElement;
      var max = h.scrollHeight - h.clientHeight;
      bar.style.width = (max > 0 ? (h.scrollTop / max) * 100 : 0) + "%";
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ---- Mobile nav ---- */
  var burger = document.querySelector(".nav-burger");
  var links = document.querySelector(".nav-links");
  if (burger && links) {
    burger.addEventListener("click", function () {
      links.classList.toggle("open");
      burger.setAttribute("aria-expanded", links.classList.contains("open"));
    });
  }

  /* ---- Animated counters ---- */
  var counters = document.querySelectorAll("[data-count]");
  if (counters.length && !reduced && "IntersectionObserver" in window) {
    var cio = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (!e.isIntersecting) return;
          cio.unobserve(e.target);
          var el = e.target;
          var target = parseFloat(el.getAttribute("data-count"));
          var prefix = el.getAttribute("data-prefix") || "";
          var suffix = el.getAttribute("data-suffix") || "";
          var dec = (el.getAttribute("data-count").split(".")[1] || "").length;
          var t0 = null;
          var dur = 1400;
          function step(ts) {
            if (!t0) t0 = ts;
            var p = Math.min((ts - t0) / dur, 1);
            var eased = 1 - Math.pow(1 - p, 3);
            el.textContent = prefix + (target * eased).toFixed(dec) + suffix;
            if (p < 1) requestAnimationFrame(step);
          }
          requestAnimationFrame(step);
        });
      },
      { threshold: 0.6 }
    );
    counters.forEach(function (el) { cio.observe(el); });
  }

  /* ---- Pricing toggle (annual / monthly) ---- */
  var toggle = document.querySelector(".toggle");
  if (toggle) {
    var setMode = function (annual) {
      toggle.setAttribute("aria-checked", annual ? "true" : "false");
      document.querySelectorAll("[data-annual]").forEach(function (el) {
        el.textContent = annual ? el.getAttribute("data-annual") : el.getAttribute("data-monthly");
      });
      document.querySelectorAll("[data-annual-html]").forEach(function (el) {
        el.innerHTML = annual ? el.getAttribute("data-annual-html") : el.getAttribute("data-monthly-html");
      });
      document.querySelectorAll(".tlabel").forEach(function (l) {
        l.classList.toggle("active", (l.getAttribute("data-mode") === "annual") === annual);
      });
    };
    document.querySelectorAll(".tlabel").forEach(function (l) {
      l.addEventListener("click", function () { setMode(l.getAttribute("data-mode") === "annual"); });
    });
    toggle.addEventListener("click", function () {
      setMode(toggle.getAttribute("aria-checked") !== "true");
    });
    setMode(true);
  }

  /* ---- Current-page nav highlight ---- */
  var path = location.pathname.replace(/\/index\.html$/, "/");
  document.querySelectorAll(".nav-links a").forEach(function (a) {
    var href = a.getAttribute("href");
    if (!href || href.charAt(0) === "#") return;
    var ap = a.pathname.replace(/\/index\.html$/, "/");
    if (ap === path) a.setAttribute("aria-current", "page");
  });

  /* ---- Footer year ---- */
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });
})();

/* ============ Flair layer ============ */
(function () {
  "use strict";
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine = window.matchMedia("(pointer: fine)").matches;

  /* Film grain + hero aurora (every page) */
  var grain = document.createElement("div");
  grain.className = "grain";
  document.body.appendChild(grain);
  var hero = document.querySelector(".hero");
  if (hero) {
    var aurora = document.createElement("div");
    aurora.className = "aurora";
    aurora.innerHTML = "<i></i><i></i><i></i>";
    hero.insertBefore(aurora, hero.firstChild);
  }

  /* Word-stagger the main headline */
  var h1 = document.querySelector("h1.display");
  if (h1 && !reduced) {
    var wi = 0;
    var wrapWords = function (node, grad) {
      Array.prototype.slice.call(node.childNodes).forEach(function (child) {
        if (child.nodeType === 3) {
          var frag = document.createDocumentFragment();
          child.textContent.split(/(\s+)/).forEach(function (part) {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
            var w = document.createElement("span");
            w.className = "word" + (grad ? " grad-text" : "");
            w.style.setProperty("--wd", (0.12 + wi * 0.07).toFixed(2) + "s");
            w.textContent = part;
            frag.appendChild(w);
            wi++;
          });
          node.replaceChild(frag, child);
        } else if (child.nodeType === 1 && child.tagName !== "BR") {
          if (child.classList.contains("grad-text")) {
            // animate the whole gradient phrase as one unit so the gradient stays continuous
            child.classList.add("word");
            child.style.setProperty("--wd", (0.12 + wi * 0.07).toFixed(2) + "s");
            wi += Math.max(child.textContent.trim().split(/\s+/).length - 1, 0) + 1;
          } else {
            wrapWords(child, grad);
          }
        }
      });
    };
    h1.classList.remove("reveal");
    h1.classList.add("in");
    wrapWords(h1, false);
  }

  /* Cursor spotlight on cards */
  if (fine) {
    document.querySelectorAll(".bento-card, .price-card, .vs-card, .quote-card").forEach(function (card) {
      card.classList.add("spot");
      card.addEventListener("mousemove", function (e) {
        var r = card.getBoundingClientRect();
        card.style.setProperty("--mx", (e.clientX - r.left) + "px");
        card.style.setProperty("--my", (e.clientY - r.top) + "px");
      });
    });
  }

  /* Hero screenshot 3D tilt */
  var shot = document.querySelector(".hero-shot");
  if (shot && fine && !reduced) {
    var frame = shot.querySelector(".frame");
    setTimeout(function () { shot.classList.add("tiltable"); }, 1600);
    shot.addEventListener("mousemove", function (e) {
      if (!shot.classList.contains("tiltable")) return;
      var r = shot.getBoundingClientRect();
      var dx = (e.clientX - r.left) / r.width - 0.5;
      var dy = (e.clientY - r.top) / r.height - 0.5;
      frame.style.transform = "rotateY(" + (dx * 5).toFixed(2) + "deg) rotateX(" + (-dy * 4).toFixed(2) + "deg) scale(1.005)";
    });
    shot.addEventListener("mouseleave", function () {
      frame.style.transform = "";
    });
  }

  /* Blueprint scroll set piece — real-sheet takeoff overlay */
  var scene = document.querySelector(".bp-scene");
  if (scene) {
    var walls = Array.prototype.slice.call(scene.querySelectorAll(".wall"));
    var lenchips = Array.prototype.slice.call(scene.querySelectorAll(".lenchip"));
    var areas = Array.prototype.slice.call(scene.querySelectorAll(".area-f"));
    var sfchips = Array.prototype.slice.call(scene.querySelectorAll(".sfchip"));
    var counts = Array.prototype.slice.call(scene.querySelectorAll(".cnt"));
    var cross = scene.querySelector("#bp-cross");
    var vLF = document.getElementById("bp-lf");
    var vSF = document.getElementById("bp-sf");
    var vEA = document.getElementById("bp-ea");
    var caption = scene.querySelector(".bp-caption");
    var AREA_VALS = [840.39, 112.05, 520.24];
    var TOTAL_SF = "1,472.68 SF";
    var wallFt = walls.map(function (w) { return parseFloat(w.getAttribute("data-ft")) || 0; });
    var totalFt = wallFt.reduce(function (a, b) { return a + b; }, 0);

    walls.forEach(function (p) {
      var len = p.getTotalLength();
      p.dataset.len = len;
      p.style.strokeDasharray = len;
      p.style.strokeDashoffset = len;
    });


    if (reduced) {
      walls.forEach(function (p) { p.style.strokeDashoffset = 0; });
      lenchips.concat(sfchips).forEach(function (c) { c.setAttribute("opacity", 1); });
      areas.forEach(function (a) { a.style.opacity = 1; });
      counts.forEach(function (c) { c.style.opacity = 1; });
      if (cross) cross.style.opacity = 0;
      if (vLF) vLF.textContent = totalFt + " LF";
      if (vSF) vSF.textContent = TOTAL_SF;
      if (vEA) vEA.textContent = counts.length + " EA";
      if (caption) caption.classList.add("show");
    } else {
      var clamp01 = function (v) { return Math.min(Math.max(v, 0), 1); };
      var onScroll = function () {
        var r = scene.getBoundingClientRect();
        var total = r.height - window.innerHeight;
        var p = clamp01(-r.top / total);

        // 0 – .42: walls trace in sequence, crosshair rides the pen tip
        var wp = clamp01(p / 0.42);
        var per = 1 / walls.length;
        var ftDrawn = 0;
        var tip = null;
        walls.forEach(function (path, i) {
          var lp = clamp01((wp - i * per) / per);
          var len = parseFloat(path.dataset.len);
          path.style.strokeDashoffset = len * (1 - lp);
          ftDrawn += wallFt[i] * lp;
          if (lenchips[i]) lenchips[i].setAttribute("opacity", lp >= 1 ? 1 : 0);
          if (lp > 0 && lp < 1) { try { tip = path.getPointAtLength(len * lp); } catch (e) {} }
        });
        if (cross) {
          if (tip && wp < 1) {
            cross.setAttribute("transform", "translate(" + tip.x + "," + tip.y + ")");
            cross.style.opacity = 1;
          } else {
            cross.style.opacity = 0;
          }
        }

        // .46 – .68: areas fill room by room, SF accumulates the real values
        var ap = clamp01((p - 0.46) / 0.22);
        var sf = 0;
        var allAreas = true;
        areas.forEach(function (a, i) {
          var partial = clamp01((ap - i / areas.length) * areas.length);
          a.style.opacity = partial > 0.04 ? 1 : 0;
          if (sfchips[i]) sfchips[i].setAttribute("opacity", partial >= 1 ? 1 : 0);
          sf += AREA_VALS[i] * partial;
          if (partial < 1) allAreas = false;
        });

        // .7 – .88: count markers pop
        var cp = clamp01((p - 0.7) / 0.18);
        var placed = 0;
        counts.forEach(function (c, i) {
          var on = cp > i / counts.length;
          c.style.opacity = on ? 1 : 0;
          var pop = c.querySelector(".cntpop");
          if (pop) pop.style.transform = on ? "scale(1)" : "scale(.4)";
          if (on) placed++;
        });

        if (vLF) vLF.textContent = Math.round(ftDrawn) + " LF";
        if (vSF) vSF.textContent = allAreas ? TOTAL_SF : Math.round(sf).toLocaleString() + " SF";
        if (vEA) vEA.textContent = placed + " EA";
        if (caption) caption.classList.toggle("show", p > 0.92);
      };
      window.addEventListener("scroll", onScroll, { passive: true });
      onScroll();
    }
  }
})();

/* ============ Bluebeam-pattern layer ============ */
(function () {
  "use strict";

  /* Announcement banner — real countdown to Revu 20 EOL (Dec 31, 2026) */
  try {
    if (!localStorage.getItem("gwBannerDismissed")) {
      var days = Math.max(Math.ceil((new Date("2026-12-31T23:59:59") - new Date()) / 86400000), 0);
      var inCompare = location.pathname.indexOf("/compare/") !== -1;
      var link = (inCompare ? "" : "compare/") + "bluebeam.html";
      var b = document.createElement("div");
      b.className = "banner";
      b.innerHTML =
        '<span class="banner-tag">HEADS UP</span>' +
        '<span><b>Bluebeam Revu 20 reaches end-of-life in ' + days + ' days.</b>' +
        '<span class="banner-hide-sm"> Perpetual holdouts lose Studio, updates, and support Dec 31.</span></span>' +
        '<a class="banner-cta" href="' + link + '">See your exit plan →</a>' +
        '<button class="banner-x" aria-label="Dismiss">×</button>';
      document.body.appendChild(b);
      document.body.classList.add("has-banner");
      b.querySelector(".banner-x").addEventListener("click", function () {
        b.remove();
        document.body.classList.remove("has-banner");
        try { localStorage.setItem("gwBannerDismissed", "1"); } catch (e) {}
      });
    }
  } catch (e) {}

  /* Generic tabs */
  document.querySelectorAll(".tabs").forEach(function (tabs) {
    var btns = tabs.querySelectorAll(".tab-btn");
    var panels = tabs.querySelectorAll(".tab-panel");
    btns.forEach(function (btn, i) {
      btn.addEventListener("click", function () {
        btns.forEach(function (b) { b.setAttribute("aria-selected", "false"); });
        panels.forEach(function (p) { p.classList.remove("active"); });
        btn.setAttribute("aria-selected", "true");
        panels[i].classList.add("active");
      });
    });
  });

  /* ROI calculator */
  var roi = document.querySelector(".roi");
  if (roi) {
    var inputs = {
      tw: document.getElementById("roi-tw"),   // takeoffs per week
      ht: document.getElementById("roi-ht"),   // hours per takeoff
      rate: document.getElementById("roi-rate"), // loaded $/hr
      save: document.getElementById("roi-save"), // % time saved (user's own assumption)
    };
    var out = document.getElementById("roi-out");
    var sub = document.getElementById("roi-sub");
    var upd = function () {
      var tw = +inputs.tw.value, ht = +inputs.ht.value, rate = +inputs.rate.value, save = +inputs.save.value;
      document.getElementById("rv-tw").textContent = tw;
      document.getElementById("rv-ht").textContent = ht;
      document.getElementById("rv-rate").textContent = "$" + rate;
      document.getElementById("rv-save").textContent = save + "%";
      var hoursSaved = tw * 48 * ht * (save / 100); // 48 working weeks
      var dollars = hoursSaved * rate;
      out.textContent = "$" + Math.round(dollars).toLocaleString() + "/yr";
      sub.textContent = Math.round(hoursSaved).toLocaleString() +
        " estimator-hours back per year · seat pays for itself " +
        (dollars > 0 ? Math.max(Math.round(dollars / 950), 0) + "×" : "—") + " over";
    };
    Object.keys(inputs).forEach(function (k) { inputs[k].addEventListener("input", upd); });
    upd();
  }
})();
