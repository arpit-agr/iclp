const pluginTOC = require('eleventy-plugin-nesting-toc');
const pluginRss = require("@11ty/eleventy-plugin-rss");
const CleanCSS = require("clean-css");
const emojiReadTime = require("@11tyrocks/eleventy-plugin-emoji-readtime");
const pluginShareHighlight = require('eleventy-plugin-share-highlight');
const { DateTime } = require("luxon");
const slugify = require("slugify");
const eleventyNavigationPlugin = require("@11ty/eleventy-navigation");
const embedTwitter = require("eleventy-plugin-embed-twitter");

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
	const linkAfterHeader = markdownItAnchor.permalink.linkAfterHeader({
		class: "deeplink",
		symbol: "<span hidden><svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" aria-hidden=\"true\"><g><g><path fill=\"currentColor\" d=\"M14.474,10.232l-0.706-0.706C12.208,7.966,9.67,7.964,8.11,9.525l-4.597,4.597c-1.56,1.56-1.56,4.097,0,5.657 l0.707,0.706c0.756,0.757,1.76,1.173,2.829,1.173c1.068,0,2.072-0.417,2.827-1.172l2.173-2.171c0.391-0.391,0.391-1.024,0-1.414 c-0.391-0.392-1.023-0.392-1.414,0l-2.173,2.17c-0.755,0.756-2.071,0.757-2.828,0l-0.707-0.706c-0.779-0.781-0.779-2.049,0-2.829 l4.597-4.596c0.756-0.756,2.073-0.756,2.828,0l0.707,0.707c0.391,0.391,1.023,0.391,1.414,0 C14.864,11.256,14.864,10.623,14.474,10.232z\"></path><path fill=\"currentColor\" d=\"M20.486,4.221l-0.707-0.706c-0.756-0.757-1.76-1.173-2.829-1.173c-1.068,0-2.072,0.418-2.827,1.172L12.135,5.5 c-0.391,0.391-0.391,1.024,0,1.414c0.391,0.392,1.023,0.392,1.414,0l1.988-1.984c0.755-0.756,2.071-0.757,2.828,0l0.707,0.706 c0.779,0.78,0.779,2.049,0,2.829l-4.597,4.596c-0.756,0.756-2.073,0.756-2.828,0c-0.391-0.391-1.024-0.391-1.414,0 c-0.391,0.391-0.392,1.023-0.001,1.414c1.56,1.562,4.098,1.562,5.657,0.001l4.597-4.597C22.046,8.319,22.046,5.781,20.486,4.221z\"></path></g></g><rect fill=\"none\" width=\"24\" height=\"24\"></rect></svg></span>",
		style: "aria-labelledby",
	});
	const markdownItAnchorOptions = {
		level: [1, 2, 3],
		slugify: (str) =>
			slugify(str, {
				lower: true,
				strict: true,
				remove: /["]/g,
			}),
		tabIndex: false,
		permalink(slug, opts, state, idx) {
			state.tokens.splice(
				idx,
				0,
				Object.assign(new state.Token("div_open", "div", 1), {
					// Add class "header-wrapper [h1 or h2 or h3]"
					attrs: [["class", `heading-wrapper ${state.tokens[idx].tag}`]],
					block: true,
				})
			);
	
			state.tokens.splice(
				idx + 4,
				0,
				Object.assign(new state.Token("div_close", "div", -1), {
					block: true,
				})
			);
	
			linkAfterHeader(slug, opts, state, idx + 1);
		},
	};
	let markdownLib = markdownIt(options).use(markdownItMark).use(markdownItFootnote).use(markdownItAnchor, markdownItAnchorOptions);
	
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
		return content.substr(0, content.lastIndexOf(" ", 155)) + "...";
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