import React, { useEffect } from "react";
import TypewriterCore, { type TypewriterOptions } from "../core";

type Props = {
  component: React.ReactNode;
  // onInit: PropTypes.func;
  options: TypewriterOptions;
};

export default function Typewriter({
  component: Component = "div",
  // onInit,
  options,
}: Props) {
  const containerRef = React.useRef<HTMLElement>(null);
  const typewriterRef = React.useRef<typeof TypewriterCore>(null);

  useEffect(() => {
    typewriterRef.current = new TypewriterCore(containerRef.current, options);

    return () => {
      typewriterRef.current.stop();
    };
  }, []);

  useEffect(() => {
    typewriterRef.current.update(options);
  }, [options]);

  return (
    <Component
      ref={containerRef}
      className="Typewriter"
      data-testid="typewriter-wrapper"
    />
  );
}
