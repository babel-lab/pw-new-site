import "./pw-enhance.js";

import { initPwTabs } from "./modules/pw-tabs.js";
import { initPwCategoryScroll } from "./modules/pw-category-scroll.js";
import { PW_EXHIBITION_PAGE_MOCK } from "./data/pw-exhibition-page.mock.js";

const SELECTORS = {
  page: "[data-pw-exhibition-page]",
  tabs: "[data-pw-tabs]",
  panel: "[data-pw-exhibition-panel]",
  list: "[data-pw-exhibition-list]",
  categoryButton: "[data-pw-exhibition-category]",
  headingEn: "[data-pw-exhibition-heading-en]",
  headingZh: "[data-pw-exhibition-heading-zh]",
};

function createCard(item) {
  const listItem = document.createElement("li");
  listItem.className = "pw-exhibition-page__item";

  const article = document.createElement("article");
  article.className = "pw-exhibition-page__card";

  if (item.featured) {
    article.classList.add("is-featured");
  }

  const link = document.createElement("a");
  link.className = "pw-exhibition-page__card-link";
  link.href = item.href || "#";

  const ariaLabelPrefix = item.ariaLabelPrefix || "查看展演";

  link.setAttribute("aria-label", `${ariaLabelPrefix}：${item.title}`);

  if (item.external) {
    link.target = "_blank";
    link.rel = "noopener noreferrer";
  }

  const media = document.createElement("span");
  media.className = "pw-exhibition-page__media";

  const image = document.createElement("img");
  image.className = "pw-exhibition-page__image";
  image.src = item.image;
  image.alt = `${item.title}主視覺`;
  image.loading = "lazy";
  image.decoding = "async";
  image.referrerPolicy = "strict-origin-when-cross-origin";

  const badge = document.createElement("span");
  badge.className = "pw-exhibition-page__media-badge";
  badge.textContent = item.badge || "3DVR";

  const body = document.createElement("span");
  body.className = "pw-exhibition-page__card-body";

  const artist = document.createElement("span");
  artist.className = "pw-exhibition-page__artist";
  artist.textContent = item.artist || "";

  const title = document.createElement("h3");
  title.className = "pw-exhibition-page__title";
  title.textContent = item.title;

  const description = document.createElement("span");
  description.className = "pw-exhibition-page__description";
  description.textContent = item.description || "";

  media.append(image, badge);
  body.append(artist, title, description);
  link.append(media, body);
  article.append(link);
  listItem.append(article);

  return listItem;
}

function renderCards(panel, items) {
  const list = panel.querySelector(SELECTORS.list);

  if (!list || !Array.isArray(items)) {
    return;
  }

  const fragment = document.createDocumentFragment();

  items.forEach((item) => {
    fragment.append(createCard(item));
  });

  list.replaceChildren(fragment);
}

function updatePaginationCategory(panel, categoryKey) {
  const links = Array.from(panel.querySelectorAll(".pw-pagination a[href]"));

  links.forEach((link) => {
    const url = new URL(link.href, window.location.href);

    url.searchParams.set("category", categoryKey);

    link.href = `${url.pathname}${url.search}${url.hash}`;
  });
}

function initExhibitionCategories(page) {
  const panels = Array.from(page.querySelectorAll(SELECTORS.panel));

  panels.forEach((panel) => {
    const panelKey = panel.dataset.pwExhibitionPanel;

    const buttons = Array.from(
      panel.querySelectorAll(SELECTORS.categoryButton),
    );

    if (buttons.length === 0) {
      return;
    }

    const headingEn = panel.querySelector(SELECTORS.headingEn);

    const headingZh = panel.querySelector(SELECTORS.headingZh);

    buttons.forEach((button) => {
      button.addEventListener("click", () => {
        const categoryKey = button.dataset.pwExhibitionCategory;

        buttons.forEach((currentButton) => {
          const isActive = currentButton === button;

          currentButton.classList.toggle("is-active", isActive);

          currentButton.setAttribute("aria-pressed", String(isActive));
        });

        if (headingEn) {
          headingEn.textContent = button.dataset.headingEn || "";
        }

        if (headingZh) {
          headingZh.textContent = button.dataset.headingZh || "";
        }

        const mockItems = PW_EXHIBITION_PAGE_MOCK[panelKey]?.[categoryKey];

        if (mockItems) {
          renderCards(panel, mockItems);
        }

        updatePaginationCategory(panel, categoryKey);
      });
    });
  });
}

function initPwExhibitionPage() {
  const page = document.querySelector(SELECTORS.page);

  if (!page) {
    return;
  }

  const tabsRoot = page.querySelector(SELECTORS.tabs);

  if (tabsRoot) {
    initPwTabs(tabsRoot);
  }

  initPwCategoryScroll(page);
  initExhibitionCategories(page);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initPwExhibitionPage, {
    once: true,
  });
} else {
  initPwExhibitionPage();
}
