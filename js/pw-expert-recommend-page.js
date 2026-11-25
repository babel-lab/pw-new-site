import { pwExpertRecommendPageMock } from "./data/pw-expert-recommend-page.mock.js";

import { initPwExpertRecommendPage } from "./modules/pw-expert-recommend-page.js";

document.addEventListener("DOMContentLoaded", () => {
  initPwExpertRecommendPage(pwExpertRecommendPageMock);
});
