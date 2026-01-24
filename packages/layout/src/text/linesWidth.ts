import { SafeTextNode } from '../types';

/**
 * Get lines width (if any)
 *
 * For multi-column layouts, returns the total width including all columns and gaps
 *
 * @param node
 * @returns Lines width
 */
const linesWidth = (node: SafeTextNode) => {
  if (!node.lines || node.lines.length === 0) return 0;

  const columnCount = node.style?.columnCount || 1;

  // For multi-column layout, calculate width based on line positions
  if (columnCount > 1) {
    const minX = Math.min(...node.lines.map((line) => line.box.x));
    const maxRight = Math.max(
      ...node.lines.map(
        (line) => line.box.x + (line.xAdvance || line.box.width),
      ),
    );
    return maxRight - minX;
  }

  // For single column, use max xAdvance
  return Math.max(0, ...node.lines.map((line) => line.xAdvance));
};

export default linesWidth;
