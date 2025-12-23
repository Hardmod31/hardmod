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
      window.scrollTo({ top: 0, behavior: "smooth" });
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
      el.addEventListener("click", () => {
        const fullSrc = el.dataset.full;
        if (fullSrc) openImageModal(fullSrc);
      });
    });
  });
})();
