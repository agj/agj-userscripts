// ==UserScript==
// @name        Pocket direct links
// @namespace   http://www.agj.cl/
// @description Main links are converted to direct links, and clicking on the URL below the title opens the Pocket reader (if available).
// @version     1.0.0
// @grant       none
// @include     http*://getpocket.com/a/queue/list/*
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


onLoad(() => {

	log('okay');

	const fix = () => {
		log(Array.from(selAll('#queue > .item:not(.dl-fixed)')))
			.forEach(fixEl);
	};
	const fixEl = el => {
		const linkTitle = el.querySelector('a.title');
		const linkBelow = el.querySelector('.original_url');
		const url = decodeURIComponent(linkBelow.getAttribute('href').replace(/^.+redirect\?url=([^&]*)&.*$/, '$1'));
		const readerURL = linkTitle.getAttribute('href');
		log(url, readerURL)
		linkTitle.setAttribute('href', url);
		el.querySelector('.item_link').setAttribute('href', url);
		linkBelow.setAttribute('href', /^\/a\/read\//.test(readerURL) ? readerURL : url);
		el.classList.add('dl-fixed');
	};

	const mutationObserver = new MutationObserver(fix);
	mutationObserver.observe(sel('#queue'), { childList: true });
	fix();

});


