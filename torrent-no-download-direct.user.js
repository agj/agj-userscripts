// ==UserScript==
// @name        No torrent download direct
// @namespace   http://www.agj.cl/
// @description Hide misleading 'download direct' links in several torrent sites.
// @include     http*://thepiratebay.se/torrent/*/*
// @include     http*://torrentz2.eu/*
// @include     http*://monova.org/*
// @version     0.3.0
// @grant       none
// ==/UserScript==

'use strict';

// Config.

var sites = [
		// {
		// 	hosts: ['torrentproject.se', 'torrentproject.org'],
		// 	elements: [
		// 		'#offer_u',
		// 		'#download .usite:nth-child(1)',
		// 	],
		// },
		{
			hosts: ['thepiratebay.se'],
			elements: [
				'[title="Anonymous Download "]',
			],
		},
		{
			hosts: ['torrentz2.eu'],
			elements: [
				'.downlinks > dl:nth-of-type(1)',
			],
		},
		{
			hosts: ['monova.org'],
			elements: [
				'.page-buttons > a:not(#report_button):not(#favorite_button):not(#download-file)',
				'.page-buttons > span',
			],
		},
	];


// Utils.

function onLoad(cb) {
	if (/interactive|complete/.test(document.readyState)) setTimeout(cb, 0);
	else document.addEventListener('DOMContentLoaded', cb);
}

var sel = document.querySelector.bind(document);
var selAll = document.querySelectorAll.bind(document);

function remove(el) {
	// if (el) el.parentElement.removeChild(el);
	if (el) el.classList.add('spam');
	return !!el;
}

function toArray(obj) {
	return Array.prototype.slice.call(obj);
}

function get(prop) {
	return function (obj) {
		return obj[prop];
	};
}
function id(a) { return a; }
function concat(concatted, arr) {
	return concatted.concat(arr);
}
function pipe(fnA, fnB) {
	return function () {
		return fnB(fnA.apply(null, arguments));
	};
}
function equals(a) {
	return function (b) { return a === b; };
}
function any(predicate) {
	return function (list) {
		return list.filter(predicate).length > 0;
	};
}


// Run.

onLoad( function () {

	console.log("Running.")

	var matchesHost = pipe(get('hosts'), any(equals(location.hostname)));

	var css =
		sites
		.filter(matchesHost)
		.map(get('elements'))
		.reduce(concat, [])
		.map(sel => `${ sel } { display: none }`)
		.join('\n');

	sel('body').insertAdjacentHTML('beforeend', `
		<style>
			${ css }
		</style>
	`);

	console.log("Misleading links hidden.");

});

