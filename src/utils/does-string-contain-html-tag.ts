/**
 * Check if a string contains a HTML tag or not
 *
 * @param string String to check for HTML tag
 * @return {Boolean} True|False
 *
 */
const doesStringContainHTMLTag = (string: string): boolean => {
  const regexp = new RegExp(/<[a-z][\s\S]*>/i);
  return regexp.test(string);
};

export default doesStringContainHTMLTag;
