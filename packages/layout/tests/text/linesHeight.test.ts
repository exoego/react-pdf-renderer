import { describe, expect, test } from 'vitest';

import * as P from '@react-pdf/primitives';
import { SafeTextNode } from '../../src';
import linesHeight from '../../src/text/linesHeight';

const createTextNode = (
  lines: Array<{ box: { y: number; height: number } }>,
  style = {},
): SafeTextNode => ({
  style,
  props: {},
  type: P.Text,
  children: [],
  lines: lines as SafeTextNode['lines'],
});

describe('linesHeight', () => {
  test('should return -1 when no lines', () => {
    const node = createTextNode(null);
    expect(linesHeight(node)).toBe(-1);
  });

  test('should return -1 when lines is empty array', () => {
    const node = createTextNode([]);
    expect(linesHeight(node)).toBe(-1);
  });

  describe('single column', () => {
    test('should sum all line heights', () => {
      const node = createTextNode([
        { box: { y: 0, height: 20 } },
        { box: { y: 20, height: 20 } },
        { box: { y: 40, height: 20 } },
      ]);

      expect(linesHeight(node)).toBe(60);
    });
  });

  describe('multi column', () => {
    test('should return max bottom - min y for 2 columns', () => {
      const node = createTextNode(
        [
          // Column 1
          { box: { y: 0, height: 20 } },
          { box: { y: 20, height: 20 } },
          // Column 2
          { box: { y: 0, height: 20 } },
          { box: { y: 20, height: 20 } },
        ],
        { columnCount: 2 },
      );

      // Max bottom = 20 + 20 = 40, min y = 0
      expect(linesHeight(node)).toBe(40);
    });

    test('should handle uneven columns', () => {
      const node = createTextNode(
        [
          // Column 1 - 3 lines
          { box: { y: 0, height: 20 } },
          { box: { y: 20, height: 20 } },
          { box: { y: 40, height: 20 } },
          // Column 2 - 2 lines
          { box: { y: 0, height: 20 } },
          { box: { y: 20, height: 20 } },
        ],
        { columnCount: 2 },
      );

      // Max bottom = 60 (from column 1), min y = 0
      expect(linesHeight(node)).toBe(60);
    });
  });
});
