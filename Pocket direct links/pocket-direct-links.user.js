// ==UserScript==
// @name        Pocket direct links
// @version     4.0.0
// @namespace   http://www.agj.cl/
// @description Clicking on an item directly opens the website, not the Pocket reader.
// @license     Unlicense
// @include     http*://getpocket.com/*
// @grant       none
// ==/UserScript==

const onLoad = cb => /interactive|complete/.test(document.readyState) ? setTimeout(cb, 0) : document.addEventListener('DOMContentLoaded', cb);
const sel = document.querySelector.bind(document);
const selAll = document.querySelectorAll.bind(document);
const tap = f => (...args) => { f(...args); return args[0] };
const log = tap(console.log);
const onChanged = (el, cb) => {
	if (!el) throw `onChanged: No element passed.`;
	if (!cb) throw `onChanged: No callback passed.`;
	const observer = new MutationObserver(cb);
	observer.observe(el, { childList: true, subtree: true });
	return observer.disconnect.bind(observer);
};

const attrFixedFlag = 'data-link-fixed-agj';
const getReactKey = (el) =>
	Object.keys(el).find((key) => /^__reactProps/.test(key));
const getUrl = (el) => // Huge hack to get the URL from deep within the React component!
	el[getReactKey(el)]
	.children[3]
	.props
	.children[1]
	.props
	.children
	.props
	.children[1]
	.props
	.openUrl;


onLoad(() => {
	// Actual link fixing.

	const fix = () => {
		Array.from(unsafeWindow.document.querySelectorAll('article'))
			.forEach(fixEl);
	};
	const fixEl = (el) => {
		const url = getUrl(el);

		const id = el.getAttribute('data-cy');
		const linkEl = el.querySelector('a');
		const safeEl = sel(`[data-cy="${ id }"]`);
		const safeLinkEl = safeEl.querySelector('a');

		if (linkEl.getAttribute(attrFixedFlag)) {
			return;
		}

		linkEl.setAttribute('href', url);

		safeLinkEl.addEventListener('click', (e) => {
			if (!e.getModifierState('Shift') && !e.getModifierState('Alt') && !e.getModifierState('Meta') && !e.getModifierState('Control')) {
				e.stopPropagation();
				e.preventDefault();
				window.location.href = url;
			}
		});

		linkEl.setAttribute(attrFixedFlag, true);
	};

	// Fix when links added.

	onChanged(sel('#__next'), fix);
	fix();

	// Fix when history state changed.

	const pushState = history.pushState.bind(history);
	const replaceState = history.replaceState.bind(history);
	const locationChanged = () => {
		fix();
	};

	history.pushState = (...args) => {
		pushState(...args);
		locationChanged();
	};
	history.replaceState = (...args) => {
		replaceState(...args);
		locationChanged();
	};

	window.addEventListener('popstate', locationChanged);
});


