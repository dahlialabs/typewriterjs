"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const get_dom_element_from_string_1 = __importDefault(require("./get-dom-element-from-string"));
describe("getDOMElementFromString", () => {
    it("should return correct dom elements from string", () => {
        const nodes = (0, get_dom_element_from_string_1.default)("<strong>test</strong> Hello <i>world</i>");
        expect(nodes).toHaveLength(3);
        expect(nodes[0].nodeName).toBe("STRONG");
        expect(nodes[0].textContent).toEqual("test");
        expect(nodes[1].nodeName).toEqual("#text");
        expect(nodes[1].textContent).toEqual(" Hello ");
        expect(nodes[2].nodeName).toEqual("I");
        expect(nodes[2].textContent).toEqual("world");
    });
});
//# sourceMappingURL=get-dom-element-from-string.spec.js.map