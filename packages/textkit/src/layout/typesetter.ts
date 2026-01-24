import { isNil } from '@react-pdf/fns';

import copyRect from '../rect/copy';
import cropRect from '../rect/crop';
import blockHeight from '../paragraph/height';
import truncateBlock from '../paragraph/truncate';
import layoutParagraph from './layoutParagraph';
import sliceBlockAtHeight from '../paragraph/sliceAtHeight';
import isGlyphWhiteSpace from '../glyph/isWhiteSpace';
import { AttributedString, Container, Paragraph, Rect } from '../types';
import { Engines } from '../engines';

/**
 * Layout paragraphs inside container until it does not
 * fit anymore, performing line wrapping in the process.
 *
 * @param  engines - Engines
 * @param  options - Layout options
 * @param container - Container
 */
const typesetter = (engines: Engines, options, container: Container) => {
  /**
   * @param attributedStrings - Attributed strings (paragraphs)
   * @returns Paragraph blocks
   */
  return (attributedStrings: AttributedString[]) => {
    // Handle multi-column layout
    const isMultiColumn = container.columnCount && container.columnCount > 1;

    if (isMultiColumn) {
      return typesetMultiColumn(engines, options, container, attributedStrings);
    }

    // Standard single-column layout
    const result: Paragraph[] = [];
    const paragraphs = [...attributedStrings];
    const layout = layoutParagraph(engines, options);
    const maxLines = isNil(container.maxLines) ? Infinity : container.maxLines;
    const truncateEllipsis = container.truncateMode === 'ellipsis';

    let linesCount = maxLines;
    let paragraphRect = copyRect(container);
    let nextParagraph = paragraphs.shift();

    while (linesCount > 0 && nextParagraph) {
      const paragraph = layout(paragraphRect, nextParagraph);
      const slicedBlock = paragraph.slice(0, linesCount);
      const linesHeight = blockHeight(slicedBlock);

      const shouldTruncate =
        truncateEllipsis && paragraph.length !== slicedBlock.length;

      linesCount -= slicedBlock.length;

      if (paragraphRect.height >= linesHeight) {
        result.push(shouldTruncate ? truncateBlock(slicedBlock) : slicedBlock);
        paragraphRect = cropRect(linesHeight, paragraphRect);
        nextParagraph = paragraphs.shift();
      } else {
        result.push(
          truncateBlock(sliceBlockAtHeight(paragraphRect.height, slicedBlock)),
        );
        break;
      }
    }

    return result;
  };
};

/**
 * Check if a line is whitespace only (no visible content)
 */
export const isWhiteSpaceOnly = (line: AttributedString): boolean => {
  if (!line.runs || line.runs.length === 0) return true;

  for (const run of line.runs) {
    if (!run.glyphs || run.glyphs.length === 0) continue;

    for (const glyph of run.glyphs) {
      if (!isGlyphWhiteSpace(glyph)) return false;
    }
  }

  return true;
};

/**
 * Calculate how many lines each column should have for balanced distribution.
 * Earlier columns get ceil(n/columns), later columns get floor(n/columns).
 */
export const calculateLinesPerColumn = (
  totalLines: number,
  columnCount: number,
): number[] => {
  const linesPerColumn: number[] = [];
  let remainingLines = totalLines;

  for (let i = 0; i < columnCount; i += 1) {
    const remainingColumns = columnCount - i;
    const linesForThisColumn = Math.ceil(remainingLines / remainingColumns);
    linesPerColumn.push(linesForThisColumn);
    remainingLines -= linesForThisColumn;
  }

  return linesPerColumn;
};

/**
 * Layout all paragraphs in multi-column mode
 *
 * Features:
 * - Balances columns so earlier columns have more or equal lines
 * - Trims empty lines at the start of each column (CSS best practice)
 *
 * @param engines - Engines
 * @param options - Layout options
 * @param container - Container
 * @param attributedStrings - Attributed strings (paragraphs)
 * @returns Paragraph blocks with lines distributed across columns
 */
const typesetMultiColumn = (
  engines: Engines,
  options,
  container: Container,
  attributedStrings: AttributedString[],
): Paragraph[] => {
  const columnCount = container.columnCount || 1;
  const columnGap = container.columnGap || 0;
  const columnWidth =
    (container.width - columnGap * (columnCount - 1)) / columnCount;

  // Create a single-column container for initial line breaking
  const singleColumnContainer: Container = {
    ...container,
    width: columnWidth,
    columnCount: 1,
    columnGap: 0,
  };

  const layout = layoutParagraph(engines, options);

  // First pass: layout all paragraphs in single column to get all lines
  const allLines: AttributedString[] = [];
  let currentY = container.y;

  for (const paragraph of attributedStrings) {
    const layoutContainer: Container = {
      ...singleColumnContainer,
      y: currentY,
    };

    const lines = layout(layoutContainer, paragraph);

    for (const line of lines) {
      if (!line.runs || line.runs.length === 0) continue;

      allLines.push(line);
      currentY += line.box?.height || 0;
    }
  }

  if (allLines.length === 0) {
    return [];
  }

  // Calculate how many lines each column should have
  const linesPerColumn = calculateLinesPerColumn(allLines.length, columnCount);

  // Generate column rectangles
  const columnRects: Rect[] = [];
  for (let i = 0; i < columnCount; i += 1) {
    columnRects.push({
      x: container.x + i * (columnWidth + columnGap),
      y: container.y,
      width: columnWidth,
      height: container.height,
    });
  }

  // Second pass: distribute lines across columns
  let columnIndex = 0;
  let linesInCurrentColumn = 0;
  let currentColumn = columnRects[columnIndex];
  currentY = currentColumn.y;
  let isColumnStart = true;

  const resultLines: AttributedString[] = allLines.map((line) => {
    const height = line.box?.height || 0;

    // Check if we need to move to next column
    if (
      linesInCurrentColumn >= linesPerColumn[columnIndex] &&
      columnIndex < columnRects.length - 1
    ) {
      columnIndex += 1;
      linesInCurrentColumn = 0;
      currentColumn = columnRects[columnIndex];
      currentY = currentColumn.y;
      isColumnStart = true;
    }

    // Skip empty lines at the start of a column (trim leading whitespace)
    if (isColumnStart && isWhiteSpaceOnly(line)) {
      const newLine: AttributedString = {
        ...line,
        box: {
          ...line.box,
          x: currentColumn.x,
          y: currentY,
          width: currentColumn.width,
          height: 0, // Collapse empty line at column start
        },
      };
      linesInCurrentColumn += 1;
      return newLine;
    }

    isColumnStart = false;

    const newLine: AttributedString = {
      ...line,
      box: {
        ...line.box,
        x: currentColumn.x,
        y: currentY,
        width: currentColumn.width,
      },
    };

    currentY += height;
    linesInCurrentColumn += 1;

    return newLine;
  });

  // Return as single paragraph block
  return [resultLines];
};

export default typesetter;
