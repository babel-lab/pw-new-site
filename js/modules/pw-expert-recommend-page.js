const SELECTORS = {
  root: "[data-pw-expert-recommend-page]",

  heroImage: "[data-pw-expert-hero-image]",

  expertRole: "[data-pw-expert-role]",

  expertName: "[data-pw-expert-name]",

  expertNameEn: "[data-pw-expert-name-en]",

  expertBiography: "[data-pw-expert-biography]",

  roomList: "[data-pw-expert-room-list]",

  roomTemplate: "[data-pw-expert-room-template]",

  roomItem: "[data-pw-expert-room-item]",

  roomLink: "[data-pw-expert-room-link]",

  roomImage: "[data-pw-expert-room-image]",

  roomCategory: "[data-pw-expert-room-category]",

  roomTitle: "[data-pw-expert-room-title]",

  roomDescription: "[data-pw-expert-room-description]",

  featuredList: "[data-pw-expert-featured-list]",

  pagination: "[data-pw-expert-pagination]",

  paginationPages: "[data-pw-expert-pagination-pages]",

  paginationPrev: "[data-pw-expert-pagination-prev]",

  paginationNext: "[data-pw-expert-pagination-next]",

  expertSlider: "[data-pw-expert-slider]",

  expertRail: "[data-pw-expert-slider-rail]",

  expertPrev: "[data-pw-expert-slider-prev]",

  expertNext: "[data-pw-expert-slider-next]",

  expertTemplate: "[data-pw-other-expert-template]",

  otherExpertLink: "[data-pw-other-expert-link]",

  otherExpertImage: "[data-pw-other-expert-image]",

  otherExpertRole: "[data-pw-other-expert-role]",

  otherExpertName: "[data-pw-other-expert-name]",

  otherExpertNameEn: "[data-pw-other-expert-name-en]",
};

const MOBILE_MEDIA = "(max-width: 991.98px)";

const MOBILE_PAGE_SIZE = 3;
const DESKTOP_PAGE_SIZE = 9;

function setText(element, value) {
  if (!element || value == null) return;

  element.textContent = String(value);
}

function cloneTemplate(template) {
  if (!(template instanceof HTMLTemplateElement)) {
    return null;
  }

  return template.content.cloneNode(true);
}

function renderExpert(root, expert) {
  if (!expert) return;

  const image = root.querySelector(SELECTORS.heroImage);

  if (image && expert.image) {
    image.src = expert.image;
    image.alt = expert.imageAlt ?? expert.name ?? "";
  }

  setText(root.querySelector(SELECTORS.expertRole), expert.role);

  setText(root.querySelector(SELECTORS.expertName), expert.name);

  setText(root.querySelector(SELECTORS.expertNameEn), expert.nameEn);

  const biographyElement = root.querySelector(SELECTORS.expertBiography);

  if (
    !biographyElement ||
    !Array.isArray(expert.biography) ||
    expert.biography.length === 0
  ) {
    return;
  }

  const fragment = document.createDocumentFragment();

  expert.biography.forEach((text) => {
    const paragraph = document.createElement("p");

    paragraph.textContent = text;

    fragment.appendChild(paragraph);
  });

  biographyElement.replaceChildren(fragment);
}

function createRoomCard(room, template) {
  const fragment = cloneTemplate(template);

  if (!fragment) return null;

  const item = fragment.querySelector(SELECTORS.roomItem);

  const link = fragment.querySelector(SELECTORS.roomLink);

  const image = fragment.querySelector(SELECTORS.roomImage);

  if (!item) return null;

  item.dataset.roomId = room.id ?? "";

  if (link) {
    link.href = room.href ?? "#";

    link.setAttribute("aria-label", `在新視窗開啟${room.title ?? "3D 展間"}`);
  }

  if (image) {
    image.src = room.image ?? "";

    image.alt = room.imageAlt ?? room.title ?? "";
  }

  setText(fragment.querySelector(SELECTORS.roomCategory), room.category);

  setText(fragment.querySelector(SELECTORS.roomTitle), room.title);

  setText(fragment.querySelector(SELECTORS.roomDescription), room.description);

  return fragment;
}

