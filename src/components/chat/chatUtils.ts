/**
 * Removes LaTeX delimiters while preserving normal math expressions and fractions
 */
export const cleanMathNotation = (text: string): string =>
  text
    // Remove LaTeX parentheses: \(expression\) or \(expression\)
    .replace(/\\?\\\(([^)]+)\\\)/g, "$1")
    // Remove LaTeX brackets: \[expression\] or \[expression\]
    .replace(/\\?\\\[([^\]]+)\\\]/g, "$1")
    // Remove LaTeX dollar signs: $expression$ (inline math)
    .replace(/\$([^$]+)\$/g, "$1");
