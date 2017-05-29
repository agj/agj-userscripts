// ==UserScript==
// @name        CDJournal to MusicBrainz
// @namespace   http://www.agj.cl/
// @description Adds link to CDJournal entry page that prefills the MusicBrainz "add release" form.
// @include     http*://artist.cdjournal.com/d/*
// @version     0.1.0
// @grant       none
// ==/UserScript==


(() => {
'use strict';

// Utilities.

const sel = document.querySelector.bind(document);
const selAll = document.querySelectorAll.bind(document);
const get = prop => obj => obj[prop];
const esc = encodeURIComponent;
const dom = (tag, attrs, ...children) => {
	const el = document.createElement(tag);
	if (attrs) Object.keys(attrs).forEach(attr => el.setAttribute(attr, attrs[attr]));
	children.map(obj => typeof obj === 'string' ? document.createTextNode(obj) : obj)
		.forEach(node => el.appendChild(node));
	return el;
};
const counter = () => { let i = 0; return () => i++ };
const flatten = list => list.reduce((r, item) => Array.isArray(item) ? r.concat(flatten(item)) : r.concat([item]), []);


// Get values.

const artist = sel('#discdata_right_body .discdata li:nth-of-type(1) div').textContent;
const title  = sel('#discdata_right_body .discdata li:nth-of-type(2) div').textContent;
const type   = sel('#discdata_right_body .discdata li:nth-of-type(3) div').textContent.split(' /')[0];
const label  = sel('#discdata_right_body .discdata li:nth-of-type(4) div').textContent;
const cat    = sel('#discdata_right_body .discdata li:nth-of-type(5) div').textContent;
const date   = sel('#discdata_right_body .discdata li:nth-of-type(7) div').textContent.split('/');
const tracks = Array.from(selAll('.songlist .song .song_title'))
               .map(get('textContent'));


// Add submit link.

const checkType = raw =>   raw === 'アルバム' ? 'album'
                         : raw === 'ミニアルバム' ? 'ep'
                         : raw === 'シングル' ? 'single'
                         : '';

const link = dom('a', null, 'MusicBrainz に投稿');
const input = (name, value) => dom('input', { name: name, value: value, type: 'text' });
const form = dom('form', { name: 'musicbrainz-submit', action: 'https://musicbrainz.org/release/add', method: 'post', 'accept-charset': 'utf-8', style: 'display: none' },
             	input('name', title),
             	input('artist_credit.names.0.name', artist),
             	input('type', checkType(type)),
             	input('labels.0.name', label),
             	input('labels.0.catalog_number', cat),
             	input('events.0.date.year', date[0]),
             	input('events.0.date.month', date[1]),
             	input('events.0.date.day', date[2]),
             	input('events.0.country', 'JP'),
             	input('language', 'jpn'),
             	input('script', 'Jpan'),
             	input('status', 'official'),
             	input('mediums.0.format', 'cd'),
             	input('edit_note', 'From CDJournal: ' + window.location.href)
             );
const container = dom('div', { id: 'musicbrainz-submit' }, link, form);

const trackCount = counter();
flatten(tracks
        .map(title => {
        	const i = trackCount();
        	return [input(`mediums.0.track.${ i }.name`, title),
        	        input(`mediums.0.track.${ i }.number`, i + 1)];
        }))
.map(el => form.appendChild(el));

sel('#artist_sub').appendChild(container);
link.addEventListener('click', e => {
	form.submit();
	e.preventDefault();
});

sel('head').appendChild(dom('style', null, `
	#musicbrainz-submit a {
		cursor: pointer;
		font-size: 1.2em;
		font-weight: bold;
	}
`));

})()