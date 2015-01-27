// ==UserScript==
// @name        Wikipedia search auto-correct
// @namespace   http://www.agj.cl/
// @description When no matches found for a search in Wikipedia, automatically see 'did you mean' results instead.
// @include     http://*.wikipedia.org/w/index.php?search=*
// @version     0.0.1
// @grant       none
// ==/UserScript==

(function () {
	'use strict';

	var sel = document.querySelector.bind(document);

	if (sel('.mw-search-nonefound')) {
		var meantLink = sel('.searchdidyoumean a');
		if (meantLink) location = meantLink.getAttribute('href');
	}

})();
