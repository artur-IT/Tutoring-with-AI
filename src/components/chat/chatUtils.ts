export const cleanMathNotation = (text: string): string =>
  text
    .replace(/\/([^/]+)\//g, "$1")
    .replace(/\\?\\\(([^)]+)\\\)/g, "$1")
    .replace(/\\?\\\[([^\]]+)\\\]/g, "$1")
    .replace(/\$([^$]+)\$/g, "$1");
