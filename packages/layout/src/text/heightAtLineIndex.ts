import { SafeTextNode } from '../types';

/**
 * Get height for given text line index
 *
 * For multi-column layouts, calculates the height when distributing
 * the given number of lines across columns.
 *
 * @param node
 * @param index
 */
const heightAtLineIndex = (node: SafeTextNode, index: number) => {
  if (!node.lines) return 0;

  const columnCount = node.style?.columnCount || 1;

  // Multi-column layout: simulate distribution to find max column height
  if (columnCount > 1) {
    // Calculate total height of lines to distribute
    let totalHeight = 0;
    for (let i = 0; i < index; i += 1) {
      const line = node.lines[i];
      if (!line) break;
      totalHeight += line.box?.height || 0;
    }

    // Target column height when balanced
    const targetColumnHeight = Math.ceil(totalHeight / columnCount);

    // Simulate distribution to find actual max column height
    const columnHeights: number[] = new Array(columnCount).fill(0);
    let currentColumn = 0;

    for (let i = 0; i < index; i += 1) {
      const line = node.lines[i];
      if (!line) break;

      const lineHeight = line.box?.height || 0;

      // Move to next column if current exceeds target and more columns available
      if (
        columnHeights[currentColumn] + lineHeight > targetColumnHeight &&
        currentColumn < columnCount - 1
      ) {
        currentColumn += 1;
      }

      columnHeights[currentColumn] += lineHeight;
    }

    return Math.max(...columnHeights);
  }

  // Single column: use cumulative height
  let counter = 0;

  for (let i = 0; i < index; i += 1) {
    const line = node.lines[i];

    if (!line) break;

    counter += line.box.height;
  }

  return counter;
};

export default heightAtLineIndex;
