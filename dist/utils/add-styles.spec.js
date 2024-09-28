"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const add_styles_1 = __importDefault(require("./add-styles"));
describe("addStyles", () => {
    it("should add styles to document.head correctly", () => {
        const styles = ".test{color:red;}";
        let styleNode;
        document.head.appendChild = jest.fn((node) => (styleNode = node));
        (0, add_styles_1.default)(styles);
        expect(document.head.appendChild).toHaveBeenCalledTimes(1);
        expect(styleNode.innerHTML).toEqual(styles);
    });
});
//# sourceMappingURL=add-styles.spec.js.map