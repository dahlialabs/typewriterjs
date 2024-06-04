import React, { useEffect } from "react";
import TypewriterCore, { type TypewriterOptions } from "../core";

type Props = {
  component: React.JSXElementConstructor<any> | string;
  onInit: (core: TypewriterCore) => void;
  options: TypewriterOptions;
};

export default function Typewriter({
  component: Component = "div",
  onInit,
  options,
}: Props) {
  const containerRef = React.useRef<HTMLElement>(null);
  const typewriterRef: React.MutableRefObject<TypewriterCore | null> =
    React.useRef(null);

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
    typewriterRef.current?.update(options);
  }, [options]);

  return (
    <Component
      ref={containerRef}
      className="Typewriter"
      data-testid="typewriter-wrapper"
    />
  );
}
