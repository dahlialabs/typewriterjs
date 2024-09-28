"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const react_2 = require("@testing-library/react");
const Typewriter_1 = __importDefault(require("./Typewriter"));
const index_1 = __importDefault(require("../core/index"));
jest.mock("./../../core", () => {
    return jest.fn().mockImplementation(() => ({
        stop: jest.fn(),
    }));
});
describe("Typewriter component", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });
    it("should render correctly and create an instance of typewriter core", () => {
        const options = { strings: ["test-1", "test-2"] };
        const { getByTestId } = (0, react_2.render)(react_1.default.createElement(Typewriter_1.default, { options: options }));
        const element = getByTestId("typewriter-wrapper");
        expect(index_1.default).toHaveBeenCalledTimes(1);
        expect(index_1.default).toHaveBeenCalledWith(element, options);
    });
    it("should call onInit prop correctly", () => {
        const options = { strings: ["test-1", "test-2"] };
        const onInit = jest.fn();
        (0, react_2.render)(react_1.default.createElement(Typewriter_1.default, { options: options, onInit: onInit }));
        expect(onInit).toHaveBeenCalledTimes(1);
    });
    it("should call stop function correctly on unmount", () => {
        const options = { strings: ["test-1", "test-2"] };
        let instance = null;
        const { unmount } = (0, react_2.render)(react_1.default.createElement(Typewriter_1.default, { options: options, onInit: (i) => (instance = i) }));
        unmount();
        expect(instance.stop).toHaveBeenCalledTimes(1);
    });
    it("should create new typewriter instance once options prop changes", () => {
        const optionsA = { strings: ["test-1", "test-2"] };
        const optionsB = { strings: ["test-3", "test-4"] };
        const { rerender, getByTestId } = (0, react_2.render)(react_1.default.createElement(Typewriter_1.default, { options: optionsA }));
        rerender(react_1.default.createElement(Typewriter_1.default, { options: optionsB }));
        const element = getByTestId("typewriter-wrapper");
        expect(index_1.default).toHaveBeenCalledTimes(2);
        expect(index_1.default).toHaveBeenCalledWith(element, optionsA);
        expect(index_1.default).toHaveBeenCalledWith(element, optionsB);
    });
    it("should not create new typewriter instance once options prop changes and has the same content", () => {
        const optionsA = { strings: ["test-1", "test-2"] };
        const optionsB = { strings: ["test-1", "test-2"] };
        const { rerender, getByTestId } = (0, react_2.render)(react_1.default.createElement(Typewriter_1.default, { options: optionsA }));
        rerender(react_1.default.createElement(Typewriter_1.default, { options: optionsB }));
        const element = getByTestId("typewriter-wrapper");
        expect(index_1.default).toHaveBeenCalledTimes(1);
        expect(index_1.default).toHaveBeenCalledWith(element, optionsA);
    });
});
//# sourceMappingURL=Typewriter.spec.js.map