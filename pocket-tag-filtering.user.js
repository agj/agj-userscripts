// ==UserScript==
// @name        Pocket tag filtering
// @version     2.0.0
// @namespace   http://www.agj.cl/
// @description Shows tags toward the top that you can select to filter the list of links. Click tag to show only links that contain that tag; shift-click tag to hide links that contain it.
// @license     Unlicense
// @include     http*://app.getpocket.com/*
// @grant       unsafeWindow
// ==/UserScript==

const onLoad = cb => /interactive|complete/.test(document.readyState) ? setTimeout(cb, 0) : document.addEventListener('DOMContentLoaded', cb);
const sel = unsafeWindow.document.querySelector.bind(document);
const selAll = unsafeWindow.document.querySelectorAll.bind(document);
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
const without = a => list => list.filter(b => b !== a);
const tap = f => (...args) => { f(...args); return args[0] };
const log = tap(console.log);
const onChanged = (el, cb) => {
	const observer = new MutationObserver(cb);
	observer.observe(el, { childList: true });
	return observer.disconnect.bind(observer);
};
const onChangedDeep = (el, cb) => {
	const observer = new MutationObserver(cb);
	observer.observe(el, { childList: true, subtree: true });
	return observer.disconnect.bind(observer);
};
const onChangedUntil = (el, predicate, success) => {
    const stop = onChanged(el, () => {
        if (predicate(el)) {
            stop();
            success(el);
        }
    });
    return stop;
};
const waitFor = (predicate, success) => {
    const check = () => {
        if (predicate()) {
            clearInterval(intervalId);
            success();
        }
    }
    const intervalId = setInterval(check, 100);
    setTimeout(check, 0);
}
const waitForEl = (selector, success) => {
    waitFor(
        () => sel(selector),
        () => { success(sel(selector)) }
    );
};

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
		-moz-user-select: none;
		-ms-user-select: none;
		-webkit-user-select: none;
		user-select: none;
	}
	.tf-tag.tf-selected {
		background-color: red;
		color: white;
	}
	.tf-tag.tf-hidden {
		color: silver;
	}

	.item.tf-hidden {
		display: none;
    }
    
    article[x-visible=false] {
        display: none;
    }
`;

const getAllTags = () => sel('#root')._reactRootContainer._internalRoot.current.memoizedState.element.props.store.getState().tags;
const elToReact = (el) => {
    const key = Object.keys(el).find((key) => /^__reactInternalInstance/g.test(key));
    return el[key];
};
const getElTags = (el) => {
    const tags = elToReact(el).memoizedProps.children.props.tags;
    return tags ? tags : {};
};


onLoad(() => {
    console.log('Loaded');

    // Inject styles.

	sel('head').appendChild(makeEl('style', null, styles));

    // Initialization.

    const init = () => {
        log('Initted')
        const tags = getAllTags();

        console.log('Tags', tags);

		const updateView = () => {
            log('Updating view');
            const items = Array.from(selAll('article'));
            log(items);

            const setItemVisibility = (el, visible) => {
                el.setAttribute('x-visible', visible.toString());
            };
            const updateItem = (el) => {
                console.log('Updating item', el)
                const tags = getElTags(el);
                setItemVisibility(el, !Object.keys(tags).includes('h'));
            };

            items.forEach(updateItem);

			document.dispatchEvent(new Event('scroll'));
		};

        onChangedDeep(sel('#root'), updateView);
        updateView();
    }

    // Get the tags and initialize.

    const checkTagsLoaded = () => {
        log('Checking tags loaded…');
        const itemsEl = sel('div[role=main]');
        const tags = getAllTags();
		return itemsEl && Object.keys(tags).length > 1;
    };
    waitFor(checkTagsLoaded, init);



	// const init = () => {
	// 	initted();
	// 	let tagsSelected = [];
	// 	const storageTagsHidden = localStorage.getItem('tagsHidden');
	// 	let tagsHidden = storageTagsHidden ? storageTagsHidden.split('\t') : [];
	// 	const tagClicked = (tag, positive) => {
	// 		if (positive) {
	// 			tagsHidden = without(tag)(tagsHidden);
	// 			tagsSelected = toggle(tag)(tagsSelected);
	// 		} else {
	// 			tagsSelected = without(tag)(tagsSelected);
	// 			tagsHidden = toggle(tag)(tagsHidden);
	// 		}
	// 		localStorage.setItem('tagsHidden', tagsHidden.join('\t'));
	// 		updateView();
	// 	};
	// 	const updateView = () => {
	// 		const items = Array.from(selAll('#queue > .item'));
	// 		items.forEach(el => el.classList.remove('tf-hidden'));
	// 		items.filter(el => !hasAllTags(tagsSelected)(el) || hasAnyTags(tagsHidden)(el))
	// 			.forEach(el => el.classList.add('tf-hidden'));
	// 		Array.from(selAll('.tf-tag'))
	// 			.forEach(el => { el.classList.remove('tf-selected'); el.classList.remove('tf-hidden') });
	// 		tagsSelected.forEach(t => sel(`.tf-tag[data-tag="${ t }"]`).classList.add('tf-selected'));
	// 		tagsHidden.forEach(t => sel(`.tf-tag[data-tag="${ t }"]`).classList.add('tf-hidden'));
	// 		document.dispatchEvent(new Event('scroll'));
	// 	};
	// 	const elTags = el => Array.from(el.querySelectorAll('.tag')).map(el => el.textContent);
	// 	const elHasTag = el => tag => elTags(el).some(t => t === tag);
	// 	const hasAllTags = tags => el => without('untagged')(tags).every(elHasTag(el)) && (!has('untagged')(tags) || elTags(el).length === 0);
	// 	const hasAnyTags = tags => el => without('untagged')(tags).some(elHasTag(el))  || ( has('untagged')(tags) && elTags(el).length === 0);

	// 	const tags =
	// 		Array.from(selAll('#pagenav_tagfilter .popover-new-list > li'))
	// 		.map(el => decodeURIComponent(el.getAttribute('val')))
	// 		.filter(not(isIn(['all', 'edit'])));
	// 	const tagEls =
	// 		tags
	// 		.map(tag => {
	// 			const el = makeEl('div', { 'class': 'tf-tag', 'data-tag': tag }, tag);
	// 			el.addEventListener('click', e => tagClicked(tag, !e.shiftKey));
	// 			return el;
	// 		});

	// 	const tagListEl =
	// 		makeEl('div', { 'class': 'tf-tag-list', 'title': 'Shift+click to hide' },
	// 			...tagEls);
	// 	sel('#page_queue .queue_secondarynav_main').append(tagListEl);
	// 	updateView();

	// 	onChanged(sel('#queue'), updateView);
	// };


});
