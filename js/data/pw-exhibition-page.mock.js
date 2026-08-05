const REAL_EXHIBITION = {
  title: "李健儀油畫創作展",
  artist: "李健儀",
  description: "以油彩探索文化記憶與生命經驗，透過線上 3D 展間觀看作品。",
  href: "https://virtual.metaassets.asia/exhibitions/LiChienYi",
  image: "https://cdn.metaassets.asia/exhibitions/banner_55_20251212073814.jpg",
  external: true,
  featured: true,
  badge: "3DVR",
  ariaLabelPrefix: "開啟 3D 展間",
};

/*
 * 各展演類型的卡片目的地設定。
 *
 * solo / curated：
 * 直接開啟各自的 3DVR 展間。
 *
 * group：
 * 前往舉辦聯展的協會首頁。
 *
 * fair：
 * 前往舉辦特展的機構首頁。
 *
 * 目前是假資料，因此同一類型先共用一個示範網址。
 * React 串接正式資料後，每張卡片可改為各自的 href。
 */
const PANEL_CONFIG = {
  solo: {
    prefix: "SOLO",
    entityLabel: "示範藝術人",
    href: "https://virtual.metaassets.asia/exhibitions/LiChienYi",
    external: true,
    badge: "3DVR",
    ariaLabelPrefix: "開啟 3D 展間",
    descriptionSuffix: "建立可在線上瀏覽的 3D 展覽空間。",
  },

  group: {
    prefix: "GROUP",
    entityLabel: "示範協會",
    href: "./pw-association-page.html",
    external: false,
    badge: "協會首頁",
    ariaLabelPrefix: "前往協會首頁",
    descriptionSuffix: "前往所屬協會首頁，查看聯展與協會相關資訊。",
  },

  fair: {
    prefix: "ART FAIR",
    entityLabel: "示範機構",
    href: "./pw-institution-page.html",
    external: false,
    badge: "機構首頁",
    ariaLabelPrefix: "前往機構首頁",
    descriptionSuffix: "前往主辦機構首頁，查看特展與機構相關資訊。",
  },

  curated: {
    prefix: "CURATED",
    entityLabel: "示範藏家",
    href: "https://virtual.metaassets.asia/exhibitions/LiChienYi",
    external: true,
    badge: "3DVR",
    ariaLabelPrefix: "開啟 3D 展間",
    descriptionSuffix: "建立可在線上瀏覽的收藏展間。",
  },
};

const CATEGORY_DATA = {
  all: {
    prefix: "ALL",
    label: "全部展演",
  },

  "oil-painting": {
    prefix: "OIL",
    label: "油彩藝術",
  },

  "ink-art": {
    prefix: "INK",
    label: "水墨藝術",
  },

  pastel: {
    prefix: "PASTEL",
    label: "粉彩藝術",
  },

  photography: {
    prefix: "PHOTO",
    label: "攝影藝術",
  },

  sculpture: {
    prefix: "SCULPTURE",
    label: "雕塑藝術",
  },

  "digital-art": {
    prefix: "DIGITAL",
    label: "數位藝術",
  },

  "mixed-media": {
    prefix: "MIXED",
    label: "複合媒材",
  },

  installation: {
    prefix: "INSTALLATION",
    label: "裝置藝術",
  },
};

function createPlaceholderItem({
  panelConfig,
  title,
  artist,
  description,
  imageText,
  imageBackground,
  imageForeground,
  featured = false,
}) {
  return {
    title,
    artist,
    description,
    href: panelConfig.href,
    external: panelConfig.external,
    badge: panelConfig.badge,
    ariaLabelPrefix: panelConfig.ariaLabelPrefix,
    image: `https://placehold.co/1200x675/${imageBackground}/${imageForeground}?text=${encodeURIComponent(
      imageText,
    )}`,
    featured,
  };
}

function createPlaceholderItems(panelKey, categoryPrefix, categoryLabel) {
  const panelConfig = PANEL_CONFIG[panelKey];

  if (!panelConfig) {
    return [];
  }

  const combinedPrefix = `${panelConfig.prefix} ${categoryPrefix}`;

  const firstItem =
    panelKey === "solo" && categoryLabel === "全部展演"
      ? REAL_EXHIBITION
      : createPlaceholderItem({
          panelConfig,
          title: `${categoryLabel}｜線上展演示範`,
          artist: panelConfig.entityLabel,
          description: `以${categoryLabel}作為主要語彙，${panelConfig.descriptionSuffix}`,
          imageText: `${combinedPrefix} FEATURED`,
          imageBackground: "eee8df",
          imageForeground: "665f56",
          featured: true,
        });

  return [
    firstItem,

    createPlaceholderItem({
      panelConfig,
      title: `${combinedPrefix}・光的邊界`,
      artist: `${panelConfig.entityLabel} A`,
      description: `以${categoryLabel}作為主要語彙，${panelConfig.descriptionSuffix}`,
      imageText: `${combinedPrefix} 01`,
      imageBackground: "eee8df",
      imageForeground: "665f56",
    }),

    createPlaceholderItem({
      panelConfig,
      title: `${combinedPrefix}・城市切片`,
      artist: `${panelConfig.entityLabel} B`,
      description: `從城市、建築與日常觀看出發，${panelConfig.descriptionSuffix}`,
      imageText: `${combinedPrefix} 02`,
      imageBackground: "e8e8e8",
      imageForeground: "555555",
    }),

    createPlaceholderItem({
      panelConfig,
      title: `${combinedPrefix}・時間的形狀`,
      artist: `${panelConfig.entityLabel} C`,
      description: `以材質、色彩與空間層次，${panelConfig.descriptionSuffix}`,
      imageText: `${combinedPrefix} 03`,
      imageBackground: "f3efe7",
      imageForeground: "6f6559",
    }),

    createPlaceholderItem({
      panelConfig,
      title: `${combinedPrefix}・無界觀看`,
      artist: `${panelConfig.entityLabel} D`,
      description: `透過數位展示延伸實體展覽，${panelConfig.descriptionSuffix}`,
      imageText: `${combinedPrefix} 04`,
      imageBackground: "e5e1dc",
      imageForeground: "5b5650",
    }),

    createPlaceholderItem({
      panelConfig,
      title: `${combinedPrefix}・回到風景`,
      artist: `${panelConfig.entityLabel} E`,
      description: `重新觀看熟悉的自然與生活場景，${panelConfig.descriptionSuffix}`,
      imageText: `${combinedPrefix} 05`,
      imageBackground: "ebe6dc",
      imageForeground: "625e55",
    }),
  ];
}

function createPanelData(panelKey) {
  return Object.fromEntries(
    Object.entries(CATEGORY_DATA).map(([key, category]) => [
      key,
      createPlaceholderItems(panelKey, category.prefix, category.label),
    ]),
  );
}

export const PW_EXHIBITION_PAGE_MOCK = {
  solo: createPanelData("solo"),
  group: createPanelData("group"),
  fair: createPanelData("fair"),
  curated: createPanelData("curated"),
};
