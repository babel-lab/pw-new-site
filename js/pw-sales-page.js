/* =========================================================
   PW Sales Page
   銷售頁服務滾輪

   JS 僅負責：
   - 每 3 秒自動往返切換服務
   - 滑鼠滾輪、點擊與鍵盤操作
   - 更新 active / aria / hidden 狀態

   所有服務名稱與內容都已存在於 HTML。
   ========================================================= */

const AUTOPLAY_DELAY = 3000;
const WHEEL_LOCK_DELAY = 420;

function initSalesService(root) {
  const wheel = root.querySelector("[data-pw-sales-wheel]");
  const triggers = Array.from(root.querySelectorAll("[data-pw-sales-trigger]"));
  const panels = Array.from(root.querySelectorAll("[data-pw-sales-panel]"));

  if (!wheel || triggers.length === 0 || panels.length === 0) {
    return;
  }

  const serviceCount = Math.min(triggers.length, panels.length);
  const reducedMotionQuery = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  );

  const initialIndexFromData = Number.parseInt(
    root.dataset.initialIndex || "",
    10,
  );

  let activeIndex = Number.isInteger(initialIndexFromData)
    ? initialIndexFromData
    : triggers.findIndex(
        (trigger) => trigger.getAttribute("aria-selected") === "true",
      );

  if (activeIndex < 0 || activeIndex >= serviceCount) {
    activeIndex = 0;
  }

  let direction = 1;
  let autoplayTimer = null;
  let wheelLocked = false;
  let pointerInside = false;
  let focusInside = false;

  function isAutoplayAllowed() {
    return (
      !reducedMotionQuery.matches &&
      !pointerInside &&
      !focusInside &&
      !document.hidden &&
      serviceCount > 1
    );
  }

  function clearAutoplay() {
    if (autoplayTimer !== null) {
      window.clearTimeout(autoplayTimer);
      autoplayTimer = null;
    }
  }

  function scheduleAutoplay() {
    clearAutoplay();

    if (!isAutoplayAllowed()) {
      return;
    }

    autoplayTimer = window.setTimeout(() => {
      const lastIndex = serviceCount - 1;
      let nextIndex = activeIndex + direction;

      if (nextIndex > lastIndex) {
        direction = -1;
        nextIndex = Math.max(0, lastIndex - 1);
      } else if (nextIndex < 0) {
        direction = 1;
        nextIndex = Math.min(lastIndex, 1);
      }

      setActive(nextIndex, { moveFocus: false, restartAutoplay: false });
      scheduleAutoplay();
    }, AUTOPLAY_DELAY);
  }

  function updateNearbyState() {
    triggers.forEach((trigger, index) => {
      const distance = Math.abs(index - activeIndex);
      trigger.classList.toggle("is-nearby", distance === 1);
    });
  }

  function setActive(
    nextIndex,
    { moveFocus = false, restartAutoplay = true } = {},
  ) {
    if (!Number.isInteger(nextIndex)) {
      return;
    }

    const safeIndex = Math.max(0, Math.min(serviceCount - 1, nextIndex));
    activeIndex = safeIndex;

    root.style.setProperty("--pw-sales-active-index", String(activeIndex));

    triggers.forEach((trigger, index) => {
      const isActive = index === activeIndex;

      trigger.classList.toggle("is-active", isActive);
      trigger.setAttribute("aria-selected", String(isActive));
      trigger.tabIndex = isActive ? 0 : -1;

      if (isActive && moveFocus) {
        trigger.focus({ preventScroll: true });
      }
    });

    panels.forEach((panel, index) => {
      const isActive = index === activeIndex;

      panel.classList.toggle("is-active", isActive);
      panel.hidden = !isActive;
      panel.setAttribute("aria-hidden", String(!isActive));
    });

    updateNearbyState();

    if (restartAutoplay) {
      scheduleAutoplay();
    }
  }

  function selectRelative(step, options = {}) {
    const nextIndex = Math.max(
      0,
      Math.min(serviceCount - 1, activeIndex + step),
    );

    if (nextIndex === activeIndex) {
      direction = step > 0 ? -1 : 1;
      scheduleAutoplay();
      return;
    }

    direction = step > 0 ? 1 : -1;
    setActive(nextIndex, options);
  }

  function lockWheelBriefly() {
    wheelLocked = true;
    window.setTimeout(() => {
      wheelLocked = false;
    }, WHEEL_LOCK_DELAY);
  }

  triggers.forEach((trigger, index) => {
    trigger.addEventListener("click", (event) => {
      event.preventDefault();
      direction = index >= activeIndex ? 1 : -1;
      setActive(index, { moveFocus: true });
    });

    trigger.addEventListener("keydown", (event) => {
      switch (event.key) {
        case "ArrowDown":
        case "ArrowRight":
          event.preventDefault();
          selectRelative(1, { moveFocus: true });
          break;

        case "ArrowUp":
        case "ArrowLeft":
          event.preventDefault();
          selectRelative(-1, { moveFocus: true });
          break;

        case "Home":
          event.preventDefault();
          direction = 1;
          setActive(0, { moveFocus: true });
          break;

        case "End":
          event.preventDefault();
          direction = -1;
          setActive(serviceCount - 1, { moveFocus: true });
          break;

        default:
          break;
      }
    });
  });

  wheel.addEventListener(
    "wheel",
    (event) => {
      if (wheelLocked || Math.abs(event.deltaY) < 4) {
        return;
      }

      event.preventDefault();
      lockWheelBriefly();

      if (event.deltaY > 0) {
        selectRelative(1);
      } else {
        selectRelative(-1);
      }
    },
    { passive: false },
  );

  root.addEventListener("pointerenter", () => {
    pointerInside = true;
    clearAutoplay();
  });

  root.addEventListener("pointerleave", () => {
    pointerInside = false;
    scheduleAutoplay();
  });

  root.addEventListener("focusin", () => {
    focusInside = true;
    clearAutoplay();
  });

  root.addEventListener("focusout", (event) => {
    if (event.relatedTarget && root.contains(event.relatedTarget)) {
      return;
    }

    focusInside = false;
    scheduleAutoplay();
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      clearAutoplay();
    } else {
      scheduleAutoplay();
    }
  });

  const handleReducedMotionChange = () => {
    scheduleAutoplay();
  };

  if (typeof reducedMotionQuery.addEventListener === "function") {
    reducedMotionQuery.addEventListener("change", handleReducedMotionChange);
  } else if (typeof reducedMotionQuery.addListener === "function") {
    reducedMotionQuery.addListener(handleReducedMotionChange);
  }

  root.classList.add("is-enhanced");
  setActive(activeIndex, { moveFocus: false });
}

function initSalesPage() {
  const serviceRoots = document.querySelectorAll("[data-pw-sales-service]");
  serviceRoots.forEach(initSalesService);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initSalesPage, { once: true });
} else {
  initSalesPage();
}
