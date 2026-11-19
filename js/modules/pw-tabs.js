export function initPwTabs(root, { queryParam = "tab", syncUrl = true } = {}) {
  if (!root) {
    return null;
  }

  const triggers = Array.from(root.querySelectorAll("[data-pw-tab-trigger]"));

  const panels = Array.from(root.querySelectorAll("[data-pw-tab-panel]"));

  if (triggers.length === 0 || panels.length === 0) {
    return null;
  }

  const controller = new AbortController();
  const { signal } = controller;

  root.classList.add("is-enhanced");

  /**
   * 依 tab key 尋找頁籤按鈕。
   */
  function findTriggerByKey(tabKey) {
    if (!tabKey) {
      return null;
    }

    return (
      triggers.find((trigger) => trigger.dataset.pwTabTrigger === tabKey) ||
      null
    );
  }

  /**
   * 相容舊版 Hash：
   *
   * #artist-explore-masters-tab
   * #artist-explore-masters-panel
   * #exhibition-solo-tab
   * #exhibition-solo-panel
   */
  function findTriggerByHash(hash) {
    if (!hash) {
      return null;
    }

    const hashId = decodeURIComponent(hash.replace(/^#/, ""));

    if (!hashId) {
      return null;
    }

    return (
      triggers.find((trigger) => {
        const panelId = trigger.getAttribute("aria-controls");

        return trigger.id === hashId || panelId === hashId;
      }) || null
    );
  }

  /**
   * 取得 HTML 中預設的 active 頁籤。
   */
  function getDefaultTrigger() {
    return (
      triggers.find(
        (trigger) => trigger.getAttribute("aria-selected") === "true",
      ) ||
      triggers.find((trigger) => trigger.classList.contains("is-active")) ||
      triggers.find((trigger) =>
        trigger.classList.contains("pw-tabs__button--active"),
      ) ||
      triggers[0] ||
      null
    );
  }

  /**
   * 從目前網址判斷要顯示哪個頁籤。
   *
   * 優先順序：
   * 1. ?tab=
   * 2. 舊版 #ID
   * 3. HTML 預設頁籤
   */
  function getTabStateFromUrl() {
    const url = new URL(window.location.href);

    const queryTabKey = url.searchParams.get(queryParam);

    const queryTrigger = findTriggerByKey(queryTabKey);

    if (queryTrigger) {
      return {
        trigger: queryTrigger,
        source: "query",
      };
    }

    const hashTrigger = findTriggerByHash(url.hash);

    if (hashTrigger) {
      return {
        trigger: hashTrigger,
        source: "hash",
      };
    }

    return {
      trigger: getDefaultTrigger(),
      source: "default",
    };
  }

  /**
   * 更新網址，但不重新載入頁面。
   */
  function updateUrl(tabKey, historyMode = "replace") {
    if (!syncUrl || !tabKey) {
      return;
    }

    const url = new URL(window.location.href);

    url.searchParams.set(queryParam, tabKey);

    /**
     * 移除舊版 Hash，
     * 避免瀏覽器自動捲到頁籤按鈕。
     */
    url.hash = "";

    const nextUrl = `${url.pathname}` + `${url.search}`;

    const nextState = {
      ...(window.history.state || {}),
      pwTabKey: tabKey,
    };

    if (historyMode === "push") {
      window.history.pushState(nextState, "", nextUrl);

      return;
    }

    window.history.replaceState(nextState, "", nextUrl);
  }

  /**
   * 啟用指定頁籤。
   */
  function activate(
    tabKey,
    {
      focus = false,
      emit = true,
      updateUrlState = false,
      historyMode = "replace",
    } = {},
  ) {
    const activeTrigger = findTriggerByKey(tabKey);

    if (!activeTrigger) {
      return;
    }

    triggers.forEach((trigger) => {
      const isActive = trigger === activeTrigger;

      trigger.classList.toggle("is-active", isActive);

      /**
       * 保留舊版 Tabs class 相容性。
       */
      trigger.classList.toggle("pw-tabs__button--active", isActive);

      trigger.setAttribute("aria-selected", String(isActive));

      trigger.tabIndex = isActive ? 0 : -1;
    });

    panels.forEach((panel) => {
      const isActive = panel.dataset.pwTabPanel === tabKey;

      panel.hidden = !isActive;
    });

    if (updateUrlState) {
      updateUrl(tabKey, historyMode);
    }

    if (focus) {
      activeTrigger.focus();
    }

    if (emit) {
      root.dispatchEvent(
        new CustomEvent("pw:tabs-change", {
          bubbles: true,
          detail: {
            tabKey,
          },
        }),
      );
    }
  }

  /**
   * 依目前網址啟用頁籤。
   */
  function activateFromUrl() {
    const { trigger, source } = getTabStateFromUrl();

    if (!trigger) {
      return;
    }

    const tabKey = trigger.dataset.pwTabTrigger;

    activate(tabKey, {
      emit: false,
    });

    /**
     * 舊版 #ID 連結載入後，
     * 自動轉換成 ?tab=。
     */
    if (source === "hash") {
      updateUrl(tabKey, "replace");

      /**
       * Hash 可能已令瀏覽器自動捲動，
       * 因此將頁面恢復至頂端。
       */
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => {
          window.scrollTo({
            top: 0,
            left: 0,
            behavior: "auto",
          });
        });
      });
    }
  }

  function getActiveIndex() {
    const index = triggers.findIndex(
      (trigger) => trigger.getAttribute("aria-selected") === "true",
    );

    return index >= 0 ? index : 0;
  }

  function handleKeydown(event) {
    const supportedKeys = [
      "ArrowLeft",
      "ArrowRight",
      "ArrowUp",
      "ArrowDown",
      "Home",
      "End",
    ];

    if (!supportedKeys.includes(event.key)) {
      return;
    }

    event.preventDefault();

    const activeIndex = getActiveIndex();

    let nextIndex = activeIndex;

    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      nextIndex = (activeIndex + 1) % triggers.length;
    }

    if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      nextIndex = (activeIndex - 1 + triggers.length) % triggers.length;
    }

    if (event.key === "Home") {
      nextIndex = 0;
    }

    if (event.key === "End") {
      nextIndex = triggers.length - 1;
    }

    activate(triggers[nextIndex].dataset.pwTabTrigger, {
      focus: true,
      updateUrlState: true,
      historyMode: "push",
    });
  }

  triggers.forEach((trigger) => {
    trigger.addEventListener(
      "click",
      () => {
        activate(trigger.dataset.pwTabTrigger, {
          updateUrlState: true,
          historyMode: "push",
        });
      },
      { signal },
    );

    trigger.addEventListener("keydown", handleKeydown, { signal });
  });

  /**
   * 頁面第一次載入時，
   * 依 ?tab= 或舊版 Hash 顯示正確頁籤。
   */
  activateFromUrl();

  /**
   * 支援瀏覽器上一頁／下一頁。
   */
  window.addEventListener("popstate", activateFromUrl, { signal });

  /**
   * 相容頁面中仍可能存在的舊版 Hash 連結。
   */
  window.addEventListener("hashchange", activateFromUrl, { signal });

  return {
    activate,

    destroy() {
      controller.abort();
      root.classList.remove("is-enhanced");
    },
  };
}
