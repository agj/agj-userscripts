// ==UserScript==
// @name            Taiwan ISRC to MusicBrainz
// @version         1.1.0
// @namespace       http://www.agj.cl/
// @description     Adds a link to any isrc.ncl.edu.tw record entry page that opens the Add Release form in MusicBrainz, prefilling it with that record's information.
// @license         Unlicense
// @include         http*://isrc.ncl.edu.tw/music_view.aspx*
// @grant           none
// ==/UserScript==

(() => {
  "use strict";

  // Utilities.

  const sel = document.querySelector.bind(document);
  const selAll = document.querySelectorAll.bind(document);
  const selIn = (el, selector) => el.querySelector(selector);
  const get = (prop) => (obj) => obj[prop];
  const call =
    (method, ...args) =>
    (obj) =>
      obj[method](...args);
  const esc = encodeURIComponent;
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

  // Get values.

  const values = Array.from(selAll(".musicView > table > tbody > tr")).reduce(
    (r, el) => {
      const label = selIn(el, "th").textContent.trim();
      const value = selIn(el, "td")
        .textContent.trim()
        .replace(/^:\s+(\S.*)$/, "$1");
      if (/表演者/.test(label)) r.artist = value;
      else if (/樂團名稱/.test(label)) r.artist = value;
      else if (/專輯名稱/.test(label)) r.title = value;
      else if (/發行公司/.test(label)) r.label = value;
      else if (/產品編碼/.test(label)) r.cat = value;
      else if (/EAN碼/.test(label)) r.barcode = value;
      else if (/發行日期/.test(label)) r.date = value.split("/");
      return r;
    },
    {}
  );
  values.tracks = Array.from(selAll(".AllMusic fieldset a"))
    .map(get("textContent"))
    .map(call("trim"))
    .map((t) => t.replace(/^.+ ] 曲目名稱:(.*)$/, "$1"));

  // Add submit link.

  const checkValue = (value) => (value === undefined ? "" : value);
  const input = (name, value) =>
    dom("input", { name: name, value: checkValue(value), type: "text" });

  const link = dom("a", null, "Add to MusicBrainz");
  const form = dom(
    "form",
    {
      name: "musicbrainz-submit",
      action: "https://musicbrainz.org/release/add",
      method: "post",
      "accept-charset": "utf-8",
      style: "display: none",
    },
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
    input("edit_note", "From Taiwan ISRC: " + window.location.href)
  );
  const container = dom("div", { id: "musicbrainz-submit" }, link, form);

  const trackCount = counter();
  flatten(
    values.tracks.map((title) => {
      const i = trackCount();
      return [
        input(`mediums.0.track.${i}.name`, title),
        input(`mediums.0.track.${i}.number`, i + 1),
      ];
    })
  ).map((el) => form.appendChild(el));

  sel("#mainContent > div").prepend(container);
  link.addEventListener("click", (e) => {
    form.submit();
    e.preventDefault();
  });

  sel("head").append(
    dom(
      "style",
      null,
      `
        #musicbrainz-submit {
            display: inline-flex;
            vertical-align: bottom;
            margin-right: 20px;
            height: 42px;
            align-items: center;
        }
        #musicbrainz-submit a {
            cursor: pointer;
            font-size: 14px;
            font-weight: bold;
        }
`
    )
  );
})();
