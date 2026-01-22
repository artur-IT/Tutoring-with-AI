/**
 * Cleans LaTeX notation from text while preserving normal mathematical expressions
 * This function removes LaTeX delimiters but keeps normal fractions (like 1/2) and math symbols
 * Note: AI should not use LaTeX according to prompts, but this is a safety measure
 * We don't remove /expression/ pattern to preserve normal fractions like 1/2
 * If AI uses LaTeX with /, it should be fixed in the prompts, not here
 */
export const cleanMathNotation = (text: string): string =>
  text
    // Remove LaTeX parentheses: \(expression\) or \(expression\)
    .replace(/\\?\\\(([^)]+)\\\)/g, "$1")
    // Remove LaTeX brackets: \[expression\] or \[expression\]
    .replace(/\\?\\\[([^\]]+)\\\]/g, "$1")
    // Remove LaTeX dollar signs: $expression$ (inline math)
    .replace(/\$([^$]+)\$/g, "$1");
