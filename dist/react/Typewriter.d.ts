import React from "react";
import TypewriterCore, { type TypewriterOptions } from "../core";
type Props = {
    component?: React.JSXElementConstructor<any> | string;
    onInit?: (core: TypewriterCore) => void;
    options?: TypewriterOptions;
};
export default function Typewriter({ component: Component, onInit, options, }: Props): React.JSX.Element;
export {};
