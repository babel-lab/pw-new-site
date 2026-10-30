/*
 * Artist Explore Mock Data
 * 探索藝術人頁：分類切換展示用假資料
 *
 * 藝術大師分類：每個次分類 15 筆
 * 創藝人物分類：每個次分類 16 筆
 */

const IMAGES = [
  "https://cdn.metaassets.asia/artists/avatar_12_20230224020147.jpg",
  "https://cdn.metaassets.asia/artists/avatar_2_20230223093241.jpg",
  "https://cdn.metaassets.asia/artists/avatar_3_20240627041500.jpg",
  "https://cdn.metaassets.asia/artists/avatar_5_20230223094839.jpg",
  "https://cdn.metaassets.asia/artists/avatar_7_20230223094042.jpg",
];

function createArtistItems(prefix, startId, imageOffset = 0, count = 15) {
  return Array.from({ length: count }, (_, index) => {
    const id = startId + index;

    return {
      name: `${prefix}${index + 1}`,
      href: `./pw-artist-page.html?id=${id}`,
      image: IMAGES[(index + imageOffset) % IMAGES.length],
      featured: index === 0,
      grayscale: true,
    };
  });
}

function fillArtistItems(
  seedItems,
  prefix,
  startId,
  imageOffset = 0,
  total = 15,
) {
  const remainingCount = Math.max(total - seedItems.length, 0);

  const additionalItems = Array.from({ length: remainingCount }, (_, index) => {
    const id = startId + index;
    const displayIndex = seedItems.length + index + 1;

    return {
      name: `${prefix}${displayIndex}`,
      href: `./pw-artist-page.html?id=${id}`,
      image: IMAGES[(index + imageOffset) % IMAGES.length],
      featured: false,
      grayscale: true,
    };
  });

  return [...seedItems, ...additionalItems];
}

const MASTER_FIGURATIVE_ITEMS = [
  {
    name: "林嘉文",
    href: "./pw-artist-page.html?id=12",
    image: IMAGES[0],
    featured: true,
    grayscale: true,
  },
  {
    name: "林宏信",
    href: "./pw-artist-page.html?id=2",
    image: IMAGES[1],
    grayscale: true,
  },
  {
    name: "金莉",
    href: "./pw-artist-page.html?id=3",
    image: IMAGES[2],
    grayscale: true,
  },
  {
    name: "胡朝聰",
    href: "./pw-artist-page.html?id=5",
    image: IMAGES[3],
    grayscale: true,
  },
];

const CREATOR_FIGURATIVE_ITEMS = [
  {
    name: "吳政翰",
    href: "./pw-artist-page.html?id=7",
    image: IMAGES[4],
    featured: true,
    grayscale: true,
  },
  {
    name: "陳凱森",
    href: "./pw-artist-page.html?id=101",
    image: IMAGES[0],
    grayscale: true,
  },
  {
    name: "潘蓬彬",
    href: "./pw-artist-page.html?id=102",
    image: IMAGES[1],
    grayscale: true,
  },
  {
    name: "劉洋哲",
    href: "./pw-artist-page.html?id=103",
    image: IMAGES[2],
    grayscale: true,
  },
];

export const PW_ARTIST_EXPLORE_MOCK = {
  masters: {
    surrealism: createArtistItems("超現實藝術家 ", 301, 0, 15),

    "ai-generative": createArtistItems("AI 藝術家 ", 321, 1, 15),

    figurative: fillArtistItems(
      MASTER_FIGURATIVE_ITEMS,
      "具象藝術家 ",
      341,
      2,
      15,
    ),

    pastel: createArtistItems("粉彩藝術家 ", 361, 2, 15),

    abstract: createArtistItems("抽象藝術家 ", 381, 3, 15),

    expressionism: createArtistItems("表現藝術家 ", 401, 4, 15),

    "three-dimensional": createArtistItems("立體藝術家 ", 421, 0, 15),

    installation: createArtistItems("裝置藝術家 ", 441, 1, 15),

    "oil-painting": createArtistItems("油彩藝術家 ", 461, 2, 15),
  },

  creators: {
    surrealism: createArtistItems("超現實創藝人物 ", 501, 1, 16),

    "ai-generative": createArtistItems("AI 創藝人物 ", 521, 2, 16),

    figurative: fillArtistItems(
      CREATOR_FIGURATIVE_ITEMS,
      "具象創藝人物 ",
      541,
      3,
      16,
    ),

    pastel: createArtistItems("粉彩創藝人物 ", 561, 3, 16),

    abstract: createArtistItems("抽象創藝人物 ", 581, 4, 16),

    expressionism: createArtistItems("表現創藝人物 ", 601, 0, 16),

    "three-dimensional": createArtistItems("立體創藝人物 ", 621, 1, 16),

    installation: createArtistItems("裝置創藝人物 ", 641, 2, 16),

    "oil-painting": createArtistItems("油彩創藝人物 ", 661, 3, 16),
  },
};