function renderRoomList({ list, rooms, template }) {
  if (!list || !template || !Array.isArray(rooms) || rooms.length === 0) {
    // 資料不存在時保留 EJS fallback。
    return;
  }

  const fragment = document.createDocumentFragment();

  rooms.forEach((room) => {
    const card = createRoomCard(room, template);

    if (card) {
      fragment.appendChild(card);
    }
  });

  list.replaceChildren(fragment);
}

function getFeaturedRooms(data) {
  if (!Array.isArray(data.rooms) || !Array.isArray(data.featuredRoomIds)) {
    return [];
  }

  const roomMap = new Map(data.rooms.map((room) => [room.id, room]));

  return data.featuredRoomIds.map((id) => roomMap.get(id)).filter(Boolean);
}

function renderOtherExperts(root, experts) {
  const rail = root.querySelector(SELECTORS.expertRail);

  const template = root.querySelector(SELECTORS.expertTemplate);

  if (!rail || !template || !Array.isArray(experts) || experts.length === 0) {
    // 資料不存在時保留 EJS fallback。
    return;
  }

  const fragment = document.createDocumentFragment();

  experts.forEach((expert) => {
    const card = cloneTemplate(template);

    if (!card) return;

    const link = card.querySelector(SELECTORS.otherExpertLink);

    const image = card.querySelector(SELECTORS.otherExpertImage);

    if (link) {
      link.href = expert.href ?? "#";
    }

    if (image) {
      image.src = expert.image ?? "";

      image.alt = expert.imageAlt ?? `${expert.role ?? ""}${expert.name ?? ""}`;
    }

    setText(card.querySelector(SELECTORS.otherExpertRole), expert.role);

    setText(card.querySelector(SELECTORS.otherExpertName), expert.name);

    setText(card.querySelector(SELECTORS.otherExpertNameEn), expert.nameEn);

    fragment.appendChild(card);
  });

  rail.replaceChildren(fragment);
}

function renderPage(root, data) {
  renderExpert(root, data.expert);

  const roomTemplate = root.querySelector(SELECTORS.roomTemplate);

  renderRoomList({
    list: root.querySelector(SELECTORS.roomList),
    rooms: data.rooms,
    template: roomTemplate,
  });

  renderRoomList({
    list: root.querySelector(SELECTORS.featuredList),
    rooms: getFeaturedRooms(data),
    template: roomTemplate,
  });

  renderOtherExperts(root, data.otherExperts);
}

function getPageSize(mediaQuery) {
  return mediaQuery.matches ? MOBILE_PAGE_SIZE : DESKTOP_PAGE_SIZE;
}

