const htmlmin = require("html-minifier");
const socialImages = require("@11tyrocks/eleventy-plugin-social-images");
const pluginTOC = require('eleventy-plugin-nesting-toc');
const pluginRss = require("@11ty/eleventy-plugin-rss");
const CleanCSS = require("clean-css");
const emojiReadTime = require("@11tyrocks/eleventy-plugin-emoji-readtime");
const { DateTime } = require("luxon");
const slugify = require("slugify");
const eleventyNavigationPlugin = require("@11ty/eleventy-navigation");
const embedTwitter = require("eleventy-plugin-embed-twitter");
const directoryOutputPlugin = require("@11ty/eleventy-plugin-directory-output");

module.exports = function (eleventyConfig) {

	eleventyConfig.setQuietMode(true);
  eleventyConfig.addPlugin(directoryOutputPlugin);

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
		symbol: "<span hidden><svg xmlns=\"http://www.w3.org/2000/svg\" width=\"1em\" height=\"1em\" fill=\"currentColor\" class=\"bi bi-link-45deg\" viewBox=\"0 0 16 16\"><path d=\"M4.715 6.542 3.343 7.914a3 3 0 1 0 4.243 4.243l1.828-1.829A3 3 0 0 0 8.586 5.5L8 6.086a1.002 1.002 0 0 0-.154.199 2 2 0 0 1 .861 3.337L6.88 11.45a2 2 0 1 1-2.83-2.83l.793-.792a4.018 4.018 0 0 1-.128-1.287z\"/><path d=\"M6.586 4.672A3 3 0 0 0 7.414 9.5l.775-.776a2 2 0 0 1-.896-3.346L9.12 3.55a2 2 0 1 1 2.83 2.83l-.793.792c.112.42.155.855.128 1.287l1.372-1.372a3 3 0 1 0-4.243-4.243L6.586 4.672z\"/></svg></span>",
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
	eleventyConfig.addPlugin(socialImages);
	eleventyConfig.addPlugin(pluginRss);
	eleventyConfig.addPlugin(emojiReadTime, {
		showEmoji: false,
		label: "min. read",
		wpm: 220,
	});
	eleventyConfig.addPlugin(pluginTOC);
	eleventyConfig.addPlugin(embedTwitter, {
		doNotTrack: true,
		cacheText: true,
		cacheDuration: "1d"
	});
	eleventyConfig.addPlugin(eleventyNavigationPlugin);

	//SHORTCODES
	eleventyConfig.addShortcode("year", () => `${new Date().getFullYear()}`);
	eleventyConfig.addPairedShortcode('footnote', (content, { id }) => {
    return `<a href="#${id}" id="${id}ref" class="c-footnote-phrase">${content}</a>`;
  });


  eleventyConfig.addPairedShortcode('footnoteText', (content, { id }) => {
    return `
<aside class="c-footnote" id="${id}" aria-labelledby="${id}ref">
  <details>
    <summary class="text--s-1 font-weight:700">Note</summary>
    ${content}
  </details>
</aside>
`;
  });
	
	//FILTER
	eleventyConfig.addFilter("getByTags", require("./src/_11ty/filters/getByTags.js"));
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

	//TRANSFORM
	eleventyConfig.addTransform("htmlmin", function(content, outputPath) {
    if( outputPath && outputPath.endsWith(".html") ) {
      let minified = htmlmin.minify(content, {
        useShortDoctype: true,
        removeComments: true,
        collapseWhitespace: true
      });
      return minified;
    }

    return content;
  });

	//TURN OFF DATA DEEP MERGE
	eleventyConfig.setDataDeepMerge(false);


	return {
		markdownTemplateEngine: "njk",
		htmlTemplateEngine: "njk",
		dir: {
			input: 'src',
			output: 'public'
		}
	};
};