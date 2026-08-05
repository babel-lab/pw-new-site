/* =========================================================
   PW Site Header
   - 20260701 update:
     1) 大版 menu panel 顯示全部次選單 group
     2) JS 只負責 active 狀態，不再加 is-menu-filtered 去隱藏其他 group
     3) search / menu / lang 互斥開啟
     4) 小版 search 常駐，不因點外面消失
     5) sticky 狀態使用 .is-sticky
   ========================================================= */

const DEFAULT_OPTIONS = {
  headerSelector: "[data-pw-header]",
  compactMedia: "(max-width: 49.999em)",
  stickyOffset: 80,
  stickyReleaseOffset: 24,
};

const PANEL_NAMES = ["search", "menu", "lang"];

export function initPwSiteHeader(options = {}) {
  const config = {
    ...DEFAULT_OPTIONS,
    ...options,
  };

  document.documentElement.classList.add("pw-has-js");

  const headers = Array.from(document.querySelectorAll(config.headerSelector));

  headers.forEach((header) => {
    setupHeader(header, config);
  });
}

function setupHeader(header, config) {
  if (header.dataset.pwHeaderReady === "true") return;

  header.dataset.pwHeaderReady = "true";

  const compactQuery = window.matchMedia(config.compactMedia);

  const panels = {};
  header.querySelectorAll("[data-pw-panel]").forEach((panel) => {
    const panelName = panel.dataset.pwPanel;

    if (panelName) {
      panels[panelName] = panel;
    }
  });

  const toggles = Array.from(header.querySelectorAll("[data-pw-toggle]"));
  const menuGroups = Array.from(
    header.querySelectorAll("[data-pw-menu-group]"),
  );
  const searchInput = header.querySelector("#pw-header-search-input");

  let activeMenuKey = null;
  let lastTrigger = null;
  let lastIsCompact = isCompact();
  let scrollTicking = false;

  function isCompact() {
    return compactQuery.matches;
  }

  function isSticky() {
    return header.classList.contains("is-sticky");
  }

  function isPersistentPanel(panelName) {
    return panelName === "search" && isCompact() && !isSticky();
  }

  function blurPanelFocus(panelName) {
    const panel = panels[panelName];

    if (!panel) return;

    const activeElement = document.activeElement;

    if (
      activeElement &&
      activeElement instanceof HTMLElement &&
      panel.contains(activeElement)
    ) {
      activeElement.blur();
    }
  }

  function isPanelOpen(panelName) {
    const panel = panels[panelName];

    return panel?.dataset.pwOpen === "true";
  }

  function syncToggleState() {
    toggles.forEach((toggle) => {
      const panelName = toggle.dataset.pwToggle;

      if (!PANEL_NAMES.includes(panelName)) return;

      const panelIsOpen = isPanelOpen(panelName);
      let shouldExpand = panelIsOpen;

      if (panelName === "menu") {
        const toggleMenuKey = toggle.dataset.pwMenuKey || null;

        if (activeMenuKey) {
          shouldExpand = panelIsOpen && toggleMenuKey === activeMenuKey;
        } else {
          shouldExpand = panelIsOpen && !toggleMenuKey;
        }
      }

      toggle.setAttribute("aria-expanded", String(shouldExpand));

      const labelOpen = toggle.dataset.pwLabelOpen;
      const labelClose = toggle.dataset.pwLabelClose;

      if (labelOpen && labelClose) {
        toggle.setAttribute(
          "aria-label",
          shouldExpand ? labelClose : labelOpen,
        );
      }
    });
  }

  function syncActiveMenu() {
    const menuIsOpen = isPanelOpen("menu");

    /*
      20260701：
      大版設計稿是展開完整次選單，不再只顯示單一 group。
      所以這裡只做 active 標示，不再使用 is-menu-filtered。
    */
    header.classList.remove("is-menu-filtered");

    menuGroups.forEach((group) => {
      const isActive =
        menuIsOpen &&
        activeMenuKey &&
        group.dataset.pwMenuGroup === activeMenuKey;

      group.classList.toggle("is-active", Boolean(isActive));
      group.classList.toggle(
        "pw-site-header__menu-group--active",
        Boolean(isActive),
      );
    });

    toggles
      .filter((toggle) => {
        return toggle.dataset.pwToggle === "menu" && toggle.dataset.pwMenuKey;
      })
      .forEach((toggle) => {
        const isActive =
          menuIsOpen &&
          activeMenuKey &&
          toggle.dataset.pwMenuKey === activeMenuKey;

        toggle.classList.toggle("is-active", Boolean(isActive));
        toggle.classList.toggle(
          "pw-site-header__nav-toggle--active",
          Boolean(isActive),
        );
      });

    syncToggleState();
  }

  function setPanelOpen(panelName, shouldOpen) {
    const panel = panels[panelName];

    if (!panel) return;

    if (!shouldOpen) {
      blurPanelFocus(panelName);
    }

    panel.dataset.pwOpen = String(shouldOpen);
    panel.setAttribute("aria-hidden", String(!shouldOpen));

    panel.classList.toggle("is-open", shouldOpen);
    panel.classList.toggle(
      `pw-site-header__${panelName}-panel--open`,
      shouldOpen,
    );

    header.classList.toggle(`is-${panelName}-open`, shouldOpen);
    header.classList.toggle(`pw-site-header--${panelName}-open`, shouldOpen);

    if (panelName === "menu") {
      syncActiveMenu();
    } else {
      syncToggleState();
    }
  }

  function closePanel(panelName, options = {}) {
    const { force = false } = options;

    if (isPersistentPanel(panelName) && !force) {
      setPanelOpen(panelName, true);
      return;
    }

    if (panelName === "menu") {
      activeMenuKey = null;
    }

    setPanelOpen(panelName, false);
  }

  function openPanel(panelName, trigger = null, options = {}) {
    const { menuKey = null } = options;

    PANEL_NAMES.forEach((name) => {
      if (name !== panelName) {
        closePanel(name);
      }
    });

    if (panelName === "menu") {
      activeMenuKey = menuKey;
    }

    setPanelOpen(panelName, true);

    lastTrigger = trigger || lastTrigger;

    if (panelName === "search" && searchInput && (!isCompact() || isSticky())) {
      window.requestAnimationFrame(() => {
        searchInput.focus();
      });
    }
  }

  function closeAllPanels(options = {}) {
    const { restoreFocus = false, force = false } = options;

    PANEL_NAMES.forEach((panelName) => {
      closePanel(panelName, { force });
    });

    if (restoreFocus && lastTrigger) {
      lastTrigger.focus();
    }
  }

  function handleToggleClick(event) {
    const toggle = event.target.closest("[data-pw-toggle]");

    if (!toggle || !header.contains(toggle)) return;

    const panelName = toggle.dataset.pwToggle;

    if (!PANEL_NAMES.includes(panelName)) return;

    event.preventDefault();

    lastTrigger = toggle;

    if (panelName === "menu") {
      const nextMenuKey = toggle.dataset.pwMenuKey || null;
      const menuIsOpen = isPanelOpen("menu");

      /*
        大版主 nav：
        - 點不同主選單：menu panel 維持打開，只換 active 標示
        - 點同一個主選單：關閉 menu panel
        小版 hamburger：
        - 沒有 data-pw-menu-key，所以直接開完整 menu
      */
      const isSameMenu = menuIsOpen && activeMenuKey === nextMenuKey;

      if (isSameMenu) {
        closePanel("menu");
        return;
      }

      openPanel("menu", toggle, {
        menuKey: nextMenuKey,
      });

      return;
    }

    if (isPanelOpen(panelName)) {
      closePanel(panelName, {
        force: panelName === "search",
      });
      return;
    }

    openPanel(panelName, toggle);
  }

  function handleHeaderPanelLinkClick(event) {
    const panelLink = event.target.closest("[data-pw-panel] a");

    if (!panelLink || !header.contains(panelLink)) return;

    closeAllPanels();
  }

  function handleDocumentClick(event) {
    if (header.contains(event.target)) return;

    closeAllPanels();
  }

  function handleDocumentKeydown(event) {
    if (event.key !== "Escape") return;

    const hasOpenClosablePanel = PANEL_NAMES.some((panelName) => {
      return isPanelOpen(panelName) && !isPersistentPanel(panelName);
    });

    if (!hasOpenClosablePanel) return;

    closeAllPanels({
      restoreFocus: true,
    });
  }

  function syncResponsiveState() {
    const nowIsCompact = isCompact();

    if (nowIsCompact) {
      if (isSticky()) {
        closePanel("search", {
          force: true,
        });
      } else {
        setPanelOpen("search", true);
      }

      if (lastIsCompact !== nowIsCompact) {
        activeMenuKey = null;
        syncActiveMenu();
      }
    } else if (lastIsCompact !== nowIsCompact) {
      closePanel("search", {
        force: true,
      });

      activeMenuKey = null;
      syncActiveMenu();
    }

    lastIsCompact = nowIsCompact;
    syncToggleState();
  }

  function syncStickyState() {
    const wasSticky = isSticky();
    const stickyReleaseOffset = config.stickyReleaseOffset ?? 24;

    const shouldSticky = wasSticky
      ? window.scrollY > Math.max(0, config.stickyOffset - stickyReleaseOffset)
      : window.scrollY > config.stickyOffset;

    if (wasSticky === shouldSticky) return;

    header.classList.toggle("is-sticky", shouldSticky);
    header.classList.toggle("pw-site-header--compact", shouldSticky);

    if (isCompact()) {
      if (shouldSticky) {
        closePanel("search", {
          force: true,
        });
      } else {
        setPanelOpen("search", true);
      }
    }

    syncToggleState();
  }

  function handleScroll() {
    if (scrollTicking) return;

    scrollTicking = true;

    window.requestAnimationFrame(() => {
      syncStickyState();
      scrollTicking = false;
    });
  }

  header.addEventListener("click", handleToggleClick);
  header.addEventListener("click", handleHeaderPanelLinkClick);
  document.addEventListener("click", handleDocumentClick);
  document.addEventListener("keydown", handleDocumentKeydown);
  window.addEventListener("scroll", handleScroll, { passive: true });

  if (typeof compactQuery.addEventListener === "function") {
    compactQuery.addEventListener("change", syncResponsiveState);
  } else {
    compactQuery.addListener(syncResponsiveState);
  }

  /* 初始狀態 */
  PANEL_NAMES.forEach((panelName) => {
    const shouldOpen = panelName === "search" && isCompact();

    setPanelOpen(panelName, shouldOpen);
  });

  syncResponsiveState();
  syncStickyState();
}