function initRoomPagination(root) {
  const roomList = root.querySelector(SELECTORS.roomList);

  if (!roomList) return;

  const items = Array.from(roomList.querySelectorAll(SELECTORS.roomItem));

  const pagination = root.querySelector(SELECTORS.pagination);

  const pagesElement = root.querySelector(SELECTORS.paginationPages);

  const prevButton = root.querySelector(SELECTORS.paginationPrev);

  const nextButton = root.querySelector(SELECTORS.paginationNext);

  if (
    items.length === 0 ||
    !pagination ||
    !pagesElement ||
    !prevButton ||
    !nextButton
  ) {
    return;
  }

  const mobileMedia = window.matchMedia(MOBILE_MEDIA);

  let currentPage = 1;

  let pageSize = getPageSize(mobileMedia);

  function getTotalPages() {
    return Math.max(1, Math.ceil(items.length / pageSize));
  }

  function renderItems() {
    const start = (currentPage - 1) * pageSize;

    const end = start + pageSize;

    items.forEach((item, index) => {
      item.hidden = index < start || index >= end;
    });
  }

  function createPageButton(pageNumber) {
    const button = document.createElement("button");

    button.type = "button";

    button.className = "pw-expert-recommend-page__pagination-page";

    button.textContent = String(pageNumber);

    button.setAttribute("aria-label", `前往第 ${pageNumber} 頁`);

    if (pageNumber === currentPage) {
      button.setAttribute("aria-current", "page");
    }

    button.addEventListener("click", () => {
      if (pageNumber === currentPage) {
        return;
      }

      currentPage = pageNumber;

      render({
        shouldScroll: true,
      });
    });

    return button;
  }

  function renderPageButtons() {
    const totalPages = getTotalPages();

    const fragment = document.createDocumentFragment();

    for (let page = 1; page <= totalPages; page += 1) {
      fragment.appendChild(createPageButton(page));
    }

    pagesElement.replaceChildren(fragment);

    pagination.hidden = totalPages <= 1;
  }

  function updateControls() {
    const totalPages = getTotalPages();

    prevButton.disabled = currentPage <= 1;

    nextButton.disabled = currentPage >= totalPages;
  }

  function scrollToList() {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    roomList.scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
      block: "start",
    });
  }

  function render({ shouldScroll = false } = {}) {
    const totalPages = getTotalPages();

    currentPage = Math.min(Math.max(currentPage, 1), totalPages);

    renderItems();
    renderPageButtons();
    updateControls();

    if (shouldScroll) {
      scrollToList();
    }
  }

  function handleViewportChange() {
    const nextPageSize = getPageSize(mobileMedia);

    if (nextPageSize === pageSize) {
      return;
    }

    const firstVisibleIndex = (currentPage - 1) * pageSize;

    pageSize = nextPageSize;

    currentPage = Math.floor(firstVisibleIndex / pageSize) + 1;

    render();
  }

  prevButton.addEventListener("click", () => {
    if (currentPage <= 1) {
      return;
    }

    currentPage -= 1;

    render({
      shouldScroll: true,
    });
  });

  nextButton.addEventListener("click", () => {
    if (currentPage >= getTotalPages()) {
      return;
    }

    currentPage += 1;

    render({
      shouldScroll: true,
    });
  });

  mobileMedia.addEventListener("change", handleViewportChange);

  render();
}

function initExpertSlider(root) {
  const rail = root.querySelector(SELECTORS.expertRail);

  const prevButton = root.querySelector(SELECTORS.expertPrev);

  const nextButton = root.querySelector(SELECTORS.expertNext);

  if (!rail || !prevButton || !nextButton) {
    return;
  }

  function getMaxScrollLeft() {
    return Math.max(0, rail.scrollWidth - rail.clientWidth);
  }

  function updateButtons() {
    const tolerance = 2;

    const maxScrollLeft = getMaxScrollLeft();

    prevButton.disabled = rail.scrollLeft <= tolerance;

    nextButton.disabled = rail.scrollLeft >= maxScrollLeft - tolerance;
  }

  function moveRail(direction) {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    rail.scrollBy({
      left: rail.clientWidth * direction,

      behavior: reduceMotion ? "auto" : "smooth",
    });
  }

  prevButton.addEventListener("click", () => {
    moveRail(-1);
  });

  nextButton.addEventListener("click", () => {
    moveRail(1);
  });

  rail.addEventListener("scroll", updateButtons, {
    passive: true,
  });

  window.addEventListener("resize", updateButtons);

  updateButtons();
}

export function initPwExpertRecommendPage(data) {
  const root = document.querySelector(SELECTORS.root);

  if (!root || !data || root.dataset.pwExpertRecommendInitialized === "true") {
    return;
  }

  renderPage(root, data);
  initRoomPagination(root);
  initExpertSlider(root);

  root.dataset.pwExpertRecommendInitialized = "true";
}
