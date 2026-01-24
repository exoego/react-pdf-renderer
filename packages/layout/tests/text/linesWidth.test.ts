import { describe, expect, test } from 'vitest';

import * as P from '@react-pdf/primitives';
import { SafeTextNode } from '../../src';
import linesWidth from '../../src/text/linesWidth';

const createTextNode = (
  lines: Array<{ box: { x: number; width: number }; xAdvance?: number }>,
  style = {},
): SafeTextNode => ({
  style,
  props: {},
  type: P.Text,
  children: [],
  lines: lines as SafeTextNode['lines'],
});

describe('linesWidth', () => {
  test('should return 0 when no lines', () => {
    const node = createTextNode(null);
    expect(linesWidth(node)).toBe(0);
  });

  test('should return 0 when lines is empty array', () => {
    const node = createTextNode([]);
    expect(linesWidth(node)).toBe(0);
  });

  describe('single column', () => {
    test('should return max xAdvance', () => {
      const node = createTextNode([
        { box: { x: 0, width: 100 }, xAdvance: 80 },
        { box: { x: 0, width: 100 }, xAdvance: 95 },
        { box: { x: 0, width: 100 }, xAdvance: 70 },
      ]);

      expect(linesWidth(node)).toBe(95);
    });
  });

  describe('multi column', () => {
    test('should return max right - min x for 2 columns', () => {
      const node = createTextNode(
        [
          // Column 1
          { box: { x: 0, width: 90 }, xAdvance: 80 },
          { box: { x: 0, width: 90 }, xAdvance: 85 },
          // Column 2
          { box: { x: 110, width: 90 }, xAdvance: 80 },
          { box: { x: 110, width: 90 }, xAdvance: 75 },
        ],
        { columnCount: 2 },
      );

      // Max right = 110 + 80 = 190, min x = 0
      expect(linesWidth(node)).toBe(190);
    });

    test('should use box width when xAdvance is not defined', () => {
      const node = createTextNode(
        [
          // Column 1
          { box: { x: 0, width: 90 } },
          // Column 2
          { box: { x: 110, width: 90 } },
        ],
        { columnCount: 2 },
      );

      // Max right = 110 + 90 = 200, min x = 0
      expect(linesWidth(node)).toBe(200);
    });
  });
});
