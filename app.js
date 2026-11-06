// app.js
// app.js — stable tabs smooth hover, no page jerk

(function () {
  const ready = (fn) => {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  };

  ready(() => {
    document.body.classList.add("js-ready");

    const $ = (sel, root = document) => root.querySelector(sel);
    const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

    const mqDesktop = window.matchMedia("(min-width: 992px)");
    const isDesktop = () => mqDesktop.matches;

    // Burger menu
    const menuToggle = $("#menuToggle");
    const sideMenu = $("#sideMenu");
    const menuOverlay = $("#menuOverlay");

    function setDesktopMenuState() {
      if (!sideMenu || !menuOverlay) return;
      if (isDesktop()) {
        sideMenu.classList.add("open");
        menuOverlay.classList.add("hidden");
      } else {
        sideMenu.classList.remove("open");
        menuOverlay.classList.add("hidden");
      }
    }

    function toggleMenu(force) {
      if (!sideMenu || !menuOverlay) return;
      if (isDesktop()) return;

      const willOpen =
        typeof force === "boolean" ? force : !sideMenu.classList.contains("open");
      sideMenu.classList.toggle("open", willOpen);
      menuOverlay.classList.toggle("hidden", !willOpen);
    }

    if (menuToggle) menuToggle.addEventListener("click", () => toggleMenu());
    if (menuOverlay) menuOverlay.addEventListener("click", () => toggleMenu(false));
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") toggleMenu(false);
    });

    mqDesktop.addEventListener("change", setDesktopMenuState);
    setDesktopMenuState();

    // Pages switch
    const pages = {
      about: $("#page-about"),
      exp: $("#page-exp"),
      edu: $("#page-edu"),
    };

    const menuLinks = [

...$$(".side-menu__link"),

...$$(".top-nav__link"),

];

    function openPage(key) {
      Object.keys(pages).forEach((k) => {
        if (!pages[k]) return;
        pages[k].classList.toggle("active", k === key);
      });

      menuLinks.forEach((btn) => {
        btn.classList.toggle("active", btn.dataset.page === key);
      });

      toggleMenu(false);

      const swap = () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
        requestAnimationFrame(() => initReveal());
      };

      if (document.startViewTransition) {
        document.startViewTransition(swap);
      } else {
        swap();
      }
    }

    menuLinks.forEach((btn) => {
      btn.addEventListener("click", () => openPage(btn.dataset.page));
    });

    // Tabs core
    function initTabs({
      tabsSelector,
      panelsSelector,
      tabKey,
      panelKey,
      defaultKey,
      container,
      hoverDelay = 140,
      animLock = 420,
    }) {
      const tabs = $$(tabsSelector);
      const panels = $$(panelsSelector);
      if (!tabs.length || !panels.length) return;

      if (container) {
  container.style.minHeight = "";
  container.classList.remove("is-animating");
}

      panels.forEach((p) => p.classList.remove("hidden"));

      let lockTimer = null;
      let hoverTimer = null;
      let activeKey = null;

      function measureMaxHeight() {
        let maxH = 0;
        panels.forEach((p) => {
          const prevMax = p.style.maxHeight;
          const prevVis = p.style.visibility;

          p.style.maxHeight = "9999px";
          p.style.visibility = "hidden";

          maxH = Math.max(maxH, p.scrollHeight);

          p.style.maxHeight = prevMax;
          p.style.visibility = prevVis;
        });
        return maxH;
      }
      function setContainerMinHeight(px) {
        if (!container) return;
        container.style.minHeight = `${px}px`;
      }

      function lockHeight() {
        if (!container) return;
        const rect = container.getBoundingClientRect();
        container.style.minHeight = `${Math.ceil(rect.height)}px`;
        container.classList.add("is-animating");
        clearTimeout(lockTimer);
        lockTimer = setTimeout(() => {
          container.classList.remove("is-animating");
        }, animLock);
      }

      function remeasure() {
        if (!container) return;
        if (container.classList.contains("is-animating")) return;
        const maxH = measureMaxHeight();
        setContainerMinHeight(maxH + 1);
      }

      function setActive(key) {
        if (key === activeKey) return;
        activeKey = key;

        lockHeight();

        panels.forEach((p) => {
          p.classList.toggle("is-active", p.dataset[panelKey] === key);
        });

        tabs.forEach((t) => {
          t.classList.toggle("active", t.dataset[tabKey] === key);
        });

        setTimeout(remeasure, 60);
      }

      // initial
      const initialKey =
        (tabs.find((t) => t.classList.contains("active")) || {}).dataset?.[tabKey] ||
        defaultKey;
      setActive(initialKey);
      remeasure();

      // click always
      tabs.forEach((t) =>
        t.addEventListener("click", () => setActive(t.dataset[tabKey]))
      );

      // hover
      tabs.forEach((t) => {
        t.addEventListener("mouseenter", () => {
          clearTimeout(hoverTimer);
          hoverTimer = setTimeout(() => setActive(t.dataset[tabKey]), hoverDelay);
        });
        t.addEventListener("mouseleave", () => clearTimeout(hoverTimer));
      });

      window.addEventListener("resize", remeasure);
      mqDesktop.addEventListener("change", remeasure);
    }

    // Experience tabs
    const experience = $("#experience");
    initTabs({
      tabsSelector: ".exp-tab[data-exp]",
      panelsSelector: ".exp-panel[data-exp-panel]",
      tabKey: "exp",
      panelKey: "expPanel",
      defaultKey: "network",
      container: experience ? experience.querySelector(".experience-content") : null,
      hoverDelay: 160,
      animLock: 460,
    });

    // Skills tabs
    const skillsTabs = $("#skills-tabs");
    const skillsCard = skillsTabs ? skillsTabs.closest(".card") : null;
    initTabs({
      tabsSelector: ".exp-tab[data-skill]",
      panelsSelector: ".exp-panel[data-skill-panel]",
      tabKey: "skill",
      panelKey: "skillPanel",
      defaultKey: "launch",
      container: skillsCard ? skillsCard.querySelector(".experience-content") : null,
      hoverDelay: 160,
      animLock: 460,
    });

    // Hobby tabs (text)
    const hobbyTabsEl = $("#hobby-tabs");
    const hobbyCard = hobbyTabsEl ? hobbyTabsEl.closest(".card") : null;
    initTabs({
      tabsSelector: ".exp-tab[data-hobby]",
      panelsSelector: ".exp-panel[data-hobby-panel]",
      tabKey: "hobby",
      panelKey: "hobbyPanel",
      defaultKey: "trading",
      container: hobbyCard ? hobbyCard.querySelector(".experience-content") : null,
      hoverDelay: 160,
      animLock: 460,
    });

    // Hobby photos
    const hobbyPhotos = $$(".hobby-photo[data-hobby-photo]");
    const hobbyTabs = $$(".exp-tab[data-hobby]");

    function setHobbyPhoto(key) {
      hobbyPhotos.forEach((ph) => {
        ph.classList.toggle("is-active", ph.dataset.hobbyPhoto === key);
      });
    }

    const initialHobbyKey =
      (hobbyTabs.find((t) => t.classList.contains("active")) || {}).dataset?.hobby ||
      "trading";
    setHobbyPhoto(initialHobbyKey);

    let hobbyHoverTimer = null;
    hobbyTabs.forEach((t) => {
      const key = t.dataset.hobby;

      t.addEventListener("click", () => setHobbyPhoto(key));
      t.addEventListener("mouseenter", () => {
        clearTimeout(hobbyHoverTimer);
        hobbyHoverTimer = setTimeout(() => setHobbyPhoto(key), 160);
      });
      t.addEventListener("mouseleave", () => clearTimeout(hobbyHoverTimer));
    });

    // Image modal
    const imageModal = $("#image-modal");
    const imageModalImg = $("#image-modal-img");

    function openImageModal(src) {
      if (!imageModal || !imageModalImg) return;
      imageModalImg.src = src;
      imageModal.classList.add("open");
    }

    function closeImageModal() {
      if (!imageModal || !imageModalImg) return;
      imageModal.classList.remove("open");
      imageModalImg.src = "";
    }

    if (imageModal) imageModal.addEventListener("click", closeImageModal);

    $$(".zoomable").forEach((el) => {
      if (el.classList.contains('video-card')) return;
      el.addEventListener("click", () => {
        if (el.classList.contains("is-missing")) return;
        const fullSrc = el.dataset.full;
        if (fullSrc) openImageModal(fullSrc);
      });
    });

    // ---- Видео-модалка: одна инициализация на страницу ----
    const videoModalEl = $("#video-modal");
    const videoPlayer = $("#video-modal-player");

    $$(".video-card").forEach((card) => {
      card.addEventListener("click", (e) => {
        e.stopPropagation();
        const url = card.dataset.video;
        if (!url || !videoModalEl || !videoPlayer) return;
        videoPlayer.src = url;
        videoModalEl.classList.add("open");
        const p = videoPlayer.play();
        if (p && p.catch) p.catch(() => {});
      });
    });

    if (videoModalEl) {
      videoModalEl.addEventListener("click", () => {
        if (videoPlayer) {
          videoPlayer.pause();
          videoPlayer.src = "";
        }
        videoModalEl.classList.remove("open");
      });
    }

    // ---- Появление блоков при прокрутке ----
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const REVEAL_SELECTOR = ".card, .achievement-card, .photo-card, .edu-item, .info-card";
    let revealObserver = null;

    function initReveal() {
      if (reduceMotion || !("IntersectionObserver" in window)) return;

      if (!revealObserver) {
        revealObserver = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (!entry.isIntersecting) return;
              entry.target.classList.add("is-visible");
              revealObserver.unobserve(entry.target);
            });
          },
          { rootMargin: "0px 0px -8% 0px", threshold: 0.05 }
        );
      }

      $$(REVEAL_SELECTOR)
        .filter((el) => el.offsetParent !== null)
        .forEach((el, i) => {
          if (el.classList.contains("reveal")) return;
          el.classList.add("reveal");
          el.style.setProperty("--reveal-delay", `${(i % 5) * 70}ms`);
          revealObserver.observe(el);
        });
    }

    initReveal();

    // ---- Графики роста: рисуются из data-атрибутов, играют один раз ----
    const charts = $$("[data-chart]");

    if (charts.length) {
      const W = 420, BW = 26, LEFT = 10, RIGHT = 16, N = 10;
      const fmt = (n) => String(n).replace(".", ",");

      charts.forEach((card, cardIndex) => {
        const start = Number(card.dataset.start || 0);
        const target = Number(card.dataset.target || 100);
        const unit = card.dataset.unit || "";
        const prefix = card.dataset.prefix || "";
        const footText = card.dataset.foot;
        const label = card.dataset.label || "";
        const period = card.dataset.period || "";
        const suffix = card.dataset.suffix !== undefined ? card.dataset.suffix : "/ мес";
        const gid = "barGrad" + cardIndex;

        // без нижней подписи график выше — заполняет карточку
        const noFoot = footText === "" && !period;
        const VH = noFoot ? 236 : 200;
        const BASE = noFoot ? 224 : 190;
        const MAXH = noFoot ? 198 : 162;

        const gap = (W - LEFT - RIGHT - BW * N) / (N - 1);
        const bars = [];
        const pts = [];

        const barsStart = card.dataset.barsStart !== undefined ? Number(card.dataset.barsStart) : start;
        const barsTarget = card.dataset.barsTarget !== undefined ? Number(card.dataset.barsTarget) : target;

        for (let i = 0; i < N; i++) {
          const t = i / (N - 1);
          const v = barsStart + (barsTarget - barsStart) * Math.pow(t, 2.3);
          const h = Math.max(6, Math.round((MAXH * v) / barsTarget));
          const x = LEFT + i * (BW + gap);
          const y = BASE - h;
          bars.push(
            '<rect class="bar" style="--i:' + i + ';fill:url(#' + gid + ')" x="' +
            x.toFixed(1) + '" y="' + y.toFixed(1) + '" width="' + BW + '" height="' + h + '" rx="3"/>'
          );
          pts.push({ x: x + BW / 2, y: y - 14 });
        }

        let d = "M " + pts[0].x.toFixed(1) + " " + pts[0].y.toFixed(1);
        for (let i = 0; i < pts.length - 1; i++) {
          const xc = (pts[i].x + pts[i + 1].x) / 2;
          d += " C " + xc.toFixed(1) + " " + pts[i].y.toFixed(1) +
               ", " + xc.toFixed(1) + " " + pts[i + 1].y.toFixed(1) +
               ", " + pts[i + 1].x.toFixed(1) + " " + pts[i + 1].y.toFixed(1);
        }

        const last = pts[pts.length - 1];
        const prev = pts[pts.length - 2];
        const ang = Math.atan2(last.y - prev.y, last.x - prev.x);
        const tipX = last.x + Math.cos(ang) * 7;
        const tipY = last.y + Math.sin(ang) * 7;
        const bx = tipX - 16 * Math.cos(ang);
        const by = tipY - 16 * Math.sin(ang);
        const nx = Math.sin(ang) * 8;
        const ny = -Math.cos(ang) * 8;
        const arrow = "M " + tipX.toFixed(1) + " " + tipY.toFixed(1) +
                      " L " + (bx + nx).toFixed(1) + " " + (by + ny).toFixed(1) +
                      " L " + (bx - nx).toFixed(1) + " " + (by - ny).toFixed(1) + " Z";

        card.innerHTML =
          '<div class="chart-head">' +
            '<span class="chart-label">' + label + '</span>' +
            '<span class="chart-value"><span class="chart-value__num">' + prefix + fmt(start) +
              '</span><span class="chart-value__unit">' + unit + '</span></span>' +
          '</div>' +
          '<svg class="growth-chart" viewBox="0 0 ' + W + ' ' + VH + '" aria-hidden="true" focusable="false">' +
            '<defs><linearGradient id="' + gid + '" x1="0" y1="1" x2="0" y2="0">' +
              '<stop offset="0%" stop-color="#1b7f78"/><stop offset="100%" stop-color="#8ffbe6"/>' +
            '</linearGradient></defs>' +
            bars.join("") +
            '<path class="trend" d="' + d + '"/>' +
            '<path class="arrow-head" d="' + arrow + '"/>' +
          '</svg>' +
          (footText === "" && !period ? "" :
            '<div class="chart-foot">' +
              '<span class="chart-foot__start">' + (footText !== undefined ? footText : fmt(start) + ' ' + unit) + (suffix ? '<span>' + suffix + '</span>' : '') + '</span>' +
              (period ? '<span class="chart-foot__period">' + period + '</span>' : '') +
            '</div>');

        const numEl = card.querySelector(".chart-value__num");
        let started = false;

        const run = () => {
          card.classList.add("is-drawn");

          if (reduceMotion) {
            if (numEl) numEl.textContent = prefix + fmt(target);
            return;
          }

          const dur = 2800;
          const t0 = performance.now();
          const tick = (now) => {
            const p = Math.min(1, (now - t0) / dur);
            const eased = 1 - Math.pow(1 - p, 3);
            if (numEl) numEl.textContent = prefix + fmt(Math.round((start + (target - start) * eased) * 10) / 10);
            if (p < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        };

        if ("IntersectionObserver" in window) {
          const io = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
              if (!entry.isIntersecting || started) return;
              started = true;
              run();
              io.disconnect();
            });
          }, { threshold: 0.2 });
          io.observe(card);
        } else {
          run();
        }
      });
    }

    // ---- Если картинки инфографики ещё нет — показать подсказку вместо битой иконки ----
    $$(".info-card img").forEach((img) => {
      const fallback = () => {
        const card = img.closest(".info-card");
        if (card) card.classList.add("is-missing");
      };
      img.addEventListener("error", fallback);
      if (img.complete && img.naturalWidth === 0) fallback();
    });

    // ---- Команда: раз в 3 секунды подрастают 1-3 случайных человека ----
    const teamIcons = $$(".team-grid i");

    if (teamIcons.length && !reduceMotion) {
      setInterval(() => {
        const count = 1 + Math.floor(Math.random() * 2);
        const pool = teamIcons.slice();
        const picked = [];

        for (let i = 0; i < count && pool.length; i++) {
          const j = Math.floor(Math.random() * pool.length);
          picked.push(pool.splice(j, 1)[0]);
        }

        picked.forEach((el) => {
          el.classList.remove("is-pulse");
          void el.offsetWidth;
          el.classList.add("is-pulse");
        });

        setTimeout(() => {
          picked.forEach((el) => el.classList.remove("is-pulse"));
        }, 950);
      }, 3000);
    }


    // ---- Шестерня: шаг поворота раз в 3 секунды ----
    const gearIcon = document.querySelector(".scrum-core i");

    if (gearIcon && !reduceMotion) {
      let gearDeg = 0;
      setInterval(() => {
        gearDeg += 30;
        gearIcon.style.transform = "rotate(" + gearDeg + "deg)";
      }, 3000);
    }

    // ---- Щит: искра в случайной точке раз в 3 секунды ----
    const sparks = Array.prototype.slice.call(document.querySelectorAll(".shield-spark"));

    if (sparks.length && !reduceMotion) {
      let lastSpark = -1;

      setInterval(() => {
        let idx = Math.floor(Math.random() * sparks.length);
        if (idx === lastSpark) idx = (idx + 1) % sparks.length;
        lastSpark = idx;

        const el = sparks[idx];
        el.classList.remove("is-on");
        void el.offsetWidth;
        el.classList.add("is-on");
        setTimeout(() => el.classList.remove("is-on"), 800);
      }, 3000);
    }

    // ---- Индикатор прокрутки ----
    const progressBar = document.getElementById("scrollProgress");

    if (progressBar) {
      const updateProgress = () => {
        const h = document.documentElement;
        const max = h.scrollHeight - h.clientHeight;
        const pct = max > 0 ? (h.scrollTop / max) * 100 : 0;
        progressBar.style.width = pct.toFixed(2) + "%";
      };
      window.addEventListener("scroll", updateProgress, { passive: true });
      window.addEventListener("resize", updateProgress);
      updateProgress();
    }

    // ---- Спотлайт под курсором ----
    $$(".info-card, .exp-block, .card, .role-card").forEach((card) => {
      card.addEventListener("pointermove", (e) => {
        const r = card.getBoundingClientRect();
        card.style.setProperty("--mx", (e.clientX - r.left) + "px");
        card.style.setProperty("--my", (e.clientY - r.top) + "px");
      });
    });

    // ---- Счётчики при появлении ----
    const counters = $$("[data-count]");

    if (counters.length && "IntersectionObserver" in window) {
      const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          counterObserver.unobserve(el);

          const target = Number(el.dataset.count || 0);
          const prefix = el.dataset.prefix || "";
          const suffix = el.dataset.suffix || "";

          if (reduceMotion) {
            el.textContent = prefix + target + suffix;
            return;
          }

          const dur = 1100;
          const t0 = performance.now();
          const tick = (now) => {
            const p = Math.min(1, (now - t0) / dur);
            const eased = 1 - Math.pow(1 - p, 3);
            el.textContent = prefix + Math.round(target * eased) + suffix;
            if (p < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        });
      }, { threshold: 0.4 });

      counters.forEach((el) => counterObserver.observe(el));
    }


    // ---- Город и период в шапке опыта ----
    const expMeta = document.getElementById("expMeta");
    const expContent = document.querySelector("#experience .experience-content");

    function syncExpMeta() {
      if (!expMeta || !expContent) return;
      const active = expContent.querySelector(".exp-panel.is-active");
      expMeta.textContent = active ? (active.dataset.meta || "") : "";
    }

    if (expMeta && expContent) {
      syncExpMeta();
      new MutationObserver(syncExpMeta).observe(expContent, {
        subtree: true,
        attributes: true,
        attributeFilter: ["class"],
      });
    }

    // ---- Слайдеры «было / стало» ----
    const baCards = $$("[data-ba]");

    baCards.forEach((card) => {
      const track = card.querySelector(".ba-track");
      const buttons = Array.prototype.slice.call(card.querySelectorAll(".ba-btn"));
      if (!track || !buttons.length) return;

      let index = 1;

      const go = (next) => {
        index = Math.max(0, Math.min(1, next));
        track.style.transform = "translateX(" + (-50 * index) + "%)";
        buttons.forEach((b, i) => b.classList.toggle("is-active", i === index));
      };

      buttons.forEach((b) => {
        b.addEventListener("click", () => go(Number(b.dataset.baI)));
      });

      go(1);

      let startX = null;
      card.addEventListener("pointerdown", (e) => {
        startX = e.clientX;
      });
      card.addEventListener("pointerup", (e) => {
        if (startX === null) return;
        const dx = e.clientX - startX;
        if (Math.abs(dx) > 45) go(index + (dx < 0 ? 1 : -1));
        startX = null;
      });
      card.addEventListener("pointercancel", () => { startX = null; });
    });


    // ---- Копирование контактов ----
    const copyToast = document.createElement("div");
    copyToast.className = "copy-toast";
    document.body.appendChild(copyToast);

    $$("[data-copy]").forEach((el) => {
      el.addEventListener("click", async () => {
        const value = el.dataset.copy || "";
        try {
          await navigator.clipboard.writeText(value);
        } catch (e) {
          const ta = document.createElement("textarea");
          ta.value = value;
          document.body.appendChild(ta);
          ta.select();
          document.execCommand("copy");
          ta.remove();
        }
        copyToast.textContent = "Скопировано: " + value;
        copyToast.classList.add("is-visible");
        clearTimeout(copyToast._t);
        copyToast._t = setTimeout(() => copyToast.classList.remove("is-visible"), 1800);
      });
    });

    // ---- Тумблер «оставить только цифры» ----
    const numbersToggle = document.getElementById("numbersOnly");
    const COWBOY = [
      "Ковбой вывел ранчо из убытка: +38% выручки за сезон.",
      "Сократил расходы на овёс на 19%, поголовье не пострадало.",
      "Собрал бригаду из 12 ковбоев, текучка — 0%.",
      "Новый маршрут через прерию: время в пути −27%.",
      "Договорился с шерифом: штрафы 87 тыс. → 0.",
      "Забор поставил за 2 недели вместо 6.",
    ];

    if (numbersToggle) {
      $$(".exp-block__list li").forEach((li) => {
        if (/\d/.test(li.textContent)) li.classList.add("has-digits");
      });


      const spawnDust = (rect, count) => {
        for (let i = 0; i < count; i += 1) {
          const dot = document.createElement("span");
          dot.className = "dust";

          dot.style.left = (rect.left + Math.random() * rect.width).toFixed(0) + "px";
          dot.style.top = (rect.top + Math.random() * rect.height).toFixed(0) + "px";
          dot.style.setProperty("--dx", (45 + Math.random() * 150).toFixed(0) + "px");
          dot.style.setProperty("--dy", (-14 + Math.random() * 28).toFixed(0) + "px");
          dot.style.animationDelay = (Math.random() * 300).toFixed(0) + "ms";
          dot.style.width = dot.style.height = (1.5 + Math.random() * 2.5).toFixed(1) + "px";

          document.body.appendChild(dot);
          setTimeout(() => dot.remove(), 2700);
        }
      };

      const dustOut = (done) => {
        const panel = document.querySelector(".exp-panel.is-active");
        const selector = document.body.classList.contains("numbers-on")
          ? ".digits-line"
          : ".exp-block__list li";
        const items = panel
          ? Array.prototype.slice.call(panel.querySelectorAll(selector))
          : [];

        if (!items.length) {
          done();
          return;
        }

        items.forEach((li) => {
          const rect = li.getBoundingClientRect();
          if (!rect.width || !rect.height) return;

          li.style.transition = "opacity .3s ease, filter .3s ease";
          li.style.opacity = "0";
          li.style.filter = "blur(3px)";

          spawnDust(rect, Math.min(90, Math.max(26, Math.round(rect.width / 9))));
        });

        if (panel) {
          const info = panel.querySelector(".exp-infographics");
          if (info) {
            const r = info.getBoundingClientRect();
            if (r.width && r.height) {
              spawnDust(r, Math.min(70, Math.max(18, Math.round(r.width / 16))));
            }
          }
        }

        setTimeout(done, 420);
      };

      numbersToggle.addEventListener("click", () => {
        const willOn = !document.body.classList.contains("numbers-on");
        numbersToggle.disabled = true;

        dustOut(() => {
          document.body.classList.toggle("numbers-on", willOn);
          numbersToggle.classList.toggle("is-on", willOn);

          const infoBlock = document.querySelector(".exp-panel.is-active .exp-infographics");
          if (infoBlock) {
            infoBlock.classList.remove("is-rising", "is-falling");
            void infoBlock.offsetWidth;
            infoBlock.classList.add(willOn ? "is-rising" : "is-falling");
            setTimeout(() => infoBlock.classList.remove("is-rising", "is-falling"), 820);
          }

          setTimeout(() => {
            items_reset();
            numbersToggle.disabled = false;
          }, 360);
        });

        function items_reset() {
          $$(".exp-block__list li, .digits-line").forEach((li) => {
            li.style.opacity = "";
            li.style.filter = "";
            li.style.transition = "";
          });
        }
      });
    }


    // ---- Счётчик посещений (виден только владельцу) ----
    (function () {
      const NS = "vadimglazko-portfolio";
      const KEY = "visits";

      const READ = [
        "https://abacus.jasoncameron.dev/get/" + NS + "/" + KEY,
        "https://api.counterapi.dev/v1/" + NS + "/" + KEY,
      ];
      const BUMP = [
        "https://api.counterapi.dev/v1/" + NS + "/" + KEY + "/up",
        "https://abacus.jasoncameron.dev/hit/" + NS + "/" + KEY,
      ];

      const pick = (data) => {
        if (!data || typeof data !== "object") return null;
        if (typeof data.value === "number") return data.value;
        if (typeof data.count === "number") return data.count;
        if (data.result && typeof data.result.count === "number") return data.result.count;
        if (data.up_count !== undefined) return Number(data.up_count);
        return null;
      };

      const call = async (list) => {
        for (let i = 0; i < list.length; i += 1) {
          try {
            const r = await fetch(list[i], { cache: "no-store" });
            if (!r.ok) continue;
            const v = pick(await r.json());
            if (v !== null && !Number.isNaN(v)) return v;
          } catch (e) { /* следующий сервис */ }
        }
        return null;
      };

      const params = new URLSearchParams(location.search);
      const owner = params.has("stats") || location.hash === "#stats";

      const show = (count) => {
        if (count === null) return;
        const box = document.createElement("div");
        box.className = "visit-counter";
        box.textContent = "Просмотров: " + count;
        box.title = "Видно только по адресу ?stats=1";
        document.body.appendChild(box);
      };

      if (owner) {
        call(READ).then((v) => {
          if (v !== null) show(v);
          else call(BUMP).then(show);
        });
        return;
      }

      if (sessionStorage.getItem("visit-counted")) return;
      sessionStorage.setItem("visit-counted", "1");
      call(BUMP);
    })();

    // ---- Личная статистика: 10 кликов по логотипу ----
    (function () {
      const KEY = "vg-analytics-v1";
      const LABELS = { about: "Обо мне", exp: "Опыт", edu: "Образование" };

      const load = () => {
        try {
          return JSON.parse(localStorage.getItem(KEY) || "null") || {
            pages: { about: { views: 0, ms: 0 }, exp: { views: 0, ms: 0 }, edu: { views: 0, ms: 0 } },
            sessions: 0,
          };
        } catch (e) {
          return { pages: {}, sessions: 0 };
        }
      };

      const save = (data) => {
        try { localStorage.setItem(KEY, JSON.stringify(data)); } catch (e) {}
      };

      let data = load();
      let currentPage = null;
      let openedAt = 0;

      const currentKey = () => {
        const el = document.querySelector(".page.active");
        return el && el.id ? el.id.replace("page-", "") : null;
      };

      const closeTimer = () => {
        if (!currentPage || !openedAt) return;
        const ms = Date.now() - openedAt;
        if (!data.pages[currentPage]) data.pages[currentPage] = { views: 0, ms: 0 };
        data.pages[currentPage].ms += ms;
        openedAt = 0;
        save(data);
      };

      const openTimer = (key) => {
        closeTimer();
        currentPage = key;
        openedAt = Date.now();
        if (!key) return;
        if (!data.pages[key]) data.pages[key] = { views: 0, ms: 0 };
        data.pages[key].views += 1;
        save(data);
      };

      if (!sessionStorage.getItem("vg-session")) {
        sessionStorage.setItem("vg-session", "1");
        data.sessions = (data.sessions || 0) + 1;
        save(data);
      }

      openTimer(currentKey());

      new MutationObserver(() => {
        const key = currentKey();
        if (key && key !== currentPage) openTimer(key);
      }).observe(document.body, { subtree: true, attributes: true, attributeFilter: ["class"] });

      document.addEventListener("visibilitychange", () => {
        if (document.hidden) closeTimer();
        else if (currentPage) openedAt = Date.now();
      });
      window.addEventListener("pagehide", closeTimer);

      const fmtTime = (ms) => {
        if (!ms) return "—";
        const s = Math.round(ms / 1000);
        if (s < 60) return s + " сек";
        const m = Math.floor(s / 60);
        if (m < 60) return m + " мин " + (s % 60) + " с";
        return Math.floor(m / 60) + " ч " + (m % 60) + " мин";
      };

      const build = () => {
        const old = document.querySelector(".stats-panel");
        if (old) old.remove();

        const totalViews = Object.values(data.pages || {}).reduce((a, p) => a + (p.views || 0), 0);
        const totalMs = Object.values(data.pages || {}).reduce((a, p) => a + (p.ms || 0), 0);

        const rows = Object.keys(LABELS).map((key) => {
          const p = (data.pages || {})[key] || { views: 0, ms: 0 };
          const avg = p.views ? p.ms / p.views : 0;
          return "<tr><td>" + LABELS[key] + "</td><td>" + p.views + "</td><td>" +
                 fmtTime(p.ms) + "</td><td>" + fmtTime(avg) + "</td></tr>";
        }).join("");

        const panel = document.createElement("div");
        panel.className = "stats-panel";
        panel.innerHTML =
          '<div class="stats-panel__head"><span>Моя статистика</span>' +
            '<button type="button" class="stats-panel__close" aria-label="Закрыть">×</button></div>' +
          '<div class="stats-panel__row"><span>Всего просмотров</span><b>' + totalViews + '</b></div>' +
          '<div class="stats-panel__row"><span>Времени на сайте</span><b>' + fmtTime(totalMs) + '</b></div>' +
          '<div class="stats-panel__row"><span>Сессий</span><b>' + (data.sessions || 0) + '</b></div>' +
          '<div class="stats-panel__row stats-panel__row--ext"><span>Просмотров сайта всеми</span><b id="statsExt">…</b></div>' +
          '<table class="stats-panel__table"><thead><tr><th>Страница</th><th>Раз</th><th>Всего</th><th>Среднее</th></tr></thead>' +
          '<tbody>' + rows + '</tbody></table>' +
          '<button type="button" class="stats-panel__reset">Сбросить мои данные</button>';

        document.body.appendChild(panel);

        panel.querySelector(".stats-panel__close").addEventListener("click", () => panel.remove());
        panel.querySelector(".stats-panel__reset").addEventListener("click", () => {
          data = { pages: { about: { views: 0, ms: 0 }, exp: { views: 0, ms: 0 }, edu: { views: 0, ms: 0 } }, sessions: 0 };
          save(data);
          panel.remove();
          build();
        });

        fetch("https://abacus.jasoncameron.dev/get/vadimglazko-portfolio/visits", { cache: "no-store" })
          .then((r) => (r.ok ? r.json() : null))
          .then((d) => {
            const el = panel.querySelector("#statsExt");
            if (el) el.textContent = d && typeof d.value === "number" ? d.value : "—";
          })
          .catch(() => {
            const el = panel.querySelector("#statsExt");
            if (el) el.textContent = "—";
          });
      };

      const logo = document.querySelector(".logo");
      if (logo) {
        let clicks = 0;
        let timer = null;
        logo.addEventListener("click", () => {
          clicks += 1;
          clearTimeout(timer);
          timer = setTimeout(() => { clicks = 0; }, 900);
          if (clicks >= 15) {
            clicks = 0;
            clearTimeout(timer);
            build();
          }
        });
      }
    })();
  });
})();
