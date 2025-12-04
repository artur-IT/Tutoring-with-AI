import * as React from "react";
import arrowLeftSimpleSvg from "./arrow-left-simple.svg?raw";

interface ArrowLeftSimpleIconProps {
  className?: string;
}

export default function ArrowLeftSimpleIcon({ className = "w-5 h-5" }: ArrowLeftSimpleIconProps) {
  const svgWithClass = arrowLeftSimpleSvg.replace(/<svg([^>]*)>/, `<svg$1 className="${className}">`);
  return <span dangerouslySetInnerHTML={{ __html: svgWithClass }} />;
}
