"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const does_string_contain_html_tag_1 = __importDefault(require("./does-string-contain-html-tag"));
describe("doesStringContainHTMLTag", () => {
    it("should return true if string contains html", () => {
        expect((0, does_string_contain_html_tag_1.default)("Hello <strong>world</strong>!")).toEqual(true);
    });
    it("should return false if string does not contain html", () => {
        expect((0, does_string_contain_html_tag_1.default)("Hello world!")).toEqual(false);
    });
});
//# sourceMappingURL=does-string-contain-html-tag.spec.js.map