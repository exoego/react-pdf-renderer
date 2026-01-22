/**
 * Split string by comma, respecting parentheses depth.
 * Useful for parsing CSS values like gradients and multiple backgrounds.
 */
const splitByComma = (value: string): string[] => {
  const result: string[] = [];
  let current = '';
  let depth = 0;

  for (const char of value) {
    if (char === '(') {
      depth++;
      current += char;
    } else if (char === ')') {
      depth--;
      current += char;
    } else if (char === ',' && depth === 0) {
      const trimmed = current.trim();
      if (trimmed) result.push(trimmed);
      current = '';
    } else {
      current += char;
    }
  }

  const trimmed = current.trim();
  if (trimmed) result.push(trimmed);

  return result;
};

export default splitByComma;
