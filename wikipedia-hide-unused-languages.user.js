// ==UserScript==
// @name        Wikipedia hide unused languages
// @namespace   http://www.agj.cl/
// @include     http*://*.wikipedia.org/wiki/*
// @version     0.1.0
// @grant       none
// ==/UserScript==

(function () {
	'use strict';

	console.log('Executing Wikipedia hide unused languages.');


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

	const hulsl = 'hideUnusedLanguagesSelectedLanguages';
	if (!localStorage[hulsl]) localStorage[hulsl] = JSON.stringify([]);

	const languages = () => JSON.parse(localStorage[hulsl]);
	const setLanguages = (l) => localStorage[hulsl] = JSON.stringify(uniq(l));

	const languageClasses = () => languages().map(prepend('interwiki-'));
	const elements = Array.from(selAll('.interlanguage-link'));
	const contenedorLenguajes = sel('#p-lang');
	const toggleButton = makeEl('a', {}, 'show/hide more languages');
	const toggleButtonContainer = makeEl('div', { 'class': 'unused-languages-toggle-button-container' }, toggleButton);

	const show = () => contenedorLenguajes.classList.add('unused-languages-showing');
	const hide = () => contenedorLenguajes.classList.remove('unused-languages-showing');
	const addLanguage    = lang => () => { const l = languages(); l.push(lang); setLanguages(l) };
	const removeLanguage = lang => () => { setLanguages(languages().filter(not(eq(lang)))) };
	const setSelectedClass = () => elements.forEach(el => el.classList[Array.from(el.classList).some(isIn(languageClasses())) ? 'add' : 'remove']('selected'));

	setSelectedClass();

	elements.forEach(el => {
		const lang = Array.from(el.classList).find(test(/interwiki-.*/)).match(/interwiki-(.*)/)[1];
		const add = makeEl('a', { 'class': 'add' }, '+');
		const remove = makeEl('a', { 'class': 'remove' }, '–');
		add.addEventListener('click', pipe(addLanguage(lang), setSelectedClass));
		remove.addEventListener('click', pipe(removeLanguage(lang), setSelectedClass));
		el.appendChild(makeEl('span', { 'class': 'unused-languages-add-remove' }, ' ', add, remove));
	});

	toggleButton.addEventListener('click', alternate(show, hide));

	contenedorLenguajes.insertBefore(toggleButtonContainer, sel('#p-lang .body'));


	// Styles.

	sel('head').appendChild(makeEl('style', null,
		`
		#p-lang .unused-languages-toggle-button-container {
			font-size: 0.5em;
			text-align: right;
		}

		#p-lang:not(.unused-languages-showing) .interlanguage-link:not(.selected) {
			display: none;
		}

		#p-lang .unused-languages-toggle-button-container a,
		#p-lang .interlanguage-link .unused-languages-add-remove .add,
		#p-lang .interlanguage-link .unused-languages-add-remove .remove {
			cursor: pointer;
		}

		#p-lang .interlanguage-link.selected       .unused-languages-add-remove .add {
			display: none;
		}
		#p-lang .interlanguage-link:not(.selected) .unused-languages-add-remove .remove {
			display: none;
		}
		`
	));

})();
