/**
 * Check if a string contains a HTML tag or not
 *
 * @param string String to check for HTML tag
 * @return {Boolean} True|False
 *
 */
const doesStringContainHTMLTag = (string) => {
    const regexp = new RegExp(/<[a-z][\s\S]*>/i);
    return regexp.test(string);
};
export default doesStringContainHTMLTag;
//# sourceMappingURL=does-string-contain-html-tag.js.map