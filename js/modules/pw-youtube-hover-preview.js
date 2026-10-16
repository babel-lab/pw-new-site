/**
 * YouTube Hover Preview
 *
 * 功能：
 * 1. 僅在支援 hover 且為精準滑鼠指標的裝置啟用。
 * 2. 第一次 hover 時才載入 YouTube IFrame API。
 * 3. 第一次 hover 該卡片時才建立播放器。
 * 4. 靜音播放指定區段 3 秒。
 * 5. mouseleave 時立即暫停並回到預覽起點。
 */

const SELECTOR = "[data-youtube-preview]";
const PREVIEW_DURATION = 3000;

const desktopHoverQuery = window.matchMedia(
  "(hover: hover) and (pointer: fine)",
);

let youtubeApiPromise = null;
let activeItem = null;

const previewStates = new WeakMap();

/**
 * 動態載入 YouTube IFrame Player API。
 */
function loadYouTubeIframeApi() {
  if (window.YT?.Player) {
    return Promise.resolve(window.YT);
  }

  if (youtubeApiPromise) {
    return youtubeApiPromise;
  }

  youtubeApiPromise = new Promise((resolve, reject) => {
    const existingScript = document.querySelector(
      'script[src="https://www.youtube.com/iframe_api"]',
    );

    const previousReadyHandler = window.onYouTubeIframeAPIReady;

    window.onYouTubeIframeAPIReady = () => {
      if (typeof previousReadyHandler === "function") {
        previousReadyHandler();
      }

      resolve(window.YT);
    };

    if (existingScript) {
      return;
    }

    const script = document.createElement("script");

    script.src = "https://www.youtube.com/iframe_api";
    script.async = true;

    script.addEventListener("error", () => {
      reject(new Error("YouTube IFrame API 載入失敗。"));
    });

    document.head.appendChild(script);
  });

  return youtubeApiPromise;
}

/**
 * 取得卡片的預覽起始秒數。
 */
function getPreviewStart(item) {
  const value = Number(item.dataset.previewStart);

  if (!Number.isFinite(value) || value < 0) {
    return 0;
  }

  return value;
}

/**
 * 清除目前卡片的 3 秒計時器。
 */
function clearPreviewTimer(state) {
  if (!state?.timerId) {
    return;
  }

  window.clearTimeout(state.timerId);
  state.timerId = null;
}

/**
 * 建立單一卡片的 YouTube Player。
 *
 * 第一次 hover 才會執行。
 */
function createPlayer(item) {
  const existingState = previewStates.get(item);

  if (existingState?.player) {
    return Promise.resolve(existingState.player);
  }

  if (existingState?.playerPromise) {
    return existingState.playerPromise;
  }

  const videoId = item.dataset.videoId;
  const playerElement = item.querySelector(".pw-wing-people__player");

  if (!videoId || !playerElement) {
    return Promise.reject(
      new Error("YouTube 預覽卡片缺少 video ID 或播放器容器。"),
    );
  }

  const state = existingState || {
    player: null,
    playerPromise: null,
    timerId: null,
    isPointerInside: false,
  };

  previewStates.set(item, state);

  state.playerPromise = loadYouTubeIframeApi().then(
    () =>
      new Promise((resolve, reject) => {
        const previewStart = getPreviewStart(item);

        const player = new window.YT.Player(playerElement, {
          videoId,

          playerVars: {
            autoplay: 0,
            controls: 0,
            disablekb: 1,
            enablejsapi: 1,
            fs: 0,
            playsinline: 1,
            rel: 0,
            start: previewStart,
          },

          events: {
            onReady(event) {
              state.player = event.target;
              state.playerPromise = null;

              event.target.mute();
              event.target.seekTo(previewStart, true);

              item.classList.add("is-player-ready");

              resolve(event.target);
            },

            onError() {
              state.playerPromise = null;
              item.classList.add("has-player-error");

              reject(new Error(`YouTube 影片 ${videoId} 無法建立播放器。`));
            },
          },
        });

        state.player = player;
      }),
  );

  return state.playerPromise;
}

/**
 * 停止指定卡片的預覽。
 */
function stopPreview(item, shouldReset = true) {
  const state = previewStates.get(item);

  if (!state) {
    return;
  }

  clearPreviewTimer(state);

  if (state.player?.pauseVideo) {
    state.player.pauseVideo();

    if (shouldReset) {
      state.player.seekTo(getPreviewStart(item), true);
    }
  }

  item.classList.remove("is-previewing");

  if (activeItem === item) {
    activeItem = null;
  }
}

/**
 * 開始播放指定卡片的 3 秒預覽。
 */
async function startPreview(item) {
  if (!desktopHoverQuery.matches) {
    return;
  }

  const state = previewStates.get(item) || {
    player: null,
    playerPromise: null,
    timerId: null,
    isPointerInside: true,
  };

  state.isPointerInside = true;
  previewStates.set(item, state);

  /*
   * 同一時間只允許一支影片播放。
   */
  if (activeItem && activeItem !== item) {
    stopPreview(activeItem);
  }

  activeItem = item;
  item.classList.add("is-loading-preview");

  try {
    const player = await createPlayer(item);
    const currentState = previewStates.get(item);

    item.classList.remove("is-loading-preview");

    /*
     * API 載入完成前，滑鼠可能已經移出卡片。
     * 此時不可再自動播放。
     */
    if (!currentState?.isPointerInside) {
      stopPreview(item);
      return;
    }

    clearPreviewTimer(currentState);

    const previewStart = getPreviewStart(item);

    player.mute();
    player.seekTo(previewStart, true);
    player.playVideo();

    item.classList.add("is-previewing");

    currentState.timerId = window.setTimeout(() => {
      stopPreview(item);
    }, PREVIEW_DURATION);
  } catch (error) {
    item.classList.remove("is-loading-preview", "is-previewing");

    console.error(error);
  }
}

/**
 * 處理滑鼠移出。
 */
function handlePointerLeave(item) {
  const state = previewStates.get(item);

  if (state) {
    state.isPointerInside = false;
  }

  item.classList.remove("is-loading-preview");
  stopPreview(item);
}

/**
 * 綁定單一卡片事件。
 */
function bindPreviewItem(item) {
  if (item.dataset.youtubePreviewReady === "true") {
    return;
  }

  item.dataset.youtubePreviewReady = "true";

  item.addEventListener("mouseenter", () => {
    const state = previewStates.get(item);

    if (state) {
      state.isPointerInside = true;
    }

    startPreview(item);
  });

  item.addEventListener("mouseleave", () => {
    handlePointerLeave(item);
  });
}

/**
 * 初始化。
 */
function initYouTubeHoverPreview() {
  if (!desktopHoverQuery.matches) {
    return;
  }

  document.querySelectorAll(SELECTOR).forEach(bindPreviewItem);
}

/**
 * 當裝置從桌機 hover 狀態變成觸控狀態時，
 * 停止目前正在播放的預覽。
 */
function handleDeviceCapabilityChange(event) {
  if (!event.matches && activeItem) {
    stopPreview(activeItem);
  }

  if (event.matches) {
    initYouTubeHoverPreview();
  }
}

document.addEventListener("DOMContentLoaded", initYouTubeHoverPreview);

desktopHoverQuery.addEventListener("change", handleDeviceCapabilityChange);
