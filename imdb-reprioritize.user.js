// ==UserScript==
// @name        IMDB Re-prioritize
// @namespace   http://www.agj.cl/
// @description Raises the 'Details' and 'Storyline' blocks to right below the main information block on any IMDB movie page.
// @include     /^https?:\/\/(www.)?imdb.com\/title\/.+$/
// @version     1.0.0
// @grant       none
// ==/UserScript==


// Utils.

const onLoad = cb => /interactive|complete/.test(document.readyState) ? setTimeout(cb, 0) : document.addEventListener('DOMContentLoaded', cb);
const sel = document.querySelector.bind(document);


// Modify stuff.

onLoad(() => {

	if (window.top !== window.self) return; // Prevent loading on iframes.

	const details = sel('#titleDetails');
	const storyline = sel('#titleStoryLine');
	const mainBottom = sel('#main_bottom')

	mainBottom.prepend(storyline);
	mainBottom.prepend(details);

});

