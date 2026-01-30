export const cleanMathNotation = (text: string) =>
  text
    .replace(/\\?\\\(([^)]+)\\\)/g, "$1")
    .replace(/\\?\\\[([^\]]+)\\\]/g, "$1")
    .replace(/\$([^$]+)\$/g, "$1");
