import { initPwTabs } from "./modules/pw-tabs.js";
import { initPwCategoryScroll } from "./modules/pw-category-scroll.js";
import { PW_ARTIST_EXPLORE_MOCK } from "./data/pw-artist-explore.mock.js";

const SELECTORS = {
  page: "[data-pw-artist-explore-page]",
  tabs: "[data-pw-tabs]",
  panel: "[data-pw-artist-explore-panel]",
  list: "[data-pw-artist-explore-list]",
  categoryButton: "[data-pw-artist-category]",
  headingEn: "[data-pw-artist-heading-en]",
  headingZh: "[data-pw-artist-heading-zh]",
};

function createCard(item) {
  const listItem = document.createElement("li");
  listItem.className = "pw-artist-explore-page__item";

  const article = document.createElement("article");
  article.className = "pw-artist-explore-page__card";

  if (item.featured) {
    article.classList.add("is-featured");
  }

  if (item.grayscale) {
    article.classList.add("pw-artist-explore-page__card--grayscale");
  }

  const link = document.createElement("a");
  link.className = "pw-artist-explore-page__card-link";
  link.href = item.href;
  link.setAttribute("aria-label", `查看${item.name}詳細資料`);

  const media = document.createElement("span");
  media.className = "pw-artist-explore-page__media";

  const image = document.createElement("img");
  image.className = "pw-artist-explore-page__image";
  image.src = item.image;
  image.alt = item.name;
  image.loading = "lazy";
  image.decoding = "async";
  image.referrerPolicy = "strict-origin-when-cross-origin";

  const name = document.createElement("h3");
  name.className = "pw-artist-explore-page__name";
  name.textContent = item.name;

  media.append(image);
  link.append(media, name);
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

function initArtistCategories(page) {
  const panels = Array.from(page.querySelectorAll(SELECTORS.panel));

  panels.forEach((panel) => {
    const panelKey = panel.dataset.pwArtistExplorePanel;

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
        const categoryKey = button.dataset.pwArtistCategory;

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

        const mockItems = PW_ARTIST_EXPLORE_MOCK[panelKey]?.[categoryKey];

        if (mockItems) {
          renderCards(panel, mockItems);
        }

        updatePaginationCategory(panel, categoryKey);
      });
    });
  });
}

function initPwArtistExplorePage() {
  const page = document.querySelector(SELECTORS.page);

  if (!page) {
    return;
  }

  const tabsRoot = page.querySelector(SELECTORS.tabs);

  if (tabsRoot) {
    initPwTabs(tabsRoot);
  }

  initPwCategoryScroll(page);
  initArtistCategories(page);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initPwArtistExplorePage, {
    once: true,
  });
} else {
  initPwArtistExplorePage();
}
