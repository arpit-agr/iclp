const pluginRss = require("@11ty/eleventy-plugin-rss");
const CleanCSS = require("clean-css");
const emojiReadTime = require("@11tyrocks/eleventy-plugin-emoji-readtime");
const pluginShareHighlight = require('eleventy-plugin-share-highlight');
const { DateTime } = require("luxon");
const slugify = require("slugify");
const eleventyNavigationPlugin = require("@11ty/eleventy-navigation");
const embedTwitter = require("eleventy-plugin-embed-twitter");
const pluginTOC = require('eleventy-plugin-toc')

module.exports = function (eleventyConfig) {

	eleventyConfig.setBrowserSyncConfig({
		ui: false,
		ghostMode: false
	});

	//PASSTHROUGH COPY
	eleventyConfig.addPassthroughCopy("./src/css/");
	eleventyConfig.addPassthroughCopy("./src/scripts/");
	eleventyConfig.addPassthroughCopy("./src/img/");
	eleventyConfig.addPassthroughCopy("./src/fonts/");


	//WATCH TARGET
	eleventyConfig.addWatchTarget("./src/css/");

	//MARKDOWN-IT
	let markdownIt = require("markdown-it");
	let markdownItAnchor = require("markdown-it-anchor");
	let markdownItFootnote = require("markdown-it-footnote");
	let markdownItMark = require("markdown-it-mark");

	let options = {
	  html: true,
	  breaks: true,
	  linkify: true
	};
	let opts = {
	  permalink: true,
		permalinkClass: "deeplink",
		permalinkSymbol: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" alt="an icon of a link"><g id="Filled_Icons_1_"><g id="Filled_Icons"><path fill="currentColor" d="M14.474,10.232l-0.706-0.706C12.208,7.966,9.67,7.964,8.11,9.525l-4.597,4.597c-1.56,1.56-1.56,4.097,0,5.657 l0.707,0.706c0.756,0.757,1.76,1.173,2.829,1.173c1.068,0,2.072-0.417,2.827-1.172l2.173-2.171c0.391-0.391,0.391-1.024,0-1.414 c-0.391-0.392-1.023-0.392-1.414,0l-2.173,2.17c-0.755,0.756-2.071,0.757-2.828,0l-0.707-0.706c-0.779-0.781-0.779-2.049,0-2.829 l4.597-4.596c0.756-0.756,2.073-0.756,2.828,0l0.707,0.707c0.391,0.391,1.023,0.391,1.414,0 C14.864,11.256,14.864,10.623,14.474,10.232z"></path><path fill="currentColor" d="M20.486,4.221l-0.707-0.706c-0.756-0.757-1.76-1.173-2.829-1.173c-1.068,0-2.072,0.418-2.827,1.172L12.135,5.5 c-0.391,0.391-0.391,1.024,0,1.414c0.391,0.392,1.023,0.392,1.414,0l1.988-1.984c0.755-0.756,2.071-0.757,2.828,0l0.707,0.706 c0.779,0.78,0.779,2.049,0,2.829l-4.597,4.596c-0.756,0.756-2.073,0.756-2.828,0c-0.391-0.391-1.024-0.391-1.414,0 c-0.391,0.391-0.392,1.023-0.001,1.414c1.56,1.562,4.098,1.562,5.657,0.001l4.597-4.597C22.046,8.319,22.046,5.781,20.486,4.221z"></path></g></g><rect fill="none" width="24" height="24" id="Frames-24px"></rect></svg>',
		renderPermalink: (slug, opts, state, idx) => {
			// based on fifth version in
			// https://amberwilson.co.uk/blog/are-your-anchor-links-accessible/
			const linkContent = state.tokens[idx + 1].children[0].content;
		
			// Create the openning <div> for the wrapper
			const headingWrapperTokenOpen = Object.assign(
				new state.Token('div_open', 'div', 1),
				{
					attrs: [['class', 'heading-wrapper']],
				}
			);
			// Create the closing </div> for the wrapper
			const headingWrapperTokenClose = Object.assign(
				new state.Token('div_close', 'div', -1),
				{
					attrs: [['class', 'heading-wrapper']],
				}
			);
		
			// Create the tokens for the full accessible anchor link
			// <a class="deeplink" href="#your-own-platform-is-the-nearest-you-can-get-help-to-setup">
			//   <span aria-hidden="true">
			//     ${opts.permalinkSymbol}
			//   </span>
			//   <span class="visually-hidden">
			//     Section titled Your "own" platform is the nearest you can(get help to) setup
			//   </span>
			// </a >
			const anchorTokens = [
				Object.assign(new state.Token('link_open', 'a', 1), {
					attrs: [
						...(opts.permalinkClass ? [['class', opts.permalinkClass]] : []),
						['href', opts.permalinkHref(slug, state)],
						...Object.entries(opts.permalinkAttrs(slug, state)),
					],
				}),
				Object.assign(new state.Token('span_open', 'span', 1), {
					attrs: [['aria-hidden', 'true']],
				}),
				Object.assign(new state.Token('html_block', '', 0), {
					content: opts.permalinkSymbol,
				}),
				Object.assign(new state.Token('span_close', 'span', -1), {}),
				Object.assign(new state.Token('span_open', 'span', 1), {
					attrs: [['class', 'visually-hidden']],
				}),
				Object.assign(new state.Token('html_block', '', 0), {
					content: `Section titled ${linkContent}`,
				}),
				Object.assign(new state.Token('span_close', 'span', -1), {}),
				new state.Token('link_close', 'a', -1),
			];
		
			// idx is the index of the heading's first token
			// insert the wrapper opening before the heading
			state.tokens.splice(idx, 0, headingWrapperTokenOpen);
			// insert the anchor link tokens after the wrapper opening and the 3 tokens of the heading
			state.tokens.splice(idx + 3 + 1, 0, ...anchorTokens);
			// insert the wrapper closing after all these
			state.tokens.splice(
				idx + 3 + 1 + anchorTokens.length,
				0,
				headingWrapperTokenClose
			);
		},
		slugify: function(s) {
			  return encodeURIComponent(String(s).replace(/New\ in\ v\d+\.\d+\.\d+/, '').trim().toLowerCase().replace(/\s+/g, '-'));
		  },
		  
		  tabIndex: false,
		  level: [2,3,4] 
	  };
	let markdownLib = markdownIt(options).use(markdownItMark).use(markdownItFootnote).use(markdownItAnchor, opts);
	
	eleventyConfig.setLibrary("md", markdownLib);

	//PLUGIN
	eleventyConfig.addPlugin(pluginRss);

	eleventyConfig.addPlugin(emojiReadTime, { showEmoji: false });

	eleventyConfig.addPlugin(pluginTOC);

	eleventyConfig.addPlugin(embedTwitter, {
		doNotTrack: true,
		cacheText: true,
		cacheDuration: "1d"
	});

	eleventyConfig.addPlugin(eleventyNavigationPlugin);

	eleventyConfig.addPlugin(pluginShareHighlight, {
        // optional: define the tooltip label.
        // will be "Share this" if omitted.
        label: "Share"
    });

	//SHORTCODES
	eleventyConfig.addShortcode("year", () => `${new Date().getFullYear()}`);
	
	//FILTER
	eleventyConfig.addFilter("cssmin", function(code) {
    return new CleanCSS({}).minify(code).styles;
  });

	eleventyConfig.addFilter("randomLimit", (arr, limit, currPage) => {
		// Filters out current page
		const pageArr = arr.filter((page) => page.url !== currPage);
	
		// Randomizes remaining items
		pageArr.sort(() => {
			return 0.5 - Math.random();
		});
	
		// Returns array items up to limit
		return pageArr.slice(0, limit);
	});

	eleventyConfig.addFilter("limit", function (arr, limit) {
	return arr.slice(0, limit);
	});

	eleventyConfig.addFilter("slug", (str) => {
		if (!str) {
		  return;
		}
	  
		return slugify(str, {
		  lower: true,
		  strict: true,
		  remove: /["]/g,
		});
	});

	eleventyConfig.addFilter("postDate", (dateObj) => {
		return DateTime.fromJSDate(dateObj).toLocaleString(DateTime.DATE_MED);
	});

	eleventyConfig.addFilter("excerpt", (post) => {
		const content = post.replace(/(<([^>]+)>)/gi, "");
		return content.substr(0, content.lastIndexOf(" ", 200)) + "...";
	  });

	eleventyConfig.addFilter("addNbsp", (str) => {
	if (!str) {
		return;
	}
	let title = str.replace(/((.*)\s(.*))$/g, "$2&nbsp;$3");
	title = title.replace(/"(.*)"/g, '\\"$1\\"');
	return title;
	});

	
	eleventyConfig.addFilter("head", (array, n) => {
		if(!Array.isArray(array) || array.length === 0) {
		  return [];
		}
		if( n < 0 ) {
		  return array.slice(n);
		}
	
		return array.slice(0, n);
	  });

	eleventyConfig.addFilter("min", (...numbers) => {
		return Math.min.apply(null, numbers);
	  });

	function filterTagList(tags) {
		return (tags || []).filter(tag => ["all", "nav", "pages", "post", "posts"].indexOf(tag) === -1);
	  }
	
	  eleventyConfig.addFilter("filterTagList", filterTagList)

	//COLLECTION
	eleventyConfig.addCollection("tagList", function(collection) {
		let tagSet = new Set();
		collection.getAll().forEach(item => {
		  (item.data.tags || []).forEach(tag => tagSet.add(tag));
		});
	
		return filterTagList([...tagSet]);
	  });

	eleventyConfig.addCollection("posts", function(collectionApi) {
		return collectionApi.getFilteredByGlob("./src/posts/*.md");
	  });

	return {
		dir: {
			input: 'src',
			output: 'public'
		}
	};
};