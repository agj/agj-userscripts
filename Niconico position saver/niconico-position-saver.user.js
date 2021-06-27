// ==UserScript==
// @name        Niconico position saver
// @version     1.0.0
// @namespace   http://www.agj.cl/
// @description Periodically records the current playing time while you watch videos, so you don't lose track of where you were watching.
// @license     Unlicense
// @match       *://*.nicovideo.jp/*
// @grant       none
// ==/UserScript==

// Configuration

const saveIntervalSeconds = 10;
const previewSeconds = 5;
const videoReadyPollingSeconds = 0.2;

// Utilities

const onLoad = (cb) =>
  /interactive|complete/.test(document.readyState)
    ? setTimeout(cb, 0)
    : document.addEventListener("DOMContentLoaded", cb, { once: true });
const onChanged = (el, cb) => {
  const observer = new MutationObserver(cb);
  observer.observe(el, {
    childList: true,
    subtree: true,
  });
  return observer.disconnect.bind(observer);
};
const getVideo = () => document.querySelector("#MainVideoPlayer video");
const getTimeToSave = (seconds) =>
  Math.max(0, Math.floor(seconds - previewSeconds));

// Position retrieving

console.log("!", location);
const startTimeString = new URL(location).searchParams.get("t");
const startTime = startTimeString === "" ? null : parseInt(startTimeString);
const videoLoaded = false;

onLoad(() => {
  // Position restoring

  if (startTime) {
    const tryRestoringVideo = () => {
      const video = getVideo();
      if (video && video.duration) {
        video.currentTime = startTime;
        saveTime();
        clearInterval(intervalId);
      }
    };

    const intervalId = setInterval(
      tryRestoringVideo,
      videoReadyPollingSeconds * 1000
    );
  }

  // Position saving

  let video;

  const saveTime = () => {
    if (!video || !video.document) {
      video = getVideo();
      if (!video) return;
      video.addEventListener("seeked", saveTime);
    }
    const seconds = video.currentTime;
    const url = new URL(location);
    url.searchParams.set("t", getTimeToSave(seconds).toString());
    history.replaceState(history.state, document.title, url.toString());
  };

  setInterval(saveTime, saveIntervalSeconds * 1000);
});
