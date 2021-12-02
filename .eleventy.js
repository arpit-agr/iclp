const { DateTime } = require("luxon");
const slugify = require("slugify");
const eleventyNavigationPlugin = require("@11ty/eleventy-navigation");
const embedTwitter = require("eleventy-plugin-embed-twitter");
const pluginTOC = require('eleventy-plugin-toc')

module.exports = function (eleventyConfig) {

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
		  slugify: function(s) {
			  return encodeURIComponent(String(s).replace(/New\ in\ v\d+\.\d+\.\d+/, '').trim().toLowerCase().replace(/\s+/g, '-'));
		  },
		  permalinkClass: "direct-link",
		  permalinkSymbol: "#",
		  level: [2,3,4] 
	  };
	let markdownLib = markdownIt(options).use(markdownItMark).use(markdownItFootnote).use(markdownItAnchor, opts);
	
	eleventyConfig.setLibrary("md", markdownLib);

	//PLUGIN
	eleventyConfig.addPlugin(pluginTOC);

	eleventyConfig.addPlugin(embedTwitter, {
		cacheDuration: "60m"
	});

	eleventyConfig.addPlugin(eleventyNavigationPlugin);
	
	//FILTER
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

	//SHORTCODES
	eleventyConfig.addShortcode("year", () => `${new Date().getFullYear()}`);

	//COLLECTION
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