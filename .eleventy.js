module.exports = function (eleventyConfig) {


	//PASSTHROUGH COPY
	eleventyConfig.addPassthroughCopy("./src/css/");
	eleventyConfig.addPassthroughCopy("./src/scripts/");
	eleventyConfig.addPassthroughCopy("./src/img/");


	//WATCH TARGET
	eleventyConfig.addWatchTarget("./src/css/");


	return {
		dir: {
			input: 'src',
			output: 'public'
		}
	};
};