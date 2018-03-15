// ==UserScript==
// @name        Pocket tag filtering
// @namespace   http://www.agj.cl/
// @description Shows tags toward the top that you can select to filter the list of links.
// @version     0.0.1
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

const styles = `
.tf-tag-list {
  display: block;
  text-align: left;
  padding-bottom: 0.5em;
  font-size: 12pt;
  line-height: 1.6;
}

.tf-tag {
  display: inline-block;
  margin-right: 0.2em;
  margin-bottom: 0.2em;
  background-color: white;
  padding: 0 0.3em;
  white-space: nowrap;
  border-radius: 0.2em;
  cursor: pointer;
}
.tf-tag.tf-selected {
	background-color: red;
	color: white;
}

.item.tf-hidden {
	display: none;
}
`;


onLoad(() => {

	sel('head').appendChild(makeEl('style', null, styles));

	sel('.nav-default .filter-tags').click();
	setTimeout(() => sel('.side-nav').click(), 5);

	const checkTagsLoaded = () => {
		const loaded = !!sel('#pagenav_tagfilter .popover-new-list > li.editdelete');
		if (loaded) init();
		else setTimeout(checkTagsLoaded, 200);
	};
	checkTagsLoaded();

	const init = () => {
		let tagsSelected = [];
		const tagClicked = tag => () => {
			tagsSelected = toggle(tag)(tagsSelected);
			updateView();
		};
		const updateView = () => {
			const items = Array.from(selAll('#queue > .item'));
			items.forEach(el => el.classList.remove('tf-hidden'));
			items.filter(not(hasAllTags(tagsSelected)))
				.forEach(el => el.classList.add('tf-hidden'));
			Array.from(selAll('.tf-tag'))
				.forEach(el => el.classList.remove('tf-selected'));
			tagsSelected.forEach(t => sel(`.tf-tag[data-tag="${ t }"]`).classList.add('tf-selected'));
			document.dispatchEvent(new Event('scroll'));
		};
		const hasAllTags = tags => el => tags.every(elHasTag(el));
		const elHasTag = el => tag => Array.from(el.querySelectorAll('.tag')).some(el => el.textContent === tag);

		const tags =
			Array.from(selAll('#pagenav_tagfilter .popover-new-list > li'))
			.map(el => el.getAttribute('val'))
			.filter(not(isIn(['all', 'edit'])));
		const tagEls =
			tags
			.map(tag => {
				const el = makeEl('div', { 'class': 'tf-tag', 'data-tag': tag }, tag);
				el.addEventListener('click', tagClicked(tag));
				return el;
			});

		const tagListEl =
			makeEl('div', { 'class': 'tf-tag-list' },
				...tagEls);
		sel('#page_queue .queue_secondarynav_main').append(tagListEl);

		const mutationObserver = new MutationObserver(updateView);
		mutationObserver.observe(sel('#queue'), { childList: true });
	};


});
