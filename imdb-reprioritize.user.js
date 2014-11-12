// ==UserScript==
// @name        IMDB Re-prioritize
// @namespace   http://www.agj.cl/
// @description Puts the movie 'Details' block right below the main information block.
// @include     /^http:\/\/(www.)?imdb.com\/title\/.+$/
// @version     0.0.1
// @grant       none
// ==/UserScript==


// Utils.

function onLoad(cb) {
	if (/interactive|complete/.test(document.readyState)) setTimeout(cb, 0);
	else document.addEventListener('DOMContentLoaded', cb);
}
var sel = document.querySelector.bind(document);


// Modify stuff.

onLoad( function () {

	if (window.top !== window.self) return; // Prevent loading on iframes.

	var centerBottom = sel('#maindetails_center_bottom');
	var details = sel('#titleDetails');

	var after = sel('#titleMediaStrip');
	if (!after) after = sel('#titleRecs');

	centerBottom.insertBefore(details, after);

});

