import { SafeTextNode } from '../types';

/**
 * Get lines height (if any)
 *
 * For multi-column layouts, returns the height based on line positions
 * (from min Y to max Y + height of the last line in that column)
 *
 * @param node
 * @returns Lines height
 */
const linesHeight = (node: SafeTextNode) => {
  if (!node.lines || node.lines.length === 0) return -1;

  const columnCount = node.style?.columnCount || 1;

  // For multi-column layout, calculate height based on line positions
  if (columnCount > 1) {
    const minY = Math.min(...node.lines.map((line) => line.box.y));
    const maxBottom = Math.max(
      ...node.lines.map((line) => line.box.y + line.box.height),
    );
    return maxBottom - minY;
  }

  // For single column, sum all line heights
  return node.lines.reduce((acc, line) => acc + line.box.height, 0);
};

export default linesHeight;
