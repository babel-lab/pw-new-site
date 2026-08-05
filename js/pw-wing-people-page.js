import "./modules/pw-youtube-hover-preview.js";

(() => {
  /**
   * 翼見人物列表頁：
   * 1. 專訪／短影音頁籤切換
   * 2. 支援網址 ?tab=interview / ?tab=shorts
   * 3. 相容舊版 #wing-people-*-tab 網址
   * 4. 短影音分享選單
   */

  /* ========================================
   * 專訪／短影音頁籤
   * ======================================== */

  const pageRoot = document.querySelector("[data-pw-wing-people-page]");

  if (pageRoot) {
    const tabs = Array.from(
      pageRoot.querySelectorAll("[data-pw-wing-people-tab]"),
    );

    const panels = Array.from(
      pageRoot.querySelectorAll("[data-pw-wing-people-panel]"),
    );

    /**
     * 依據資料 key 尋找頁籤。
     *
     * interview
     * shorts
     */
    const findTabByKey = (tabKey) => {
      if (!tabKey) {
        return null;
      }

      return tabs.find((tab) => tab.dataset.panelId === tabKey) || null;
    };

    /**
     * 依據舊版 Hash 尋找頁籤。
     *
     * 支援：
     * #wing-people-interview-tab
     * #wing-people-shorts-tab
     * #wing-people-interview-panel
     * #wing-people-shorts-panel
     */
    const findTabByHash = (hash) => {
      if (!hash) {
        return null;
      }

      const hashId = decodeURIComponent(hash.replace(/^#/, ""));

      if (!hashId) {
        return null;
      }

      return (
        tabs.find((tab) => {
          const panelId = tab.getAttribute("aria-controls");

          return tab.id === hashId || panelId === hashId;
        }) || null
      );
    };

    /**
     * 取得 HTML 預設頁籤。
     */
    const getDefaultTab = () =>
      tabs.find((tab) => tab.getAttribute("aria-selected") === "true") ||
      tabs[0] ||
      null;

    /**
     * 從目前網址取得應顯示的頁籤。
     *
     * 優先順序：
     * 1. ?tab=
     * 2. 舊版 #ID
     * 3. HTML 預設值
     */
    const getTabStateFromUrl = () => {
      const url = new URL(window.location.href);

      const queryTabKey = url.searchParams.get("tab");

      const queryTab = findTabByKey(queryTabKey);

      if (queryTab) {
        return {
          tab: queryTab,
          source: "query",
        };
      }

      const hashTab = findTabByHash(url.hash);

      if (hashTab) {
        return {
          tab: hashTab,
          source: "hash",
        };
      }

      return {
        tab: getDefaultTab(),
        source: "default",
      };
    };

    /**
     * 更新網址中的 tab 狀態。
     *
     * push：
     * 使用者主動切換頁籤時建立瀏覽紀錄。
     *
     * replace：
     * 初始化或舊網址轉換時覆蓋目前紀錄。
     */
    const updateTabUrl = (tabKey, historyMode = "replace") => {
      if (!tabKey) {
        return;
      }

      const url = new URL(window.location.href);

      url.searchParams.set("tab", tabKey);

      /**
       * 移除舊版 Hash，
       * 避免瀏覽器自動捲到頁籤按鈕。
       */
      url.hash = "";

      const nextUrl = `${url.pathname}${url.search}`;

      const nextState = {
        ...(window.history.state || {}),
        pwWingPeopleTab: tabKey,
      };

      if (historyMode === "push") {
        window.history.pushState(nextState, "", nextUrl);

        return;
      }

      window.history.replaceState(nextState, "", nextUrl);
    };

    /**
     * 啟用指定頁籤。
     */
    const activateTab = (
      targetTab,
      {
        shouldFocus = false,
        shouldUpdateUrl = false,
        historyMode = "replace",
      } = {},
    ) => {
      if (!targetTab) {
        return;
      }

      const targetPanelId = targetTab.dataset.panelId;

      tabs.forEach((tab) => {
        const isActive = tab === targetTab;

        tab.classList.toggle("is-active", isActive);

        tab.setAttribute("aria-selected", String(isActive));

        tab.tabIndex = isActive ? 0 : -1;
      });

      panels.forEach((panel) => {
        const isActive = panel.dataset.panelId === targetPanelId;

        panel.hidden = !isActive;
      });

      if (shouldUpdateUrl) {
        updateTabUrl(targetPanelId, historyMode);
      }

      if (shouldFocus) {
        targetTab.focus();
      }
    };

    /**
     * 依目前網址初始化頁籤。
     */
    const activateTabFromUrl = () => {
      const { tab: targetTab, source } = getTabStateFromUrl();

      if (!targetTab) {
        return;
      }

      activateTab(targetTab);

      /**
       * 舊網址：
       * #wing-people-shorts-tab
       *
       * 自動轉換成：
       * ?tab=shorts
       */
      if (source === "hash") {
        updateTabUrl(targetTab.dataset.panelId, "replace");

        /**
         * 瀏覽器可能已經依 Hash 捲動，
         * 轉換網址後將畫面恢復到頁面頂端。
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
    };

    if (tabs.length > 0 && panels.length > 0) {
      tabs.forEach((tab, tabIndex) => {
        /**
         * 滑鼠／觸控點擊。
         */
        tab.addEventListener("click", () => {
          activateTab(tab, {
            shouldUpdateUrl: true,
            historyMode: "push",
          });
        });

        /**
         * 鍵盤頁籤操作。
         */
        tab.addEventListener("keydown", (event) => {
          let nextTabIndex = tabIndex;

          switch (event.key) {
            case "ArrowRight":
            case "ArrowDown":
              nextTabIndex = (tabIndex + 1) % tabs.length;
              break;

            case "ArrowLeft":
            case "ArrowUp":
              nextTabIndex = (tabIndex - 1 + tabs.length) % tabs.length;
              break;

            case "Home":
              nextTabIndex = 0;
              break;

            case "End":
              nextTabIndex = tabs.length - 1;
              break;

            default:
              return;
          }

          event.preventDefault();

          activateTab(tabs[nextTabIndex], {
            shouldFocus: true,
            shouldUpdateUrl: true,
            historyMode: "push",
          });
        });
      });

      /**
       * 第一次載入頁面時，
       * 依網址決定顯示專訪或短影音。
       */
      activateTabFromUrl();

      /**
       * 支援瀏覽器上一頁／下一頁。
       */
      window.addEventListener("popstate", activateTabFromUrl);

      /**
       * 相容專案中可能仍存在的舊版 Hash 連結。
       */
      window.addEventListener("hashchange", activateTabFromUrl);
    }
  }

  /* ========================================
   * 翼見人物分享選單
   * ======================================== */

  /**
   * 初始化頁面上所有 data-pw-wing-people。
   */
  const wingPeopleRoots = Array.from(
    document.querySelectorAll("[data-pw-wing-people]"),
  );

  const shares = wingPeopleRoots.flatMap((root) =>
    Array.from(root.querySelectorAll(".pw-wing-people__share")),
  );

  /**
   * 關閉單一分享面板。
   */
  const closeShare = (share) => {
    const toggle = share.querySelector("[data-pw-wing-share-toggle]");

    const panel = share.querySelector("[data-pw-wing-share-panel]");

    share.classList.remove("is-open");

    if (toggle) {
      toggle.setAttribute("aria-expanded", "false");
    }

    if (panel) {
      panel.hidden = true;
    }
  };

  /**
   * 關閉全部分享面板。
   */
  const closeAllShares = (exceptShare = null) => {
    shares.forEach((share) => {
      if (share !== exceptShare) {
        closeShare(share);
      }
    });
  };

  /**
   * 開啟單一分享面板。
   */
  const openShare = (share) => {
    const toggle = share.querySelector("[data-pw-wing-share-toggle]");

    const panel = share.querySelector("[data-pw-wing-share-panel]");

    closeAllShares(share);

    share.classList.add("is-open");

    if (toggle) {
      toggle.setAttribute("aria-expanded", "true");
    }

    if (panel) {
      panel.hidden = false;
    }
  };

  /**
   * 切換分享面板。
   */
  const toggleShare = (share) => {
    const isOpen = share.classList.contains("is-open");

    if (isOpen) {
      closeShare(share);
      return;
    }

    openShare(share);
  };

  /**
   * 使用事件委派。
   *
   * 即使短影音 Panel 載入時為 hidden，
   * 切換顯示後仍可正常操作。
   */
  document.addEventListener("click", (event) => {
    const target = event.target;

    if (!(target instanceof Element)) {
      return;
    }

    const toggle = target.closest("[data-pw-wing-share-toggle]");

    if (toggle) {
      const share = toggle.closest(".pw-wing-people__share");

      if (share) {
        event.preventDefault();
        event.stopPropagation();

        toggleShare(share);
      }

      return;
    }

    const closeButton = target.closest("[data-pw-wing-share-close]");

    if (closeButton) {
      const share = closeButton.closest(".pw-wing-people__share");

      if (share) {
        event.preventDefault();
        event.stopPropagation();

        closeShare(share);
      }

      return;
    }

    /**
     * 點擊分享面板中的連結時，
     * 不立即關閉分享面板。
     */
    if (target.closest(".pw-wing-people__share")) {
      return;
    }

    closeAllShares();
  });

  /**
   * ESC 關閉全部分享面板。
   */
  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") {
      return;
    }

    closeAllShares();
  });
})();
