// ==UserScript==
// @name        Pocket direct links
// @version     3.0.0
// @namespace   http://www.agj.cl/
// @description Clicking on an item directly opens the website, not the Pocket reader.
// @license     Unlicense
// @include     http*://getpocket.com/*
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
	if (!el) throw `onChanged: No element passed.`;
	if (!cb) throw `onChanged: No callback passed.`;
	const observer = new MutationObserver(cb);
	observer.observe(el, { childList: true, subtree: true });
	return observer.disconnect.bind(observer);
};



onLoad(() => {
	// Actual link fixing.

	const fix = () => {
		Array.from(selAll('article'))
			.forEach(fixEl);
	};
	const fixEl = el => {
		const linkEl = el.querySelector('a');
		const menuButton = el.querySelector('.footer .item-menu button');
		const doIt = (e) => {
			e.stopPropagation();
			e.preventDefault();
			menuButton.click();
			sel('body').click();
			const openLinkEl = el.querySelector('.footer .item-menu > div > ul > li > ul > li > a');
			const rawUrl = openLinkEl.getAttribute('href');
			const url = decodeURIComponent(rawUrl.replace(/^.*redirect\?url=(.*)$/g, '$1'));
			return url;
		};
		linkEl.addEventListener('click', (e) => {
			const url = doIt(e);
			window.location.href = url;
		});
		linkEl.addEventListener('auxclick', (e) => {
			const url = doIt(e);
			window.open(url);
		})
	};

	// Fix when links added.

	onChanged(sel('#__next'), fix);
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


