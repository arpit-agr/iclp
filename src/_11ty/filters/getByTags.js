/**
 * Filter collection by categories
 *
 * @param {Array} collection - collection (assuming front-matter have a 'tags' key)
 * @param {Array} tags - array of tags (if string supplied, turn into array)
 * @returns {Array} collection items from specified tags
 */

 module.exports = function (collection, tags) {
  let results = new Set();

  if (typeof tags === "string") {
    tags = Array.of(tags);
  }

  tags.forEach((cat) => {
    let matches = collection.filter((item) =>
      item.data["tags"].includes(cat)
    );
    matches.forEach((item) => results.add(item));
  });

  results = Array.from(results).sort((a, b) => a.date - b.date);

  return results;
};