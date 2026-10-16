const SELECTORS = {
  root: "[data-pw-category-scroll]",
  rail: "[data-pw-category-scroll-rail]",
  prevButton: "[data-pw-category-scroll-prev]",
  nextButton: "[data-pw-category-scroll-next]",
  item: "[data-pw-category-scroll-item]",
};

const CLASS_NAMES = {
  overflow: "pw-category-scroll--overflow",
  atStart: "pw-category-scroll--at-start",
  atEnd: "pw-category-scroll--at-end",
};

const SCROLL_TOLERANCE = 2;
const SCROLL_UPDATE_DELAY = 360;

function getMaxScrollLeft(rail) {
  return Math.max(0, rail.scrollWidth - rail.clientWidth);
}

function hasHorizontalOverflow(rail) {
  return getMaxScrollLeft(rail) > SCROLL_TOLERANCE;
}

function isAtStart(rail) {
  return rail.scrollLeft <= SCROLL_TOLERANCE;
}

function isAtEnd(rail) {
  return rail.scrollLeft >= getMaxScrollLeft(rail) - SCROLL_TOLERANCE;
}

function shouldReduceMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function clampScrollLeft(rail, left) {
  return Math.min(Math.max(left, 0), getMaxScrollLeft(rail));
}

function scrollRailTo(rail, left) {
  rail.scrollTo({
    left: clampScrollLeft(rail, left),
    behavior: shouldReduceMotion() ? "auto" : "smooth",
  });
}

/**
 * 不直接用 offsetLeft，避免 offsetParent 不是 rail 時算錯。
 */
function getItemScrollLeft(rail, item) {
  const railRect = rail.getBoundingClientRect();
  const itemRect = item.getBoundingClientRect();

  return itemRect.left - railRect.left + rail.scrollLeft;
}

function getItemScrollRight(rail, item) {
  return getItemScrollLeft(rail, item) + item.offsetWidth;
}

function getNextItemScrollLeft(rail) {
  const items = Array.from(rail.querySelectorAll(SELECTORS.item));
  const currentLeft = rail.scrollLeft;
  const viewportRight = currentLeft + rail.clientWidth;
  const maxScrollLeft = getMaxScrollLeft(rail);

  const nextHiddenItem = items.find((item) => {
    return getItemScrollRight(rail, item) > viewportRight + SCROLL_TOLERANCE;
  });

  return nextHiddenItem
    ? Math.min(getItemScrollLeft(rail, nextHiddenItem), maxScrollLeft)
    : maxScrollLeft;
}

function getPrevItemScrollLeft(rail) {
  const items = Array.from(rail.querySelectorAll(SELECTORS.item));
  const currentLeft = rail.scrollLeft;

  const previousItems = items.filter((item) => {
    return getItemScrollLeft(rail, item) < currentLeft - SCROLL_TOLERANCE;
  });

  const previousItem = previousItems[previousItems.length - 1];

  return previousItem ? Math.max(getItemScrollLeft(rail, previousItem), 0) : 0;
}

function rafThrottle(callback) {
  let frameId = null;

  return (...args) => {
    if (frameId !== null) return;

    frameId = window.requestAnimationFrame(() => {
      frameId = null;
      callback(...args);
    });
  };
}

function setupCategoryScroll(root) {
  const rail = root.querySelector(SELECTORS.rail);
  const prevButton = root.querySelector(SELECTORS.prevButton);
  const nextButton = root.querySelector(SELECTORS.nextButton);

  if (!rail || !prevButton || !nextButton) return null;

  const controller = new AbortController();
  const { signal } = controller;

  const updateButtonState = () => {
    const isOverflowing = hasHorizontalOverflow(rail);
    const atStart = isAtStart(rail);
    const atEnd = isAtEnd(rail);

    /**
     * 箭頭永遠顯示。
     * JS 只負責 disabled 狀態，不負責 display none。
     */
    prevButton.disabled = !isOverflowing || atStart;
    nextButton.disabled = !isOverflowing || atEnd;

    prevButton.setAttribute("aria-disabled", String(prevButton.disabled));
    nextButton.setAttribute("aria-disabled", String(nextButton.disabled));

    root.classList.toggle(CLASS_NAMES.overflow, isOverflowing);
    root.classList.toggle(CLASS_NAMES.atStart, isOverflowing && atStart);
    root.classList.toggle(CLASS_NAMES.atEnd, isOverflowing && atEnd);
  };

  const throttledUpdateButtonState = rafThrottle(updateButtonState);

  prevButton.addEventListener(
    "click",
    () => {
      scrollRailTo(rail, getPrevItemScrollLeft(rail));
      window.setTimeout(updateButtonState, SCROLL_UPDATE_DELAY);
    },
    { signal },
  );

  nextButton.addEventListener(
    "click",
    () => {
      scrollRailTo(rail, getNextItemScrollLeft(rail));
      window.setTimeout(updateButtonState, SCROLL_UPDATE_DELAY);
    },
    { signal },
  );

  rail.addEventListener("scroll", throttledUpdateButtonState, {
    passive: true,
    signal,
  });

  const resizeObserver = new ResizeObserver(updateButtonState);
  resizeObserver.observe(root);
  resizeObserver.observe(rail);

  const mutationObserver = new MutationObserver(updateButtonState);
  mutationObserver.observe(rail, {
    childList: true,
    subtree: true,
    characterData: true,
  });

  if (document.fonts?.ready) {
    document.fonts.ready.then(updateButtonState);
  }

  window.requestAnimationFrame(updateButtonState);

  return () => {
    controller.abort();
    resizeObserver.disconnect();
    mutationObserver.disconnect();
  };
}

export function initPwCategoryScroll(root = document) {
  const scrollers =
    root instanceof Element && root.matches(SELECTORS.root)
      ? [root]
      : Array.from(root.querySelectorAll(SELECTORS.root));

  const cleanups = scrollers
    .map((scroller) => setupCategoryScroll(scroller))
    .filter(Boolean);

  return () => {
    cleanups.forEach((cleanup) => cleanup());
  };
}
