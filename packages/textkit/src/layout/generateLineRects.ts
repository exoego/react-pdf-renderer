import intersects from '../rect/intersects';
import partition from '../rect/partition';
import { Container, Rect } from '../types';

const getLineFragment = (lineRect: Rect, excludeRect: Rect): Rect[] => {
  if (!intersects(excludeRect, lineRect)) return [lineRect];

  const eStart = excludeRect.x;
  const eEnd = excludeRect.x + excludeRect.width;
  const lStart = lineRect.x;
  const lEnd = lineRect.x + lineRect.width;

  const a = Object.assign({}, lineRect, { width: eStart - lStart });
  const b = Object.assign({}, lineRect, { x: eEnd, width: lEnd - eEnd });

  return [a, b].filter((r) => r.width > 0);
};

const getLineFragments = (rect: Rect, excludeRects: Rect[]) => {
  let fragments = [rect];

  for (let i = 0; i < excludeRects.length; i += 1) {
    const excludeRect = excludeRects[i];

    fragments = fragments.reduce((acc, fragment) => {
      const pieces = getLineFragment(fragment, excludeRect);
      return acc.concat(pieces);
    }, []);
  }

  return fragments;
};

/**
 * Generate column rectangles for multi-column layout
 *
 * @param rect - Base rectangle
 * @param columnCount - Number of columns
 * @param columnGap - Gap between columns
 * @returns Array of column rectangles
 */
const generateColumnRects = (
  rect: Rect,
  columnCount: number,
  columnGap: number,
): Rect[] => {
  const columnWidth =
    (rect.width - columnGap * (columnCount - 1)) / columnCount;

  const columnRects: Rect[] = [];

  for (let i = 0; i < columnCount; i += 1) {
    columnRects.push({
      x: rect.x + i * (columnWidth + columnGap),
      y: rect.y,
      width: columnWidth,
      height: rect.height,
    });
  }

  return columnRects;
};

const generateLineRects = (container: Container, height: number) => {
  const { excludeRects, columnCount, columnGap, ...rect } = container;

  // Handle multi-column layout
  if (columnCount && columnCount > 1) {
    return generateColumnRects(rect, columnCount, columnGap || 0);
  }

  if (!excludeRects) return [rect];

  const lineRects: Rect[] = [];
  const maxY = Math.max(...excludeRects.map((r) => r.y + r.height));

  let currentRect = rect;

  while (currentRect.y < maxY) {
    const [lineRect, rest] = partition(currentRect, height);
    const lineRectFragments = getLineFragments(lineRect, excludeRects);

    currentRect = rest;
    lineRects.push(...lineRectFragments);
  }

  return [...lineRects, currentRect];
};

export default generateLineRects;
