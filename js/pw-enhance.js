// 全站共用功能：Header、Back to top
//import { initPwTabs } from "./modules/pw-tabs.js";
//import { initPwCarousel } from "./modules/pw-carousel.js";
import { initPwSiteHeader } from "./modules/pw-site-header.js";
import { initPwBackToTop } from "./modules/pw-back-to-top.js";

//初始化
document.addEventListener("DOMContentLoaded", () => {
  // HEADER：搜尋 / 語言 / 選單 toggle
  initPwSiteHeader({
    mobileMedia: "(max-width: 991.98px)",
    compactOffset: 80,
  });

  // Tabs
  //document.querySelectorAll("[data-pw-tabs]").forEach(initPwTabs);

  // Carousel
  //document.querySelectorAll("[data-pw-carousel]").forEach(initPwCarousel);

  // Back to top
  initPwBackToTop();
});
