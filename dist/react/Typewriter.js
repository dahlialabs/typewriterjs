import React, { useEffect } from "react";
import TypewriterCore from "../core";
export default function Typewriter({ component: Component = "div", onInit, options, }) {
    const containerRef = React.useRef(null);
    const typewriterRef = React.useRef(null);
    useEffect(() => {
        if (!containerRef.current) {
            return;
        }
        const inst = new TypewriterCore(containerRef.current, options);
        typewriterRef.current = inst;
        if (onInit) {
            onInit(inst);
        }
        return () => {
            inst.stop();
        };
    }, []);
    useEffect(() => {
        if (options) {
            typewriterRef.current?.update(options);
        }
    }, [options]);
    return (React.createElement(Component, { ref: containerRef, className: "Typewriter", "data-testid": "typewriter-wrapper" }));
}
//# sourceMappingURL=Typewriter.js.map