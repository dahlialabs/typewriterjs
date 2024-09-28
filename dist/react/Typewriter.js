"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Typewriter;
const react_1 = __importStar(require("react"));
const core_1 = __importDefault(require("../core"));
function Typewriter({ component: Component = "div", onInit, options, }) {
    const containerRef = react_1.default.useRef(null);
    const typewriterRef = react_1.default.useRef(null);
    (0, react_1.useEffect)(() => {
        if (!containerRef.current) {
            return;
        }
        const inst = new core_1.default(containerRef.current, options);
        typewriterRef.current = inst;
        if (onInit) {
            onInit(inst);
        }
        return () => {
            inst.stop();
        };
    }, []);
    (0, react_1.useEffect)(() => {
        if (options) {
            typewriterRef.current?.update(options);
        }
    }, [options]);
    return (react_1.default.createElement(Component, { ref: containerRef, className: "Typewriter", "data-testid": "typewriter-wrapper" }));
}
//# sourceMappingURL=Typewriter.js.map