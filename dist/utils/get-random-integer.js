"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Return a random integer between min/max values
 *
 * @param {Number} min Minimum number to generate
 * @param {Number} max Maximum number to generate
 * @author Tameem Safi <tamem@safi.me.uk>
 */
const getRandomInteger = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};
exports.default = getRandomInteger;
//# sourceMappingURL=get-random-integer.js.map