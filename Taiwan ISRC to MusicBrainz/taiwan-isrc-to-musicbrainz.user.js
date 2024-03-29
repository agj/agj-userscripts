// ==UserScript==
// @name            Taiwan ISRC to MusicBrainz
// @version         3.0.0
// @namespace       http://www.agj.cl/
// @description     Adds an “Add to MusicBrainz” button to any Taiwan ISRC website record entry page, which prefills the record submission form on MusicBrainz.
// @description.zh  在台灣ISRC網站裡的專輯頁上加「Add to MusicBrainz」（加到 MusicBrainz 音樂數據庫）的按鈕。
// @license         Unlicense
// @include         http*://isrc.ncl.edu.tw/C100/*
// @grant           none
// ==/UserScript==

(() => {
  "use strict";

  // Utilities.

  const sel = document.querySelector.bind(document);
  const selAll = document.querySelectorAll.bind(document);
  const selIn = (el, selector) => el.querySelector(selector);
  const dom = (tag, attrs, ...children) => {
    const el = document.createElement(tag);
    if (attrs)
      Object.keys(attrs).forEach((attr) => el.setAttribute(attr, attrs[attr]));
    children
      .map((obj) =>
        typeof obj === "string" ? document.createTextNode(obj) : obj
      )
      .forEach((node) => el.appendChild(node));
    return el;
  };
  const counter = () => {
    let i = 0;
    return () => i++;
  };
  const flatten = (list) =>
    list.reduce(
      (r, item) =>
        Array.isArray(item) ? r.concat(flatten(item)) : r.concat([item]),
      []
    );
  const onFullLoad = (cb) =>
    /complete/.test(document.readyState)
      ? setTimeout(cb, 0)
      : window.addEventListener("load", cb, {
          once: true,
        });
  const waitFor = (milliseconds) =>
    new Promise((resolve) => {
      setTimeout(resolve, milliseconds);
    });
  const checkValue = (value) => (value === undefined ? "" : value);
  const input = (name, value) =>
    dom("input", { name: name, value: checkValue(value), type: "text" });
  const observe = (element, callback) => {
    const observer = new MutationObserver(callback);
    observer.observe(element, { childList: true, subtree: true });
  };

  onFullLoad(async () => {
    // Add elements to DOM.

    const button = dom(
      "button",
      {
        class: "btn btn-outline-secondary pull-right",
        id: "musicbrainz-button",
      },
      "Add to MusicBrainz"
    );

    const form = dom("form", {
      name: "musicbrainz-submit",
      action: "https://musicbrainz.org/release/add",
      method: "post",
      "accept-charset": "utf-8",
      style: "display: none",
    });

    const container = sel(".card-header");
    container.insertAdjacentElement("afterbegin", form);
    container.insertAdjacentElement("afterbegin", button);

    button.addEventListener("click", (e) => {
      form.submit();
      e.preventDefault();
    });

    sel("head").append(
      dom(
        "style",
        null,
        `
          #musicbrainz-button {
            float: right
          }`
      )
    );

    const table = sel(".table");
    const songsTable = sel("#songsTable");

    const updateForm = () => {
      // Get values.

      const values = Array.from(table.querySelectorAll("tr")).reduce(
        (r, el) => {
          const label = selIn(el, "th").textContent.trim();
          const value = selIn(el, "td").textContent.trim();
          console.log({ el, label, value });
          if (/表演者/.test(label)) r.artist = value;
          else if (/樂團名稱/.test(label)) r.artist = value;
          else if (/專輯名稱/.test(label)) r.title = value;
          else if (/發行公司/.test(label)) r.label = value;
          else if (/產品編碼/.test(label)) r.cat = value;
          else if (/EAN\/UPC碼/.test(label)) r.barcode = value;
          else if (/發行日期/.test(label)) r.date = value.split(".");
          return r;
        },
        {}
      );

      values.tracks = Array.from(songsTable.querySelectorAll("tr")).map(
        (el) => {
          const [hours, minutes, seconds] = el
            .querySelector("td.text-right")
            .textContent.trim()
            .split(".")
            .map(Number);
          const paddedSeconds = seconds.toString().padStart(2, "0");
          return {
            title: el
              .querySelector("a")
              .textContent.trim()
              .replace(/^\[\S+\] \d+[.](.*)$/, "$1"),
            length: `${hours * 60 + minutes}:${paddedSeconds}`,
          };
        }
      );

      console.log({ values });

      // Create form inputs.

      const baseInputs = [
        input("name", values.title),
        input("artist_credit.names.0.name", values.artist),
        input("labels.0.name", values.label),
        input("labels.0.catalog_number", values.cat),
        input("events.0.date.year", values.date[0]),
        input("events.0.date.month", values.date[1]),
        input("events.0.country", "TW"),
        input("barcode", values.barcode),
        input("urls.0.url", window.location.href),
        input("urls.0.link_type", "82"),
        input("language", "cmn"),
        input("script", "Hant"),
        input("status", "official"),
        input("mediums.0.format", "cd"),
        input("edit_note", "From Taiwan ISRC: " + window.location.href),
      ];

      const trackCount = counter();
      const trackInputs = flatten(
        values.tracks.map(({ title, length }) => {
          const i = trackCount();
          return [
            input(`mediums.0.track.${i}.name`, title),
            input(`mediums.0.track.${i}.length`, length),
            input(`mediums.0.track.${i}.number`, i + 1),
          ];
        })
      );

      // Replace form contents with new data.

      form.textContent = "";
      form.append(...baseInputs, ...trackInputs);
    };

    updateForm();

    // Listen to changes in data.

    observe(table, updateForm);
    observe(songsTable, updateForm);
  });
})();
