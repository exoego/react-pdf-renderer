import { SafeTextNode } from '../types';

/**
 * Get line index at given height.
 *
 * For multi-column layouts, calculates how many lines can fit given the
 * available height as the column height constraint.
 *
 * @param node - Text node with lines
 * @param height - Available height
 * @returns Line index that fits within height
 */
function lineIndexAtHeight(node: SafeTextNode, height: number): number {
  if (!node.lines) return 0;

  const columnCount = node.style?.columnCount || 1;

  // Multi-column layout: calculate based on column height constraint
  if (columnCount > 1) {
    let currentColumnHeight = 0;
    let columnsUsed = 0;

    for (let i = 0; i < node.lines.length; i += 1) {
      const lineHeight = node.lines[i].box?.height || 0;

      if (currentColumnHeight + lineHeight <= height) {
        currentColumnHeight += lineHeight;
      } else {
        // Move to next column
        columnsUsed += 1;
        if (columnsUsed >= columnCount) {
          return i;
        }
        currentColumnHeight = lineHeight;
      }
    }

    return node.lines.length;
  }

  // Single column: use cumulative height
  let y = 0;

  for (let i = 0; i < node.lines.length; i += 1) {
    const lineHeight = node.lines[i].box.height;
    if (y + lineHeight > height) return i;
    y += lineHeight;
  }

  return node.lines.length;
}

export default lineIndexAtHeight;
