import { describe, expect, test } from 'vitest';

import generateLineRects from '../../src/layout/generateLineRects';

describe('generateLineRects', () => {
  describe('single column', () => {
    test('should return single rect when no columnCount specified', () => {
      const container = {
        x: 0,
        y: 0,
        width: 200,
        height: 100,
      };

      const result = generateLineRects(container, 20);

      expect(result).toEqual([{ x: 0, y: 0, width: 200, height: 100 }]);
    });

    test('should return single rect when columnCount is 1', () => {
      const container = {
        x: 0,
        y: 0,
        width: 200,
        height: 100,
        columnCount: 1,
      };

      const result = generateLineRects(container, 20);

      expect(result).toEqual([{ x: 0, y: 0, width: 200, height: 100 }]);
    });
  });

  describe('multi column', () => {
    test('should generate 2 column rects', () => {
      const container = {
        x: 0,
        y: 0,
        width: 200,
        height: 100,
        columnCount: 2,
        columnGap: 20,
      };

      const result = generateLineRects(container, 20);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({ x: 0, y: 0, width: 90, height: 100 });
      expect(result[1]).toEqual({ x: 110, y: 0, width: 90, height: 100 });
    });

    test('should generate 3 column rects', () => {
      const container = {
        x: 0,
        y: 0,
        width: 300,
        height: 100,
        columnCount: 3,
        columnGap: 15,
      };

      const result = generateLineRects(container, 20);

      expect(result).toHaveLength(3);
      // columnWidth = (300 - 15 * 2) / 3 = 270 / 3 = 90
      expect(result[0]).toEqual({ x: 0, y: 0, width: 90, height: 100 });
      expect(result[1]).toEqual({ x: 105, y: 0, width: 90, height: 100 });
      expect(result[2]).toEqual({ x: 210, y: 0, width: 90, height: 100 });
    });

    test('should handle no columnGap', () => {
      const container = {
        x: 0,
        y: 0,
        width: 200,
        height: 100,
        columnCount: 2,
        columnGap: 0,
      };

      const result = generateLineRects(container, 20);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({ x: 0, y: 0, width: 100, height: 100 });
      expect(result[1]).toEqual({ x: 100, y: 0, width: 100, height: 100 });
    });

    test('should handle undefined columnGap', () => {
      const container = {
        x: 0,
        y: 0,
        width: 200,
        height: 100,
        columnCount: 2,
      };

      const result = generateLineRects(container, 20);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({ x: 0, y: 0, width: 100, height: 100 });
      expect(result[1]).toEqual({ x: 100, y: 0, width: 100, height: 100 });
    });

    test('should handle container with offset', () => {
      const container = {
        x: 50,
        y: 30,
        width: 200,
        height: 100,
        columnCount: 2,
        columnGap: 20,
      };

      const result = generateLineRects(container, 20);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({ x: 50, y: 30, width: 90, height: 100 });
      expect(result[1]).toEqual({ x: 160, y: 30, width: 90, height: 100 });
    });
  });
});
