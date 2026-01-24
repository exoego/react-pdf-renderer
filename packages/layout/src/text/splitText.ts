import { isWhiteSpaceOnly, calculateLinesPerColumn } from '@react-pdf/textkit';

import lineIndexAtHeight from './lineIndexAtHeight';
import heightAtLineIndex from './heightAtLineIndex';
import { SafeTextNode } from '../types';

const getLineBreak = (node: SafeTextNode, height: number) => {
  const top = node.box?.top || 0;
  const widows = node.props.widows || 2;
  const orphans = node.props.orphans || 2;
  const linesQuantity = node.lines.length;
  const slicedLine = lineIndexAtHeight(node, height - top);

  if (slicedLine === 0) {
    return 0;
  }

  if (linesQuantity < orphans) {
    return linesQuantity;
  }

  if (slicedLine < orphans || linesQuantity < orphans + widows) {
    return 0;
  }

  if (linesQuantity === orphans + widows) {
    return orphans;
  }

  if (linesQuantity - slicedLine < widows) {
    return linesQuantity - widows;
  }

  return slicedLine;
};

/**
 * Recalculate line positions for multi-column layout after split.
 * Lines start from Y=0 and are distributed across columns with balanced distribution.
 */
function recalculateMultiColumnLines(
  lines: SafeTextNode['lines'],
  columnCount: number,
  columnGap: number,
  containerWidth: number,
): SafeTextNode['lines'] {
  if (!lines || lines.length === 0) return lines;

  const columnWidth =
    (containerWidth - columnGap * (columnCount - 1)) / columnCount;

  const linesPerColumn = calculateLinesPerColumn(lines.length, columnCount);

  let columnIndex = 0;
  let linesInCurrentColumn = 0;
  let currentColumnX = 0;
  let currentY = 0;
  let isColumnStart = true;

  return lines.map((line) => {
    const height = line.box?.height || 0;

    // Move to next column if current is full
    if (
      linesInCurrentColumn >= linesPerColumn[columnIndex] &&
      columnIndex < columnCount - 1
    ) {
      columnIndex += 1;
      linesInCurrentColumn = 0;
      currentColumnX = columnIndex * (columnWidth + columnGap);
      currentY = 0;
      isColumnStart = true;
    }

    // Collapse empty lines at the start of a column
    if (isColumnStart && isWhiteSpaceOnly(line)) {
      linesInCurrentColumn += 1;
      return {
        ...line,
        box: { ...line.box, x: currentColumnX, y: currentY, height: 0 },
      };
    }

    isColumnStart = false;

    const newLine = {
      ...line,
      box: { ...line.box, x: currentColumnX, y: currentY },
    };

    currentY += height;
    linesInCurrentColumn += 1;

    return newLine;
  });
}

/**
 * Calculate the height of a set of lines after multi-column distribution.
 */
function calculateDistributedHeight(lines: SafeTextNode['lines']): number {
  if (!lines || lines.length === 0) return 0;

  const minY = Math.min(...lines.map((line) => line.box.y));
  const maxBottom = Math.max(
    ...lines.map((line) => line.box.y + line.box.height),
  );

  return maxBottom - minY;
}

/**
 * Resolve the column gap value, defaulting to 1em (fontSize) per CSS spec.
 */
function resolveColumnGap(node: SafeTextNode): number {
  const columnCount = node.style?.columnCount || 1;
  if (columnCount <= 1) return 0;

  const styleColumnGap = node.style?.columnGap;
  if (styleColumnGap !== undefined && styleColumnGap !== null) {
    return styleColumnGap;
  }

  const fontSize = node.style?.fontSize || 18;
  return fontSize;
}

/**
 * Split text node at the given height for pagination.
 * Handles multi-column layout by recalculating line positions.
 */
const splitText = (node: SafeTextNode, height: number) => {
  const slicedLineIndex = getLineBreak(node, height);
  const currentHeight = heightAtLineIndex(node, slicedLineIndex);
  const nextHeight = node.box.height - currentHeight;

  const columnCount = node.style?.columnCount || 1;
  const columnGap = resolveColumnGap(node);
  const containerWidth = node.box?.width || 0;
  const isMultiColumn = columnCount > 1;

  // Process current page lines
  let currentLines = node.lines.slice(0, slicedLineIndex);
  let recalculatedCurrentHeight = currentHeight;

  if (isMultiColumn && currentLines.length > 0) {
    currentLines = recalculateMultiColumnLines(
      currentLines,
      columnCount,
      columnGap,
      containerWidth,
    );
    recalculatedCurrentHeight = calculateDistributedHeight(currentLines);
  }

  // Process next page lines
  let nextLines = node.lines.slice(slicedLineIndex);
  let recalculatedNextHeight = nextHeight;

  if (isMultiColumn && nextLines.length > 0) {
    nextLines = recalculateMultiColumnLines(
      nextLines,
      columnCount,
      columnGap,
      containerWidth,
    );
    recalculatedNextHeight = calculateDistributedHeight(nextLines);
  }

  const current: SafeTextNode = {
    ...node,
    box: {
      ...node.box,
      height: recalculatedCurrentHeight,
      borderBottomWidth: 0,
    },
    style: {
      ...node.style,
      marginBottom: 0,
      paddingBottom: 0,
      borderBottomWidth: 0,
      borderBottomLeftRadius: 0,
      borderBottomRightRadius: 0,
    },
    lines: currentLines,
  };

  const next: SafeTextNode = {
    ...node,
    box: {
      ...node.box,
      top: 0,
      height: recalculatedNextHeight,
      borderTopWidth: 0,
    },
    style: {
      ...node.style,
      marginTop: 0,
      paddingTop: 0,
      borderTopWidth: 0,
      borderTopLeftRadius: 0,
      borderTopRightRadius: 0,
    },
    lines: nextLines,
  };

  return [current, next];
};

export default splitText;
