const emphasisOverrides = require('eleventy-plugin-emphasis');
const pluginTOC = require('eleventy-plugin-toc')

module.exports = function (eleventyConfig) {


	//PASSTHROUGH COPY
	eleventyConfig.addPassthroughCopy("./src/css/");
	eleventyConfig.addPassthroughCopy("./src/scripts/");
	eleventyConfig.addPassthroughCopy("./src/img/");


	//WATCH TARGET
	eleventyConfig.addWatchTarget("./src/css/");

	//MARKDOWN-IT
	let markdownIt = require("markdown-it");
	let markdownItAnchor = require("markdown-it-anchor");
	let markdownItFootnote = require("markdown-it-footnote");
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
	let markdownLib = markdownIt(options).use(markdownItFootnote).use(markdownItAnchor, opts);
	
	eleventyConfig.setLibrary("md", markdownLib);
  
	//EMPHASIS OVERRIDE
	const markdown = markdownLib;
  
	  eleventyConfig.addPlugin(emphasisOverrides, {
		  'md': markdown,
		  '_': 'mark',
		  '__': 'b'
	  });
  
	  eleventyConfig.setLibrary('md', markdown);
  
	  //PLUGIN
	  eleventyConfig.addPlugin(pluginTOC);

	return {
		dir: {
			input: 'src',
			output: 'public'
		}
	};
};