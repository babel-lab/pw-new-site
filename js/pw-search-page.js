import { initPwTabs } from "./modules/pw-tabs.js";
import { PW_SEARCH_MOCK } from "./data/pw-search.mock.js";

const VALID_TYPES = ["artists", "media", "exhibitions"];

const SELECTORS = {
  page: "[data-pw-search-page]",
  tabs: "[data-pw-search-tabs]",
  trigger: "[data-pw-search-type]",
  panel: "[data-pw-search-panel]",
  list: "[data-pw-search-list]",
  empty: "[data-pw-search-empty]",
  count: "[data-pw-search-count]",
  keyword: "[data-pw-search-keyword]",
  artistTemplate: "[data-pw-search-artist-template]",
  exhibitionTemplate: "[data-pw-search-exhibition-template]",
  pagination: "[data-pw-search-pagination]",
};

function formatCount(value) {
  const safeValue = Number.isFinite(Number(value))
    ? Math.max(0, Number(value))
    : 0;

  return String(safeValue).padStart(3, "0");
}

function getSearchState() {
  const params = new URLSearchParams(window.location.search);
  const type = params.get("type");
  const keyword = params.get("q");

  return {
    type: VALID_TYPES.includes(type) ? type : PW_SEARCH_MOCK.defaultType,
    keyword: keyword?.trim() || PW_SEARCH_MOCK.keyword,
  };
}

function setInitialTab(page, activeType) {
  const triggers = Array.from(page.querySelectorAll(SELECTORS.trigger));
  const panels = Array.from(page.querySelectorAll(SELECTORS.panel));

  triggers.forEach((trigger) => {
    const isActive = trigger.dataset.pwSearchType === activeType;

    trigger.classList.toggle("is-active", isActive);
    trigger.setAttribute("aria-selected", String(isActive));
    trigger.tabIndex = isActive ? 0 : -1;
  });

  panels.forEach((panel) => {
    panel.hidden = panel.dataset.pwSearchPanel !== activeType;
  });
}

function createArtistCard(template, item) {
  const fragment = template.content.cloneNode(true);
  const card = fragment.querySelector("[data-pw-search-card]");
  const link = fragment.querySelector("[data-pw-search-card-link]");
  const image = fragment.querySelector("[data-pw-search-card-image]");
  const title = fragment.querySelector("[data-pw-search-card-title]");
  const meta = fragment.querySelector("[data-pw-search-card-meta]");

  if (item.featured && card) {
    card.classList.add("is-featured");
  }

  if (link) {
    link.href = item.href;
    link.setAttribute("aria-label", `查看${item.name}詳細資料`);
  }

  if (image) {
    image.src = item.image;
    image.alt = item.name;
  }

  if (title) {
    title.textContent = item.name;
  }

  if (meta) {
    const hasMeta = Boolean(item.meta?.trim());

    meta.textContent = hasMeta ? item.meta : "";
    meta.hidden = !hasMeta;
  }

  return fragment;
}

function createExhibitionCard(template, item) {
  const fragment = template.content.cloneNode(true);
  const card = fragment.querySelector("[data-pw-search-card]");
  const link = fragment.querySelector("[data-pw-search-card-link]");
  const image = fragment.querySelector("[data-pw-search-card-image]");
  const title = fragment.querySelector("[data-pw-search-card-title]");
  const description = fragment.querySelector(
    "[data-pw-search-card-description]",
  );

  if (item.featured && card) {
    card.classList.add("is-featured");
  }

  if (link) {
    link.href = item.href;
    link.setAttribute("aria-label", `查看${item.title}展覽內容`);
  }

  if (image) {
    image.src = item.image;
    image.alt = item.title;
  }

  if (title) {
    title.textContent = item.title;
  }

  if (description) {
    description.textContent = item.description;
  }

  return fragment;
}

function renderResultType(page, type, result) {
  const list = page.querySelector(`[data-pw-search-list="${type}"]`);
  const empty = page.querySelector(`[data-pw-search-empty="${type}"]`);
  const count = page.querySelector(`[data-pw-search-count="${type}"]`);

  const artistTemplate = page.querySelector(SELECTORS.artistTemplate);
  const exhibitionTemplate = page.querySelector(SELECTORS.exhibitionTemplate);

  const items = Array.isArray(result?.items) ? result.items : [];

  if (count) {
    count.textContent = formatCount(result?.total ?? items.length);
  }

  if (!list) {
    return;
  }

  const fragment = document.createDocumentFragment();

  items.forEach((item) => {
    if (type === "exhibitions" && exhibitionTemplate) {
      fragment.append(createExhibitionCard(exhibitionTemplate, item));
      return;
    }

    if (artistTemplate) {
      fragment.append(createArtistCard(artistTemplate, item));
    }
  });

  list.replaceChildren(fragment);
  list.hidden = items.length === 0;

  if (empty) {
    empty.hidden = items.length > 0;
  }
}

function updatePaginationLinks(page, keyword) {
  const paginationGroups = Array.from(
    page.querySelectorAll(SELECTORS.pagination),
  );

  paginationGroups.forEach((pagination) => {
    const type = pagination.dataset.pwSearchPagination;
    const links = Array.from(pagination.querySelectorAll("a[href]"));

    links.forEach((link) => {
      const url = new URL(link.href, window.location.href);

      url.searchParams.set("q", keyword);
      url.searchParams.set("type", type);

      link.href = `${url.pathname}${url.search}${url.hash}`;
    });
  });
}

function updateActiveTypeInUrl(type) {
  const url = new URL(window.location.href);

  url.searchParams.set("type", type);

  window.history.replaceState(
    {},
    "",
    `${url.pathname}${url.search}${url.hash}`,
  );
}

function initTypeUrlSync(page) {
  const triggers = Array.from(page.querySelectorAll(SELECTORS.trigger));

  triggers.forEach((trigger) => {
    trigger.addEventListener("click", () => {
      updateActiveTypeInUrl(trigger.dataset.pwSearchType);
    });
  });
}

function initPwSearchPage() {
  const page = document.querySelector(SELECTORS.page);

  if (!page) {
    return;
  }

  const state = getSearchState();
  const keyword = page.querySelector(SELECTORS.keyword);
  const tabsRoot = page.querySelector(SELECTORS.tabs);

  if (keyword) {
    keyword.textContent = state.keyword;
  }

  VALID_TYPES.forEach((type) => {
    renderResultType(page, type, PW_SEARCH_MOCK.results[type]);
  });

  setInitialTab(page, state.type);
  updatePaginationLinks(page, state.keyword);

  if (tabsRoot) {
    initPwTabs(tabsRoot);
  }

  initTypeUrlSync(page);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initPwSearchPage, {
    once: true,
  });
} else {
  initPwSearchPage();
}
