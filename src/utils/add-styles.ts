/**
 * Add styles to document head
 *
 * @param styles CSS styles to add
 * @returns {void}
 */
const addStyles = (styles: string) => {
  const styleBlock = document.createElement("style");
  styleBlock.appendChild(document.createTextNode(styles));
  document.head.appendChild(styleBlock);
};

export default addStyles;
