/*
 * Search Page Mock Data
 * 搜尋頁：設計預覽用假資料
 *
 * 假資料與 HTML 結構分離。
 * React 交付時可移除本檔與 pw-search-page.js，
 * 保留 EJS 轉出的純 HTML 結構與 SCSS。
 */

const ARTIST_IMAGES = [
  "https://cdn.metaassets.asia/artists/avatar_12_20230224020147.jpg",
  "https://cdn.metaassets.asia/artists/avatar_2_20230223093241.jpg",
  "https://cdn.metaassets.asia/artists/avatar_3_20240627041500.jpg",
  "https://cdn.metaassets.asia/artists/avatar_5_20230223094839.jpg",
  "https://cdn.metaassets.asia/artists/avatar_7_20230223094042.jpg",
];

export const PW_SEARCH_MOCK = {
  keyword: "趙",
  defaultType: "exhibitions",

  results: {
    artists: {
      total: 5,
      items: [
        {
          name: "趙二呆",
          href: "./pw-artist-page.html?id=12",
          image: ARTIST_IMAGES[0],
          featured: true,
        },
        {
          name: "趙樹均",
          href: "./pw-artist-page.html?id=2",
          image: ARTIST_IMAGES[1],
        },
        {
          name: "邱中超",
          href: "./pw-artist-page.html?id=3",
          image: ARTIST_IMAGES[2],
        },
        {
          name: "趙樹均",
          href: "./pw-artist-page.html?id=5",
          image: ARTIST_IMAGES[3],
        },
        {
          name: "趙趙趙",
          href: "./pw-artist-page.html?id=7",
          image: ARTIST_IMAGES[4],
        },
      ],
    },

    media: {
      total: 5,
      items: [
        {
          name: "趙二呆",
          meta: "粉彩／壓克力",
          href: "./pw-artist-page.html?id=12",
          image: ARTIST_IMAGES[0],
          featured: true,
        },
        {
          name: "趙樹均",
          meta: "油彩",
          href: "./pw-artist-page.html?id=2",
          image: ARTIST_IMAGES[1],
        },
        {
          name: "邱中超",
          meta: "壓克力／粉彩",
          href: "./pw-artist-page.html?id=3",
          image: ARTIST_IMAGES[2],
        },
        {
          name: "趙樹均",
          meta: "粉彩",
          href: "./pw-artist-page.html?id=5",
          image: ARTIST_IMAGES[3],
        },
        {
          name: "趙趙趙",
          meta: "粉彩／壓克力",
          href: "./pw-artist-page.html?id=7",
          image: ARTIST_IMAGES[4],
        },
      ],
    },

    exhibitions: {
      total: 8,
      items: [
        {
          title: "李健儀油畫創作展",
          href: "https://virtual.metaassets.asia/exhibitions/LiChienYi",
          image:
            "https://cdn.metaassets.asia/exhibitions/banner_55_20251212073814.jpg",
          featured: true,
          description:
            "現任玄奘大學客座教授兼院長。作品《中華聖人圖》榮獲梵諦岡博物館永久典藏，為東亞藝術家唯一者，並於 2000 年獲教宗聖若望保祿二世接見於聖彼得大教堂。1992 至 1994 年留學美國芳邦大學，獲藝術暨美術雙碩士學位。2012 年入選《中華文化大使——沈鵬、戴士和、李健儀、馮遠、許江》畫集。",
        },
        {
          title: "林宏信個展",
          href: "https://virtual.metaassets.asia/exhibitions/HSIN",
          image:
            "https://cdn.metaassets.asia/exhibitions/banner_12_20230324082754.jpg",
          description:
            "林宏信 1975 年出生於雲林，畢業於國立臺灣藝術大學美術研究所。作品曾參與臺北、上海、倫敦、新加坡等地藝術博覽會，亦獲國立臺灣美術館與臺北市立美術館收藏。作品以寫實繪畫為主體，揉合向量平面符號、虛擬空間意象、個人生活經歷與妄想，並以班雅明的「漫遊者」概念形塑畫面中的主體人物。",
        },
        {
          title: "花開宇宙間",
          href: "https://virtual.metaassets.asia/exhibitions/LI",
          image:
            "https://cdn.metaassets.asia/exhibitions/banner_26_20251222041457.jpg",
          description:
            "金莉《花開宇宙間》個展，展期為 2023 年 5 月 20 日至 6 月 16 日。畫作如宇宙間綻放的花朵，以精確肯定的筆觸描繪花卉、蔬果與風景，並透過水彩渲染筆法營造融合自然與宇宙之美的藝術體驗。",
        },
        {
          title: "胡朝聰個展",
          href: "https://virtual.metaassets.asia/exhibitions/Tsung",
          image:
            "https://cdn.metaassets.asia/exhibitions/banner_13_20230324081954.jpg",
          description:
            "胡朝聰 1981 年生於臺北，畢業於文化大學美術系及藝術研究所美術組，並就讀臺北藝術大學美術學系碩士班創作組。曾獲金車青年藝術獎、臺灣國展、大墩美展、雙和美展、國泰新世紀潛力畫展等多項獎項與入選肯定。",
        },
        {
          title: "許德麗個展",
          href: "https://virtual.metaassets.asia/exhibitions/TELI",
          image:
            "https://cdn.metaassets.asia/exhibitions/banner_15_20230330022746.jpg",
          description:
            "許德麗 1961 年生於屏東。自幼進入何文杞老師畫室學習兒童畫與寫意畫，之後陸續學習國畫、素描、水彩、油畫與版畫。就讀師大美術系期間，曾受顧炳星、李焜培、鄭善禧、黃昌惠、陳銀輝、郭軔、劉文煒、廖修平等教授指導。",
        },
        {
          title: "吳政翰－城市 tempo 個展",
          href: "https://virtual.metaassets.asia/exhibitions/Witkin",
          image:
            "https://cdn.metaassets.asia/exhibitions/banner_11_20230324062043.jpg",
          description:
            "吳政翰畢業於高雄師範大學美術系，並完成藝術學研究所藝術理論美學組學業。作品曾參與東京 Gallery Field 臺灣五人藝術家聯展、高雄與臺中藝術博覽會、桃源獎與金車油畫得獎作品聯展，以及 One Art Taipei 等展覽。",
        },
        {
          title: "林嘉翔",
          href: "https://virtual.metaassets.asia/exhibitions/ADAM",
          image:
            "https://cdn.metaassets.asia/exhibitions/banner_23_20230420021326.jpg",
          description:
            "林嘉翔出生於臺北，畢業於臺灣大學。雖未就讀藝術系，卻在長途旅行中重新執起畫筆，以右手描繪景物、左手書寫心境。曾受邀於日本舉辦多次個展，系列作品亦散見於國內外專業出版物。",
        },
        {
          title: "李霽洵個展",
          href: "https://virtual.metaassets.asia/exhibitions/first",
          image:
            "https://cdn.metaassets.asia/exhibitions/banner_1_20230321034511.jpg",
          description: "以女性主體為核心的雕刻創作展。",
        },
      ],
    },
  },
};
