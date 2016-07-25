// ==UserScript==
// @name        No torrent download direct
// @namespace   http://www.agj.cl/
// @description Hide misleading 'download direct' links in several torrent sites.
// @include     http*://bitsnoop.com/*
// @include     http*://torrentproject.se/*
// @include     http*://torrentproject.org/*
// @include     http*://thepiratebay.se/torrent/*/*
// @version     0.1.0
// @grant       none
// ==/UserScript==

'use strict';

// Config.

var sites = [
		{
			hosts: ['bitsnoop.com'],
			elements: [
				'#dload > :nth-child(1)',
				'#dload > :nth-child(2)',
				'#dload > :nth-child(3)',
				'#dload > :nth-child(4)',
				'#dload > :nth-child(5)',
			],
		},
		{
			hosts: ['torrentproject.se', 'torrentproject.org'],
			elements: [
				'#offer_u',
				'#download .usite:nth-child(1)',
			],
		},
		{
			hosts: ['thepiratebay.se'],
			elements: [
				'[title="Anonymous Download "]',
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
	if (el) el.parentElement.removeChild(el);
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

	var matchesHost = pipe(get('hosts'), any(equals(location.hostname)));

	var found =
		sites
		.filter(matchesHost)
		.map(get('elements'))
		.reduce(concat, [])
		.map(selAll)
		.map(toArray)
		.reduce(concat, []);
	found.map(remove);

	if (found.length > 0) {
		console.log('Misleading link elements found and removed:', found);
	} else {
		console.log('No misleading link elements found.');
	}

});

