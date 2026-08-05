// 首頁專用功能
import { pwHeroBannerMockData } from "./data/pw-hero-banner.mock.js";
import { initPwHeroBannerDemo } from "./modules/pw-hero-banner-demo.js";
import { initPwCategoryScroll } from "./modules/pw-category-scroll.js";
import "./modules/pw-wing-people-share.js";
//短影音預覽3秒
import "./modules/pw-youtube-hover-preview.js";

document.addEventListener("DOMContentLoaded", () => {
  initPwHeroBannerDemo(pwHeroBannerMockData);
  initPwCategoryScroll();
});
