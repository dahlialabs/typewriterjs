/**
 * Add styles to document head
 *
 * @param styles CSS styles to add
 * @returns {void}
 */
const addStyles = (styles) => {
    const styleBlock = document.createElement("style");
    styleBlock.appendChild(document.createTextNode(styles));
    document.head.appendChild(styleBlock);
};
export default addStyles;
//# sourceMappingURL=add-styles.js.map