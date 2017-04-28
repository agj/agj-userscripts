// ==UserScript==
// @name        Wikipedia article name with language
// @namespace   http://www.agj.cl/
// @description Shows the article name in its language in the 'Languages' box.
// @include     http*://*.wikipedia.org/wiki/*
// @version     0.1.0
// @grant       none
// ==/UserScript==

(function () {
	'use strict';

	console.log('Executing Wikipedia article name with language.');


	// Utilities.

	const sel = document.querySelector.bind(document);
	const selAll = document.querySelectorAll.bind(document);
	const eq = a => b => a === b;
	const test = regex => text => regex.test(text);
	const call = (method, ...args) => obj => obj[method](...args);
	const isIn = list => obj => list.some(eq(obj));
	const prepend = a => b => a + b;
	const makeEl = (tag, attrs, ...content) => {
		const el = document.createElement(tag);
		if (attrs) Object.keys(attrs).forEach(attr => el.setAttribute(attr, attrs[attr]));
		content.map(obj => typeof obj === 'string' ? document.createTextNode(obj) : obj)
			.forEach(node => el.appendChild(node));
		return el;
	};
	const alternate = (f, g) => { let state = false; return () => { state = !state; return state ? f() : g() } };
	const pipe = (...fs) => fs.reduce((left, right) => (...args) => right(left(...args)));
	const uniq = list => {
		const seen = [];
		return list.filter(item => seen.some(eq(item)) ? false : (seen.push(item), true));
	};
	const not = f => (...args) => !f(...args);


	//

	const elements = Array.from(selAll('.interlanguage-link'));

	elements.forEach(el => {
		console.log(el);
		const a = el.getElementsByTagName('a')[0];
		const langName = a.textContent;
		const articleName = a.getAttribute('title').replace(/(.+) – .+/, '$1');
		a.textContent = '';
		a.appendChild(makeEl('span', { 'class': 'language-name' },
			langName));
		a.appendChild(document.createTextNode(' '));
		a.appendChild(makeEl('span', { 'class': 'article-title' },
			articleName));
		// a.textContent = langName + ': ' + articleName;
		// console.log(articleName, langName)
	});


	// Styles.

	sel('head').appendChild(makeEl('style', null,
		`
		.interlanguage-link .language-name {
			text-transform: uppercase;
			font-size: 0.7em;
		}
		.interlanguage-link .article-title::before {
			content: '\\A';
			white-space: pre;
		}
		`
	));

})();
