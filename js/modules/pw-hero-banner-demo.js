const SELECTORS = {
  root: "[data-pw-hero-banner]",
  tabs: "[data-pw-hero-tabs]",
  tab: "[data-pw-hero-tab]",
  track: "[data-pw-hero-track]",
  pagination: "[data-pw-hero-pagination]",
  dot: "[data-pw-hero-dot]",
  info: "[data-pw-hero-info]",
  slide: "[data-pw-hero-slide]",
};

const CLASS_NAMES = {
  active: "is-active",
};

export function initPwHeroBannerDemo(data) {
  const root = document.querySelector(SELECTORS.root);

  if (!root || !Array.isArray(data) || data.length === 0) return;

  const tabsEl = root.querySelector(SELECTORS.tabs);
  const trackEl = root.querySelector(SELECTORS.track);
  const paginationEl = root.querySelector(SELECTORS.pagination);
  const infoEl = root.querySelector(SELECTORS.info);

  if (!tabsEl || !trackEl || !paginationEl || !infoEl) return;

  let activeCategoryId = getDefaultCategoryId(data);
  let activeIndex = 0;

  root.addEventListener("click", (event) => {
    const tab = event.target.closest(SELECTORS.tab);

    if (tab) {
      activeCategoryId = tab.dataset.categoryId;
      activeIndex = 0;
      render();
      return;
    }

    const dot = event.target.closest(SELECTORS.dot);

    if (dot) {
      activeIndex = Number(dot.dataset.slideIndex);
      render();
      return;
    }

    const slide = event.target.closest(SELECTORS.slide);

    if (slide && slide.dataset.itemIndex) {
      activeIndex = Number(slide.dataset.itemIndex);
      render();
    }
  });

  function render() {
    const category = getActiveCategory();
    const items = category.items || [];
    const currentItem = items[activeIndex];

    renderTabs(category);
    renderSlides(items);
    renderDots(items);
    renderInfo(category, currentItem);
  }

  function renderTabs(activeCategory) {
    tabsEl.innerHTML = data
      .map((category) => {
        const isActive = category.id === activeCategory.id;

        return `
        <button
          class="pw-category-tabs__button pw-hero-banner__tab${isActive ? ` ${CLASS_NAMES.active}` : ""}"
          type="button"
          role="tab"
          aria-selected="${isActive ? "true" : "false"}"
          data-pw-hero-tab
          data-category-id="${escapeAttribute(category.id)}"
        >
          ${escapeHtml(category.label)}
        </button>
      `;
      })
      .join("");
  }

  function renderSlides(items) {
    const visibleSlides = getVisibleSlides(items, activeIndex);

    trackEl.innerHTML = visibleSlides
      .map((slide) => {
        const item = items[slide.itemIndex];
        const isCurrent = slide.position === "current";
        const itemTitle = getItemTitle(item);

        return `
          <article
            class="pw-hero-banner__slide${isCurrent ? ` ${CLASS_NAMES.active}` : ""}"
            aria-hidden="${isCurrent ? "false" : "true"}"
            data-pw-hero-slide
            data-slide-position="${slide.position}"
            data-item-index="${slide.itemIndex}"
          >
            <a
              class="pw-hero-banner__media-link"
              href="${escapeAttribute(item.href || "#")}"
              aria-label="${escapeAttribute(itemTitle || "前往展覽頁面")}"
              ${isCurrent ? "" : 'tabindex="-1"'}
            >
              ${renderMedia(item, isCurrent)}
            </a>
          </article>
        `;
      })
      .join("");
  }

  function renderDots(items) {
    if (items.length <= 1) {
      paginationEl.innerHTML = "";
      return;
    }

    paginationEl.innerHTML = items
      .map((item, index) => {
        const isActive = index === activeIndex;

        return `
          <button
            class="pw-hero-banner__dot${isActive ? ` ${CLASS_NAMES.active}` : ""}"
            type="button"
            aria-label="切換到第 ${index + 1} 張：${escapeAttribute(getItemTitle(item))}"
            aria-current="${isActive ? "true" : "false"}"
            data-pw-hero-dot
            data-slide-index="${index}"
          ></button>
        `;
      })
      .join("");
  }

  function renderInfo(category, item) {
    if (!item) {
      infoEl.innerHTML = "";
      return;
    }

    infoEl.innerHTML = `
      <div class="pw-hero-banner__info-main">
        <span class="pw-badge pw-hero-banner__eyebrow">
          ${escapeHtml(item.badge || category.label)}
        </span>

        <div class="pw-hero-banner__heading">
          <a
    class="pw-hero-banner__title-link"
    href="${escapeAttribute(item.href || "#")}"
    aria-label="前往展覽：${escapeAttribute(getItemTitle(item))}"
  >
    <h2 class="pw-hero-banner__title">
      ${renderTitleLines(item.titleLines)}
    </h2>
  </a>

          <p class="pw-hero-banner__organizer">
            ${escapeHtml(item.organizer || "")}
          </p>

          <time
            class="pw-hero-banner__date"
            datetime="${escapeAttribute(item.dateTime || "")}"
          >
            ${escapeHtml(item.dateText || "")}
          </time>
        </div>
      </div>

      <div class="pw-hero-banner__info-aside">
        <p class="pw-hero-banner__desc">
          ${escapeHtml(item.description || "")}
        </p>
      </div>
    `;
  }

  function renderMedia(item, isCurrent) {
    const media = item.media || {};
    const itemTitle = getItemTitle(item);
    const mediaAlt = media.alt || itemTitle || "展覽主視覺";
    const loading = isCurrent ? "eager" : "lazy";
    const preload = isCurrent ? "auto" : "metadata";
    const posterAttribute = media.poster
      ? `poster="${escapeAttribute(media.poster)}"`
      : "";

    if (media.type === "video") {
      return `
        <div class="pw-hero-banner__media">
          <video
            class="pw-hero-banner__video"
            src="${escapeAttribute(media.src || "")}"
            ${posterAttribute}
            aria-label="${escapeAttribute(mediaAlt)}"
            autoplay
            muted
            loop
            playsinline
            preload="${preload}"
          ></video>
        </div>
      `;
    }

    return `
      <div class="pw-hero-banner__media">
        <picture class="pw-hero-banner__picture">
          <img
            class="pw-hero-banner__image"
            src="${escapeAttribute(media.src || "")}"
            alt="${escapeAttribute(mediaAlt)}"
            loading="${loading}"
            decoding="async"
          >
        </picture>
      </div>
    `;
  }

  function getActiveCategory() {
    return data.find((category) => category.id === activeCategoryId) || data[0];
  }

  render();
}

function getDefaultCategoryId(data) {
  return data.find((category) => category.isDefault)?.id || data[0].id;
}

function getVisibleSlides(items, activeIndex) {
  const total = items.length;

  if (total <= 1) {
    return [{ itemIndex: 0, position: "current" }];
  }

  const prevIndex = activeIndex <= 0 ? total - 1 : activeIndex - 1;
  const nextIndex = activeIndex >= total - 1 ? 0 : activeIndex + 1;

  return [
    { itemIndex: prevIndex, position: "prev" },
    { itemIndex: activeIndex, position: "current" },
    { itemIndex: nextIndex, position: "next" },
  ];
}

function getItemTitle(item) {
  return Array.isArray(item.titleLines)
    ? item.titleLines.join(" ")
    : item.title || "";
}

function renderTitleLines(titleLines) {
  if (!Array.isArray(titleLines)) return "";

  return titleLines.map((line) => escapeHtml(line)).join("<br>");
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttribute(value) {
  return escapeHtml(value);
}
