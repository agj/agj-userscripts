// ==UserScript==
// @name        Pocket direct links
// @version     2.0.1
// @namespace   http://www.agj.cl/
// @description Main links are converted to direct links, and clicking on the URL below the title opens the Pocket reader (if available).
// @license     Unlicense
// @include     http*://app.getpocket.com/*
// @grant       none
// ==/UserScript==

const onLoad = cb => /interactive|complete/.test(document.readyState) ? setTimeout(cb, 0) : document.addEventListener('DOMContentLoaded', cb);
const sel = document.querySelector.bind(document);
const selAll = document.querySelectorAll.bind(document);
const makeEl = (tag, attrs, ...children) => {
	const el = document.createElement(tag);
	if (attrs) Object.keys(attrs).forEach(attr => el.setAttribute(attr, attrs[attr]));
	children.map(obj => typeof obj === 'string' ? document.createTextNode(obj) : obj)
		.forEach(node => el.appendChild(node));
	return el;
};
const eq = a => b => b === a;
const not = f => (...args) => !f(...args);
const has = a => list => list.includes(a);
const isIn = list => obj => list.some(a => a === obj);
const toggle = a => list => has(a)(list) ? list.filter(not(eq(a))) : list.concat([a]);
const tap = f => (...args) => { f(...args); return args[0] };
const log = tap(console.log);
const onChanged = (el, cb) => {
	const observer = new MutationObserver(cb);
	observer.observe(el, { childList: true, subtree: true });
	return observer.disconnect.bind(observer);
};



onLoad(() => {
	// Actual link fixing.

	const fix = () => {
		Array.from(selAll(`article`))
			.forEach(fixEl);
	};
	const fixEl = el => {
		const elImage = el.querySelector('a[aria-label]');
		const elTitle = el.querySelector('div > a[aria-label]');
		const elDirect = el.querySelector('div > div > cite > a');

		if (!elImage || !elTitle || !elDirect) return;

		const isFixed = !!el.getAttribute('x-actual-url');
		const url = isFixed
			? el.getAttribute('x-actual-url')
			: decodeURIComponent(elDirect.getAttribute('href').replace(/^.+redirect\?url=([^&]*)(\&.*)?$/, '$1'));
		const readerUrl = isFixed
			? el.getAttribute('x-reader-url')
			: elTitle.getAttribute('href');

		elImage.setAttribute('href', url);
		elTitle.setAttribute('href', url);
		elDirect.setAttribute('href', /^\/read\//.test(readerUrl) ? readerUrl : url);

		const openUrl = (e) => {
			window.location.href = url;
			e.preventDefault();
		}
		elImage.addEventListener('click', openUrl);
		elTitle.addEventListener('click', openUrl);

		if (!isFixed) {
			el.setAttribute('x-actual-url', url);
			el.setAttribute('x-reader-url', readerUrl);
		}
	};

	// Fix when links added.

	onChanged(sel('#root'), fix);
	fix();

	// Fix when history state changed.

	const pushState = history.pushState.bind(history);
	const replaceState = history.replaceState.bind(history);
	const locationChanged = () => {
		fix();
	}

	history.pushState = (...args) => {
		pushState(...args);
		locationChanged();
	};
	history.replaceState = (...args) => {
		replaceState(...args);
		locationChanged();
	}

	window.addEventListener('popstate', locationChanged);


});


