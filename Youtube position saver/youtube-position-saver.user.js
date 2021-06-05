// ==UserScript==
// @name        Youtube position saver
// @version     1.0.0
// @namespace   http://www.agj.cl/
// @description Periodically records the current playing time while you watch videos, so you don't lose track of where you were watching.
// @license     Unlicense
// @match       *://*.youtube.com/watch*
// @grant       none
// ==/UserScript==

// Configuration

const previewSeconds = 5;
const saveIntervalSeconds = 10;

// Utilities

const onLoad = (cb) =>
  /interactive|complete/.test(document.readyState)
    ? setTimeout(cb, 0)
    : document.addEventListener("DOMContentLoaded", cb);

// Position saving

onLoad(() => {
  const video = unsafeWindow.document.querySelector("#movie_player");
  let previousTime = video.getCurrentTime() || 0;

  const saveTime = () => {
    if (video) {
      const seconds = video.getCurrentTime();
      if (seconds !== previousTime) {
        const url = new URL(location);
        url.searchParams.set(
          "t",
          Math.max(0, Math.floor(seconds) - previewSeconds)
        );
        history.replaceState(history.state, document.title, url.toString());
      }
    }
  };

  setInterval(saveTime, saveIntervalSeconds * 1000);
});
