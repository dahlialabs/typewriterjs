"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const get_random_integer_1 = __importDefault(require("./get-random-integer"));
describe("getRandomInteger", () => {
    it("should return a random integer between min and max values", () => {
        expect((0, get_random_integer_1.default)(1, 10)).toBeGreaterThanOrEqual(1);
        expect((0, get_random_integer_1.default)(1, 10)).toBeLessThanOrEqual(10);
    });
});
//# sourceMappingURL=get-random-integer.spec.js.map